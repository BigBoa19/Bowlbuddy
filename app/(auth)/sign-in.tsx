import { View, Text, Image, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { UserContext } from '../context';
import { doc, setDoc } from "firebase/firestore"
import icons from '@/constants/icons'
import { auth, db } from "../../firebaseConfig"
import { GoogleAuthProvider, signInWithCredential, User } from "firebase/auth"
import * as Google from "expo-auth-session/providers/google"
import { router } from "expo-router"
import { AppleAuthProvider, getAuth, signInWithCredential as appleSignInWithCredential } from '@react-native-firebase/auth';
import { appleAuth } from '@invertase/react-native-apple-authentication';



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

  async function onAppleButtonPress() {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
    });
  
    if (!appleAuthRequestResponse.identityToken) {
      throw new Error('Apple Sign-In failed - no identify token returned');
    }
    const { identityToken, nonce } = appleAuthRequestResponse;
    const appleCredential = AppleAuthProvider.credential(identityToken, nonce);
    return appleSignInWithCredential(getAuth(), appleCredential);
  }

  React.useEffect(() => {
    if (response?.type=="success"){
      const {id_token} = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential).then((userCredential) => {
        const user = userCredential.user;
        addUserToDatabase(user);
        router.push('/play');
      }).catch((error) => {
        console.log('Error: ', error)
      });
    }
  },[response])

  return (
    <SafeAreaView className='bg-background flex-1'>
      <View className="flex-1 justify-between p-4">
        <View className="items-center mt-20">
          <Image
            source={require('../../assets/images/BBlogo.jpg')}
            className="w-52 h-52 mb-4"
            resizeMode="contain"
          />
          <Text className="text-tertiary text-4xl font-gBold">BowlBuddy</Text>
          <Text className="text-tertiary text-xl font-gBold text-center mt-4 px-6">
            Your personal quiz bowl companion.{'\n\n'}
            <Text className="text-[#8a92eb]">Practice questions</Text>{'\n'}
            <Text className="text-[#8a92eb]">Gain knowledge</Text>{'\n'}
            <Text className="text-[#8a92eb]">Win tournaments</Text>
          </Text>
        </View>

        <TouchableOpacity 
            className="flex-row items-center justify-center bg-black p-4 rounded-xl mb-4 shadow-lg border-1 border-[#8a92eb]"
            onPress={() => onAppleButtonPress().then(() => console.log('Apple sign-in complete!'))}
          >
            <Image
              source={icons.apple}
              resizeMode="contain"
              tintColor="white"
              className='w-10 h-10 mb-0.5 p-1.5'
            />
            <Text className="text-white font-gBook text-xl ml-2">
              Continue with
            </Text>
            <Text className='text-white font-gBold text-2xl ml-2'>Apple</Text>
          </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => promptAsync()} 
          className="flex-row items-center justify-center bg-primary p-4 rounded-xl mb-10 shadow-lg border-2 border-[#8a92eb]"
        >
          <Image
            source={icons.google}
            resizeMode="contain"
            tintColor="white"
            className='w-10 h-10 mb-0.5 '
          />
          <Text className="text-white font-gBook text-xl ml-2">
            Continue with
          </Text>
          <Text className='text-[#4285f4] font-gBold text-2xl ml-2'>G</Text>
          <Text className='text-[#ea4336] font-gBold text-2xl'>o</Text>
          <Text className='text-[#fbbc04] font-gBold text-2xl'>o</Text>
          <Text className='text-[#4285f4] font-gBold text-2xl'>g</Text>
          <Text className='text-[#34a853] font-gBold text-2xl'>l</Text>
          <Text className='text-[#ea4336] font-gBold text-2xl'>e</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default SignIn