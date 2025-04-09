import type { ReactNode } from "react";

import { useState, useEffect } from "react";

import { AuthContext } from "./useAuth";
import { appConfig } from "../config/config.ts";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [bruker, setBruker] = useState({ navn: "" });

  useEffect(() => {
    const sjekkAuth = async () => {
      try {
        const response = await fetch("/api/me", {
          headers: {
            Accept: "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setBruker({ navn: data.name });
        } else {
          loggInn();
        }
      } catch (error) {
        console.error("Feil med auth-validering:", error);
      }
    };

    sjekkAuth();
  }, []);

  const loggInn = () => {
    window.location.href = appConfig.loginUrl;
  };

  const loggUt = () => {
    // TODO: Legg til backend-endepunkt for å logge ut
  };

  return (
    <AuthContext.Provider value={{ bruker, loggInn, loggUt }}>
      {children}
    </AuthContext.Provider>
  );
};
