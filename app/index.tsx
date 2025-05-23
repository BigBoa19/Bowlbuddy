import React, { useState, useEffect } from "react"
import { UserContext } from './context';
import { router } from "expo-router"
import SignIn from "./(auth)/sign-in"
import SplashScreen from './components/SplashScreen';
import { View } from 'react-native';

export default function Index() {
  const { userGoogle, userApple } = React.useContext(UserContext);
  const user = userGoogle || userApple;
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
  
  return user ? <View style={{ flex: 1, backgroundColor: '#252537' }} /> : <SignIn />;
}