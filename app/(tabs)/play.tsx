import { SafeAreaView,View, Text, Image, TouchableOpacity, Modal, FlatList } from 'react-native'
import React from 'react'
import icons from '@/constants/icons'
import CustomButton from '../components/CustomButton'
import TextAnimator from '../components/TextAnimator'
import { questions, fetchDBQuestions } from '../functions/fetchDB'

const Play = () => {
  const [paused, setPaused] = React.useState(false)
  const [modalVisible, setModalVisible] = React.useState(false)
  const [height, setHeight] = React.useState(0)
  const [currentPage, setCurrentPage] = React.useState(0); 
  const [questions, setQuestions] = React.useState<questions[]>([])

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const page = Math.round(offsetY / height); 
    setCurrentPage(page);
  };

  React.useEffect(() => {
    fetchDBQuestions('grant wood').then((questions) => setQuestions(questions))
  }, [])



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
          <View className='flex-1 justify-center items-center'>
            <View className="m-5 bg-background border-2 border-secondary rounded-lg p-9 items-center shadow-lg">
              <Text className='text-tertiary text-2xl font-gBold'>Settings</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <CustomButton title='Close' handlePress={() => setModalVisible(false)} containerStyles='mt-5' />
              </TouchableOpacity>
            </View>
          </View>
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
            <TextAnimator sentence={item.question_sanitized} height={height} page={currentPage} paused={paused}/>
          )}
          pagingEnabled={true}
          onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          windowSize={1}
          className='flex-1'
        />
      </View>

      {/* Buttons */}
      <View className='flex-row justify-between'>
        <TouchableOpacity className="shadow-md flex-[0.5] mx-2 mb-5 bg-primary py-4 rounded-full justify-center items-center" onPress={() => setPaused(!paused)}>
          <Image source={paused? icons.play2: icons.pause2} className="w-12 h-12" tintColor={"#cccfff"} resizeMode="contain" />
        </TouchableOpacity>
        <TouchableOpacity className="shadow-md border-2 border-red-500 flex-grow mx-2 mb-5 bg-primary py-4 rounded-full justify-center items-center">
          <Text className="text-2xl font-gBlack text-red-500">Buzz!</Text>
        </TouchableOpacity>
        <TouchableOpacity className="flex-[0.5] shadow-md mx-4 mb-5 bg-primary py-4 rounded-full justify-center items-center">
          <Image source={icons.save} className="w-10 h-10" tintColor={"#cccfff"} resizeMode="contain" />
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  )
}

export default Play