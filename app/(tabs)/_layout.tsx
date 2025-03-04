import { View, Text, Image, Animated, SafeAreaView, Button, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import React from 'react';
import Voice from '@react-native-voice/voice';
import icons from "@/constants/icons";
import { BuzzCircleContext, QuestionContext, SettingsContext,PointsContext } from '../context';
import { Audio } from 'expo-av';
// @ts-ignore
import checkAnswer from "../../node_modules/qb-answer-checker/src/check-answer.js"

const TabIcon = ({icon, color, name, focused}: any) => {
  return(
    <View className='items-center justify-center gap-1 ' style={{ paddingTop: 20 }}>
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        className='w-6 h-6'
      />
      <Text className={`${focused ? 'font-gBold text-secondary' : 'font-gBook text-tertiary'} text-xs text-center`}
        numberOfLines={1}
        style={{ width: 61 }}
      >
        {name}
      </Text>
    </View>
  )
}

export default function TabsLayout() {
  const { currentQuestion } = React.useContext(QuestionContext);
  const { isAnimating, setAnimating} = React.useContext(BuzzCircleContext);
  const {enableTimer, allowRebuzz} = React.useContext(SettingsContext);
  const {points, setPoints} = React.useContext(PointsContext)

  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const [ buzzModal, setBuzzModal ] = React.useState(false);

  const BuzzScreen = () => {
    const [ inputAnswer, setInputAnswer ] = React.useState('')
    const [ started, setStarted ] = React.useState(false);
    const [ results, setResults ] = React.useState([]);
    const themeValue = React.useRef(new Animated.Value(0)).current;
    const [ backgroundColor, setBackgroundColor] = React.useState(themeValue.interpolate({
      inputRange: [0, 1],
      outputRange: ["#8a92eb", "#00cd00"], // Secondary to Green
    }))
    

    const shiftValue = React.useRef(new Animated.Value(-350)).current;
    const [barColor, setBarColor] = React.useState(shiftValue.interpolate({
      inputRange: [-350, -150, 0], // Three stops: start, middle, end
      outputRange: ['#66ff00', '#ffff00', '#e61d06'], // Green -> Yellow -> Red
    }))
    const [barOpacity, setBarOpacity] = React.useState(1);

    const isAnswerChecked = React.useRef(false); // Track if checkAnswer has been called
    const isMounted = React.useRef(true); // Track if the component is mounted
    const animationRef = React.useRef<Animated.CompositeAnimation | null>(null);
    
    React.useEffect(() => {
      if(enableTimer){
        console.log('Starting animation'); // Debugging
        isAnswerChecked.current = false; // Reset the guard
    
        animationRef.current = Animated.timing(shiftValue, {
          toValue: 0,
          duration: 10000,
          useNativeDriver: true,
        });
    
        animationRef.current.start(({ finished }) => {
          if (finished && !isAnswerChecked.current && isMounted.current) {
            // console.log('Animation completed'); // Debugging
            isAnswerChecked.current = true;
            console.log(inputAnswer)
            startAnswerCheck(inputAnswer);
          }
        });
    
        // Cleanup function to stop the animation on unmount
        return () => {
          // console.log('Cleaning up animation'); // Debugging
          isMounted.current = false; // Mark component as unmounted
          if (animationRef.current) {
            animationRef.current.stop(); // Stop the animation
          }
        };
      } else { setBarOpacity(0) }
    }, []);

    const playSound = async (checkRight:boolean) => {
      const soundPath = checkRight 
        ? require('../../assets/audio/right-answer.mp3') 
        : require('../../assets/audio/wrong-answer.mp3');
      const { sound } = await Audio.Sound.createAsync(soundPath);
      if(checkRight){
        await sound.setRateAsync(2.0, true);
      }
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    }

    const onBuzzClose = () => {
      scaleValue.setValue(0);
      setAnimating(false);
      setBuzzModal(false);
    }

    React.useEffect(() => {
      Voice.onSpeechError = onSpeechError;
      Voice.onSpeechResults = onSpeechResults;

      return () => {
        Voice.destroy().then(Voice.removeAllListeners);
      }
    }, []);

    const startSpeechToText = async () => {
      await Voice.start("en-US");
      setStarted(true);
    };

    const stopSpeechToText = async () => {
      await Voice.stop();
      setStarted(false);
    };

    const onSpeechResults = (result: any) => {
      setResults(result.value);
      setInputAnswer(result.value[0])
    };

    const onSpeechError = (error: any) => {
      console.log(error);
    };
    
    const startAnswerCheck = (inputAnswer:string) =>{
      shiftValue.stopAnimation();
      console.log(currentQuestion.answer)
      const response = checkAnswer(currentQuestion.answer, inputAnswer);
      console.log("Response: ", response.directive)
      if(response.directedPrompt){ //if answer is prompt
        //code for prompt
      }

      if(response.directive=='accept'){
        playSound(true)
      }
      else if(response.directive=='reject'){
        playSound(false);
        setBackgroundColor(themeValue.interpolate({
          inputRange: [0, 1],
          outputRange: ["#8a92eb", "#b30000"], // Secondary to Red
        }))
      }
      Animated.timing(themeValue, {
        toValue: 1,
        duration:100,
        useNativeDriver:true
      }).start(()=>{
        setTimeout(()=>{},)
        Animated.timing(themeValue, {
          toValue:0,
          duration:500,
          useNativeDriver:true
        }).start(()=>{
          if(response.directive=='accept'){
            setPoints(10);
          }else{
            setPoints(0)
          }
          onBuzzClose()
        })
      })
    }
    

    return (
      <View className='flex-1 bg-secondary'>
        <Animated.View className='flex-1 justify-center' style = {{backgroundColor:backgroundColor}}>
          {/* Bar + BuzzScreen Text */}
          <View className='flex-1 justify-between mt-9 mx-9'>
            {/* Bar */}
            {/* <Animated.View className='border-2 p-3 rounded-full mt-16 shadow-lg' style={{
                transform:[{scaleX:shiftValue}], backgroundColor:barColor
                }}>
            </Animated.View> */}
            <View className='shadow-lg shadow-gray-700' style={{opacity:barOpacity}}>
              <View className='w-full h-6 bg-gray-500 rounded-full overflow-hidden mt-16'>
              {/* Animated Progress Bar */}
                <Animated.View
                  className='h-full rounded-full shadow-lg shadow-gray-900'
                  style={{
                    transform: [{ translateX:shiftValue }],
                    backgroundColor: barColor,
                    width: '100%', // Set the initial width to 100%
                    transformOrigin: 'left', // Ensure scaling starts from the left
                  }}
                />
              </View>
            </View>

            <Text className='text-white text-3xl text-center'>
              BuzzScreen
            </Text>
          </View>
          
          {/* Rest of it */}
          <View className='flex-1 items-center justify-center'>
            {!started ? <Button title='Start Speech to Text' onPress={startSpeechToText} /> : undefined}
            {started ? <Button title='Stop Speech to Text' onPress={stopSpeechToText} /> : undefined}
            {results.map((result, index) => <Text className='text-white text-xl' key={index}>{result}</Text>)}
            <TextInput
              value={inputAnswer}
              placeholder='Answer Here'
              onChangeText={(e) => setInputAnswer(e)}
              className='flex-row w-96 border-2 p-2 rounded-lg'
              autoCorrect={false}
              autoCapitalize="none"
            />
            <TouchableOpacity className='mt-5 mb-4 border-2 p-4 w-44 items-center justify-center bg-red-300 rounded-md' onPress={()=>startAnswerCheck(inputAnswer)}>
              <Text className='font-gBold'>Submit Answer</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onBuzzClose}>
              <Text className=' text-white text-3xl'>Close</Text>
            </TouchableOpacity>
          </View>
          {/* Filler View */}
          <View className='flex-1'></View>
        </Animated.View>
      </View>
    )
  }

  const BuzzCircle = () => {
    return (
      <Animated.View style={{
        transform: [
          {scale:scaleValue},
          {translateX: 0},
          {translateY: -17},
        ],
        zIndex: 9999
      }} className='absolute flex-1 bg-transparent items-center justify-end bottom-28 right-44 left-44'>
          <View className='w-6 h-6 p-9 rounded-full bg-secondary'></View>
      </Animated.View>
    )
  }

  
  React.useEffect(()=>{
    if(isAnimating == true){
      scaleValue.setValue(0);
      Animated.timing(scaleValue, {
          toValue: 16, // Scale up to x times the original size
          duration: 400, // Animation duration in milliseconds
          useNativeDriver: true, // Use native driver for better performance
        }).start(() => {
          setBuzzModal(true)
      });
    }
    else{
    }
  }, [isAnimating])

  return (
    <View className='flex-1'>
      <Modal
          animationType="fade"
          transparent={true}
          visible={buzzModal}
          onRequestClose={() => {
            setBuzzModal(false); // Close the modal when back button is pressed (for Android)
          }}>
          <BuzzScreen />
      </Modal>
      {isAnimating && <BuzzCircle/>}
      <Tabs screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#8a92eb',
        tabBarInactiveTintColor: '#ccccff',
        tabBarStyle:{
          backgroundColor: '#161622',
          borderTopWidth: 1,
          borderTopColor: '#232533',
          height: 80
        }
      }}>
        <Tabs.Screen 
          name='play' 
          options={{
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabIcon
                icon={icons.play}
                color={color}
                name='Play'
                focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen 
          name='multiplayer' 
          options={{
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabIcon
                icon={icons.multiplayer}
                color={color}
                name='Multiplayer'
                focused={focused}
              />
            )
          }}
        /><Tabs.Screen 
        name='saved' 
        options={{
          headerShown: false,
          tabBarIcon: ({color, focused}) => (
            <TabIcon
              icon={icons.save}
              color={color}
              name='Saved'
              focused={focused}
            />
          )
        }}
      />
        <Tabs.Screen 
          name='profile' 
          options={{
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
              <TabIcon
                icon={icons.profile}
                color={color}
                name='Profile'
                focused={focused}
              />
            )
          }}
        />
        <Tabs.Screen
          name='SavedQuestion'
          options={{ 
            href: null, 
            headerShown:false,
            tabBarStyle: { display: 'none' },
            animation:'shift'
          }} 
        />
      </Tabs>
    </View>
  )
}
