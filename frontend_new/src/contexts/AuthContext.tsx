import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '../services/api';
import jwt_decode from 'jwt-decode';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextData {
  signed: boolean;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface TokenPayload {
  sub: string;
  name: string;
  email: string;
  exp: number;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storedToken = localStorage.getItem('token');
      
      if (storedToken) {
        try {
          const decoded = jwt_decode<TokenPayload>(storedToken);
          
          // Verificar se o token expirou
          const currentTime = Date.now() / 1000;
          if (decoded.exp < currentTime) {
            localStorage.removeItem('token');
            setUser(null);
          } else {
            api.defaults.headers.Authorization = `Bearer ${storedToken}`;
            setUser({
              id: parseInt(decoded.sub),
              name: decoded.name,
              email: decoded.email
            });
          }
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      
      setLoading(false);
    }

    loadStorageData();
  }, []);

  async function signIn(email: string, password: string) {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token } = response.data;
      
      localStorage.setItem('token', token);
      
      const decoded = jwt_decode<TokenPayload>(token);
      
      api.defaults.headers.Authorization = `Bearer ${token}`;
      
      setUser({
        id: parseInt(decoded.sub),
        name: decoded.name,
        email: decoded.email
      });
    } catch (error) {
      throw error;
    }
  }

  async function signUp(name: string, email: string, password: string) {
    try {
      await api.post('/auth/register', { name, email, password });
    } catch (error) {
      throw error;
    }
  }

  function signOut() {
    localStorage.removeItem('token');
    api.defaults.headers.Authorization = undefined;
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
