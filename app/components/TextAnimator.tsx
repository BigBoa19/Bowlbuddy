import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  cancelAnimation,
} from 'react-native-reanimated';

type TextAnimatorProps = {
  sentence: string;
  height: number;
  page: number;
  paused: boolean;
  isVisible: boolean;
  speed: number; // stagger delay per word (in ms)
};

const fadeDuration = 100; // each word fades in over 100ms

const TextAnimatorReanimated: React.FC<TextAnimatorProps> = ({
  sentence,
  height,
  page,
  paused,
  isVisible,
  speed,
}) => {
  const words = sentence.split(' ');

  // Shared opacity values for each word.
  const opacities = useRef(words.map(() => useSharedValue(0))).current;

  // Track whether a word's animation has actually started (i.e. after its delay).
  const started = useRef(new Array(words.length).fill(false));
  // Record the scheduled start time (in JS time) for each word.
  const scheduledStartTimes = useRef<number[]>([]);
  // Hold the timeout IDs for marking a word as started.
  const startTimeouts = useRef<(NodeJS.Timeout | number)[]>([]);

  // Global pause time (in milliseconds) from JS Date.
  const pauseTimeRef = useRef(0);
  const prevPaused = useRef(paused);

  // Helper: Start the animation for word at index i with a given delay.
  const startWordAnimation = (i: number, delay: number) => {
    scheduledStartTimes.current[i] = Date.now() + delay;
    // Mark this word as not started yet.
    started.current[i] = false;
    // Schedule marking it as started once the delay is over.
    startTimeouts.current[i] = setTimeout(() => {
      started.current[i] = true;
    }, delay);
    // Start the animation with delay.
    opacities[i].value = withDelay(
      delay,
      withTiming(1, { duration: fadeDuration })
    );
  };

  // Reset and start animations when sentence, page, or visibility changes.
  useEffect(() => {
    // Clear any pending timeouts.
    startTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
    scheduledStartTimes.current = [];
    words.forEach((_, i) => {
      opacities[i].value = 0;
      started.current[i] = false;
    });
    if (isVisible) {
      words.forEach((_, i) => {
        startWordAnimation(i, i * speed);
      });
    }
    prevPaused.current = paused;
  }, [sentence, page, isVisible]);

  // Handle pause/resume changes.
  useEffect(() => {
    if (!isVisible) return;
    if (prevPaused.current !== paused) {
      if (paused) {
        // On pause: record the pause time and cancel all animations.
        pauseTimeRef.current = Date.now();
        words.forEach((_, i) => {
          cancelAnimation(opacities[i]);
          // Cancel pending timeouts for words that haven't started.
          if (!started.current[i] && startTimeouts.current[i]) {
            clearTimeout(startTimeouts.current[i]);
          }
        });
      } else {
        // On resume: for each word, decide how to restart its animation.
        words.forEach((_, i) => {
          if (opacities[i].value < 1) {
            if (started.current[i]) {
              // For words that have already started, resume from the current progress.
              const current = opacities[i].value;
              const remainingDuration = fadeDuration * (1 - current);
              opacities[i].value = withTiming(1, { duration: remainingDuration });
            } else {
              // For words that haven't started, calculate remaining delay.
              const elapsedSincePause = Date.now() - pauseTimeRef.current;
              const fullDelay = scheduledStartTimes.current[i] - pauseTimeRef.current;
              const remainingDelay = Math.max(fullDelay, 0); //originally fullDelay-elapsedSincePause, what was the logic behind the difference? Wouldn't it have to be fullDelay - (the amount of delay passed through the animation?) I did a very primitive fix for now.
              startWordAnimation(i, remainingDelay);
            }
          }
        });
      }
      prevPaused.current = paused;
    }
  }, [paused, isVisible]);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', height }}>
      {words.map((word, i) => {
        const animatedStyle = useAnimatedStyle(() => ({
          opacity: opacities[i].value,
        }));
        return (
          <Animated.Text className="text-sm text-secondary text-left font-gBook"
                         key={i} style={[{ marginRight: 5 }, animatedStyle]}>
            {word}{''}
          </Animated.Text>
        );
      })}
    </View>
  );
};

export default TextAnimatorReanimated;




// import { Text, View, Animated, Easing } from 'react-native';
// import React from 'react';


// const PulsingLoadingText: React.FC = () => {
//   const animationValue = React.useRef(new Animated.Value(0)).current;

//   React.useEffect(() => {
//     Animated.loop(
//       Animated.sequence([
//         Animated.timing(animationValue, {
//           toValue: 1,
//           duration: 300,
//           easing: Easing.inOut(Easing.ease),
//           useNativeDriver: true,
//         }),
//         Animated.timing(animationValue, {
//           toValue: 0,
//           duration: 700,
//           easing: Easing.inOut(Easing.ease),
//           useNativeDriver: true,
//         }),
//       ])
//     ).start(()=>{});
//   }, [animationValue]);

//   const opacity = animationValue.interpolate({
//     inputRange: [0, 1],
//     outputRange: [0.4, 1.0],
//   });

//   return (
//     <Animated.Text
//       className="text-lg text-secondary text-left font-gBook"
//       style={{ opacity }}
//     >
//       Loading
//     </Animated.Text>
//   );
// };


// type TextAnimatorProps = {
//   sentence: string;
//   height: number;
//   page: number;
//   paused: boolean;
//   isVisible: boolean;
//   speed: number;
//   onEnd: any;
// };

// const TextAnimator: React.FC<TextAnimatorProps> = ({ sentence, height, page, paused, isVisible, speed, onEnd }) => {
//   const hasRendered = React.useRef(false);

//   React.useEffect(() => {
//     if (isVisible && !hasRendered.current) {
//       hasRendered.current = true;
//     }
//   }, [isVisible]);

//   const isLoading = !hasRendered.current;

//   const words = sentence.split(' ');
//   const animations = React.useRef(words.map(() => new Animated.Value(0))).current;

//   React.useEffect(() => {
//     if (isLoading) return;

//     if (!isVisible) {
//       animations.forEach(anim => anim.setValue(1));
//       return;
//     }
//     if (paused) {
//       animations.forEach(anim => anim.stopAnimation());
//     } else {
//       Animated.stagger(
//         speed,
//         animations.map(anim =>
//           Animated.timing(anim, {
//             toValue: 1,
//             duration: 100,
//             useNativeDriver: true,
//           })
//         )
//       ).start(()=>{onEnd()});
//     }
//   }, [page, paused, isVisible, sentence, animations, isLoading]);

//   // Conditionally render based on isLoading
//   if (isLoading) {
//     return (
//       <View style={{ flexDirection: 'row', flexWrap: 'wrap', height }}>
//        <PulsingLoadingText />
//       </View>
//     );
//   }

//   return (
//     <View style={{ flexDirection: 'row', flexWrap: 'wrap', height }}>
//       {words.map((word, index) => (
//         <Animated.Text
//           key={index}
//           style={{ opacity: animations[index], marginRight: 5 }}
//           className="text-sm text-secondary text-left font-gBook"
//         >
//           {word}{""}
//         </Animated.Text>
//       ))}
//     </View>
//   );
// };

// export default TextAnimator;