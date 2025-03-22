import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  token: string | null;
  user: string | null;
  login: (token: string, user: string) => void;
  logout: () => void;
  setLogoutCallback: (callback: () => void) => void;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
  setLogoutCallback: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [user, setUser] = useState<string | null>(localStorage.getItem("user"));
  const [logoutCallback, setLogoutCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }

    if (user) {
      localStorage.setItem("user", user);
    } else {
      localStorage.removeItem("user");
    }
  }, [token, user]);

  const login = (token: string, user: string) => {
    setToken(token);
    setUser(user);
    localStorage.setItem("token", token);
    localStorage.setItem("user", user);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    if (logoutCallback) {
      logoutCallback(); // Redirige al login
    }

  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout, setLogoutCallback }}>
      {children}
    </AuthContext.Provider>
  );
};
