import { View, Text, SafeAreaView, Image, TouchableOpacity, Modal, TextInput, Alert } from 'react-native'
import React from 'react'
import icons from '@/constants/icons'
import { auth, db } from '@/firebaseConfig'
import { signOut, updateProfile } from 'firebase/auth'
import { useRouter } from 'expo-router'
import { UserContext } from '../context';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import CustomButton from '../components/CustomButton';
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
          maxLength={multiline ? undefined : 10}
          multiline={multiline}
          textAlignVertical={multiline ? "top" : "center"}
          numberOfLines={multiline ? 4 : 1}
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
  const { user } = React.useContext(UserContext);
  const router = useRouter();
  const [isNameModalVisible, setIsNameModalVisible] = React.useState(false);
  const [isBioModalVisible, setIsBioModalVisible] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newBio, setNewBio] = React.useState('');
  const [currentBio, setCurrentBio] = React.useState('');

  React.useEffect(() => {
    const fetchBio = async () => {
      if (!user?.uid) return;
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setCurrentBio(userDoc.data().bio || '');
      }
    };
    fetchBio();
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
              await signOut(auth);
              router.push('/(auth)/sign-in');
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
          style: "destructive"
        }
      ]
    );
  }

  const handleNameChange = async () => {
    if (!user || !newName.trim()) return;
    
    try {
      await updateProfile(user, { displayName: newName.trim() });
      await updateDoc(doc(db, 'users', user.uid), { name: newName.trim() });
      
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
    if (!user) return;
    
    try {
      await updateDoc(doc(db, 'users', user.uid), { bio: newBio.trim() });
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
      </View>

      <View className="h-[1px] bg-tertiary mt-[8px]" />
      
      <View className='flex-1 p-4 mt-2'>
        <View className='flex-column bg-primary h-[550px] p-4 rounded-lg border-secondary shadow-lg'>
          <View className='flex-row items-center'>
            <View className='flex-row w-60 items-center'>
              <Text className='text-tertiary text-2xl font-gBold p-4' numberOfLines={1} adjustsFontSizeToFit={true}>
                {user?.displayName}
              </Text>
              <TouchableOpacity onPress={() => {
                setNewName(user?.displayName || '');
                setIsNameModalVisible(true);
              }}>
                <Image source={icons.edit} className='w-14 h-14 p-4 shadow-lg' style={{tintColor: '#8a92eb'}} resizeMode='contain' />
              </TouchableOpacity>
            </View>
          </View>

          <View className="h-[1px] bg-secondary mt-2 mb-3" />
          
          {renderStatRow('Questions Seen', '55')}
          {renderStatRow('Correct Answers', '38')}
          {renderStatRow('Powers', '18')}
          
          <View className='flex-row items-center'>
            <Image source={icons.fire} className='w-14 h-14 shadow-lg mt-3' style={{tintColor: '#8a92eb'}} resizeMode='contain' />
            <Text className='text-2xl font-gBold text-secondary mt-3'>Max Streak</Text>
          </View>

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