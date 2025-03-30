import { View, Text, SafeAreaView, Image, TouchableOpacity, Touchable, Modal } from 'react-native'
import React from 'react'
import icons from '@/constants/icons'
import { auth } from '@/firebaseConfig'
import { signOut } from 'firebase/auth'
import { useRouter } from 'expo-router'
import { UserContext } from '../context';

const Profile = () => {
  const { user } = React.useContext(UserContext);
  const router = useRouter();

  const SignOut = async () => {
    try {
      await signOut(auth);
      console.log("signed out");
      router.push('/(auth)/sign-in')
      
    } catch (error: any) {
      console.log(error);
    }
  }

  const changeName = () => {
    //how do I set this
  }

  return (
    <SafeAreaView className='bg-background flex-1'>
      {/* Top Text and Icon */}
      <View className='flex-row justify-between items-center p-2 pt-[16px] pl-5'>
        <Text className='text-tertiary text-3xl font-gBold'>Profile</Text>
      </View>

      {/* Border */}
      <View className="h-[1px] bg-tertiary mt-[8px]" />
      <View className='flex-1 p-4 mt-2 '>
        {/* Profile Box */}
        <View className='flex-column bg-primary h-[550px] p-4 rounded-lg border-secondary shadow-lg it' >
          <View className='flex-row  items-center'>
            {/* Make this max 10 Characters */}
            <View className='flex-row w-60 items-center'>
              <Text className='text-tertiary text-2xl font-gBold p-4' numberOfLines={1} adjustsFontSizeToFit={true}>
                {user?.displayName}
              </Text>
              <TouchableOpacity onPress={()=>changeName()}>
                <Image source={icons.edit} className='w-14 h-14 p-4 shadow-lg' style={{tintColor: '#8a92eb'}} resizeMode='contain' />
              </TouchableOpacity>
            </View>
            {/* Profile Image? */}
          </View>
          <View className="h-[1px] bg-secondary mt-2 mb-3" />
          {/* Other Profile Elements */}
          <View className='flex-row items-center justify-between'>
            <Text className='text-tertiary text-xl font-gBook p-2'>
              Questions Seen
            </Text>
            <Text className='text-xl font-gBold text-tertiary pr-2'>55</Text>
          </View>
          <View className='flex-row items-center justify-between'>
            <Text className='text-tertiary text-xl font-gBook p-2'>
              Correct Answers
            </Text>
            <Text className='text-xl font-gBold text-tertiary pr-2'>38</Text>
          </View>
          <View className='flex-row items-center justify-between'>
            <Text className='text-tertiary text-xl font-gBook p-2'>
              Powers
            </Text>
            <Text className='text-xl font-gBold text-tertiary pr-2'>18</Text>
          </View>
          <View className='flex-row items-center'>
            <Image source={icons.fire} className='w-14 h-14 shadow-lg mt-3' style={{tintColor: '#8a92eb'}} resizeMode='contain' />
            <Text className='text-2xl font-gBold text-secondary mt-3'>Max Streak</Text>
          </View>
          <View className='flex-1 border-2 rounded-lg bg-'>

          </View>
         
        </View>
        

        <TouchableOpacity onPress={SignOut}>
          <View className='flex-row items-center shadow-md shadow-red-900'>
            <Image source={icons.logout} className='w-14 h-14 p-3 mt-2' style={{tintColor: '#cd1c18'}} resizeMode='contain' />
            <Text className='flex-1 pt-2 text-xl text-[#cd1c18] font-gBold'>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>

    
    </SafeAreaView>
  )
}

export default Profile