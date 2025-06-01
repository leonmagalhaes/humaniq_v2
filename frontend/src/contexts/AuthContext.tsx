import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface User {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: string;
  turma_id?: number;
  nivel: number;
  xp: number;
  teste_inicial_concluido: boolean;
  desafios_concluidos: number;
}

interface AuthContextData {
  user: User | null;
  loading: boolean;
  signed: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nome: string, email: string, senha: string, tipoUsuario?: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
  updateUser: (userData: User) => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadAttempted, setLoadAttempted] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      // Verificar se já tentou carregar o usuário
      if (loadAttempted) return;
      
      const token = localStorage.getItem('access_token');
      if (!token) {
        setLoading(false);
        setLoadAttempted(true);
        return;
      }
      
      setLoading(true);
      try {
        const response = await api.get('/users/me');
        setUser(response.data.usuario);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        // Limpar tokens se a autenticação falhar
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
        setLoadAttempted(true);
      }
    };
    
    loadUser();
  }, [loadAttempted]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log('Login attempt with:', { email, senha: password }); // Debug log
      
      const response = await api.post('/auth/login', {
        email,
        senha: password
      });
      
      console.log('Login response:', response.data); // Debug log
      
      const { access_token, refresh_token, usuario } = response.data;
      
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      setUser(usuario);
      setError(null);
    } catch (error: any) {
      console.error('Detailed login error:', error.response?.data || error); // Detailed error log
      setError(error.response?.data?.message || 'Erro ao fazer login');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (nome: string, email: string, senha: string, tipoUsuario: string = 'aluno') => {
    try {
      setLoading(true);
      const response = await api.post('/auth/register', {
        nome,
        email,
        senha,
        tipo_usuario: tipoUsuario
      });
  
      const { access_token, refresh_token, usuario } = response.data;
  
      // Armazena os tokens no localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
  
      setUser(usuario);
      setError(null);
    } catch (error: any) {
      console.error('Erro ao registrar:', error);
      if (error.response?.status === 400) {
        setError('Preencha todos os campos obrigatórios.');
      } else if (error.response?.status === 409) {
        setError('Email já cadastrado. Utilize outro email.');
      } else {
        setError('Erro ao criar conta. Tente novamente mais tarde.');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        signed: !!user,
        loading,
        login,
        register,
        logout,
        error,
        clearError,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
