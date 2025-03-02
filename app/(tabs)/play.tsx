import { SafeAreaView, ScrollView, View, Text, Image, TouchableOpacity, Modal, FlatList, Button, Animated } from 'react-native'
import React from 'react'
import icons from '@/constants/icons'
import FocusedTextAnimator from '../components/TextAnimator'
import { questions, fetchDBQuestions } from '../functions/fetchDB'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { db } from '../../firebaseConfig'
import { doc, setDoc, collection } from 'firebase/firestore'
import { UserContext, BuzzCircleContext, QuestionContext, SettingsContext } from '../context';
import SettingsModal from '../components/SettingsModal'

const Play = () => {
  const { setAnimating } = React.useContext(BuzzCircleContext);
  const { enableTimer, setEnableTimer, allowRebuzz, setAllowRebuzz } = React.useContext(SettingsContext);
  const { user } = React.useContext(UserContext);
  const { setCurrentQuestion } = React.useContext(QuestionContext);

  const [ paused , setPaused ] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [ height, setHeight] = React.useState(0);
  const [ currentPage, setCurrentPage] = React.useState(0);
  const [ questions , setQuestions ] = React.useState<questions[]>([]);
  const [ showStart , setShowStart ] = React.useState(true);
  const scaleValue = React.useRef(new Animated.Value(1)).current;
  const [ difficulties , setDifficulties ] = React.useState<number[] | undefined>(undefined);
  const [categories, setCategories] = React.useState<string[] | undefined>(undefined);
  const [isLoading, setIsLoading] = React.useState(false);
  
  


  React.useEffect(()=>{
    console.log("Enable Timer:", enableTimer)
    console.log("Allow Rebuzz:", allowRebuzz)
  },[enableTimer,allowRebuzz])

  React.useEffect(()=>{
    if (difficulties && difficulties.length === 0) {
      setDifficulties(undefined);
    }
  },[difficulties, categories]) // printing diff and cat



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
      appendQuestion()
    });
  }

  const appendQuestion = async () => {
    if (isLoading) return;
  
    setIsLoading(true);
    const newQuestion = await fetchDBQuestions({ difficulties: difficulties, categories: categories });
    setQuestions(prevQuestions => [...prevQuestions, newQuestion[0]]);
    setIsLoading(false);
  };

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const page = Math.round(offsetY / height);
    setCurrentPage(page);
    setCurrentQuestion(questions[currentPage])
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
          />
        </Modal>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Image source={icons.settings} className='w-14 h-14 p-2' style={{tintColor: '#cccfff'}} resizeMode='contain' />
        </TouchableOpacity>
        
      </View>

      {/* Border */} 
      <View className="h-[1px] bg-tertiary" />

      {/* Score Board */}
      <View className="flex-shrink mx-4 my-5 bg-primary border-tertiary border-2 rounded-lg p-5 shadow-md">
        <View className='flex-row justify-between'>
          <Text className="text-2xl text-tertiary text-left font-gBold">Score   125</Text>
          <Text className="text-2xl text-tertiary text-left font-gBold">Correct   4/8</Text>
        </View>
        <View className='flex-row justify-between'>
          <Text className="text-2xl text-tertiary text-left font-gBold">Interupts   3</Text>
          <Text className="text-2xl text-tertiary text-left font-gBold">Seen   9</Text>
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
          renderItem={({item}) => (
            <View>
              {/* <FocusedTextAnimator 
                sentence={item.question_sanitized} 
                height={height} 
                page={currentPage} 
                paused={paused}
              /> */}

              <Text className='text-sm text-secondary text-left font-gBook' style={{height: height}}>{item.question_sanitized}</Text>
            </View>
          )}
          pagingEnabled={true}
          onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          onEndReached={appendQuestion}
          onEndReachedThreshold={0.5}
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
          onPress={
            () => {
              if(!showStart) {setAnimating(true)}
            }
          }
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