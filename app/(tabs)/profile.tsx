import { View, Text, SafeAreaView, Image, TouchableOpacity } from 'react-native'
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

  return (
    <SafeAreaView className='bg-background flex-1'>
      {/* Top Text and Icon */}
      <View className='flex-row justify-between items-center p-2 pt-[16px] pl-5'>
        <Text className='text-tertiary text-3xl font-gBold'>Profile</Text>
      </View>

      {/* Border */}
      <View className="h-[1px] bg-tertiary mt-[8px]" />
      <View className='flex-1 p-4 mt-2'>
        <Text className='text-tertiary text-3xl font-gBook pb-5'>{user?.displayName}</Text>
        <View className='flex-row bg-primary h-96 p-2 rounded-lg border-secondary border-2 shadow-lg' >

        </View>
        <TouchableOpacity onPress={SignOut}>
          <View className='flex-row items-center shadow-lg shadow-red-700'>
            <Image source={icons.logout} className='w-14 h-14 p-3 mt-2 shadow-lg shadow-[#cd1c18]' style={{tintColor: '#cd1c18'}} resizeMode='contain' />
            <Text className='flex-1 pt-2 text-xl text-[#cd1c18] font-gBold'>Logout</Text>
          </View>
        </TouchableOpacity>
      </View>
      
    
    </SafeAreaView>
  )
}

export default Profile