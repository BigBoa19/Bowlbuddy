import { createContext } from 'react';
import { User } from 'firebase/auth';

type UserContextType = {
    user: User | null;
};

type BuzzCircleContextType = {
    isAnimating: boolean;
    setAnimating: (animating: boolean) => any;
};
  

export const UserContext = createContext<UserContextType>({user: null });
export const BuzzCircleContext = createContext<BuzzCircleContextType>({ isAnimating: false, setAnimating: () => {} });

