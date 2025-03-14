import React, { useCallback, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import CustomButton from './CustomButton';
import Slider from '@react-native-community/slider';
import { STTContext } from '../context';

interface SettingsModalProps {
  difficulties: number[] | undefined;
  setDifficulties: React.Dispatch<React.SetStateAction<number[] | undefined>>;
  categories: string[] | undefined;
  setCategories: React.Dispatch<React.SetStateAction<string[] | undefined>>;
  setModalVisible: (visible: boolean) => void;
  enableTimer: boolean;
  setEnableTimer: React.Dispatch<React.SetStateAction<boolean>>;
  allowRebuzz: boolean;
  setAllowRebuzz: React.Dispatch<React.SetStateAction<boolean>>;
  onSpeedChange: (val: number) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  difficulties, setDifficulties,
  categories, setCategories,
  setModalVisible,
  enableTimer, setEnableTimer,
  allowRebuzz, setAllowRebuzz,
  onSpeedChange
}) => {
    const { startSTT, setStartSTT } = React.useContext(STTContext);
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
        socialscience: false,
        philosophy: false,
        religion: false
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
        socialscience: categories ? categories.includes("Social Science") : false,
        philosophy: categories ? categories.includes("Philosophy") : false,
        religion: categories ? categories.includes("Religion") : false
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
    }, [categories, setCategories]);

    const handleSpeedChange = (val: number) => {onSpeedChange(val);}

    return (
        <View className='flex-1 justify-center p-4'>
            <View className="m-5 bg-background border-2 border-secondary rounded-lg p-9 items-center shadow-lg">
                <Text className='text-tertiary text-2xl font-gBold pb-3'>Settings</Text>
                <Text className='text-tertiary text-xl font-gBold'>Level</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                    <CustomButton title='MS' isActive={toggleDifficulties.ms} handlePress={() => handleDifficultyPress([1])} containerStyles='mt-2 mr-2' />
                    <CustomButton title='HS' isActive={toggleDifficulties.hs} handlePress={() => handleDifficultyPress([2, 3, 4, 5])} containerStyles='mt-2 mx-2' />
                    <CustomButton title='College' isActive={toggleDifficulties.college} handlePress={() => handleDifficultyPress([6, 7, 8, 9])} containerStyles='mt-2 mx-2'/>
                    <CustomButton title='Open' isActive={toggleDifficulties.open} handlePress={() => handleDifficultyPress([10])} containerStyles='mt-2 ml-2'/>
                </ScrollView>

                <Text className='text-tertiary text-xl font-gBold py-2 mt-2'>Category</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                    <CustomButton title='Science' isActive={toggleCategories.science} handlePress={() => handleCategoryPress(["Science"])} containerStyles='mt-2 mr-2'/>
                    <CustomButton title='Social Science' isActive={toggleCategories.socialscience} handlePress={() => handleCategoryPress(["Social Science"])} containerStyles='mt-2 ml-2'/>
                    <CustomButton title='History' isActive={toggleCategories.history} handlePress={() => handleCategoryPress(["History"])} containerStyles='mt-2 mx-2'/>
                    <CustomButton title='Fine Arts' isActive={toggleCategories.finearts} handlePress={() => handleCategoryPress(["Fine Arts"])} containerStyles='mt-2 mx-2'/>
                    <CustomButton title='Literature' isActive={toggleCategories.literature} handlePress={() => handleCategoryPress(["Literature"])} containerStyles='mt-2 mx-2'/>
                    <CustomButton title='Philosophy' isActive={toggleCategories.philosophy} handlePress={() => handleCategoryPress(["Philosophy"])} containerStyles='mt-2 ml-2'/>
                    <CustomButton title='Mythology' isActive={toggleCategories.mythology} handlePress={() => handleCategoryPress(["Mythology"])} containerStyles='mt-2 ml-2'/>
                    <CustomButton title='Religion' isActive={toggleCategories.religion} handlePress={() => handleCategoryPress(["Religion"])} containerStyles='mt-2 ml-2'/>
                    
                </ScrollView>
                <Text className='text-tertiary text-xl font-gBold py-2 mt-2'>Reading Speed</Text>
                <Slider
                    style={{ width: 240, height: 40, transform: [{ scaleX: -1 }] }}
                    minimumValue={70}
                    maximumValue={300}
                    minimumTrackTintColor="#161622"
                    maximumTrackTintColor="#8a92eb"
                    thumbTintColor="#cccfff"
                    onValueChange={handleSpeedChange}
                    value={150}
                />
                <View className='flex-row justify-between'>
                    <CustomButton 
                        title='Timer' 
                        containerStyles='mt-5 mr-2' 
                        isActive={enableTimer}
                        handlePress={() => {
                            setEnableTimer(prev => {
                                return !prev;
                            });
                        }}
                    />
                    <CustomButton title='Rebuzz' 
                        containerStyles='mt-5 ml-2'
                        isActive={allowRebuzz}
                        handlePress = {()=>{setAllowRebuzz(!allowRebuzz)}}
                    />
                </View>
                <CustomButton title='Speech To Text' 
                        containerStyles='mt-5 ml-2'
                        isActive={startSTT}
                        handlePress = {()=>{setStartSTT(!startSTT)}}/>
                <CustomButton title='Close' handlePress={() => setModalVisible(false)} containerStyles='mt-5' />
            </View>
        </View>
    );
};

export default React.memo(SettingsModal);