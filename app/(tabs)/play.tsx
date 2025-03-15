import { SafeAreaView, ScrollView, View, Text, Image, TouchableOpacity, Modal, FlatList, Button, Animated } from 'react-native'
import React from 'react'
import icons from '@/constants/icons'
import FocusedTextAnimator from '../components/TextAnimator'
import { questions, fetchDBQuestions } from '../functions/fetchDB'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { db } from '../../firebaseConfig'
import { doc, setDoc, collection } from 'firebase/firestore'
import { UserContext, BuzzCircleContext, QuestionContext, SettingsContext, PointsContext } from '../context';
import SettingsModal from '../components/SettingsModal'
import { throwIfAudioIsDisabled } from 'expo-av/build/Audio/AudioAvailability'
import Loading from '../loading'

const Play = () => {
  const { isAnimating, setAnimating } = React.useContext(BuzzCircleContext);
  const { enableTimer, setEnableTimer, allowRebuzz, setAllowRebuzz } = React.useContext(SettingsContext);
  const { user } = React.useContext(UserContext);
  const { setCurrentQuestion } = React.useContext(QuestionContext);
  const { points } = React.useContext(PointsContext);

  const [ paused , setPaused ] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [ height, setHeight] = React.useState(0);
  const [ currentPage, setCurrentPage] = React.useState(0);
  const [ questions , setQuestions ] = React.useState<questions[]>([]);

  const [ showStart , setShowStart ] = React.useState(true);

  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const [ difficulties , setDifficulties ] = React.useState<number[] | undefined>(undefined);
  const [categories, setCategories] = React.useState<string[] | undefined>(undefined);
  const [readingSpeed, setReadingSpeed] = React.useState(150);
  const [isLoading, setIsLoading] = React.useState(false);

  const [ score, setScore ] = React.useState(0)
  const [ correct, setCorrect ] = React.useState<boolean[]>([]);
  const [ correctCount, setCorrectCount ] = React.useState(0);
  const [ seen, setSeen ] = React.useState(0)
  const [ answered, setAnswered ] = React.useState<boolean[]>([]); // the number of times answered PER QUESTION
  const [ answeredCount, setAnsweredCount ] = React.useState(0);
  const [ finished, setFinished ] = React.useState<boolean[]>([]);

  const [viewedIndices, setViewedIndices] = React.useState<boolean[]>([]); // Track viewed items using an array

  const [reset, setReset] = React.useState(false);
  
  const shiftValue = React.useRef(new Animated.Value(-380)).current;
  const [barColor, setBarColor] = React.useState(shiftValue.interpolate({
    inputRange: [-380, -190, 0], // Three stops: start, middle, end
    outputRange: ['#66ff00', '#ffff00', '#e61d06'], // Green -> Yellow -> Red
  }))

  React.useEffect(()=>{
    console.log("Enable Timer:", enableTimer)
    console.log("Allow Rebuzz:", allowRebuzz)
  },[enableTimer,allowRebuzz])

  React.useEffect(()=>{
    if (difficulties && difficulties.length === 0) {
      setDifficulties(undefined);
    }
  },[difficulties, categories]) 

  const fetchData = async () => {
    
    Animated.timing(scaleValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true, 
    }).start(() => {
      setShowStart(false);
    });

    fetchDBQuestions({difficulties: difficulties, categories: categories }).then((questions) => {
      setQuestions(questions)
      setCurrentQuestion(questions[0])
      setAnswered([false])
      setFinished([false])
      setViewedIndices([false])
      setSeen(1)
      appendQuestion()
    });
    
  }

  const appendQuestion = async () => {
    if (isLoading) return;
  
    setIsLoading(true);
    const newQuestion = await fetchDBQuestions({ difficulties: difficulties, categories: categories });
    setQuestions(prevQuestions => [...prevQuestions, newQuestion[0]]);
    setAnswered(prev => [...prev, false])
    setFinished(prev => [...prev, false])
    setCorrect(prev => [...prev, false])
    setViewedIndices(prev => [...prev, false])
  
    setIsLoading(false);
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const page = Math.round(offsetY / height);
    setCurrentPage(page);
    setCurrentQuestion(questions[currentPage])
    if(finished[currentPage]){
      shiftValue.setValue(0)
    } else {
      shiftValue.setValue(-380)
    }

    if (page > 0) {
      setFinished(prev => {
        const newFinished = [...prev];
        newFinished[page - 1] = true;
        return newFinished;
      });
    }
  };

  const handleSave = async (question: questions) => {
    try {
      const usersDocRef = doc(db, 'users', user?.uid || '');
      const savedQuestionsRef = collection(usersDocRef, 'savedQuestions');
      await setDoc(doc(savedQuestionsRef, question._id ), {
        question: question.question,
        answer: question.answer,
        question_sanitized: question.question_sanitized,
        answer_sanitized: question.answer_sanitized,
        timestamp: new Date().toLocaleString()
      });
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Question Saved!',
      })
    } catch (error) {
      console.log(error);
    }
  }

  const onBuzz = () => {
    if(!showStart){
      setAnimating(true);
      //setPaused(true);
    }
  }


  React.useEffect(() => {
    console.log("isAnimating:", isAnimating)
    if (!isAnimating && points>-1) {
      if(!answered[currentPage]) {setAnsweredCount(prev => prev+1)}
      setAnswered(prev => {
        const newanswered = [...prev];
        newanswered[currentPage] = true;
        return newanswered
      })

      if(!answered[currentPage] || allowRebuzz && !correct[currentPage]) {
        if(points>0) {
          setCorrect(prev => {
            const newCorrect = [...prev];
            newCorrect[currentPage]=true;
            setCorrectCount(a => a+1)
            return newCorrect;
          })
        }
        setScore(prev => prev+points)
      }
    }
  },[isAnimating])

  React.useEffect(() => {
    if(reset){
      console.log("Reset True");
      setReset(false);
      setCurrentQuestion(questions[0])
      setAnswered([])
      setFinished([])
      setViewedIndices([])
      setSeen(1)
      setShowStart(true);
      scaleValue.setValue(1);
      setPaused(false);
      setScore(0);
      setCorrectCount(0);
      setCurrentPage(0);
      setQuestions([]);
    }
  },[reset])

  //NOTE: IS THIS A GOOD WAY TO DO THIS?
  const onViewableItemsChanged = () => {
    console.log("Called:", isLoading)
    if (!viewedIndices[currentPage]) {
      if(!isLoading){
        setViewedIndices((prev) => {
          const newArray = [...prev];
          newArray[currentPage] = true; // Mark the new index as viewed
          console.log("Inside setViewedIndices:", newArray);
          return newArray;
        });
      }
      // Update the viewedIndices array at the specific index
    } else {
      // If it's a previously viewed item, set the progress bar to "finished" and stop animation
      if (currentPage > 0) {
        shiftValue.setValue(0);
        shiftValue.stopAnimation();
      }
    }
  }

  const startProgressBar = () => {
    shiftValue.setValue(-380); // Reset to 0
    Animated.timing(shiftValue, {
      toValue: 0,
      duration: 10000, // 10 seconds
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView className='bg-background flex-1'>
      {/* Header */}
      <View className='flex-row justify-between items-center p-2 pl-5'>
        <Text className='text-tertiary text-3xl font-gBold'>BowlBuddy</Text>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}>
          <SettingsModal
            difficulties={difficulties}
            setDifficulties={setDifficulties}
            categories={categories}
            setCategories={setCategories}
            setModalVisible={setModalVisible}
            enableTimer = {enableTimer}
            setEnableTimer={setEnableTimer}
            allowRebuzz = {allowRebuzz}
            setAllowRebuzz={setAllowRebuzz}
            onSpeedChange={(val) => setReadingSpeed(val)}
            setReset={setReset}
          />
        </Modal>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image source={icons.settings} className='w-14 h-14 p-2' style={{tintColor: '#cccfff'}} resizeMode='contain' />
        </TouchableOpacity>
        
      </View>

      {/* Border */} 
      <View className="h-[1px] bg-tertiary" />

      {/* Score Board */}
      <View className="flex-shrink mx-4 mt-5 bg-primary border-tertiary border-2 rounded-lg p-3 px-5 shadow-md">
        <View className='flex-row justify-between'>
          <Text className="text-2xl text-tertiary text-left font-gBold">Score   {score}</Text>
          <Text className="text-2xl text-tertiary text-left font-gBold">Correct   {correctCount}/{answeredCount}</Text>
        </View>
      </View>
      {/* Answer and Timer Bar */}
      <View className="flex-shrink mx-4 mb-3 mt-2.5">
        <View className='flex-shrink bg-primary border-secondary border-2 rounded-lg h-10 shadow-md'>
          <Text className='p-2 text-tertiary font-gBold text-sm mx-1'>Answer</Text>
        </View>
        <View className='h-1 mt-1 bg-gray-600 overflow-hidden opacity-90 rounded-lg'>
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
      {/* Question Field */}
      <View className="flex-1 mx-4 mb-5 bg-primary border-tertiary border-2 rounded-lg p-5 shadow-md" >
        { showStart ?  <Animated.View style={{transform:[{scale:scaleValue}]}}>
          <TouchableOpacity onPress={() => {fetchData()}} className={"bg-tertiary rounded-xl p-4"} >
              <Text className={"text-secondary text-center text-lg font-gBold"}> Start </Text>
          </TouchableOpacity>
        </Animated.View> : <FlatList
          data={questions}
          keyExtractor={(item, index) => `${item._id}-${index}`}
          renderItem={({item, index}) => (
            <View>
              <FocusedTextAnimator 
                sentence={item.question_sanitized} 
                height={height} 
                page={currentPage} 
                paused={paused}
                isVisible={index === currentPage}
                speed={readingSpeed}
                onEnd={()=>{
                  console.log("YO")
                  startProgressBar()
                }}
              />

              {/* <Text className='text-sm text-secondary text-left font-gBook' style={{height: height}}>{item.question_sanitized}</Text> */}
            </View>
          )}
          pagingEnabled={true}
          onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          onEndReached={()=>{appendQuestion(); setSeen(prev=>prev+1)}}
          onEndReachedThreshold={0.5}
          onViewableItemsChanged={onViewableItemsChanged}
        />}
         
      </View>

      {/* Buttons */}
      <View className='flex-row justify-between'>
        {/* Pause Icon */}
        <TouchableOpacity className="shadow-md flex-[0.5] mx-3 mb-5 bg-primary py-4 rounded-full justify-center items-center" onPress={() => setPaused(!paused)}>
          <Image source={paused? icons.play2: icons.pause2} className="w-12 h-12" tintColor={"#cccfff"} resizeMode="contain" />
        </TouchableOpacity>
        {/* Buzz Screen Modal */}
        <></>
        {/* Buzz! */}
        {/* I NEED TO CHANGE THE CONDITION FOR BUZZ BEING AVAILABLE */}
        {/* COULD MAKE IT SO THAT ITS SLIGHTLY TRANSPARENT BEFORE PRESSING START BUTTON */}
        <TouchableOpacity className="shadow-md border-2 border-red-500 flex-grow mx-2 mb-5 bg-primary py-4 rounded-full justify-center items-center" 
          onPress={onBuzz}>
          <Text className="text-2xl font-gBlack text-red-500">Buzz!</Text>
        </TouchableOpacity>
        {/* Saved icon */}
        <TouchableOpacity className="flex-[0.5] shadow-md mx-4 mb-5 bg-primary py-4 rounded-full justify-center items-center" onPress={ () => handleSave(questions[currentPage]) }>
          <Image source={icons.save} className="w-10 h-10" tintColor={"#cccfff"} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default Play