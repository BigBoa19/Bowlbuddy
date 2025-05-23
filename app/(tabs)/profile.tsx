import { View, Text, SafeAreaView, Image, TouchableOpacity, Modal, TextInput, Alert } from 'react-native'
import React from 'react'
import icons from '@/constants/icons'
import { auth, db } from '@/firebaseConfig'
import { signOut, updateProfile } from 'firebase/auth'
import { getAuth, signOut as firebaseSignOut, updateProfile as appleUpdateProfile } from '@react-native-firebase/auth';
import { useRouter } from 'expo-router'
import { UserContext } from '../context';
import { doc, updateDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

interface EditModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  value: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  multiline?: boolean;
}

const EditModal: React.FC<EditModalProps> = ({ 
  visible, 
  onClose, 
  title, 
  value, 
  onChangeText, 
  onSave, 
  multiline = false
}) => (
  <Modal
    animationType="slide"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View className="flex-1 justify-center items-center bg-black/50">
      <View className="bg-primary p-6 rounded-lg w-[80%] shadow-lg">
        <Text className="text-tertiary text-xl font-gBold mb-4">{title}</Text>
        <TextInput
          className={`bg-background p-3 rounded-lg text-tertiary font-gBook mb-4 ${multiline ? 'min-h-[100px]' : ''}`}
          value={value}
          onChangeText={onChangeText}
          placeholder={`Enter ${title.toLowerCase()}`}
          placeholderTextColor="#75726f"
          maxLength={multiline ? undefined : 20}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          numberOfLines={multiline ? 4 : 1}
          autoCorrect={false}
        />
        <View className="flex-row justify-end space-x-4">
          <TouchableOpacity 
            onPress={onClose}
            className="px-4 py-2 rounded-lg bg-secondary"
          >
            <Text className="text-tertiary font-gBold">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={onSave}
            className="ml-4 px-4 py-2 rounded-lg bg-[#8a92eb]"
          >
            <Text className="text-white font-gBold">Save</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const Profile = () => {
  const { userGoogle, userApple } = React.useContext(UserContext);
  const user = userGoogle || userApple;
  const router = useRouter();
  const [isNameModalVisible, setIsNameModalVisible] = React.useState(false);
  const [isBioModalVisible, setIsBioModalVisible] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newBio, setNewBio] = React.useState('');
  const [currentBio, setCurrentBio] = React.useState('');
  const [displayName, setDisplayName] = React.useState(user?.displayName || '');
  const [totalScore, setTotalScore] = React.useState(0);
  const [totalCorrect, setTotalCorrect] = React.useState(0);
  const [totalSeen, setTotalSeen] = React.useState(0);
  const [deleteModal, setDeleteModal] = React.useState(false);

  React.useEffect(() => {
    const fetchBio = async () => {
      if (!user?.uid) return;
      const userDocRef = doc(db, 'users', user?.uid || '');
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setCurrentBio(userDoc.data().bio || '');
      }
    };
    fetchBio();
  }, [user]);

  React.useEffect(() => {
    if (!user?.uid) return;

    const userDocRef = doc(db, 'users', user?.uid || '');
    
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const statsData = doc.data();
        setTotalScore(statsData.totalScore || 0);
        setTotalCorrect(statsData.totalCorrect || 0);
        setTotalSeen(statsData.totalSeen || 0);
      }
    });

    return () => unsubscribe();
  }, [user]);

  React.useEffect(() => {
    setDisplayName(user?.displayName || '');
  }, [user]);

  const SignOut = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Logout", 
          onPress: async () => {
            try {
              if(userGoogle) await signOut(auth);
              if(userApple) await firebaseSignOut(getAuth());
              router.replace("/");
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
          style: "destructive"
        }
      ]
    );
  }

  const DeleteUser = async () => {
    Alert.alert(
      "Delete profile?",
      "Are you sure? All saved data will be lost.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          onPress: async () => {
            try {
              if(userApple) await userApple.delete()
              if(userGoogle) await userGoogle.delete()
              await updateDoc(doc(db, 'users', user?.uid || ''), { deleted: true });
              router.replace("/");
            } catch (error) {
              console.log(error)
              Alert.alert(
                "Deletion Error",
                "Please log out and log back in to delete your account.",
                [{ text: "Confirm", style: "cancel" },]
              )
            }
          },
          style: "destructive"
        }
      ]
    );
  }

  const handleNameChange = async () => {
    if (!user?.uid || !newName.trim()) return;
    
    try {
      if(userGoogle) await updateProfile(userGoogle, { displayName: newName.trim() });
      if(userApple) await appleUpdateProfile(userApple, { displayName: newName.trim() });
      await updateDoc(doc(db, 'users', user?.uid || ''), { name: newName.trim() });
      
      // Update local state
      setDisplayName(newName.trim());
      
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Username updated successfully!',
      });
      
      setIsNameModalVisible(false);
    } catch (error) {
      console.error('Error updating username:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Failed to update username',
      });
    }
  }

  const handleBioChange = async () => {
    if (!user?.uid) return;
    
    try {
      await updateDoc(doc(db, 'users', user?.uid || ''), { bio: newBio.trim() });
      setCurrentBio(newBio.trim());
      
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Bio updated successfully!',
      });
      
      setIsBioModalVisible(false);
    } catch (error) {
      console.error('Error updating bio:', error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Failed to update bio',
      });
    }
  }

  const renderStatRow = (label: string, value: string) => (
    <View className='flex-row items-center justify-between'>
      <Text className='text-tertiary text-xl font-gBook p-2'>{label}</Text>
      <Text className='text-xl font-gBold text-tertiary pr-2'>{value}</Text>
    </View>
  );

  return (
    <SafeAreaView className='bg-background flex-1'>
      <View className='flex-row justify-between items-center p-2 pt-[16px] pl-5'>
        <Text className='text-tertiary text-3xl font-gBold'>Profile</Text>
        <Modal animationType="slide" transparent={true} visible={deleteModal}>
          <View className='flex-1 justify-center p-4'>
            <View className="m-5 bg-background border-2 border-secondary rounded-lg p-9 items-center shadow-lg">
              <Text className='text-xl text-tertiary font-gBold text-center'>
                Are you sure you want to delete your profile?
              </Text>
              <Text className='text-lg text-secondary font-gBook text-center shadow-md shadow-black mt-4'>
                All saved data will be lost.
              </Text>
              <View className='flex-row mt-8'>
                <TouchableOpacity className='bg-primary rounded-xl p-3 w-16 mr-6' onPress={()=>{setDeleteModal(false)}}>
                  <Text className='text-secondary text-center text-lg font-gBold'>No</Text>
                </TouchableOpacity>
                <TouchableOpacity className='bg-primary rounded-xl p-3 w-16 ml-6' onPress={()=>{setDeleteModal(false);DeleteUser()}}>
                  <Text className='text-red-500 text-center text-lg font-gBold'>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        <TouchableOpacity onPress={()=>{setDeleteModal(true)}}>
          <Image source={icons.trash} className='w-7 h-8 p-0.5 shadow-lg mr-2' style={{tintColor: 'red'}} resizeMode='contain' />
        </TouchableOpacity>
      </View>

      <View className="h-[1px] bg-tertiary mt-[8px]" />
      
      <View className='flex-1 p-4 mt-2'>
        <View className='flex-column bg-primary h-[550px] p-4 rounded-lg border-secondary shadow-lg'>
          <View className='flex-row items-center'>
            <View className='flex-row w-60 items-center'>
              <Text className='text-tertiary text-2xl font-gBold p-4' numberOfLines={1} adjustsFontSizeToFit={true}>
                {displayName}
              </Text>
              <TouchableOpacity onPress={() => {
                setIsNameModalVisible(true);
                setNewName(displayName);
              }}>
                <Image source={icons.edit} className='w-14 h-14 p-4 shadow-lg' style={{tintColor: '#8a92eb'}} resizeMode='contain' />
              </TouchableOpacity>
            </View>
          </View>

          <View className="h-[1px] bg-secondary mt-2 mb-3" />
          
          {renderStatRow('Total Score', totalScore.toString())}
          {renderStatRow('Questions Seen', totalSeen.toString())}
          {renderStatRow('Correct Answers', totalCorrect.toString())}
          

          <View className='mt-2 shadow-md flex-row items-center'>
            <Text className='text-tertiary text-xl font-gBold p-2'>Bio</Text>
            <TouchableOpacity onPress={() => {
              setNewBio(currentBio);
              setIsBioModalVisible(true);
            }}>
              <Image source={icons.edit} className='w-12 h-12 p-4 shadow-lg' style={{tintColor: '#8a92eb'}} resizeMode='contain' />
            </TouchableOpacity>
          </View>

          <View className='flex-1 m-1.5 shadow-md rounded-lg bg-background p-4'>
            <Text className='text-tertiary font-gBook'>{currentBio || 'No bio yet'}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={SignOut}>
          <View className='flex-row items-center shadow-md shadow-red-900'>
            <Image source={icons.logout} className='w-14 h-14 p-3 mt-2' style={{tintColor: '#cd1c18'}} resizeMode='contain' />
            <Text className='flex-1 pt-2 text-xl text-[#cd1c18] font-gBold'>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>

      <EditModal
        visible={isNameModalVisible}
        onClose={() => setIsNameModalVisible(false)}
        title="Change Username"
        value={newName}
        onChangeText={setNewName}
        onSave={handleNameChange}
      />

      <EditModal
        visible={isBioModalVisible}
        onClose={() => setIsBioModalVisible(false)}
        title="Change Bio"
        value={newBio}
        onChangeText={setNewBio}
        onSave={handleBioChange}
        multiline
      />
    </SafeAreaView>
  )
}

export default Profile