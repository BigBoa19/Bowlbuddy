import { Text, View, SafeAreaView, TouchableOpacity } from "react-native";
import React from 'react'

const SignIn = ({promptAsync}:any) => {
  return (
    <SafeAreaView style={{flex:1, alignItems:'center', justifyContent:'center'}}>
        <TouchableOpacity style={{
            flex:1, 
            alignItems:'center', 
            justifyContent:'center',
            backgroundColor: 'blue',
        }} onPress={() => promptAsync()} >
            <Text> Sign In With Google </Text>
        </TouchableOpacity>
        <Text className='flex-1 font-bold text-blue-500'> Hello World </Text>
    </SafeAreaView>
  )
}


export default SignIn