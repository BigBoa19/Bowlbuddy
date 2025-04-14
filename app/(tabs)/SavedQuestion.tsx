import { Text, View, SafeAreaView, TouchableOpacity, Image, Animated, Alert } from 'react-native';
import React, { useState, useRef } from 'react';
import icons from '@/constants/icons';
import { useLocalSearchParams, router } from 'expo-router';
import { db } from '../../firebaseConfig';
import { doc, deleteDoc } from 'firebase/firestore';
import { UserContext } from '../context';
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';

const SavedQuestion = ({question, answer, onClose, questionId}:any) => {
  const { user } = React.useContext(UserContext);

  const handleGoBack = () => { 
    if(flipped) {
      flipCard();
    }
    onClose()
  };

  const handleDelete = async () => {
    Alert.alert(
      "Delete Question",
      "Are you sure you want to delete this question?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (!user?.uid) return;
              const usersDocRef = doc(db, 'users', user.uid);
              const savedQuestionRef = doc(usersDocRef, 'savedQuestions', questionId);
              await deleteDoc(savedQuestionRef);
              Toast.show({
                type: ALERT_TYPE.SUCCESS,
                title: 'Question Deleted!',
              });
              onClose();
            } catch (error) {
              console.error('Error deleting question:', error);
              Toast.show({
                type: ALERT_TYPE.DANGER,
                title: 'Failed to delete question',
              });
            }
          }
        }
      ]
    );
  };

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
      <View className='flex-row justify-between items-center p-4'>
        <TouchableOpacity 
          onPress={handleGoBack}
          className="p-4 -m-4"
        >
          <Image 
            source={icons.leftArrow}
            resizeMode='contain' 
            className='w-[20px] h-[20px]' 
            tintColor={"#ccccff"} 
          />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={handleDelete}
          className="p-4 -m-4"
        >
          <Image 
            source={icons.trash}
            resizeMode='contain' 
            className='w-[20px] h-[20px]' 
            tintColor={"#ff4444"} 
          />
        </TouchableOpacity>
      </View>
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
