import { useState, useEffect, ReactNode } from "react";
import { AuthContext } from "./useAuth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [erAutentisert, setErAutentisert] = useState(false);
  const [bruker, setBruker] = useState({ navn: "", enhet: "" });
  const baseUrl = "https://burde-forstatt.intern.dev.nav.no";

  useEffect(() => {
    const sjekkAuth = async () => {
      try {
        const response = await fetch("/api/me");
        console.log("Response", response);

        if (response.ok) {
          const data = await response.json();
          setBruker({ navn: data.navn, enhet: data.enhet });
          setErAutentisert(true);
        }
      } catch (error) {
        console.error("Feil med auth-validering:", error);
        setErAutentisert(false);
      }
    };

    sjekkAuth();
  }, []);
  console.log("Href", window.location.href);

  const loggInn = () => {
    window.location.href = `${baseUrl}/api/oauth2/login`;
  };

  const loggUt = () => setErAutentisert(false);

  return (
    <AuthContext.Provider value={{ erAutentisert, bruker, loggInn, loggUt }}>
      {children}
    </AuthContext.Provider>
  );
};
