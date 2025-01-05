import { View, Text, Image, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import UserContext from '../context';
import { doc, setDoc } from "firebase/firestore"
import icons from '@/constants/icons'
import { auth, db } from "../../firebaseConfig"
import { GoogleAuthProvider, signInWithCredential, User } from "firebase/auth"
import * as Google from "expo-auth-session/providers/google"



const SignIn = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId:"686553870661-e1s26teaahepleu253tmsa8tkmcume1q.apps.googleusercontent.com",
    androidClientId:"686553870661-4n04cavoeg33jsftm084k769tvhecf3n.apps.googleusercontent.com",
  })

  const addUserToDatabase = async (user: User) => {
    if (!user) return;
    const date = new Date();
    const dateString = date.toLocaleString();
    const usersDocRef = doc(db, 'users', user.uid);
    await setDoc(usersDocRef, { email: user.email, name:user.displayName, timestamp: dateString}, { merge: true } );
  }

  React.useEffect(() => {
    if (response?.type=="success"){
      const {id_token} = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).then((userCredential) => {
        const user = userCredential.user;
        addUserToDatabase(user)
      }).catch((error) => {
        console.log('Error: ', error)
      });
    }
  },[response])

  return (
    <SafeAreaView className=' bg-secondary h-full'>

      <ScrollView>
        
        <View className="flex justify-center pt-2 px-4">
          <TouchableOpacity onPress={() => promptAsync()} className="flex-row items-center justify-center bg-white p-4 rounded-lg mt-2 shadow-lg">
            <Image
              source={icons.google}
              resizeMode="contain"
              tintColor="none"
              className='w-10 h-10 mb-0.5'
            />
            <Text className="text-primary font-gBook text-xl ml-2 ">
              Continue with
            </Text>
            {/* <Text className="text-tertiary font-gBold text-lg ml-1.5">
            </Text> */}
            <Text className='text-[#4285f4] font-gBold text-2xl ml-2'>G</Text>
            <Text className='text-[#ea4336] font-gBold text-2xl'>o</Text>
            <Text className='text-[#fbbc04] font-gBold text-2xl'>o</Text>
            <Text className='text-[#4285f4] font-gBold text-2xl'>g</Text>
            <Text className='text-[#34a853] font-gBold text-2xl'>l</Text>
            <Text className='text-[#ea4336] font-gBold text-2xl'>e</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}


export default SignIn