import { View, Text, Image, Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';
import icons from '@/constants/icons';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Initial fade in and scale up
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500, // Reduced from 1000ms to 500ms
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 10,
        friction: 2,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Wait for 0.5 seconds (reduced from 1.5s)
      setTimeout(() => {
        // Fade out
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300, // Reduced from 500ms to 300ms
          useNativeDriver: true,
        }).start(() => {
          onFinish();
        });
      }, 500);
    });
  }, []);

  return (
    <View className="flex-1 bg-background justify-center items-center">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center"
      >
        <Image
          source={icons.play2}
          className="w-32 h-32 mb-4"
          style={{ tintColor: '#8a92eb' }}
          resizeMode="contain"
        />
        <Text className="text-tertiary text-4xl font-gBold">BowlBuddy</Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen; 