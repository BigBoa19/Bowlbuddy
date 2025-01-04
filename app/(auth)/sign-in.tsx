import { View, Text, Image, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native'
import React from 'react'
import { Link, useRouter } from 'expo-router'
import FormField from '../components/FormField'
import CustomButton from '../components/CustomButton'
import icons from '@/constants/icons'

const SignIn = ({promptAsync}:any) => {
  const [form, setForm] = React.useState({
    email: '',
    password: ''
  })
  const router = useRouter()
  const handleGoBack = () => {
    router.back()
  }
  return (
    <SafeAreaView className=' bg-secondary h-full'>
      {/* <TouchableOpacity onPress={handleGoBack} className='p-4'>
          <Image source={icons.leftArrow} resizeMode='contain' className='w-[20px] h-[20px]' tintColor={"#2e2a72"} />
      </TouchableOpacity> */}
      <ScrollView>
        <View className='flex-1 w-full justify-center h-full px-4  mt-6 '>

          <Text className="text-2xl font-semibold text-primary font-poppinsSemiBold pl-1">
              Log In to BowlBuddy
          </Text>
          {/* Email Text Field */}
          <FormField
            title='Email'
            titleStyles='text-primary'
            value={form.email}
            placeholder='Enter your email'
            handleChangeText={(e) => setForm({...form, email: e})}
            otherStyles='mt-7'
            startCaps={false}
          />
          {/* Password Text Field */}
          <FormField
            title='Password'
            titleStyles='text-primary'
            value={form.password}
            placeholder='Enter your password'
            handleChangeText={(e) => setForm({...form, password: e})}
            otherStyles='mt-7'
            startCaps={false}
          />
          {/* Login Button */}
          <CustomButton
            title='Login'
            handlePress={() => console.log('Login')}
            containerStyles='mt-9'
          />

          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-tertiary font-poppinsRegular">
              Don't have an account?
            </Text>
          </View>
          <View className="flex justify-center pt-5">
          </View>
        </View>
        <View className="flex justify-center pt-2 px-4">
          <TouchableOpacity onPress={() => promptAsync()} className="flex-row items-center justify-center bg-white p-4 rounded-lg mt-2 shadow-lg">
            <Image
              source={icons.google}
              resizeMode="contain"
              tintColor="none"
              className='w-10 h-10 mb-0.5'
            />
            <Text className="text-primary font-gBook text-xl ml-2 ">
              Continue with
            </Text>
            {/* <Text className="text-tertiary font-gBold text-lg ml-1.5">
            </Text> */}
            <Text className='text-[#4285f4] font-gBold text-2xl ml-2'>G</Text>
            <Text className='text-[#ea4336] font-gBold text-2xl'>o</Text>
            <Text className='text-[#fbbc04] font-gBold text-2xl'>o</Text>
            <Text className='text-[#4285f4] font-gBold text-2xl'>g</Text>
            <Text className='text-[#34a853] font-gBold text-2xl'>l</Text>
            <Text className='text-[#ea4336] font-gBold text-2xl'>e</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}


export default SignIn