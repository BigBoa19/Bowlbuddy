import { auth, db } from '@/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import React from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { FirebaseAuthTypes, getAuth, onAuthStateChanged as onAppleAuthStateChanged } from '@react-native-firebase/auth';

const addAppleUserToDatabase = async (user: FirebaseAuthTypes.User) => {
  if (!user) return;
  const date = new Date();
  const dateString = date.toLocaleString();
  const usersDocRef = doc(db, 'users', user.uid);
  await setDoc(usersDocRef, { email: user.email, name:user.displayName, timestamp: dateString}, { merge: true } );
}


export default function useUserData() {
  const [userGoogle, setUserGoogle] = React.useState<User | null>(null);
  const [userApple, setUserApple] = React.useState<FirebaseAuthTypes.User | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserGoogle(user);
      console.log(user? user.displayName : "no user")
    });
    return () => unsubscribe();
  }, [])

  React.useEffect(() => {
    const unsubscribe = onAppleAuthStateChanged(getAuth(), (user) => {
      setUserApple(user);
      console.log("user: ", user)
      console.log(user ? "Display Name: " + user.displayName : "no user")
      if (user) addAppleUserToDatabase(user);
    });
    return () => unsubscribe();
  }, [])

  return { userGoogle, userApple };
}