import { createContext } from 'react';
import { User } from 'firebase/auth';
import { questions } from './functions/fetchDB'

type UserContextType = {
    user: User | null;
};

type QuestionType = {
    currentQuestion: questions;
    setCurrentQuestion: (question:questions) => any;
};

type BuzzCircleContextType = {
    isAnimating: boolean;
    setAnimating: (animating:boolean) => any;
};
  

export const UserContext = createContext<UserContextType>({user: null });
export const BuzzCircleContext = createContext<BuzzCircleContextType>({ isAnimating: false, setAnimating: () => {} });
export const QuestionContext = createContext<QuestionType>({
    currentQuestion: {_id:'',
    question:'',
    question_sanitized:'',
    answer:'',
    answer_sanitized:''},
    setCurrentQuestion: () => {}
})

