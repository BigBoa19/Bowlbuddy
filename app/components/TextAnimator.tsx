import { Text, View, Animated } from 'react-native'
import React from 'react'
import { QuestionContext } from '../context';


type TextAnimatorProps = {
    sentence: string;
    height: number;
    page: number;
    paused: boolean;
}

const TextAnimator: React.FC<TextAnimatorProps> = ({sentence, height, page, paused}) => {
    const words = sentence.split(' ');
    const animations = React.useRef(words.map(() => new Animated.Value(0))).current;

    React.useEffect(() => {
        if(paused){
            animations.forEach(anim => anim.stopAnimation());
        }
        else{
            animations.forEach(anim => anim.setValue(0));
            Animated.stagger(200, animations.map(anim => Animated.timing(anim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true
            }))).start();
        }
    }, [page, paused]);

    return (
      <View className='flex-row flex-wrap' style={{height: height}}>{
        words.map((word, index) => (
          <Animated.Text key={index} className="text-sm text-secondary text-left font-gBook" style={{opacity: animations[index]
          }}>
            {word}{" "}
          </Animated.Text>
        ))
        }
        </View>
    )
}

const FocusedTextAnimator: React.FC<TextAnimatorProps> = React.memo(({ sentence, height, page, paused }) => {
  const { currentQuestion } = React.useContext(QuestionContext);
  
  // Only render the animator if the current question matches the sentence
  if (currentQuestion.question_sanitized !== sentence) {
    return (
      <View style={{ height }}>
        <Text style={{ fontSize: 14, color: 'gray' }}>Loading</Text>
      </View>
    );
  }
  
  return (
    <TextAnimator sentence={sentence} height={height} page={page} paused={paused} />
  );
});

export default FocusedTextAnimator