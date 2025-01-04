import { createContext } from 'react';
import { User } from 'firebase/auth';

type UserContextType = {
    user: User | null;
};

const UserContext = createContext<UserContextType>({user: null });

export default UserContext;