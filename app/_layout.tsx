import { Stack, SplashScreen } from "expo-router";
import "../global.css";
import { UserContext } from "./context"; import useUserData from './functions/useUserData';
import { useFonts } from "expo-font";
import React from "react";
import { AlertNotificationRoot } from 'react-native-alert-notification';
import { BuzzCircleContext } from "./context"

export default function RootLayout() {
  const [isAnimating, setIsAnimating] = React.useState(false);
  const userData = useUserData();


  const [fontsLoaded, error] = useFonts({
    "Gotham-Black": require("../assets/fonts/Gotham-Black.otf"),
    "Gotham-BlackItalic": require("../assets/fonts/Gotham-BlackItalic.otf"),
    "Gotham-Bold": require("../assets/fonts/Gotham-Bold.otf"),
    "Gotham-BoldItalic": require("../assets/fonts/Gotham-BoldItalic.otf"),
    "Gotham-Book": require("../assets/fonts/Gotham-Book.otf"),
    "Gotham-BookItalic": require("../assets/fonts/Gotham-BookItalic.otf"),
    "Gotham-Light": require("../assets/fonts/Gotham-Light.otf"),
    "Gotham-LightItalic": require("../assets/fonts/Gotham-LightItalic.otf"),
    "Gotham-Medium": require("../assets/fonts/Gotham-Medium.otf"),
    "Gotham-MediumItalic": require("../assets/fonts/Gotham-MediumItalic.otf"),
    "Gotham-Thin": require("../assets/fonts/Gotham-Thin.otf"),
    "Gotham-ThinItalic": require("../assets/fonts/Gotham-ThinItalic.otf"),
    "Gotham-Ultra": require("../assets/fonts/Gotham-Ultra.otf"),
    "Gotham-UltraItalic": require("../assets/fonts/Gotham-UltraItalic.otf"),
    "Gotham-XLight": require("../assets/fonts/Gotham-XLight.otf"),
    "Gotham-XLightItalic": require("../assets/fonts/Gotham-XLightItalic.otf"),
  });
  React.useEffect(() => {
    if(error) throw error;
    if(fontsLoaded) SplashScreen.hideAsync();
  }
  , [fontsLoaded,error])
  if (!fontsLoaded && !error) return null;

  return (
    <AlertNotificationRoot>
      <BuzzCircleContext.Provider value={{ isAnimating:isAnimating, setAnimating:setIsAnimating }}>
        <UserContext.Provider value={{ user: userData.user }} >
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ headerShown: false }} />
          </Stack>
        </UserContext.Provider>
      </BuzzCircleContext.Provider>
    </AlertNotificationRoot>
  )
}
