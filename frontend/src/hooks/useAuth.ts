import { createContext, useContext } from "react";

type AuthContextType = {
  erAutentisert: boolean;
  bruker: {
    navn: string;
    enhet: string;
  };
  loggInn: () => void;
  loggUt: () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth må bli brukt innenfor AuthProvider");
  }
  return context;
};
