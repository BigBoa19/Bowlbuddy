import { View, Text, SafeAreaView, FlatList, Image, TouchableOpacity, Modal, Dimensions } from 'react-native';
import React, { useState } from 'react';
import icons from '@/constants/icons';
import FormField from '../components/FormField';
import { questions } from '../functions/fetchDB';
import { UserContext } from '../context';
import { db } from '../../firebaseConfig';
import { doc, collection, query, onSnapshot } from 'firebase/firestore';
import { router } from 'expo-router';
import SavedQuestion from './SavedQuestion';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  runOnJS,
  Easing 
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

const Item = React.memo(({props, isVisible, onOpen, onClose}:any) => {
  // Create a shared value for the animation
  const translateX = useSharedValue(width);
  
  // Create animated styles based on the shared value
  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }]
    };
  });

  React.useEffect(() => {
    if (isVisible) {
      // Animate in from right
      translateX.value = withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.cubic)
      });
    } else {
      // Animate out to right
      translateX.value = withTiming(width, {
        duration: 300,
        easing: Easing.in(Easing.cubic)
      });
    }
  }, [isVisible]);

  const handleClose = () => {
    // Start the slide out animation
    translateX.value = withTiming(width, {
      duration: 300,
      easing: Easing.in(Easing.cubic)
    }, () => {
      // This callback runs after animation completes
      runOnJS(onClose)();
    });
  };

  return (
    <TouchableOpacity
      onPress={onOpen}
    >
      <Modal
        animationType="none"
        transparent={true}
        visible={isVisible}
        onRequestClose={handleClose}
      >
        <View className="flex-1 bg-black/50">
          <Animated.View style={[{ flex: 1 }, animatedStyles]}>
            <View className="flex-1 bg-background">
              <SavedQuestion
                {...{
                  question: props.question_sanitized,
                  answer: props.answer_sanitized,
                  onClose: handleClose,
                  questionId: props._id,
                }}
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
      
      <View
        className="flex-row items-center p-5 bg-primary mt-3 border-2 border-[#8a92eb] shadow-md rounded-xl"
      >
        <View className="flex-1 mr-4">
          <Text
            className="text-white text-xl font-gBook"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {props.answer_sanitized}
          </Text>
        </View>
        <Image
          source={icons.leftArrow}
          resizeMode="contain"
          tintColor="text-tertiary"
          className="w-6 h-6 rotate-180"
        />
      </View>
    </TouchableOpacity>
  );
});

const Saved = () => {
  const { userGoogle, userApple } = React.useContext(UserContext);
  const user = userGoogle || userApple;
  const [questions, setQuestions] = React.useState<any[]>([]);
  const [searchQuery, setQuery] = React.useState('');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  React.useEffect(() => {
    if (!user?.uid) {
      setQuestions([]);
      return;
    }
    const usersDocRef = doc(db, 'users', user.uid);
    const savedQuestionsRef = collection(usersDocRef, 'savedQuestions');
    const q = query(savedQuestionsRef);
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const questions = snapshot.docs.map((doc) => ({
        _id: doc.id,
        ...doc.data(),
      }));
      setQuestions(questions);
    });
    return () => unsubscribe();
  }, [user]);

  const filterData = (item: questions) => {
    if (item.answer_sanitized.toLowerCase().includes(searchQuery.toLowerCase())) {
      return (
        <Item 
          props={item} 
          isVisible={selectedQuestionId === item._id}
          onOpen={() => setSelectedQuestionId(item._id)}
          onClose={() => setSelectedQuestionId(null)}
        />
      );
    }
    return null;
  };

  return (
    <SafeAreaView className="flex-1 justify-center bg-background">
      <View className="flex-1 justify-start">
        {/* Header */}
        <View className="flex-row justify-between items-center p-2 pl-5">
          <Text className="text-tertiary text-3xl font-gBold">Saved</Text>
          <Image
            source={icons.play2}
            className="w-14 h-14 p-2 opacity-0"
            style={{ tintColor: '#cccfff' }}
            resizeMode="contain"
          />
        </View>
        {/* Border */}
        <View className="h-[1px] bg-tertiary" />
        {/* Search Bar */}
        <View className="justify-between shadow-lg">
          <FormField
            value={searchQuery}
            placeholder="Search"
            handleChangeText={(e) => setQuery(e)}
            otherStyles="mt-2 pb-3 p-3"
            startCaps={false}
            titleStyles="text-blue-400"
            icon={icons.search}
          />
        </View>
        {/* Item List */}
        <FlatList
          data={questions}
          renderItem={({ item }) => filterData(item)}
          keyExtractor={(item) => item._id}
          className="px-3"
          ListEmptyComponent={() => (
            <View className="flex-1 items-center justify-center mt-20">
              <Text className="text-tertiary text-xl font-gBook text-center">
                Save questions by pressing the save button!
              </Text>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default Saved;