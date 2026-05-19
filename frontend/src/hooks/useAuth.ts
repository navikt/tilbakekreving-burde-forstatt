import { createContext, use } from 'react';

type AuthContextType = {
    bruker: {
        navn: string;
    };
    loggInn: () => void;
    loggUt: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
    const context = use(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth må bli brukt innenfor AuthProvider');
    }
    return context;
};
