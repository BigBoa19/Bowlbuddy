import { View, Text, SafeAreaView, Button } from 'react-native'
import React from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/firebaseConfig'

const Play = () => {

const logout = async () => {
    try {
        await signOut(auth);
        console.log("Signed Out")
    } catch(err) {
        console.log(err);
    }
}

  return (
    <SafeAreaView className='flex-1'>
      <Text className='flex-1 text-center bg-purple-500 text-5xl'>Play</Text>
      <Button title='Sign out' onPress={logout}/>
    </SafeAreaView>
  )
}

export default Play