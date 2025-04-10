import React, { useState, useEffect } from "react"
import { UserContext } from './context';
import { router } from "expo-router"
import SignIn from "./(auth)/sign-in"
import SplashScreen from './components/SplashScreen';

export default function Index() {
  const { user } = React.useContext(UserContext);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!showSplash) {
      if (user) {
        router.replace('/play');
      }
    }
  }, [showSplash, user]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }
  
  return <SignIn />;
}