import { View, Text, TextInput, TouchableOpacity, Image } from 'react-native';
import React from 'react';
import icons from '@/constants/icons'

type FormFieldProps = {
    title?: string;
    value: string;
    placeholder: string;
    handleChangeText: (text: string) => void;
    otherStyles?: string;
    startCaps?: boolean;
    titleStyles?: string;
    icon?: object;
}

const FormField: React.FC<FormFieldProps> = ({title, value, placeholder, handleChangeText, otherStyles, ...props}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <View className={`space-y-1 ${otherStyles}`}>
      {title && <Text className={`text-base text-tertiary ml-2 font-gBook text ${props.titleStyles}`}>{title}</Text>}
      <View className='w-full h-16 px-4 bg-slate-400 rounded-2xl border-2 border-[#2e2a72] flex flex-row justify-center items-center'>
        <TextInput
          value={value}
          placeholder={placeholder}
          onChangeText={handleChangeText}
          placeholderTextColor='#75726f'
          autoCapitalize={props.startCaps ? 'sentences' : 'none'}
          className='flex-1 font-gBook text-base text-primary pt-1'
          style={{ minHeight: 30, lineHeight: 0 }} // Adjust based on font size
          secureTextEntry={title === 'Password' && !showPassword}
        />
        <Image
          source={props.icon}
          className='w-10 h-10 p-2 opacity-55 mt-0.5' style={{tintColor: '#75726f'}} 
          resizeMode='contain'
        />
        
      </View>
      

    </View>
  )
}

export default FormField