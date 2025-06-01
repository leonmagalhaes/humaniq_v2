import { useState, useEffect } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({
    email: '',
    password: ''
  });
  
  const { login, user, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  if (user && !loading) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const validateForm = () => {
    let valid = true;
    const errors = {
      email: '',
      password: ''
    };
    
    // Validação de email
    if (!email) {
      errors.email = 'O email é obrigatório';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email inválido';
      valid = false;
    }
    
    // Validação de senha
    if (!password) {
      errors.password = 'A senha é obrigatória';
      valid = false;
    }
    
    setFormErrors(errors);
    return valid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
  
    if (validateForm()) {
      try {
        await login(email, password); // Certifique-se de que `password` é enviado como `senha`
      } catch (err: any) {
        console.error('Erro ao fazer login:', err);
      }
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="mb-8">
            <h1 className="text-2xl font-bold mb-6 text-center">Entrar no HUMANIQ</h1>
            
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="Seu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={formErrors.email}
                required
              />
              
              <Input
                type="password"
                name="password"
                label="Senha"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={formErrors.password}
                required
              />
              
              <div className="mb-6 text-right">
                <Link to="/esqueci-senha" className="text-secondary hover:underline text-sm">
                  Esqueceu sua senha?
                </Link>
              </div>
              
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Card>
          
          <div className="text-center">
            <p className="text-white text-opacity-80">
              Ainda não tem uma conta?{' '}
              <Link to="/cadastro" className="text-secondary hover:underline">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
