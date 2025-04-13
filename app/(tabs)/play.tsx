import { SafeAreaView, ScrollView, View, Text, Image, TouchableOpacity, Modal, FlatList, Button, Animated } from 'react-native'
import React from 'react'
import icons from '@/constants/icons'
import FocusedTextAnimator from '../components/TextAnimator'
import { questions, fetchDBQuestions } from '../functions/fetchDB'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { db } from '../../firebaseConfig'
import { doc, setDoc, collection, updateDoc, increment, getDoc } from 'firebase/firestore'
import { UserContext, BuzzCircleContext, QuestionContext, SettingsContext, PointsContext } from '../context';
import SettingsModal from '../components/SettingsModal'

const QuestionItem = React.memo(({ 
  item, 
  index, 
  currentPage, 
  height, 
  paused, 
  readingSpeed, 
  viewedIndices, 
  onEnd 
}: { 
  item: questions; 
  index: number; 
  currentPage: number; 
  height: number; 
  paused: boolean; 
  readingSpeed: number; 
  viewedIndices: boolean[]; 
  onEnd: () => void;
}) => {
  return (
    <View>
      <FocusedTextAnimator 
        sentence={item.question_sanitized} 
        height={height} 
        page={currentPage} 
        paused={paused}
        isVisible={index === currentPage}
        speed={readingSpeed}
        wasSeen={index < currentPage || viewedIndices[index]}
        onEnd={onEnd}
      />
    </View>
  );
});

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
  const [ answered, setAnswered ] = React.useState<boolean[]>([]); // the number of times answered PER QUESTION
  const [ answeredCount, setAnsweredCount ] = React.useState(0);
  const [ showAnswer, setShowAnswer ] = React.useState(false);
  const [viewedIndices, setViewedIndices] = React.useState<boolean[]>([]); // Track viewed items using an array
  const [reset, setReset] = React.useState(false);
  const [seen, setSeen] = React.useState(-1);
  
  const shiftValue = React.useRef(new Animated.Value(-380)).current;
  const progressBarAnimation = React.useRef<Animated.CompositeAnimation | null>(null);

  
  
  React.useEffect(()=>{
    if (difficulties && difficulties.length === 0) {
      setDifficulties(undefined);
    }
  },[difficulties, categories]) 

  const fetchData = async () => {
    // Animate the scale of the start button
    Animated.timing(scaleValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true, 
    }).start(() => {
      setShowStart(false);
      setSeen(1)
    });

    // Fetch initial questions
    const initialQuestions = await fetchDBQuestions({difficulties: difficulties, categories: categories });
    setQuestions(initialQuestions)
    setCurrentQuestion(initialQuestions[0])
    setAnswered([false, false])
    setViewedIndices([false, false])
    setCorrect([false, false])
    
    // Append another question
    appendQuestion()
  }

  const appendQuestion = async () => {
    if (isLoading) return;
  
    setIsLoading(true);
    let newQuestion = await fetchDBQuestions({ difficulties: difficulties, categories: categories });
    // Check if question is too long (over 1000 characters)
    while (newQuestion[0].question_sanitized.length > 900) {
      // Recursively fetch another question if too long
      newQuestion = await fetchDBQuestions({ difficulties: difficulties, categories: categories });
    }

    setQuestions(prevQuestions => [...prevQuestions, newQuestion[0]]);
    setAnswered(prev => [...prev, false]);
    setCorrect(prev => [...prev, false]);
    setViewedIndices(prev => [...prev, false]);
  
    setIsLoading(false);
  };

  const handleScroll = (event: any) => {
    setPaused(false)
    const offsetY = event.nativeEvent.contentOffset.y;
    const page = Math.round(offsetY / height);
    
    // Stop the progress bar animation when scrolling to a new page
    if (page !== currentPage) {
      stopProgressBar();
      
      // Mark the previous page as viewed when scrolling to a new page
      setViewedIndices((prev) => {
        const newArray = [...prev];
        if (!newArray[currentPage]) {
          newArray[currentPage] = true;
          console.log(`Marking question ${currentPage} as viewed`);
        }
        return newArray;
      });
    }
    
    setCurrentPage(page);
    setCurrentQuestion(questions[currentPage])
    
    // Show answer immediately if the question has been viewed before
    if (viewedIndices[page]) {
      shiftValue.setValue(0); 
      setShowAnswer(true);
    } else {
      shiftValue.setValue(-380);
      setShowAnswer(false);
    }
  };

  //this useEffect runs when the page is changed
  React.useEffect(()=>{
    setCurrentQuestion(questions[currentPage]);
    if(!viewedIndices[currentPage]){
      setSeen(a => a+1)
    }
  },[currentPage])

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
    if(!showStart && !showAnswer){
      setAnimating(true);
      setPaused(true);
    }
  }


  //this useEffect runs when buzzscreen is closed
  React.useEffect(() => {
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
        setShowAnswer(true);
        shiftValue.setValue(0);
        setScore(prev => prev+points)
      }
      setPaused(false);
    }
  },[isAnimating])

  //this useEffect runs when the reset button is pressed
  React.useEffect(() => {
    if(reset){
      //console.log("Reset True");
      setReset(false);
      setCurrentQuestion(questions[0])
      setAnswered([])
      setViewedIndices([]) 
      setShowStart(true);
      scaleValue.setValue(1);
      setPaused(false);
      setScore(0);
      setCorrectCount(0);
      setCurrentPage(0);
      setQuestions([]);
      setSeen(0)
    }
  },[reset])

  // Store score in database
  React.useEffect(() => {
    const updateScore = async () => {
      if (!user?.uid) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const statsDoc = await getDoc(userRef);
        if (!statsDoc.exists()) {
          await setDoc(userRef, {
            totalScore: 0,
            totalCorrect: 0,
            totalSeen: 0
          });
        }
        if(score>0){
          await updateDoc(userRef, {
            totalScore: increment(10)
          });
        }
      } catch (error) {
        console.error('Error updating score:', error);
      }
    };

    updateScore();
  }, [score, user]);

  // Store correct answers count in database
  React.useEffect(() => {
    const updateCorrect = async () => {
      if (!user?.uid) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const statsDoc = await getDoc(userRef);
        if (!statsDoc.exists()) {
          await setDoc(userRef, {
            totalScore: 0,
            totalCorrect: 0,
            totalSeen: 0
          });
        }
        if(correctCount>0){
          await updateDoc(userRef, {
            totalCorrect: increment(1)
          });
        }
      } catch (error) {
        console.error('Error updating correct count:', error);
      }
    };

    updateCorrect();
  }, [correctCount, user]);

  // Store seen count in database
  React.useEffect(() => {
    const updateSeen = async () => {
      if (!user?.uid) return;

      try {
        const userRef = doc(db, 'users', user.uid);
        const statsDoc = await getDoc(userRef);
        if (!statsDoc.exists()) {
          await setDoc(userRef, {
            totalScore: 0,
            totalCorrect: 0,
            totalSeen: 0
          });
        }
        if(seen>0){
          await updateDoc(userRef, {
            totalSeen: increment(1)
          });
        }
      } catch (error) {
        console.error('Error updating seen count:', error);
      }
    };

    updateSeen();
  }, [seen, user]);

  const startProgressBar = () => {
    // Don't start animation if the question has already been viewed or timer is disabled
    if (viewedIndices[currentPage] || !enableTimer) {
      return;
    }
    console.log("Starting Progress Bar");
    shiftValue.setValue(-380); // Reset to 0
    
    // Store the animation reference so we can stop it later
    progressBarAnimation.current = Animated.timing(shiftValue, {
      toValue: 0,
      duration: 10000, // 10 seconds
      useNativeDriver: true,
    });
    
    progressBarAnimation.current.start(({finished}) => {
      // When the animation is finished
      if (finished) {
        setShowAnswer(true);
      }
    });
  };
  
  const stopProgressBar = () => {
    // Stop the progress bar animation if it's running
    if (progressBarAnimation.current) {
      progressBarAnimation.current.stop();
      progressBarAnimation.current = null;
      shiftValue.setValue(-380); // Reset to initial position
      setShowAnswer(false); // Hide the answer
    }
  };

  // React.useEffect(()=>{
  //   if(currentPage>1){
  //     console.log(questions[currentPage].question_sanitized)
  //   }
  // },[currentPage])


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
          <Text className="text-xl text-tertiary font-gBold">Score  {score}</Text>
          <Text className="text-xl text-tertiary font-gBold">Correct  {correctCount}/{answeredCount}</Text>
          <View className='flex-row items-center'>
            <Image source={icons.bolder_eye} className="w-6 h-6" tintColor={"#cccfff"} resizeMode="contain" />
            <Text className='text-xl text-tertiary font-gBold '>   {seen}</Text> 
            {/* dude i swear this looks clunky */}
          </View>
        </View>
      </View>
      {/* Answer and Timer Bar */}
      <View className="flex-shrink mx-4 mb-3 mt-2.5">
        <View className='flex-shrink bg-primary border-secondary border-2 rounded-lg h-10 shadow-md'>
          <Text className='p-2 text-tertiary font-gBold text-sm mx-1'>{showAnswer ? questions[currentPage]?.answer_sanitized : ' '}</Text>
        </View>
        <View className='h-1 mt-1 bg-gray-600 overflow-hidden opacity-90 rounded-lg'>
          <Animated.View
            className='h-full rounded-full shadow-lg shadow-gray-900'
            style={{
              transform: [{ translateX:shiftValue }],
              backgroundColor: '#ccccff',
              width: '100%', // Set the initial width to 100%
              transformOrigin: 'left', // Ensure scaling starts from the left
            }}
          />
        </View>
      </View>
      {/* Question Field */}
      <View className="flex-1 mx-4 mb-5 bg-primary border-tertiary border-2 rounded-lg p-5 shadow-lg" >
        { showStart ?  <Animated.View style={{transform:[{scale:scaleValue}]}}>
          <TouchableOpacity onPress={() => {fetchData()}} className={"bg-tertiary rounded-xl p-4"} >
              <Text className={"text-secondary text-center text-lg font-gBold"}> Start </Text>
          </TouchableOpacity>
        </Animated.View> : <FlatList
          data={questions}
          keyExtractor={(item, index) => `${item._id}-${index}`}
          renderItem={({item, index}) => (
            <QuestionItem
              item={item}
              index={index}
              currentPage={currentPage}
              height={height}
              paused={paused}
              readingSpeed={readingSpeed}
              viewedIndices={viewedIndices}
              onEnd={() => {
                if (index === currentPage && !paused && enableTimer) {
                  startProgressBar();
                }
              }}
            />
          )}
          pagingEnabled={true}
          onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          onEndReached={()=>{appendQuestion()}}
          onEndReachedThreshold={0.5}
          removeClippedSubviews={true}
          maxToRenderPerBatch={3}
          windowSize={3}
        />}
         
      </View>

      {/* Buttons */}
      <View className='flex-row justify-between'>
        {/* Pause Icon */}
        <TouchableOpacity className="shadow-md flex-[0.5] mx-3 mb-5 bg-primary py-4 rounded-full justify-center items-center" onPress={() => setPaused(prev=>!prev)}>
          <Image source={paused? icons.play2: icons.pause2} className="w-12 h-12" tintColor={"#cccfff"} resizeMode="contain" />
        </TouchableOpacity>
        {/* Buzz Screen Modal */}
        <></>
        {/* Buzz! */}
        {/* I NEED TO CHANGE THE CONDITION FOR BUZZ BEING AVAILABLE */}
        {/* COULD MAKE IT SO THAT ITS SLIGHTLY TRANSPARENT BEFORE PRESSING START BUTTON */}
        <TouchableOpacity 
          className={`shadow-md border-2 border-red-500 flex-grow mx-2 mb-5 bg-primary py-4 rounded-full justify-center items-center ${(showStart || showAnswer) ? 'opacity-50' : ''}`}
          onPress={onBuzz}
          disabled={showStart || showAnswer}
        >
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