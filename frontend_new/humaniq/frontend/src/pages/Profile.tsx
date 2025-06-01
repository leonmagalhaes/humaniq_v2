import React, { useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();
  
  const [username, setUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);
    
    try {
      await api.put('/api/users/profile', { username });
      setMessage('Perfil atualizado com sucesso!');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    
    if (newPassword !== confirmPassword) {
      return setError('As senhas não coincidem');
    }
    
    setLoading(true);
    
    try {
      await api.put('/api/users/password', {
        current_password: currentPassword,
        new_password: newPassword
      });
      
      setMessage('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.response?.data?.msg || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      try {
        await api.delete('/api/users/profile');
        logout();
      } catch (err: any) {
        setError(err.response?.data?.msg || 'Erro ao excluir conta');
      }
    }
  };
  
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Meu Perfil</h1>
        
        {message && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {message}
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Informações Pessoais</h2>
          <form onSubmit={handleUpdateProfile}>
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
              value={user?.email || ''}
              onChange={() => {}}
              required
              disabled
            />
            
            <Button
              type="submit"
              variant="primary"
              className="mt-2"
              disabled={loading}
            >
              {loading ? 'Atualizando...' : 'Atualizar Perfil'}
            </Button>
          </form>
        </Card>
        
        <Card className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Alterar Senha</h2>
          <form onSubmit={handleChangePassword}>
            <Input
              id="currentPassword"
              label="Senha Atual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            
            <Input
              id="newPassword"
              label="Nova Senha"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
            
            <Input
              id="confirmPassword"
              label="Confirmar Nova Senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            
            <Button
              type="submit"
              variant="primary"
              className="mt-2"
              disabled={loading}
            >
              {loading ? 'Alterando...' : 'Alterar Senha'}
            </Button>
          </form>
        </Card>
        
        <Card>
          <h2 className="text-xl font-semibold mb-4">Excluir Conta</h2>
          <p className="text-gray-600 mb-4">
            Esta ação não pode ser desfeita. Todos os seus dados serão permanentemente removidos.
          </p>
          <Button
            variant="secondary"
            onClick={handleDeleteAccount}
          >
            Excluir Minha Conta
          </Button>
        </Card>
      </div>
    </Layout>
  );
};

export default Profile;
