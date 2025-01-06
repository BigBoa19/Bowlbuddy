import { SafeAreaView, ScrollView, View, Text, Image, TouchableOpacity, Modal, FlatList, Button, Animated } from 'react-native'
import React, { useEffect } from 'react'
import icons from '@/constants/icons'
import CustomButton from '../components/CustomButton'
import TextAnimator from '../components/TextAnimator'
import { questions, fetchDBQuestionsNoSearch } from '../functions/fetchDB'
import { ALERT_TYPE, Toast } from 'react-native-alert-notification';
import { db } from '../../firebaseConfig'
import { doc, setDoc, collection } from 'firebase/firestore'
import { UserContext, BuzzCircleContext, QuestionContext } from '../context';
import Slider from '@react-native-community/slider'



const Play = () => {
  const { setAnimating } = React.useContext(BuzzCircleContext);
  const { user } = React.useContext(UserContext);
  const [paused, setPaused] = React.useState(false);
  const [modalVisible, setModalVisible] = React.useState(false);
  const [height, setHeight] = React.useState(0);
  const [currentPage, setCurrentPage] = React.useState(0); 
  const [questions, setQuestions] = React.useState<questions[]>([]);
  const { setCurrentQuestion } = React.useContext(QuestionContext);

  React.useEffect(() => {
    console.log("fetched questions")
    fetchDBQuestionsNoSearch().then((questions) => {
      setQuestions(questions)
      console.log(questions)
    })
    
  }, [])


  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const page = Math.round(offsetY / height); 
    setCurrentPage(page);
    setCurrentQuestion(questions[currentPage])
  };

  const SettingsModal = () => {
    return (
      <View className='flex-1 justify-center p-4'>
        <View className="m-5 bg-background border-2 border-secondary rounded-lg p-9 items-center shadow-lg">
          <Text className='text-tertiary text-2xl font-gBold pb-3'>Settings</Text>
          <Text className='text-tertiary text-xl font-gBold'>Level</Text>
          <View className='flex-row justify-between'>
            <CustomButton title='MS' handlePress={() => {}} containerStyles='mt-2 mr-2' />
            <CustomButton title='HS' handlePress={() => {}} containerStyles='mt-2 mx-2' />
            <CustomButton title='College' handlePress={() => {}} containerStyles='mt-2 mx-2' />
            <CustomButton title='Open' handlePress={() => {}} containerStyles='mt-2 ml-2' />
          </View>
          <Text className='text-tertiary text-xl font-gBold py-2'>Category</Text>
          <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} className="flex-row">
            <CustomButton title='Science' handlePress={() => {}} containerStyles='mt-2 mr-2' />
            <CustomButton title='History' handlePress={() => {}} containerStyles='mt-2 mx-2' />
            <CustomButton title='Fine Arts' handlePress={() => {}} containerStyles='mt-2 mx-2' />
            <CustomButton title='Literature' handlePress={() => {}} containerStyles='mt-2 mx-2' />
            <CustomButton title='Mythology' handlePress={() => {}} containerStyles='mt-2 ml-2' />
          </ScrollView>
          <Text className='text-tertiary text-xl font-gBold py-2'>Type of Question</Text>
          <View className='flex-row justify-between'>
            <CustomButton title='Tossup' handlePress={() => {}} containerStyles='mt-2 mr-2' />
            <CustomButton title='Bonus' handlePress={() => {}} containerStyles='mt-2 ml-2' />
          </View>
          <Text className='text-tertiary text-xl font-gBold py-2'>Reading Speed</Text>
          <Slider
            style={{width: 240, height: 40}}
            minimumValue={0}
            minimumTrackTintColor='#8a92eb'
            maximumTrackTintColor='#161622'
            thumbTintColor='#cccfff'
          />
          <View className='flex-row justify-between'>
            <CustomButton title='Enable Timer' handlePress={() => {}} containerStyles='mt-5 mr-2' />
            <CustomButton title='Allow Rebuzz' handlePress={() => {}} containerStyles='mt-5 ml-2' />
          </View>
          <TouchableOpacity onPress={() => setModalVisible(false)}>
            <CustomButton title='Close' handlePress={() => setModalVisible(false)} containerStyles='mt-5' />
          </TouchableOpacity>
        </View>
      </View>
    )
  }

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



  const onBuzz = () =>{
    setAnimating(true)
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
          <SettingsModal />
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
        <FlatList
          data={questions}
          keyExtractor={item => item._id}
          renderItem={({item}) => (
            <View className="flex-1" style={{height: height}}>
              {/* <TextAnimator 
                sentence={item.question_sanitized} 
                height={height} 
                page={currentPage} 
                paused={paused}
              /> */}
              <Text className='text-sm text-secondary text-left font-gBook'>{item.question_sanitized}</Text>
            </View>
          )}
          pagingEnabled={true}
          onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          className='flex-1'
        />
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
        <TouchableOpacity className="shadow-md border-2 border-red-500 flex-grow mx-2 mb-5 bg-primary py-4 rounded-full justify-center items-center" onPress={()=>onBuzz()}>
          <Text className="text-2xl font-gBlack text-red-500">Buzz!</Text>
        </TouchableOpacity>
        {/* Circle Modal */}
        {/* Saved icon */}
        <TouchableOpacity className="flex-[0.5] shadow-md mx-4 mb-5 bg-primary py-4 rounded-full justify-center items-center" onPress={ () => handleSave(questions[currentPage]) }>
          <Image source={icons.save} className="w-10 h-10" tintColor={"#cccfff"} resizeMode="contain" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}



export default Play