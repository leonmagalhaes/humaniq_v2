import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

interface LocationState {
  message?: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signed } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Verificar se há mensagem de sucesso do cadastro
    const state = location.state as LocationState;
    if (state && state.message) {
      setSuccessMessage(state.message);
    }
    
    // Redirecionar se já estiver logado
    if (signed) {
      navigate('/dashboard');
    }
  }, [location, signed, navigate]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    }
    
    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsLoading(true);
    setApiError('');
    setSuccessMessage('');
    
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        setApiError(error.response.data.message);
      } else {
        setApiError('E-mail ou senha incorretos. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Entrar</h1>
        
        <Card>
          {successMessage && (
            <div className="bg-green-500/20 border border-green-500 text-green-100 px-4 py-3 rounded mb-4">
              {successMessage}
            </div>
          )}
          
          {apiError && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded mb-4">
              {apiError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <Input
              label="E-mail"
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            
            <Input
              label="Senha"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
            
            <div className="mb-6 text-right">
              <Link to="/forgot-password" className="text-primary hover:underline text-sm">
                Esqueceu sua senha?
              </Link>
            </div>
            
            <Button type="submit" fullWidth isLoading={isLoading}>
              Entrar
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p className="text-gray-light">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-primary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
