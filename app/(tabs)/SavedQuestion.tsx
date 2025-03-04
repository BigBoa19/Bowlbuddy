import { Text, View, SafeAreaView, TouchableOpacity, Image, Animated } from 'react-native';
import React, { useState, useRef } from 'react';
import icons from '@/constants/icons';
import { useLocalSearchParams, router } from 'expo-router';

const SavedQuestion = () => {
  const handleGoBack = () => { 
    router.navigate("/(tabs)/saved"); 
    if(flipped) {
      flipCard();
    }
  };
  const { question, answer } = useLocalSearchParams<{
    question: string;
    answer: string;
  }>();

  const [flipped, setFlipped] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    if (flipped) {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => setFlipped(false));
    } else {
      Animated.timing(animatedValue, {
        toValue: 180,
        duration: 800,
        useNativeDriver: true,
      }).start(() => setFlipped(true));
    }
  };

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });
  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontAnimatedStyle = {
    transform: [
      { perspective: 1000 },
      { rotateY: frontInterpolate },
    ],
  };

  const backAnimatedStyle = {
    transform: [
      { perspective: 1000 },
      { rotateY: backInterpolate },
    ],
    position: 'absolute' as const,
    top: 0,
  };

  return (
    <SafeAreaView className='bg-background flex-1'>
      <TouchableOpacity onPress={handleGoBack} className='p-4'>
        <Image 
          source={icons.leftArrow}
          resizeMode='contain' 
          className='w-[20px] h-[20px]' 
          tintColor={"#ccccff"} 
        />
      </TouchableOpacity>
      <View className='flex-1 justify-center px-3'>
      <TouchableOpacity onPress={flipCard}>
        <View className='items-center justify-center'>
          {/* Front side of the flashcard */}
          <Animated.View className={"mx-4 mb-5 bg-primary border-tertiary border-2 rounded-lg p-5 shadow-md"}
            style={[
              {padding: 20},
              frontAnimatedStyle,
            ]}
          >
            <Text className='text-sm text-white text-left font-gBook'>{question}</Text>
          </Animated.View>
          {/* Back side of the flashcard */}
          <Animated.View className={"mx-4 mb-5 bg-primary border-tertiary border-2 rounded-lg p-5 shadow-md"}
            style={[
              {width: '100%', height: '100%', justifyContent: 'center', backfaceVisibility: 'hidden'},
              backAnimatedStyle,
            ]}
          >
            <Text className='text-sm text-white text-center font-gBook'>{answer}</Text>
          </Animated.View>
        </View>
      </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default SavedQuestion;
