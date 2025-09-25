import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
  jwtToken: string;
  setJwtToken: (token: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  jwtToken: "",
  setJwtToken: () => {},
});

export const useAuthContext = () => useContext(AuthContext);

interface HomeProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: HomeProviderProps) => {
    const [jwtToken, setJwtTokenState] = useState<string>(
    () => localStorage.getItem("access_token") || ""
  );
  const setJwtToken = (token: string) => {
    setJwtTokenState(token);
    if (token !== "") {
      localStorage.setItem("access_token", token);
    } else {
      localStorage.removeItem("access_token");
    }
  };

  return (
    <AuthContext.Provider value={{ jwtToken, setJwtToken }}>
      {children}
    </AuthContext.Provider>
  );
};
