import { View, Text, SafeAreaView, FlatList, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import icons from '@/constants/icons'
import FormField from '../components/FormField'
import { questions } from '../functions/fetchDB'
import { UserContext } from '../context'
import { db } from '../../firebaseConfig'
import { doc, collection, query, onSnapshot } from 'firebase/firestore'
import { router } from 'expo-router'

const Item = (props: questions) => (
<TouchableOpacity
  onPress={() => {
    router.push({
      pathname: "/SavedQuestion",
      params: {
        question: props.question_sanitized,
        question_sanitized: props.question_sanitized,
        answer: props.answer_sanitized,
        answer_sanitized: props.answer_sanitized,
      },
    });
  }}
>
  <View className="flex-row items-center p-5 bg-primary mt-3 border-2 border-secondary rounded-xl">
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

const Saved = () => {
  const { user } = React.useContext(UserContext);
  const [questions, setQuestions] = React.useState<any[]>([])
  const [searchQuery, setQuery]= React.useState('')

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
        ...doc.data()
      }));
      setQuestions(questions);
    });
  
    return () => unsubscribe();
  
  }, [user]);  

  
  const filterData = (item: questions) => {
    if (item.answer_sanitized.toLowerCase().includes(searchQuery.toLowerCase())){
      return (
        <Item {...item} />
      );
    }
    return null;
  }
  
  return (
    <SafeAreaView className='flex-1 justify-center bg-background'>
      <View className='flex-1 justify-start'>
        {/* Header */}
        <View className='flex-row justify-between items-center p-2 pl-5'>
          <Text className='text-tertiary text-3xl font-gBold'>Saved</Text>
          <Image source={icons.play2} className='w-14 h-14 p-2' style={{tintColor: '#cccfff'}} resizeMode='contain' />
        </View>
        {/* Border */}
        <View className="h-[1px] bg-tertiary" />
        {/* Search Bar */}
        <View className='justify-between'>
          <FormField
            value={searchQuery}
            placeholder='Search'
            handleChangeText={(e) => setQuery(e)}
            otherStyles='mt-2 pb-3 p-3'
            startCaps={false}
            titleStyles='text-blue-400'
            icon={icons.search}
          />
        </View>
        {/* Item List */}
        <FlatList
          data={questions}
          renderItem={({item}) => filterData(item)}
          keyExtractor={item => item._id}
          className="px-3"
        />
      </View>
    </SafeAreaView>
  )
}

export default Saved