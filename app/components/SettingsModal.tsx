// SettingsModal.tsx
import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import CategoryScrollView from './CategoryScrollView';
import CustomButton from './CustomButton';
import Slider from '@react-native-community/slider';

interface SettingsModalProps {
  toggleDifficulties: {
    ms: boolean;
    hs: boolean;
    college: boolean;
    open: boolean;
  };
  handleDifficultyPress: (diffArray: number[]) => void;
  toggleCategories: {
    science: boolean;
    history: boolean;
    finearts: boolean;
    literature: boolean;
    mythology: boolean;
  };
  handleCategoryPress: (catArray: string[]) => void;
  scrollPosition: React.MutableRefObject<number>;
  setModalVisible: (visible: boolean) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  toggleDifficulties,
  handleDifficultyPress,
  toggleCategories,
  handleCategoryPress,
  scrollPosition,
  setModalVisible,
}) => {
    
  return (
    <View className='flex-1 justify-center p-4'>
      <View className="m-5 bg-background border-2 border-secondary rounded-lg p-9 items-center shadow-lg">
        <Text className='text-tertiary text-2xl font-gBold pb-3'>Settings</Text>
        <Text className='text-tertiary text-xl font-gBold'>Level</Text>
        <View className='flex-row justify-between'>
          <CustomButton title='MS' isActive={toggleDifficulties.ms} handlePress={() => handleDifficultyPress([1])} containerStyles='mt-2 mr-2' />
          <CustomButton title='HS' isActive={toggleDifficulties.hs} handlePress={() => handleDifficultyPress([2,3,4,5])} containerStyles='mt-2 mx-2' />
          <CustomButton title='College' isActive={toggleDifficulties.college} handlePress={() => handleDifficultyPress([6,7,8,9])} containerStyles='mt-2 mx-2' />
          <CustomButton title='Open' isActive={toggleDifficulties.open} handlePress={() => handleDifficultyPress([10])} containerStyles='mt-2 ml-2' />
        </View>
        <Text className='text-tertiary text-xl font-gBold py-2'>Category</Text>
        <CategoryScrollView
          toggleCategories={toggleCategories}
          handleCategoryPress={handleCategoryPress}
          scrollPosition={scrollPosition}
        />
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

export default React.memo(SettingsModal);

// SettingsModal.tsx
// import React, { useState, useCallback, useRef } from 'react';
// import { View, Text, TouchableOpacity } from 'react-native';
// import CustomButton from './CustomButton';
// import CategoryScrollView from './CategoryScrollView'; // The memoized scroll component from earlier
// import Slider from '@react-native-community/slider';

// interface SettingsModalProps {
//   setModalVisible: (visible: boolean) => void;
// }

// const SettingsModal: React.FC<SettingsModalProps> = ({ setModalVisible }) => {
//   // Move difficulty-related state into the modal
//   const [difficulties, setDifficulties] = useState<number[] | undefined>(undefined);
//   const [toggleDifficulties, setToggleDifficulties] = useState({
//     ms: false,
//     hs: false,
//     college: false,
//     open: false,
//   });

//   // Move category-related state into the modal
//   const [categories, setCategories] = useState<string[] | undefined>(undefined);
//   const [toggleCategories, setToggleCategories] = useState({
//     science: false,
//     history: false,
//     finearts: false,
//     literature: false,
//     mythology: false,
//   });

//   // Create a ref to track scroll position for the category ScrollView
//   const scrollPosition = useRef(0);

//   // Handler for difficulty buttons
//   const handleDifficultyPress = useCallback((diffArray: number[]) => {
//     const isAnyDifficultyActive = diffArray.some(d => difficulties?.includes(d));
//     if (isAnyDifficultyActive) {
//       // Remove difficulties in diffArray
//       setDifficulties(prev => prev?.filter(d => !diffArray.includes(d)));
//     } else {
//       // Add difficulties in diffArray
//       setDifficulties(prev => [ ...(prev || []), ...diffArray ]);
//     }

//     if (diffArray.includes(1)) {
//       setToggleDifficulties(prev => ({ ...prev, ms: !prev.ms }));
//     } else if (diffArray.includes(2)) {
//       setToggleDifficulties(prev => ({ ...prev, hs: !prev.hs }));
//     } else if (diffArray.includes(6)) {
//       setToggleDifficulties(prev => ({ ...prev, college: !prev.college }));
//     } else {
//       setToggleDifficulties(prev => ({ ...prev, open: !prev.open }));
//     }
//   }, [difficulties]);

//   // Handler for category buttons
//   const handleCategoryPress = useCallback((catArray: string[]) => {
//     const isAnyCategoryActive = catArray.some(c => categories?.includes(c));
//     if (isAnyCategoryActive) {
//       // Remove categories in catArray
//       setCategories(prev => prev?.filter(c => !catArray.includes(c)));
//     } else {
//       // Add categories in catArray
//       setCategories(prev => [ ...(prev || []), ...catArray ]);
//     }

//     if (catArray.includes("Science")) {
//       setToggleCategories(prev => ({ ...prev, science: !prev.science }));
//     } else if (catArray.includes("History")) {
//       setToggleCategories(prev => ({ ...prev, history: !prev.history }));
//     } else if (catArray.includes("Fine Arts")) {
//       setToggleCategories(prev => ({ ...prev, finearts: !prev.finearts }));
//     } else if (catArray.includes("Literature")) {
//       setToggleCategories(prev => ({ ...prev, literature: !prev.literature }));
//     } else {
//       setToggleCategories(prev => ({ ...prev, mythology: !prev.mythology }));
//     }
//   }, [categories]);

//   return (
//     <View className='flex-1 justify-center p-4'>
//       <View className="m-5 bg-background border-2 border-secondary rounded-lg p-9 items-center shadow-lg">
//         <Text className='text-tertiary text-2xl font-gBold pb-3'>Settings</Text>
        
//         <Text className='text-tertiary text-xl font-gBold'>Level</Text>
//         <View className='flex-row justify-between'>
//           <CustomButton 
//             title='MS' 
//             isActive={toggleDifficulties.ms} 
//             handlePress={() => handleDifficultyPress([1])} 
//             containerStyles='mt-2 mr-2'
//           />
//           <CustomButton 
//             title='HS' 
//             isActive={toggleDifficulties.hs} 
//             handlePress={() => handleDifficultyPress([2,3,4,5])} 
//             containerStyles='mt-2 mx-2'
//           />
//           <CustomButton 
//             title='College' 
//             isActive={toggleDifficulties.college} 
//             handlePress={() => handleDifficultyPress([6,7,8,9])} 
//             containerStyles='mt-2 mx-2'
//           />
//           <CustomButton 
//             title='Open' 
//             isActive={toggleDifficulties.open} 
//             handlePress={() => handleDifficultyPress([10])} 
//             containerStyles='mt-2 ml-2'
//           />
//         </View>
        
//         <Text className='text-tertiary text-xl font-gBold py-2'>Category</Text>
//         <CategoryScrollView 
//           toggleCategories={toggleCategories} 
//           handleCategoryPress={handleCategoryPress}
//           scrollPosition={scrollPosition}
//         />

//         <Text className='text-tertiary text-xl font-gBold py-2'>Type of Question</Text>
//         <View className='flex-row justify-between'>
//           <CustomButton title='Tossup' handlePress={() => {}} containerStyles='mt-2 mr-2' />
//           <CustomButton title='Bonus' handlePress={() => {}} containerStyles='mt-2 ml-2' />
//         </View>
        
//         <Text className='text-tertiary text-xl font-gBold py-2'>Reading Speed</Text>
//         <Slider
//           style={{width: 240, height: 40}}
//           minimumValue={0}
//           minimumTrackTintColor='#8a92eb'
//           maximumTrackTintColor='#161622'
//           thumbTintColor='#cccfff'
//         />
//         <View className='flex-row justify-between'>
//           <CustomButton title='Enable Timer' handlePress={() => {}} containerStyles='mt-5 mr-2' />
//           <CustomButton title='Allow Rebuzz' handlePress={() => {}} containerStyles='mt-5 ml-2' />
//         </View>
//         <TouchableOpacity onPress={() => setModalVisible(false)}>
//           <CustomButton title='Close' handlePress={() => setModalVisible(false)} containerStyles='mt-5' />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };

// export default React.memo(SettingsModal);
