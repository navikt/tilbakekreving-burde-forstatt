import { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "./useAuth";
import { appConfig } from "../config/config.ts";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [erAutentisert, setErAutentisert] = useState(false);
  const [bruker, setBruker] = useState({ navn: "", enhet: "" });

  useEffect(() => {
    const sjekkAuth = async () => {
      try {
        const response = await fetch("/api/me", {
          headers: {
            Accept: 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setBruker({ navn: data.name, enhet: data.enhet });
          setErAutentisert(true);
        } else {
          loggInn();
        }
      } catch (error) {
        console.error("Feil med auth-validering:", error);
        setErAutentisert(false);
      }
    };

    sjekkAuth();
  }, []);

  const loggInn = () => {
    window.location.href = appConfig.loginUrl;
  };

  const loggUt = () => setErAutentisert(false);

  return (
    <AuthContext.Provider value={{ erAutentisert, bruker, loggInn, loggUt }}>
      {children}
    </AuthContext.Provider>
  );
};
