import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '../types/user';
import { authService } from '../services/authService';

interface AuthContextData {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,  setUser]  = useState<User | null>(() => {
    const stored = localStorage.getItem('@reimburse:user');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem('@reimburse:token'),
  );

  async function login(email: string, password: string) {
    const data = await authService.login(email, password);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem('@reimburse:token', data.token);
    localStorage.setItem('@reimburse:user',  JSON.stringify(data.user));
  }

  function logout() {
    setUser(null);
    setToken(null);
    localStorage.removeItem('@reimburse:token');
    localStorage.removeItem('@reimburse:user');
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
