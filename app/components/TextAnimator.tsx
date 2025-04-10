import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated, {
  runOnJS,
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
  onEnd?: () => void;
  wasSeen?: boolean;
};

const fadeDuration = 100; // each word fades in over 100ms

const TextAnimatorReanimated: React.FC<TextAnimatorProps> = ({
  sentence,
  height,
  page,
  paused,
  isVisible,
  speed,
  onEnd,
  wasSeen = false,
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
  
  const completedWords = useRef(useSharedValue(0)).current;

  // Helper: The animation for each individual word with a given delay.
  const startWordAnimation = (i: number, delay: number) => {
    scheduledStartTimes.current[i] = Date.now() + delay;
    started.current[i] = false;
    // Mark the word as started after the delay.
    startTimeouts.current[i] = setTimeout(() => {
      started.current[i] = true;
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
    startTimeouts.current.forEach(timeoutId => clearTimeout(timeoutId));
    scheduledStartTimes.current = [];
    words.forEach((_, i) => {
      opacities[i].value = wasSeen ? 1 : 0;
      started.current[i] = wasSeen;
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
          if (!started.current[i] && startTimeouts.current[i]) {
            clearTimeout(startTimeouts.current[i]);
          }
        });
      } else {
        // On RESUME: for each word, decide how to restart its animation.
        words.forEach((_, i) => {
          if (opacities[i].value < 1) {
            if (started.current[i]) {
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
              const fullDelay = scheduledStartTimes.current[i] - pauseTimeRef.current;
              const remainingDelay = Math.max(fullDelay, 0); //originally fullDelay-elapsedSincePause, what was the logic behind the difference? Wouldn't it have to be fullDelay - (the amount of delay passed through the animation?) I did a very primitive fix for now.
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