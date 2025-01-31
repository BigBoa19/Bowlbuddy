import React, { useCallback, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import CustomButton from './CustomButton';
import Slider from '@react-native-community/slider';

interface SettingsModalProps {
  difficulties: number[] | undefined;
  setDifficulties: React.Dispatch<React.SetStateAction<number[] | undefined>>;
  categories: string[] | undefined;
  setCategories: React.Dispatch<React.SetStateAction<string[] | undefined>>;
  setModalVisible: (visible: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  difficulties,
  setDifficulties,
  categories,
  setCategories,
  setModalVisible,
}) => {
    const scrollPosition = useRef(0);
    const [toggleDifficulties, setToggleDifficulties] = React.useState({
        ms: false,
        hs: false,
        college: false,
        open: false,
    });
    const [toggleCategories, setToggleCategories] = React.useState({
        science: false,
        history: false,
        finearts: false,
        literature: false,
        mythology: false,
    });

    useEffect(() => {
        setToggleDifficulties({
        ms: difficulties ? difficulties.includes(1) : false,
        hs: difficulties ? difficulties.some(d => [2, 3, 4, 5].includes(d)) : false,
        college: difficulties ? difficulties.some(d => [6, 7, 8, 9].includes(d)) : false,
        open: difficulties ? difficulties.includes(10) : false,
        });
    }, [difficulties]);

    useEffect(() => {
        setToggleCategories({
        science: categories ? categories.includes("Science") : false,
        history: categories ? categories.includes("History") : false,
        finearts: categories ? categories.includes("Fine Arts") : false,
        literature: categories ? categories.includes("Literature") : false,
        mythology: categories ? categories.includes("Mythology") : false,
        });
    }, [categories]);

    const handleDifficultyPress = useCallback((diffArray: number[]) => {
        const isAnyActive = diffArray.some(d => difficulties?.includes(d));
        if (isAnyActive) {
        // Remove difficulties in diffArray.
        setDifficulties(prev => prev?.filter(d => !diffArray.includes(d)));
        } else {
        // Add difficulties in diffArray.
        setDifficulties(prev => [...(prev || []), ...diffArray]);
        }
        // No need to toggle local state manually—the useEffect will derive it.
    }, [difficulties, setDifficulties]);

    const handleCategoryPress = useCallback((catArray: string[]) => {
        const isAnyActive = catArray.some(c => categories?.includes(c));
        if (isAnyActive) {
        // Remove categories in catArray.
        setCategories(prev => prev?.filter(c => !catArray.includes(c)));
        } else {
        // Add categories in catArray.
        setCategories(prev => [...(prev || []), ...catArray]);
        }
        // No need to toggle local state manually—the useEffect will derive it.
    }, [categories, setCategories]);

    return (
        <View className='flex-1 justify-center p-4'>
            <View className="m-5 bg-background border-2 border-secondary rounded-lg p-9 items-center shadow-lg">
                <Text className='text-tertiary text-2xl font-gBold pb-3'>Settings</Text>
                <Text className='text-tertiary text-xl font-gBold'>Level</Text>
                <View className='flex-row justify-between'>
                    <CustomButton title='MS' isActive={toggleDifficulties.ms} handlePress={() => handleDifficultyPress([1])} containerStyles='mt-2 mr-2' />
                    <CustomButton title='HS' isActive={toggleDifficulties.hs} handlePress={() => handleDifficultyPress([2, 3, 4, 5])} containerStyles='mt-2 mx-2' />
                    <CustomButton title='College' isActive={toggleDifficulties.college} handlePress={() => handleDifficultyPress([6, 7, 8, 9])} containerStyles='mt-2 mx-2'/>
                    <CustomButton title='Open' isActive={toggleDifficulties.open} handlePress={() => handleDifficultyPress([10])} containerStyles='mt-2 ml-2'/>
                </View>

                <Text className='text-tertiary text-xl font-gBold py-2'>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                    <CustomButton title='Science' isActive={toggleCategories.science} handlePress={() => handleCategoryPress(["Science"])} containerStyles='mt-2 mr-2'/>
                    <CustomButton title='History' isActive={toggleCategories.history} handlePress={() => handleCategoryPress(["History"])} containerStyles='mt-2 mx-2'/>
                    <CustomButton title='Fine Arts' isActive={toggleCategories.finearts} handlePress={() => handleCategoryPress(["Fine Arts"])} containerStyles='mt-2 mx-2'/>
                    <CustomButton title='Literature' isActive={toggleCategories.literature} handlePress={() => handleCategoryPress(["Literature"])} containerStyles='mt-2 mx-2'/>
                    <CustomButton title='Mythology' isActive={toggleCategories.mythology} handlePress={() => handleCategoryPress(["Mythology"])} containerStyles='mt-2 ml-2'/>
                </ScrollView>

                <Text className='text-tertiary text-xl font-gBold py-2'>Type of Question</Text>
                <View className='flex-row justify-between'>
                    <CustomButton title='Tossup' handlePress={() => {}} containerStyles='mt-2 mr-2'/>
                    <CustomButton title='Bonus' handlePress={() => {}} containerStyles='mt-2 ml-2'/>
                </View>
                <Text className='text-tertiary text-xl font-gBold py-2'>Reading Speed</Text>
                <Slider
                style={{ width: 240, height: 40 }}
                minimumValue={0}
                minimumTrackTintColor='#8a92eb'
                maximumTrackTintColor='#161622'
                thumbTintColor='#cccfff'
                />
                <View className='flex-row justify-between'>
                    <CustomButton title='Enable Timer' handlePress={() => {}} containerStyles='mt-5 mr-2' />
                    <CustomButton title='Allow Rebuzz' handlePress={() => {}} containerStyles='mt-5 ml-2' />
                </View>
                <CustomButton title='Close' handlePress={() => setModalVisible(false)} containerStyles='mt-5' />
            </View>
        </View>
    );
};

export default React.memo(SettingsModal);