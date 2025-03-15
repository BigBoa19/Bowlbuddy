import { Stack, SplashScreen } from "expo-router";
import "../global.css";
import { QuestionContext, SettingsContext, UserContext, PointsContext, STTContext } from "./context"; import useUserData from './functions/useUserData';
import { useFonts } from "expo-font";
import React from "react";
import { AlertNotificationRoot } from 'react-native-alert-notification';
import { BuzzCircleContext } from "./context"
import { Audio } from "expo-av";

export default function RootLayout() {
  const [currentQuestion, setCurrentQuestion] = React.useState({_id:'', question:'', question_sanitized:'', answer:'',  answer_sanitized:''})
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [enableTimer, setEnableTimer] = React.useState(true);
  const [allowRebuzz, setAllowRebuzz] = React.useState(false);
  const [points, setPoints] = React.useState(-1);
  const [startSTT, setStartSTT] = React.useState(false);
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

  async function setAudioMode() {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
    });
    console.log("Audio Mode Set");
  }

  React.useEffect(() => {
    setAudioMode();
  },[])
  
  React.useEffect(() => {
    if(error) throw error;
    if(fontsLoaded) SplashScreen.hideAsync();
  }
  , [fontsLoaded,error])
  if (!fontsLoaded && !error) return null;

  return (
    <AlertNotificationRoot>
      {/* Providers */}
      <PointsContext.Provider value={{points:points, setPoints:setPoints}}>
      <SettingsContext.Provider value = {{
        enableTimer:enableTimer, 
        setEnableTimer:setEnableTimer,
        allowRebuzz:allowRebuzz,
        setAllowRebuzz:setAllowRebuzz,
      }}>
      <QuestionContext.Provider value={{currentQuestion:currentQuestion, setCurrentQuestion:setCurrentQuestion}}>
      <BuzzCircleContext.Provider value={{ isAnimating:isAnimating, setAnimating:setIsAnimating }}>
      <UserContext.Provider value={{ user: userData.user }} >
      <STTContext.Provider value={{startSTT:startSTT, setStartSTT:setStartSTT}}>
      
      {/* Providers */}

        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="loading" options={{ headerShown: false }} />
        </Stack>
      
      {/* Providers */}
      </STTContext.Provider>
      </UserContext.Provider>
      </BuzzCircleContext.Provider>
      </QuestionContext.Provider>
      </SettingsContext.Provider>
      </PointsContext.Provider>
      {/* Providers */}
    </AlertNotificationRoot>
  )
}
