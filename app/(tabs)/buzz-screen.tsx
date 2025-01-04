import { View, Text , SafeAreaView} from 'react-native'
import { Link } from 'expo-router'
import React from 'react'

const BuzzScreen = () => {
  return (
    <SafeAreaView className='flex-1 items-center justify-center bg-background'>
      <Text className='text-white text-3xl'>
        BuzzScreen
      </Text>
      <Link href='/play' className='text-blue-300 text-5xl'>Go Back</Link>
    </SafeAreaView>
  )
}

export default BuzzScreen