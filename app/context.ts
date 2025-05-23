import { createContext } from 'react';
import { User } from 'firebase/auth';
import { questions } from './functions/fetchDB'
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

type UserContextType = {
    userGoogle: User | null;
    userApple: FirebaseAuthTypes.User | null;
};

type QuestionType = {
    currentQuestion: questions;
    setCurrentQuestion: (question:questions) => any;
};

type BuzzCircleContextType = {
    isAnimating: boolean;
    setAnimating: (animating:boolean) => any;
};

type SettingsContextType = {
    enableTimer: boolean;
    setEnableTimer: React.Dispatch<React.SetStateAction<boolean>>;
    allowRebuzz: boolean;
    setAllowRebuzz: React.Dispatch<React.SetStateAction<boolean>>;
};
type PointsContextType = {
    points: number;
    setPoints: React.Dispatch<React.SetStateAction<number>>;
};

type STTContextType = {
    startSTT: boolean;
    setStartSTT: React.Dispatch<React.SetStateAction<boolean>>;
}
  

export const UserContext = createContext<UserContextType>({
    userGoogle: null,
    userApple: null
 });
 
export const BuzzCircleContext = createContext<BuzzCircleContextType>({ isAnimating: false, setAnimating: () => {} });
export const QuestionContext = createContext<QuestionType>({
    currentQuestion: {_id:'',
    question:'',
    question_sanitized:'',
    answer:'',
    answer_sanitized:''},
    setCurrentQuestion: () => {}
})
export const SettingsContext = createContext<SettingsContextType>({
    enableTimer: false,
    setEnableTimer: () => {},
    allowRebuzz:false,
    setAllowRebuzz: () => {}
});
export const PointsContext = createContext<PointsContextType>({
    points:0,
    setPoints: () => {}
});

export const STTContext = createContext<STTContextType>({
    startSTT: false,
    setStartSTT: () => {}
});
