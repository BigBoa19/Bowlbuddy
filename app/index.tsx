import React from "react"
import SignIn from "./(auth)/sign-in"
import * as Google from "expo-auth-session/providers/google"
import * as WebBrowser from "expo-web-browser"
import { GoogleAuthProvider, signInWithCredential, User } from "firebase/auth"
import { auth, db } from "../firebaseConfig"
import UserContext from './context';
import { Redirect } from "expo-router"
import { doc, setDoc } from "firebase/firestore"

WebBrowser.maybeCompleteAuthSession();

export default function Index() {
  const { user } = React.useContext(UserContext);

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId:"686553870661-e1s26teaahepleu253tmsa8tkmcume1q.apps.googleusercontent.com",
    androidClientId:"686553870661-4n04cavoeg33jsftm084k769tvhecf3n.apps.googleusercontent.com",
  })

  const addUserToDatabase = async (user: User) => {
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


  return user ? <Redirect href='/play'/> : <SignIn promptAsync={promptAsync}/>;
}
