import { Text, View, SafeAreaView, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import icons from '@/constants/icons'
import { useLocalSearchParams, router } from 'expo-router'

const SavedQuestion = () => {
    const handleGoBack = () => {router.navigate("/(tabs)/saved")}
    const { question, question_sanitized, answer, answer_sanitized } = useLocalSearchParams<{
        question: string; question_sanitized: string; answer: string; answer_sanitized: string;
    }>()


    return (
        <SafeAreaView className='bg-background flex-1 justify-between'>
        <TouchableOpacity onPress={handleGoBack} className='p-4'>
            <Image source={icons.leftArrow} resizeMode='contain' className='w-[20px] h-[20px]' tintColor={"#2e2a72"} />
        </TouchableOpacity>
        <Text className='text-tertiary text-2xl font-gBold'>{question_sanitized}</Text>
        <Text className='text-tertiary text-2xl font-gBold'>{answer_sanitized}</Text>
        </SafeAreaView>
    )
}

export default SavedQuestion