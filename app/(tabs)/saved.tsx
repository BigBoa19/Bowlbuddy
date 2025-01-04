import { View, Text, StyleSheet, SafeAreaView, FlatList, Image } from 'react-native'
import React, {useEffect, useState} from 'react'
import icons from '@/constants/icons'
import FormField from '../components/FormField'


const DATA = [
  {
    id: '1',
    title: 'First Item',
  },
  {
    id: '2',
    title: 'Second Item',
  },
  {
    id: '3',
    title: 'Third Item',
  },
  {
    id: '4',
    title: 'Fourth Item',
  },
  {
    id: '5',
    title: 'Fifth Item',
  },
  {
    id: '6',
    title: 'Sixth Item',
  },
  {
    id: '7',
    title: 'Seventh Item',
  },
  {
    id: '8',
    title: 'Eighth Item',
  },
  {
    id: '9',
    title: 'Ninth Item',
  },
  {
    id: '10',
    title: 'Tenth Item',
  },
];

type ItemProps = {title: string};

const Item = ({title}: ItemProps) => (
  <View className='flex-row p-5 bg-primary mt-3 border-2 border-secondary rounded-xl'>
    <Text className='text-white text-xl font-gBook'>{title}</Text>
    <View className='flex-1 items-end'>
      <Image
          source={icons.leftArrow}
          resizeMode="contain"
          tintColor={'text-tertiary'}
          className='w-6 h-6 rotate-180'
      />
    </View>
  </View>
);

// const useEffect = () => {

// }


const Saved = () => {
  const [query, setQuery]= useState('')

  const filterData = (item:any) =>{
    if(item.title.toLowerCase().includes(query.toLowerCase())){
      return (
        <Item title={item.title}/>
      );
    }
    return null;
  }
  
  return (
    // Main Box
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
            value={query}
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
          data={DATA}
          renderItem={({item}) => filterData(item)}
          keyExtractor={item => item.id}
          className="px-3"
        />
      </View>
    </SafeAreaView>
  )
}

export default Saved