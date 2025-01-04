import SignIn from "./(auth)/sign-in"
import * as Google from "expo-auth-session/providers/google"
import * as WebBrowser from "expo-web-browser"
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth"
import { auth } from "../firebaseConfig"
import * as React from "react"
import UserContext from './context';
import { Redirect } from "expo-router"

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const { user } = React.useContext(UserContext);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId:"686553870661-e1s26teaahepleu253tmsa8tkmcume1q.apps.googleusercontent.com",
    androidClientId:"686553870661-4n04cavoeg33jsftm084k769tvhecf3n.apps.googleusercontent.com",
  })

  React.useEffect(() => {
    if (response?.type=="success"){
      const {id_token} = response.params;
      const credential = GoogleAuthProvider.credential(id_token);
      signInWithCredential(auth, credential)
    }
  },[response])


  return user ? <Redirect href='/play'/> : <SignIn promptAsync={promptAsync}/>;
}
