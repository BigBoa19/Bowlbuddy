// BuzzScreen.tsx
import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, Button, TouchableOpacity, TextInput, Animated, Image } from 'react-native';
import Voice from '@react-native-voice/voice';
import { Audio } from 'expo-av';
import { BuzzCircleContext, QuestionContext, SettingsContext, PointsContext, STTContext } from '../context';
// @ts-ignore
import checkAnswer from "../../node_modules/qb-answer-checker/src/check-answer.js";
import CustomButton from '../components/CustomButton';
import icons from '@/constants/icons';


interface BuzzScreenProps {
  scaleValue: Animated.Value;
  setBuzzModal: React.Dispatch<React.SetStateAction<boolean>>;
}

const BuzzScreen: React.FC<BuzzScreenProps> = ({ scaleValue, setBuzzModal }) => {
  const { currentQuestion } = useContext(QuestionContext);
  const { setAnimating } = useContext(BuzzCircleContext);
  const { enableTimer } = useContext(SettingsContext);
  const { setPoints } = useContext(PointsContext);
  const { startSTT } = useContext(STTContext);

  const [inputAnswer, setInputAnswer] = useState('');
  const [started, setStarted] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const themeValue = useRef(new Animated.Value(0)).current;
  const [backgroundColor, setBackgroundColor] = useState(
    themeValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['#8a92eb', '#00cd00'],
    })
  );

  const shiftValue = useRef(new Animated.Value(-350)).current;
  const [barColor] = useState(
    shiftValue.interpolate({
      inputRange: [-350, -150, 0],
      outputRange: ['#66ff00', '#ffff00', '#e61d06'],
    })
  );
  const [barOpacity, setBarOpacity] = useState(1);

  const isAnswerChecked = useRef<boolean>(false);
  const isMounted = useRef<boolean>(true);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (enableTimer) {
      console.log('Starting animation');
      isAnswerChecked.current = false;
      animationRef.current = Animated.timing(shiftValue, {
        toValue: 0,
        duration: 10000,
        useNativeDriver: true,
      });
      animationRef.current.start(({ finished }) => {
        if (finished && !isAnswerChecked.current && isMounted.current) {
          isAnswerChecked.current = true;
          console.log(inputAnswer);
          answerCheck(inputAnswer);
        }
      });
      return () => {
        isMounted.current = false;
        if (animationRef.current) {
          animationRef.current.stop();
        }
      };
    } else {
      setBarOpacity(0);
    }
  }, []);

  const playSound = async (checkRight: boolean) => {
    const soundPath = checkRight
      ? require('../../assets/audio/right-answer.mp3')
      : require('../../assets/audio/wrong-answer.mp3');
    const { sound } = await Audio.Sound.createAsync(soundPath);
    if (checkRight) {
      await sound.setRateAsync(2.0, true);
    }
    await sound.playAsync();
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
      }
    });
  };

  const onBuzzClose = () => {
    scaleValue.setValue(0);
    setAnimating(false);
    setBuzzModal(false);
  };

  useEffect(() => {
    console.log('ran');
    const timer = setTimeout(() => {
      if (startSTT) {
        startSpeechToText();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    Voice.onSpeechError = onSpeechError;
    Voice.onSpeechResults = onSpeechResults;
    return () => {
        Voice.destroy().then(Voice.removeAllListeners);
        console.log("Voice destroyed");
    };
  }, []);

  const startSpeechToText = async () => {
    try {
      await Voice.start('en-US');
      setStarted(true);
    } catch (error) {
      console.error(error);
    }
  };

  const stopSpeechToText = async () => {
    try {
      await Voice.stop();
      setStarted(false);
    } catch (error) {
      console.error(error);
    }
  };

  const onSpeechResults = (result: any) => {
    setResults(result.value);
    setInputAnswer(result.value[0]);
  };

  const onSpeechError = (error: any) => {
    console.error(error);
  };

  const answerCheck = (inputAnswer: string) => {
    shiftValue.stopAnimation();
    console.log(currentQuestion.answer);
    const response = checkAnswer(currentQuestion.answer, inputAnswer);
    console.log('Response: ', response.directive);
    if (response.directedPrompt) {
      // handle directed prompt if needed
    }
    if (response.directive === 'accept') {
      playSound(true);
    } else if (response.directive === 'reject') {
      playSound(false);
      setBackgroundColor(
        themeValue.interpolate({
          inputRange: [0, 1],
          outputRange: ['#8a92eb', '#b30000'],
        })
      );
    }
    Animated.timing(themeValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start(() => {
      Animated.timing(themeValue, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        if (response.directive === 'accept') {
          setPoints(10);
        } else {
          setPoints(0);
        }
        onBuzzClose();
      });
    });
  };

  const handleClear = () => {
    setResults([]);
    setInputAnswer('');
  }
  
  

  return (
    <View className='flex-1 bg-secondary'>
      <Animated.View className='flex-1 justify-center' style={{ backgroundColor }}>
        {/* Bar + BuzzScreen Text */}
        <View className='flex-1 justify-between mt-9 mx-9'>
          <View className='shadow-lg shadow-gray-700' style={{ opacity: barOpacity }}>
            <View className='w-full h-6 bg-gray-500 rounded-full overflow-hidden mt-16'>
              <Animated.View
                className='h-full rounded-full shadow-lg shadow-gray-900'
                style={{
                  transform: [{ translateX: shiftValue }],
                  backgroundColor: barColor,
                  width: '100%',
                  transformOrigin: 'left',
                }}
              />
            </View>
          </View>
          <Text className='text-tertiary text-3xl font-gBold text-center'>BuzzScreen</Text>
        </View>

        {/* Rest of it */}
        <View className='flex-1 items-center justify-center'>
          {!started && <CustomButton title='Start Speech to text' containerStyles='my-5'
                        handlePress = {startSpeechToText}/>}
          {started && <CustomButton title='Stop Speech to text' containerStyles='my-5'
                        handlePress = {stopSpeechToText}/>}
          {/* {results.map((result, index) => (
            <Text className='text-white text-xl' key={index}>
              {result}
            </Text>
          ))} */}
          <View className='items-center relative'>
            <TextInput
              value={inputAnswer}
              placeholder='Answer Here'
              onChangeText={setInputAnswer}
              className='flex-row w-96 border-2 p-2 rounded-lg'
              autoCorrect={false}
              autoCapitalize='none'
            />
            <TouchableOpacity onPress={handleClear}  className='absolute right-0 w-10 h-10 p-2'>
            <Image source={icons.x} className='absolute right-0 w-10 h-10 p-2' style={{tintColor: '#cccfff'}} resizeMode='contain' />
            </TouchableOpacity>
            
          </View>
          
          <CustomButton handlePress={() => answerCheck(inputAnswer)} title='Submit Answer'
          containerStyles='mt-5 mb-4 border-2 p-4 w-44 items-center justify-center'/>


          <CustomButton title='Close' containerStyles='mt-5' handlePress={onBuzzClose}/>
        </View>
        <View className='flex-1' />
      </Animated.View>
    </View>
  );
};

export default BuzzScreen;