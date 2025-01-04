import { Text, View, SafeAreaView } from "react-native";
import SignIn from "./(auth)/sign-in"
import * as Google from "expo-auth-session/providers/google"
import * as WebBrowser from "expo-web-browser"
import { GoogleAuthProvider, signInWithCredential, onAuthStateChanged } from "firebase/auth"
import { auth } from "../firebaseConfig"
import * as React from "react"
import Play from './(tabs)/play'
import AsyncStorage from "@react-native-async-storage/async-storage";

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const [userInfo, setUserInfo] = React.useState();
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId:"686553870661-e1s26teaahepleu253tmsa8tkmcume1q.apps.googleusercontent.com",
    androidClientId:"686553870661-4n04cavoeg33jsftm084k769tvhecf3n.apps.googleusercontent.com",
  })

  const checkLocalUser = async () => {
    try{
      const userJSON = await AsyncStorage.getItem("@user");
      const userData:any = userJSON ? JSON.parse(userJSON) : null;
      console.log("Local Storage: ", userData)
      setUserInfo(userData);
    } catch (e:any) {
      alert(e.message)
    }
  }

  React.useEffect(() => {
    if (response?.type=="success"){
      const {id_token} = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
    }
  },[response])

  React.useEffect(() => {
    checkLocalUser();
    const unsub = onAuthStateChanged(auth, async (user:any) => {
      if(user){
        console.log(JSON.stringify(user, null, 2))
        setUserInfo(user);
        await AsyncStorage.setItem("@user", JSON.stringify(user))
      } else {
        console.log('User is not Authenticated')
      }
    });

    return () => {unsub};
  },[auth, ])
  return userInfo ? <Play/> : <SignIn promptAsync={promptAsync}/>;
}
