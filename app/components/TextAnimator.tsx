import { Text, View, Animated, Easing } from 'react-native';
import React from 'react';


const PulsingLoadingText: React.FC = () => {
  const animationValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animationValue, {
          toValue: 1,
          duration: 300,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(animationValue, {
          toValue: 0,
          duration: 700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start(()=>{});
  }, [animationValue]);

  const opacity = animationValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.4, 1.0],
  });

  return (
    <Animated.Text
      className="text-lg text-secondary text-left font-gBook"
      style={{ opacity }}
    >
      Loading
    </Animated.Text>
  );
};


type TextAnimatorProps = {
  sentence: string;
  height: number;
  page: number;
  paused: boolean;
  isVisible: boolean;
  speed: number;
  onEnd: any;
};

const TextAnimator: React.FC<TextAnimatorProps> = ({ sentence, height, page, paused, isVisible, speed, onEnd }) => {
  const hasRendered = React.useRef(false);

  React.useEffect(() => {
    if (isVisible && !hasRendered.current) {
      hasRendered.current = true;
    }
  }, [isVisible]);

  const isLoading = !hasRendered.current;

  const words = sentence.split(' ');
  const animations = React.useRef(words.map(() => new Animated.Value(0))).current;

  React.useEffect(() => {
    if (isLoading) return;

    if (!isVisible) {
      animations.forEach(anim => anim.setValue(1));
      return;
    }
    if (paused) {
      animations.forEach(anim => anim.stopAnimation());
    } else {
      Animated.stagger(
        speed,
        animations.map(anim =>
          Animated.timing(anim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          })
        )
      ).start(()=>{onEnd});
    }
  }, [page, paused, isVisible, sentence, animations, isLoading]);

  // Conditionally render based on isLoading
  if (isLoading) {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', height }}>
       <PulsingLoadingText />
      </View>
    );
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', height }}>
      {words.map((word, index) => (
        <Animated.Text
          key={index}
          style={{ opacity: animations[index], marginRight: 5 }}
          className="text-sm text-secondary text-left font-gBook"
        >
          {word}{""}
        </Animated.Text>
      ))}
    </View>
  );
};

export default TextAnimator;


