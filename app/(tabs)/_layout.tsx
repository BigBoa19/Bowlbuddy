import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, Image, Animated, Modal } from 'react-native';
import { Tabs } from 'expo-router';
import icons from '@/constants/icons';
import { BuzzCircleContext } from '../context';
import BuzzScreen from './BuzzScreen';

interface TabIconProps {
  icon: any;
  color: string;
  name: string;
  focused: boolean;
}

const TabIcon: React.FC<TabIconProps> = ({ icon, color, name, focused }) => {
  return (
    <View className='items-center justify-center gap-1' style={{ paddingTop: 20 }}>
      <Image source={icon} resizeMode='contain' tintColor={color} className='w-6 h-6' />
      <Text
        className={`${focused ? 'font-gBold text-secondary' : 'font-gBook text-tertiary'} text-xs text-center`}
        numberOfLines={1}
        style={{ width: 61 }}
      >
        {name}
      </Text>
    </View>
  );
};

export default function TabsLayout() {
  const { isAnimating } = useContext(BuzzCircleContext);
  const scaleValue = useRef(new Animated.Value(0)).current;
  const [buzzModal, setBuzzModal] = useState(false);

  const BuzzCircle = () => (
    <Animated.View
      style={{
        transform: [{ scale: scaleValue }, { translateX: 0 }, { translateY: -17 }],
        zIndex: 9999,
      }}
      className='absolute flex-1 bg-transparent items-center justify-end bottom-28 right-44 left-44'
    >
      <View className='w-6 h-6 p-9 rounded-full bg-secondary' />
    </Animated.View>
  );

  useEffect(() => {
    if (isAnimating) {
      scaleValue.setValue(0);
      Animated.timing(scaleValue, {
        toValue: 16,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        setBuzzModal(true);
      });
    }
  }, [isAnimating]);

  return (
    <View className='flex-1'>
      <Modal
        animationType='fade'
        transparent={true}
        visible={buzzModal}
        onRequestClose={() => {
          setBuzzModal(false);
        }}
      >
        <BuzzScreen scaleValue={scaleValue} setBuzzModal={setBuzzModal} />
      </Modal>
      {isAnimating && <BuzzCircle />}
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: '#8a92eb',
          tabBarInactiveTintColor: '#ccccff',
          tabBarStyle: {
            backgroundColor: '#161622',
            borderTopWidth: 1,
            borderTopColor: '#232533',
            height: 80,
          },
        }}
      >
        <Tabs.Screen
          name='play'
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
              <TabIcon icon={icons.play} color={color} name='Play' focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name='multiplayer'
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
              <TabIcon icon={icons.multiplayer} color={color} name='Multiplayer' focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name='saved'
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
              <TabIcon icon={icons.save} color={color} name='Saved' focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name='profile'
          options={{
            headerShown: false,
            tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
              <TabIcon icon={icons.profile} color={color} name='Profile' focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name='SavedQuestion'
          options={{
            href: null,
            headerShown: false,
            tabBarStyle: { display: 'none' },
            animation: 'shift',
          }}
        />
        <Tabs.Screen
          name='BuzzScreen'
          options={{
            href: null,
            headerShown: false,
            tabBarStyle: { display: 'none' },
            animation: 'shift',
          }}
        />
      </Tabs>
    </View>
  );
}
