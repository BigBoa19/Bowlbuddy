import { Text, TouchableOpacity } from 'react-native';
import React from 'react';

type CustomButtonProps = {
    title: string;
    handlePress: any;
    containerStyles?: string;
    isLoading?: boolean;
    textStyles?: string;
}

const CustomButton: React.FC<CustomButtonProps> = ({ title, handlePress, containerStyles, textStyles, isLoading, }) => {
  return (
    <TouchableOpacity 
    onPress={handlePress}
    activeOpacity={0.7}
    className={`bg-primary rounded-xl p-4 ${containerStyles} ${isLoading ? 'opacity-50' : ''}`}
    disabled={isLoading}
    >
      <Text className={`text-secondary text-center text-lg font-gBold ${textStyles}`}>
        {title}
        </Text>
    </TouchableOpacity>
  )
}

export default CustomButton