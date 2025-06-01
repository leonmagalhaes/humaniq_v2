import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

interface UserStats {
  completedChallenges: number;
  totalChallenges: number;
  streak: number;
  lastActivity: string;
  strengths: string[];
  areasToImprove: string[];
}

interface ChallengeHistory {
  id: number;
  title: string;
  completedAt: string;
  score: number;
}

const Profile: React.FC = () => {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<ChallengeHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Buscar perfil do usuário
        const profileResponse = await api.get('/user/profile');
        setProfile(profileResponse.data);
        setName(profileResponse.data.name);
        setEmail(profileResponse.data.email);
        
        // Buscar estatísticas do usuário
        const statsResponse = await api.get('/user/stats');
        setStats(statsResponse.data);
        
        // Buscar histórico de desafios
        const historyResponse = await api.get('/user/challenge-history');
        setHistory(historyResponse.data);
      } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
        setError('Não foi possível carregar os dados do perfil. Tente novamente mais tarde.');
        
        // Dados de exemplo para desenvolvimento
        setProfile({
          id: user?.id || 1,
          name: user?.name || 'Usuário Exemplo',
          email: user?.email || 'usuario@exemplo.com',
          createdAt: '2025-01-15'
        });
        
        setName(user?.name || 'Usuário Exemplo');
        setEmail(user?.email || 'usuario@exemplo.com');
        
        setStats({
          completedChallenges: 5,
          totalChallenges: 8,
          streak: 3,
          lastActivity: '2025-05-01',
          strengths: ['Comunicação', 'Trabalho em equipe', 'Criatividade'],
          areasToImprove: ['Gestão de tempo', 'Liderança']
        });
        
        setHistory([
          {
            id: 1,
            title: 'Comunicação Assertiva',
            completedAt: '2025-05-01',
            score: 92
          },
          {
            id: 2,
            title: 'Gestão de Tempo',
            completedAt: '2025-04-24',
            score: 85
          },
          {
            id: 3,
            title: 'Inteligência Emocional',
            completedAt: '2025-04-17',
            score: 78
          },
          {
            id: 4,
            title: 'Resolução de Problemas',
            completedAt: '2025-04-10',
            score: 90
          },
          {
            id: 5,
            title: 'Trabalho em Equipe',
            completedAt: '2025-04-03',
            score: 95
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };

  const handleEditProfile = () => {
    setIsEditing(true);
    setFormErrors({});
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!name.trim()) {
      errors.name = 'Nome é obrigatório';
    }
    
    if (!email.trim()) {
      errors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'E-mail inválido';
    }
    
    if (newPassword) {
      if (!currentPassword) {
        errors.currentPassword = 'Senha atual é obrigatória para alterar a senha';
      }
      
      if (newPassword.length < 6) {
        errors.newPassword = 'A nova senha deve ter pelo menos 6 caracteres';
      }
      
      if (newPassword !== confirmPassword) {
        errors.confirmPassword = 'As senhas não coincidem';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');
    
    try {
      // Em um cenário real, enviaríamos os dados para o backend
      // const response = await api.put('/user/profile', {
      //   name,
      //   email,
      //   currentPassword: currentPassword || undefined,
      //   newPassword: newPassword || undefined
      // });
      
      // Atualizar o perfil localmente
      setProfile(prev => prev ? { ...prev, name, email } : null);
      
      setIsEditing(false);
      setSuccessMessage('Perfil atualizado com sucesso!');
      
      // Limpar campos de senha
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      if (error.response && error.response.data && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError('Ocorreu um erro ao atualizar o perfil. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(profile?.name || '');
    setEmail(profile?.email || '');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setFormErrors({});
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500 text-green-100 px-4 py-3 rounded mb-6">
            {successMessage}
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Coluna de perfil */}
          <div className="w-full md:w-1/3">
            <Card>
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-3xl font-bold">
                    {profile?.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h1 className="text-2xl font-bold">{profile?.name}</h1>
                <p className="text-gray-light">{profile?.email}</p>
                <p className="text-sm text-gray-light mt-2">
                  Membro desde {profile?.createdAt ? formatDate(profile.createdAt) : ''}
                </p>
              </div>
              
              {!isEditing ? (
                <Button onClick={handleEditProfile} fullWidth>
                  Editar Perfil
                </Button>
              ) : (
                <form onSubmit={handleSubmit}>
                  <Input
                    label="Nome"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={formErrors.name}
                  />
                  
                  <Input
                    label="E-mail"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={formErrors.email}
                  />
                  
                  <div className="border-t border-gray-dark my-4 pt-4">
                    <h3 className="font-medium mb-3">Alterar Senha (opcional)</h3>
                    
                    <Input
                      label="Senha Atual"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      error={formErrors.currentPassword}
                    />
                    
                    <Input
                      label="Nova Senha"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      error={formErrors.newPassword}
                    />
                    
                    <Input
                      label="Confirmar Nova Senha"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={formErrors.confirmPassword}
                    />
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      type="submit" 
                      fullWidth
                      isLoading={isSubmitting}
                    >
                      Salvar
                    </Button>
                    
                    <Button 
                      type="button"
                      variant="secondary"
                      onClick={handleCancel}
                      fullWidth
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              )}
            </Card>
            
            {/* Estatísticas */}
            {stats && (
              <Card className="mt-6">
                <h2 className="text-xl font-bold mb-4">Estatísticas</h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span>Desafios concluídos</span>
                      <span className="font-bold">{stats.completedChallenges}/{stats.totalChallenges}</span>
                    </div>
                    <div className="w-full bg-gray-dark rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(stats.completedChallenges / stats.totalChallenges) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Sequência atual</span>
                    <span className="font-bold text-primary">{stats.streak} dias</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Última atividade</span>
                    <span>{formatDate(stats.lastActivity)}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
          
          {/* Coluna de conteúdo */}
          <div className="w-full md:w-2/3">
            {/* Pontos fortes e áreas para melhorar */}
            {stats && (
              <Card className="mb-6">
                <h2 className="text-xl font-bold mb-4">Seu Perfil de Habilidades</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-3 text-primary">Pontos Fortes</h3>
                    <ul className="space-y-2">
                      {stats.strengths.map((strength, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-3 text-secondary">Áreas para Desenvolver</h3>
                    <ul className="space-y-2">
                      {stats.areasToImprove.map((area, index) => (
                        <li key={index} className="flex items-center">
                          <span className="w-2 h-2 bg-secondary rounded-full mr-2"></span>
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            )}
            
            {/* Histórico de desafios */}
            <Card>
              <h2 className="text-xl font-bold mb-4">Histórico de Desafios</h2>
              
              {history.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-dark">
                        <th className="text-left py-3 px-4">Desafio</th>
                        <th className="text-left py-3 px-4">Data de Conclusão</th>
                        <th className="text-left py-3 px-4">Pontuação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((challenge) => (
                        <tr key={challenge.id} className="border-b border-gray-dark hover:bg-gray-dark/50">
                          <td className="py-3 px-4">{challenge.title}</td>
                          <td className="py-3 px-4">{formatDate(challenge.completedAt)}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2">
                                <span className="font-bold text-sm">{challenge.score}</span>
                              </div>
                              <div 
                                className={`h-2 rounded-full ${
                                  challenge.score >= 90 ? 'bg-green-500' :
                                  challenge.score >= 70 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${challenge.score}%` }}
                              ></div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-gray-light py-4">
                  Você ainda não completou nenhum desafio.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
