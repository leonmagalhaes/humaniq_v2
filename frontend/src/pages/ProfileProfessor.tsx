import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ProfileProfessor: React.FC = () => {
  const { user } = useAuth();
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get('/users/profile');
        setEditName(res.data.perfil.nome);
        setEditEmail(res.data.perfil.email);
      } catch {
        // erro silencioso
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const validateForm = () => {
    let valid = true;
    const errors = {
      name: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };

    if (!editName) {
      errors.name = 'O nome é obrigatório';
      valid = false;
    } else if (editName.length < 3) {
      errors.name = 'O nome deve ter pelo menos 3 caracteres';
      valid = false;
    }

    if (!editEmail) {
      errors.email = 'O email é obrigatório';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(editEmail)) {
      errors.email = 'Email inválido';
      valid = false;
    }

    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        errors.currentPassword = 'A senha atual é obrigatória para alterar a senha';
        valid = false;
      }
      if (newPassword.length > 0 && newPassword.length < 6) {
        errors.newPassword = 'A nova senha deve ter pelo menos 6 caracteres';
        valid = false;
      }
      if (newPassword !== confirmPassword) {
        errors.confirmPassword = 'As senhas não coincidem';
        valid = false;
      }
    }

    setFormErrors(errors);
    return valid;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const updateData: any = {
        name: editName,
        email: editEmail
      };
      if (newPassword) {
        updateData.senha_atual = currentPassword;
        updateData.nova_senha = newPassword;
      }
      await api.put('/users/perfil', updateData);
      setUpdateSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setUpdateSuccess(false), 3000);
    } catch (error: any) {
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('senha')) {
          setFormErrors({
            ...formErrors,
            currentPassword: error.response.data.message
          });
        } else if (error.response.data.message.includes('email')) {
          setFormErrors({
            ...formErrors,
            email: error.response.data.message
          });
        }
      }
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
            <p className="text-xl">Carregando perfil...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-xl">
        <Card>
          <h2 className="text-2xl font-bold mb-6">Editar Perfil</h2>
          {updateSuccess && (
            <div className="bg-green-500 bg-opacity-20 text-green-500 p-4 rounded-lg mb-6">
              <p>Perfil atualizado com sucesso!</p>
            </div>
          )}
          <form onSubmit={handleUpdateProfile}>
            <Input
              type="text"
              name="name"
              label="Nome"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              error={formErrors.name}
              required
            />
            <Input
              type="email"
              name="email"
              label="Email"
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              error={formErrors.email}
              required
            />
            <div className="border-t border-white border-opacity-10 my-6 pt-6">
              <h3 className="text-lg font-medium mb-4">Alterar Senha (opcional)</h3>
              <Input
                type="password"
                name="currentPassword"
                label="Senha Atual"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                error={formErrors.currentPassword}
              />
              <Input
                type="password"
                name="newPassword"
                label="Nova Senha"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                error={formErrors.newPassword}
              />
              <Input
                type="password"
                name="confirmPassword"
                label="Confirmar Nova Senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                error={formErrors.confirmPassword}
              />
            </div>
            <div className="flex justify-end mt-6">
              <Button type="submit">
                Salvar Alterações
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </Layout>
  );
};

export default ProfileProfessor;