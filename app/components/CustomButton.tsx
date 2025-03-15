import { Text, TouchableOpacity } from 'react-native';
import React from 'react';

type CustomButtonProps = {
    title: string;
    handlePress: any;
    containerStyles?: string;
    isLoading?: boolean;
    textStyles?: string;
    isActive?:boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ title, handlePress, containerStyles, textStyles, isLoading, isActive }) => {
  return (
    <TouchableOpacity 
    onPress={handlePress}
    activeOpacity={0.7}
    className={`${!isActive?"bg-primary":"bg-secondary"} rounded-xl p-3 ${containerStyles} ${isLoading ? 'opacity-50' : ''}`}
    disabled={isLoading}
    >
      <Text className={`${!isActive?"text-secondary":"text-primary"} text-center text-lg font-gBold ${textStyles}`}>
        {title}
        </Text>
    </TouchableOpacity>
  )
}

export default CustomButton