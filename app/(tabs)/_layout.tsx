import { View, Text, Image, Animated, SafeAreaView, Button, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Tabs, Redirect } from 'expo-router';
import React, { useEffect } from 'react';
import Voice from '@react-native-voice/voice';
import icons from "@/constants/icons";
import { BuzzCircleContext, QuestionContext } from '../context';

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
  const { currentQuestion, setCurrentQuestion } = React.useContext(QuestionContext);
  const { isAnimating, setAnimating} = React.useContext(BuzzCircleContext)
  const scaleValue = React.useRef(new Animated.Value(0)).current;
  const [ buzzModal, setBuzzModal ] = React.useState(false)


  

  const BuzzScreen = () => {
    const [ inputAnswer, setInputAnswer ] = React.useState('')
    const [ started, setStarted ] = React.useState(false);
    const [ results, setResults ] = React.useState([]);
    const [ checkTrue, setCheckTrue ] = React.useState(false);
    const [ checkFalse, setCheckFalse ] = React.useState(false);
    const onBuzzClose = () => {
      scaleValue.setValue(0);
      setAnimating(false);
      setBuzzModal(false);
      setCheckFalse(false); setCheckTrue(false);
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
    
    const checkAnswer = (answer:string) =>{
      setCheckTrue(false);
      setCheckFalse(false);
      if(currentQuestion.answer_sanitized.toLowerCase().includes(answer.toLowerCase()) && answer!='' && answer!=' '){
        setCheckTrue(true);
      }
      else{
        setCheckFalse(true);
      }
    }

    return (
      <View className='flex-1 bg-primary'>
        <SafeAreaView className='flex-1 items-center justify-center bg-secondary'>
          <Text className='text-white text-3xl'>
              BuzzScreen
          </Text>
          <Text className='text-s text-red-200'>Answer: {currentQuestion.answer_sanitized}</Text>
          {!started ? <Button title='Start Speech to Text' onPress={startSpeechToText} /> : undefined}
          {started ? <Button title='Stop Speech to Text' onPress={stopSpeechToText} /> : undefined}
          {results.map((result, index) => <Text className='text-white text-xl' key={index}>{result}</Text>)}
          <TextInput
            value={inputAnswer}
            placeholder='Answer Here'
            onChangeText={(e) => setInputAnswer(e)}
            className='flex-row w-96 border-2 p-2 rounded-lg'
          />
          <TouchableOpacity className='mt-5 mb-4 border-2 p-4 w-44 items-center justify-center bg-red-300 rounded-md' onPress={()=>checkAnswer(inputAnswer)}>
            <Text className='font-gBold'>Submit Answer</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onBuzzClose}>
            <Text className=' text-white text-3xl'>Close</Text>
          </TouchableOpacity>
          { checkTrue && <Text className='text-2xl text-green-300'>Correct!</Text> }
          { checkFalse && <Text className='text-2xl text-red-500'>Incorrect!</Text> }
        </SafeAreaView>
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
            tabBarStyle: { display: 'none' }
          }} 
        />
      </Tabs>
    </View>
  )
}
