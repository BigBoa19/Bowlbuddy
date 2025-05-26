import { SafeAreaView, ScrollView, View, Text, Image, TouchableOpacity, Modal, FlatList, Button, Animated, Dimensions, TouchableHighlight, ViewComponent, useWindowDimensions } from 'react-native'
import React from 'react'
import icons from '@/constants/icons'
import FocusedTextAnimator from '../components/TextAnimator'
import { questions, fetchDBQuestions } from '../functions/fetchDB'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { db } from '../../firebaseConfig'
import { doc, setDoc, collection, updateDoc, increment, getDoc } from 'firebase/firestore'
import { UserContext, BuzzCircleContext, QuestionContext, SettingsContext, PointsContext } from '../context';
import SettingsModal from '../components/SettingsModal'
import CustomButton from '../components/CustomButton'

const QuestionItem = React.memo(({
  item,
  index,
  currentPage,
  height,
  paused,
  readingSpeed,
  viewedIndices,
  onEnd,
  disableReader
}: {
  item: questions;
  index: number;
  currentPage: number;
  height: number;
  paused: boolean;
  readingSpeed: number;
  viewedIndices: boolean[];
  onEnd: () => void;
  disableReader: boolean;
}) => {
  const isVisible = index === currentPage;
  
  // For non-visible items, render a simple placeholder
  if (!isVisible) {
    return (
      <View style={{ height }}>
        <Text className='text-sm text-secondary text-left font-gBook' numberOfLines={1}>
          Loading...
        </Text>
      </View>
    );
  }
  
  // Only render the TextAnimator if this item is actually visible
  return (
    <View>
      {disableReader ? <Text className='text-sm text-secondary text-left font-gBook' style={{height: height}}>{item.question_sanitized}</Text> : 
      <FocusedTextAnimator
        sentence={item.question_sanitized}
        height={height}
        page={currentPage}
        paused={paused}
        isVisible={index === currentPage}
        speed={readingSpeed}
        wasSeen={index < currentPage || viewedIndices[index]}
        onEnd={onEnd}
      />}
    </View>
  );
});

const Play = () => {
  const { isAnimating, setAnimating } = React.useContext(BuzzCircleContext);
  const { enableTimer, setEnableTimer, allowRebuzz, setAllowRebuzz } = React.useContext(SettingsContext);
  const { user } = React.useContext(UserContext);
  const { setCurrentQuestion } = React.useContext(QuestionContext);
  const { points } = React.useContext(PointsContext);
  // Get screen width and calculate progress bar offset
  const screenWidth = Dimensions.get('window').width;
  const progressBarOffset = -(screenWidth - 20);

  const [paused, setPaused] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [askModalVisible, setAskModalVisible] = React.useState(false);
  const [skipModal, setSkipModal] = React.useState(false)
  const [height, setHeight] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0);
  const [questions, setQuestions] = React.useState<questions[]>([]);
  const [progressBarPaused, setProgressBarPaused] = React.useState(false);
  const [disableReader, setDisableReader] = React.useState(false);

  const [showStart, setShowStart] = React.useState(true);

  const scaleValue = React.useRef(new Animated.Value(1)).current;

  const [difficulties, setDifficulties] = React.useState<number[] | undefined>(undefined);
  const [categories, setCategories] = React.useState<string[] | undefined>(undefined);
  const [readingSpeed, setReadingSpeed] = React.useState(150);
  const [isLoading, setIsLoading] = React.useState(false);

  const [score, setScore] = React.useState(0)
  const [correct, setCorrect] = React.useState<boolean[]>([]);
  const [correctCount, setCorrectCount] = React.useState(0);
  const [answered, setAnswered] = React.useState<boolean[]>([]); // the number of times answered PER QUESTION
  const [answeredCount, setAnsweredCount] = React.useState(0);
  const [showAnswer, setShowAnswer] = React.useState(false);
  const [viewedIndices, setViewedIndices] = React.useState<boolean[]>([]); // Track viewed items using an array
  const [reset, setReset] = React.useState(false);
  const [seen, setSeen] = React.useState(0);

  const shiftValue = React.useRef(new Animated.Value(progressBarOffset)).current;
  const progressBarAnimation = React.useRef<Animated.CompositeAnimation | null>(null);


  React.useEffect(() => {
    if (difficulties && difficulties.length === 0) {
      setDifficulties(undefined);
    }
  }, [difficulties, categories])

  const stopProgressBar = React.useCallback(() => {
    // Stop the progress bar animation if it's running
    if (progressBarAnimation.current) {
      progressBarAnimation.current.stop();
      progressBarAnimation.current = null;
      shiftValue.setValue(progressBarOffset); // Reset to initial position
      setShowAnswer(false); // Hide the answer
    }
  }, []);

  const handleScroll = React.useCallback((event: any) => {
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
      shiftValue.setValue(progressBarOffset);
      setShowAnswer(false);
    }
  }, [currentPage, height, questions, viewedIndices, stopProgressBar]);

  const fetchData = async () => {
    // Animate the scale of the start button
    Animated.timing(scaleValue, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setPaused(false)
      setShowStart(false);
      setSeen(1)
    });

    // Fetch initial questions
    let initialQuestions = await fetchDBQuestions({ difficulties: difficulties, categories: categories });
    while (initialQuestions[0].question_sanitized.length > 900) {
      initialQuestions = await fetchDBQuestions({ difficulties: difficulties, categories: categories });
    }

    setQuestions(initialQuestions)
    setCurrentQuestion(initialQuestions[0])
    setAnswered([false, false])
    setViewedIndices([false, false])
    setCorrect([false, false])

    // Append another question
    appendQuestion()
  }

  const appendQuestion = React.useCallback(async () => {
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
  }, [difficulties, categories, isLoading]);

  //this useEffect runs when the page is changed
  React.useEffect(() => {
    setCurrentQuestion(questions[currentPage]);
    if (!viewedIndices[currentPage]) {
      setSeen(a => a + 1)
    }
  }, [currentPage])

  const handleSave = React.useCallback(async (question: questions) => {
    try {
      const usersDocRef = doc(db, 'users', user?.uid || '');
      const savedQuestionsRef = collection(usersDocRef, 'savedQuestions');
      await setDoc(doc(savedQuestionsRef, question._id), {
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
  }, [user]);

  React.useEffect(()=>{
    if(showStart){
      shiftValue.setValue(progressBarOffset);
    }
  },[])

  const onBuzz = React.useCallback(() => {
    if (!showStart && !showAnswer) {
      setAnimating(true);
      setPaused(true);
      if (progressBarAnimation.current) {
        setProgressBarPaused(true);
        progressBarAnimation.current.stop();
      }
    }
  }, [showStart, showAnswer, allowRebuzz]);


  //this useEffect runs when buzzscreen is closed
  React.useEffect(() => {
    if (!isAnimating && points > -1) {
      if (!answered[currentPage]) { setAnsweredCount(prev => prev + 1) }
      setAnswered(prev => {
        const newanswered = [...prev];
        newanswered[currentPage] = true;
        return newanswered
      })

      if (!answered[currentPage] || allowRebuzz && !correct[currentPage]) {
        if (points > 0) { //if the answer is correct
          setCorrect(prev => {
            const newCorrect = [...prev];
            newCorrect[currentPage] = true;
            setCorrectCount(a => a + 1)
            return newCorrect;
          })
          setViewedIndices(prev => {
            const newViewed = [...prev];
            newViewed[currentPage] = true;
            return newViewed;
          })
          setShowAnswer(true);
          shiftValue.setValue(0);

          setScore(prev => prev + points)
        } else { //if the answer is wrong
          if (allowRebuzz) {
            // If rebuzz is allowed and answer was wrong, resume the progress bar
            
            setProgressBarPaused(false);
            if (progressBarAnimation.current) {
              progressBarAnimation.current.start()
              // Get the current position of the progress bar
              setProgressBarPaused(false);
              let currentPosition = progressBarOffset;
              shiftValue.stopAnimation();
              shiftValue.addListener(({ value }) => {
                currentPosition = value;
                shiftValue.removeAllListeners();

                const remainingDistance = -currentPosition;
                const remainingDuration = (remainingDistance / Math.abs(progressBarOffset)) * 5000;

                // Create a new animation from the current position
                progressBarAnimation.current = Animated.timing(shiftValue, {
                  toValue: 0,
                  duration: remainingDuration,
                  useNativeDriver: true,
                });

                // Start the animation
                progressBarAnimation.current.start(({ finished }) => {
                  if (finished) {
                    setShowAnswer(true);
                  }
                });
              });
            }
          } else {
            setShowAnswer(true);
            shiftValue.setValue(0);
            setViewedIndices(prev => {
              const newViewed = [...prev];
              newViewed[currentPage] = true;
              return newViewed;
            })
            setScore(prev => prev + points)
          }
        }
      }

      setPaused(false);
    }
  }, [isAnimating])

  //this useEffect runs when the reset button is pressed
  React.useEffect(() => {
    if (reset) {
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
      setAnsweredCount(0);
      setCurrentPage(0);
      setQuestions([]);
      setSeen(0)
      shiftValue.stopAnimation()
      shiftValue.setValue(progressBarOffset)
      setShowAnswer(false)
    }
  }, [reset])

  React.useEffect(()=>{
    if(showStart){
      setAnsweredCount(0);
      setShowAnswer(false);
      setAnswered([false, false])
      setViewedIndices([false, false])
      setCorrect([false, false])
      setSeen(0)
    }
  },[])

  React.useEffect(()=>{
    if(showStart){
      setSeen(0)
    }
  },[seen])

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
        if (score > 0) {
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
        if (correctCount > 0) {
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
        if (seen > 0) {
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

  const startProgressBar = React.useCallback(() => {
    // Don't start animation if the question has already been viewed or timer is disabled
    if (viewedIndices[currentPage] || !enableTimer) {
      return;
    }
    console.log("Starting Progress Bar");
    shiftValue.setValue(progressBarOffset); // Reset to 0
    
    // Cancel any existing animation
    if (progressBarAnimation.current) {
      progressBarAnimation.current.stop();
    }
    
    setProgressBarPaused(false);

    // Store the animation reference so we can stop it later
    progressBarAnimation.current = Animated.timing(shiftValue, {
      toValue: 0,
      duration: 5000, // 10 seconds
      useNativeDriver: true,
    });

    progressBarAnimation.current.start(({ finished }) => {
      // When the animation is finished
      if (finished) {
        setShowAnswer(true);
      }
    });
  }, [currentPage, viewedIndices, enableTimer]);

  // React.useEffect(()=>{
  //   if(currentPage>1){
  //     console.log(questions[currentPage].question_sanitized)
  //   }
  // },[currentPage])

  const playPauseToggle = () => {
    if (paused) { //currently paused
      setPaused(false);
      // Resume progress bar if it was paused
      if (progressBarPaused && progressBarAnimation.current) {
        setProgressBarPaused(false);
        // Get current position and create a new animation from there
        let currentPosition = 0;
        shiftValue.stopAnimation(value => {
          currentPosition = value;
          
          const remainingDistance = -currentPosition;
          const remainingDuration = (remainingDistance / Math.abs(progressBarOffset)) * 5000;
          
          // Only start a new animation if there's distance remaining
          if (remainingDistance > 0) {
            progressBarAnimation.current = Animated.timing(shiftValue, {
              toValue: 0,
              duration: remainingDuration,
              useNativeDriver: true,
            });
            
            progressBarAnimation.current.start(({ finished }) => {
              if (finished) {
                setShowAnswer(true);
              }
            });
          }
        });
      }
    } else { //currently playing
      setPaused(true);
      // Pause progress bar if it's running
      if (progressBarAnimation.current) {
        console.log("Pausing progress bar");
        progressBarAnimation.current.stop();
        setProgressBarPaused(true);
      }
    }
  };

  const skipQuestion = () => {
    if(viewedIndices[currentPage]==true){
      setSkipModal(true);
    }
    if(!showStart){
      setShowAnswer(true)
      shiftValue.setValue(0);
      setViewedIndices(prev => {
        const newViewed = [...prev];
        newViewed[currentPage] = true;
        return newViewed;
      })
    }
  }

  const scaleFont = (baseSize: number, screenWidth: number) => {
    const baseScreenWidth = 460; // iPhone 16 width (as a reference)
    return (screenWidth / baseScreenWidth) * baseSize;
  };
  const { width } = useWindowDimensions();
  const lineHeight = scaleFont(20, width); // base line height on iPhone 16 pro
  const fontSize = scaleFont(14, width); // base size 14px on iPhone 16 pro

  return (
    <SafeAreaView className='bg-background flex-1'>
      {/* Header */}
      <View className='flex-row justify-between items-center p-2 pl-5'>
        <Text className='text-tertiary text-3xl font-gBold'>BowlBuddy</Text>
        <View className='flex-row items-end'>

          <Modal animationType="slide" transparent={true} visible={askModalVisible}>
            <View className='flex-1 justify-center p-4'>
              <View className="m-5 bg-background border-2 border-secondary rounded-lg p-9 items-center shadow-lg">
                <Text className='text-l text-secondary font-gBold text-center shadow-md shadow-black'>
                  Swipe to see the next question!
                </Text>
                <Text className='text-xl text-tertiary font-gBook text-center mt-8'>
                  Contact the developer at:
                </Text>
                <Text className='text-xl text-tertiary font-gBold text-center mt-2 p-2 bg-primary rounded-lg'>
                  ncdev1919@gmail.com
                </Text>
                <TouchableOpacity>
                  <CustomButton title='Close' handlePress={() => setAskModalVisible(false)} containerStyles='mt-5' />
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <TouchableOpacity onPress={() => setAskModalVisible(true)}>
            <Image source={icons.conversation} className='w-14 h-14 p-3' style={{ tintColor: '#cccfff' }} resizeMode='contain' />
          </TouchableOpacity>
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
              enableTimer={enableTimer}
              setEnableTimer={setEnableTimer}
              allowRebuzz={allowRebuzz}
              setAllowRebuzz={setAllowRebuzz}
              onSpeedChange={(val) => setReadingSpeed(val)}
              setReset={setReset}
              disableReader={disableReader}
              setDisableReader={setDisableReader}
            />
          </Modal>
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image source={icons.settings} className='w-14 h-14 p-2' style={{ tintColor: '#cccfff' }} resizeMode='contain' />
          </TouchableOpacity>
        </View>
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
        <ScrollView horizontal={true} className='flex-shrink bg-primary border-secondary border-2 rounded-lg h-10 shadow-md'>
          <Text className='p-2 text-tertiary font-gBold mx-1 justify-center' style={{fontSize,lineHeight}}>{showAnswer ? questions[currentPage]?.answer_sanitized : ' '}</Text>
        </ScrollView>
        <View className='h-1 mt-1 bg-gray-600 overflow-hidden opacity-90 rounded-lg'>
          <Animated.View
            className='h-full rounded-full shadow-lg shadow-gray-900'
            style={{
              transform: [{ translateX: shiftValue }],
              backgroundColor: '#ccccff',
              width: '100%', // Set the initial width to 100%
              transformOrigin: 'left', // Ensure scaling starts from the left
            }}
          />
        </View>
      </View>
      {/* Question Field */}
      <View className="flex-1 mx-4 mb-5 bg-primary border-tertiary border-2 rounded-lg p-5 shadow-lg" >
        {showStart ? <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <TouchableOpacity onPress={() => { fetchData() }} className={"bg-tertiary rounded-xl p-4"} >
            <Text className={"text-secondary text-center text-lg font-gBold"}> Start </Text>
          </TouchableOpacity>
        </Animated.View> : <FlatList
          data={questions}
          keyExtractor={(item, index) => `${item._id}-${index}`}
          renderItem={({ item, index }) => (
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
              disableReader={disableReader}
            />
          )}
          pagingEnabled={true}
          onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          onEndReached={() => { appendQuestion() }}
          onEndReachedThreshold={0.5}
          removeClippedSubviews={true}
          maxToRenderPerBatch={2}
          windowSize={3}
          initialNumToRender={3}
          updateCellsBatchingPeriod={50}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
        />}

      </View>

      {/* Buttons */}
      <View className='flex-row justify-between'>
        {/* Pause Icon */}
        <TouchableOpacity className="flex-[0.5] shadow-md mx-4 mb-5 bg-primary py-4 rounded-[15px] justify-center items-center" onPress={playPauseToggle}>
          <Image source={paused ? icons.play2 : icons.pause2} className="w-10 h-10" tintColor={"#cccfff"} resizeMode="contain" />
        </TouchableOpacity>
        {/* Buzz Screen Modal */}
        {/* Buzz! */}
        {/* I NEED TO CHANGE THE CONDITION FOR BUZZ BEING AVAILABLE */}
        {/* COULD MAKE IT SO THAT ITS SLIGHTLY TRANSPARENT BEFORE PRESSING START BUTTON */}
        <TouchableOpacity
          className={`shadow-md border-2 border-red-500 flex-grow mx-2 mb-5 bg-primary py-4 rounded-[15px] justify-center items-center ${(showStart || showAnswer) ? 'opacity-50' : ''}`}
          onPress={onBuzz}
          disabled={showStart || showAnswer}
        >
          <Text className="text-2xl font-gBlack text-red-500">Buzz!</Text>
        </TouchableOpacity>

        <Modal animationType="slide" transparent={true} visible={skipModal}>
            <View className='flex-1 justify-center p-4'>
              <View className="m-5 bg-background border-2 border-secondary rounded-lg p-9 items-center shadow-lg">
                <Text className='text-l text-tertiary font-gBook text-center mb-4'>
                  This button ends the question in the middle!
                </Text>
                <Text className='text-xl text-tertiary font-gBold text-center mt-2 p-2 bg-primary rounded-lg'>
                  Scroll to see the next question!
                </Text>
                <TouchableOpacity>
                  <CustomButton title='Close' handlePress={() => setSkipModal(false)} containerStyles='mt-5' />
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        {/* Saved icon */}      
        <View className="flex-[0.5] mx-3 mb-3 pr-1" >
          <TouchableOpacity className='flex-[0.5] bg-primary shadow-md w-full h-5 rounded-[10px] mb-2 justify-center items-center' onPress={() => handleSave(questions[currentPage])}>
            <Image source={icons.save} className="w-5 h-5" tintColor={"#cccfff"} resizeMode="contain" />
          </TouchableOpacity>

          <TouchableOpacity className='flex-[0.5] bg-primary shadow-md w-full  h-5 rounded-[10px] mb-2 justify-center items-center' onPress={skipQuestion}>
            <Image source={icons.next} className="w-8 h-8" tintColor={"#cccfff"} resizeMode="contain" />
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  )
}

export default Play