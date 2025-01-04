import { auth } from '@/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import React from 'react';

export default function useUserData() {
  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      console.log(user? user.displayName : "no user")
    });
    return () => unsubscribe();
  }, [])

  return { user };
}