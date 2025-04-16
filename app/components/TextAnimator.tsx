import React, { useEffect, useRef, useMemo } from 'react';
import { View } from 'react-native';
import Animated, {
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  withDelay,
  withTiming,
  cancelAnimation,
  type SharedValue,
} from 'react-native-reanimated';

// Memoized word component to prevent unnecessary re-renders
const AnimatedWord = React.memo(({ 
  word, 
  opacity, 
  index 
}: { 
  word: string; 
  opacity: SharedValue<number>; 
  index: number;
}) => {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }), []);

  return (
    <Animated.Text 
      className="text-sm text-secondary text-left font-gBook"
      style={[{ marginRight: 5 }, animatedStyle]}
    >
      {word}
    </Animated.Text>
  );
});

type TextAnimatorProps = {
  sentence: string;
  height: number;
  page: number;
  paused: boolean;
  isVisible: boolean;
  speed: number; // stagger delay per word (in ms)
  onEnd?: () => void;
  wasSeen?: boolean;
};

const fadeDuration = 100; // each word fades in over 100ms

const TextAnimatorReanimated: React.FC<TextAnimatorProps> = React.memo(({
  sentence,
  height,
  page,
  paused,
  isVisible,
  speed,
  onEnd,
  wasSeen = false,
}) => {
    
  const words = useMemo(() => sentence.split(' '), [sentence]);
  // Shared opacity values for each word.
  const opacities = useRef(words.map(() => useSharedValue(0))).current;
  // Track whether a word's animation has actually started (i.e. after its delay).
  const started = useRef<boolean[]>(new Array(words.length).fill(false)).current;
  // Record the scheduled start time (in JS time) for each word.
  const scheduledStartTimes = useRef<number[]>([]).current;
  // Hold the timeout IDs for marking a word as started.
  const startTimeouts = useRef<(NodeJS.Timeout | number)[]>([]).current;
  // Global pause time (in milliseconds) from JS Date.
  const pauseTimeRef = useRef(0);
  const prevPaused = useRef(paused);
  
  const completedWords = useRef(useSharedValue(0)).current;

  // Helper: The animation for each individual word with a given delay.
  const startWordAnimation = (i: number, delay: number) => {
    scheduledStartTimes[i] = Date.now() + delay;
    started[i] = false;
    // Mark the word as started after the delay.
    startTimeouts[i] = setTimeout(() => {
      started[i] = true;
    }, delay);
    // Start the animation with delay.
    opacities[i].value = withDelay(delay, withTiming(1, { duration: fadeDuration }, (finished) => {
      if (finished) {
        completedWords.value = completedWords.value + 1;
        if (completedWords.value === words.length && onEnd) {
          runOnJS(onEnd)();
        }
      }}));
  };

  // Reset animations
  useEffect(() => {
    // Clear any pending timeouts.
    startTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
    scheduledStartTimes.length = 0;
    words.forEach((_, i) => {
      opacities[i].value = wasSeen ? 1 : 0;
      started[i] = wasSeen;
    });
    if (isVisible && !wasSeen) {
      words.forEach((_, i) => {
        startWordAnimation(i, i * speed);
      });
    } else if (isVisible && wasSeen && onEnd) {
      // If the question was seen before, call onEnd immediately
      onEnd();
    }
    prevPaused.current = paused;
  }, [sentence, page, isVisible, wasSeen]);

  // pause/resume.
  useEffect(() => {
    if (!isVisible || wasSeen) return;
    if (prevPaused.current !== paused) {
      if (paused) {
        // On PAUSE: record the pause time and cancel all animations.
        pauseTimeRef.current = Date.now();
        words.forEach((_, i) => {
          cancelAnimation(opacities[i]);
          // Cancel pending timeouts for words that haven't started.
          if (!started[i] && startTimeouts[i]) {
            clearTimeout(startTimeouts[i]);
          }
        });
      } else {
        // On RESUME: for each word, decide how to restart its animation.
        words.forEach((_, i) => {
          if (opacities[i].value < 1) {
            if (started[i]) {
              // For words that have already started, resume from the current progress.
              const current = opacities[i].value;
              const remainingDuration = fadeDuration * (1 - current);
              opacities[i].value = withTiming(1, { duration: remainingDuration }, (finished) => {
                if (finished) {
                  completedWords.value = completedWords.value + 1;
                  if (completedWords.value === words.length && onEnd) {
                    runOnJS(onEnd)();
                  }
                }
              });
            } else {
              // For words that haven't started, calculate remaining delay.
              const fullDelay = scheduledStartTimes[i] - pauseTimeRef.current;
              const remainingDelay = Math.max(fullDelay, 0);
              startWordAnimation(i, remainingDelay);
            }
          }
        });
      }
      prevPaused.current = paused;
    }
  }, [paused, isVisible, wasSeen]);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', height }}>
      {words.map((word, i) => (
        <AnimatedWord
          key={`${word}-${i}`}
          word={word}
          opacity={opacities[i]}
          index={i}
        />
      ))}
    </View>
  );
});

export default TextAnimatorReanimated;