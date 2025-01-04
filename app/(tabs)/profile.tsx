import { View, Text, SafeAreaView, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import icons from '@/constants/icons'
import { auth } from '@/firebaseConfig'
import { signOut } from 'firebase/auth'
import { useRouter } from 'expo-router'

const Profile = () => {
  const router = useRouter();

  const SignOut = async () => {
    try {
      await signOut(auth);
      console.log("signed out");
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


      <Image source={icons.profile} className='w-14 h-14 p-2' style={{tintColor: '#cccfff'}} resizeMode='contain' />
      <Text className='text-tertiary text-2xl font-gBold'>Noah Choi</Text>
      <TouchableOpacity onPress={SignOut}>
        <Image source={icons.logout} className='w-14 h-14 p-2' style={{tintColor: '#cccfff'}} resizeMode='contain' />
      </TouchableOpacity>

    
    </SafeAreaView>
  )
}

export default Profile