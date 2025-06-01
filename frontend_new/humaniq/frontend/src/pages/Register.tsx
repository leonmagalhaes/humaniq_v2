import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      return setError('As senhas não coincidem');
    }
    
    setLoading(true);
    
    try {
      await register(username, email, password);
      navigate('/login', { state: { message: 'Cadastro realizado com sucesso! Faça login para continuar.' } });
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Falha ao criar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-md mx-auto">
        <Card title="Criar Conta">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <Input
              id="username"
              label="Nome de usuário"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Input
              id="password"
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <Input
              id="confirmPassword"
              label="Confirmar Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            
            <Button
              type="submit"
              variant="primary"
              className="w-full mt-4"
              disabled={loading}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>
          
          <div className="mt-4 text-center">
            <p>
              Já tem uma conta?{' '}
              <Link to="/login" className="text-blue-600 hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default Register;
