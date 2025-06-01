import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Challenge {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
}

interface Progress {
  completedChallenges: number;
  totalChallenges: number;
  streak: number;
  lastActivity: string;
}

interface LocationState {
  message?: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [recentChallenges, setRecentChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Verificar se há mensagem de sucesso
    const state = location.state as LocationState;
    if (state && state.message) {
      setSuccessMessage(state.message);
      // Limpar a mensagem do histórico para não aparecer novamente ao atualizar
      window.history.replaceState({}, document.title);
    }
    
    const fetchDashboardData = async () => {
      try {
        // Buscar desafio atual
        const challengeResponse = await api.get('/challenges/current');
        setCurrentChallenge(challengeResponse.data);
        
        // Buscar desafios recentes
        const recentResponse = await api.get('/challenges/recent');
        setRecentChallenges(recentResponse.data);
        
        // Buscar progresso
        const progressResponse = await api.get('/user/progress');
        setProgress(progressResponse.data);
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        setError('Não foi possível carregar os dados. Tente novamente mais tarde.');
        
        // Dados de exemplo para desenvolvimento
        setCurrentChallenge({
          id: 1,
          title: 'Comunicação Assertiva',
          description: 'Aprenda técnicas de comunicação assertiva para melhorar seus relacionamentos pessoais e profissionais.',
          completed: false,
          dueDate: '2025-05-10'
        });
        
        setRecentChallenges([
          {
            id: 2,
            title: 'Gestão de Tempo',
            description: 'Técnicas para organizar melhor seu tempo e aumentar sua produtividade.',
            completed: true,
            dueDate: '2025-04-26'
          },
          {
            id: 3,
            title: 'Inteligência Emocional',
            description: 'Desenvolva sua capacidade de reconhecer e gerenciar emoções.',
            completed: true,
            dueDate: '2025-04-19'
          }
        ]);
        
        setProgress({
          completedChallenges: 2,
          totalChallenges: 3,
          streak: 2,
          lastActivity: '2025-05-01'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [location]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };

  const calculateDaysLeft = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
        
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          {/* Coluna principal */}
          <div className="w-full md:w-2/3">
            <h1 className="text-3xl font-bold mb-2">Olá, {user?.name}!</h1>
            <p className="text-gray-light mb-8">Bem-vindo(a) de volta ao seu dashboard.</p>
            
            {/* Desafio da semana */}
            <h2 className="text-2xl font-bold mb-4">Desafio da Semana</h2>
            {currentChallenge ? (
              <Card className="mb-8 bg-gradient-to-br from-primary/10 to-secondary/10">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{currentChallenge.title}</h3>
                  <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm">
                    {calculateDaysLeft(currentChallenge.dueDate)} dias restantes
                  </span>
                </div>
                <p className="text-gray-light mb-6">{currentChallenge.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-light">
                    Prazo: {formatDate(currentChallenge.dueDate)}
                  </span>
                  <Button onClick={() => navigate(`/challenge/${currentChallenge.id}`)}>
                    {currentChallenge.completed ? 'Ver detalhes' : 'Iniciar desafio'}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card className="mb-8 text-center py-8">
                <p className="text-gray-light mb-4">Você não tem desafios ativos no momento.</p>
                <Button onClick={() => navigate('/initial-test')}>
                  Fazer teste inicial
                </Button>
              </Card>
            )}
            
            {/* Desafios recentes */}
            <h2 className="text-2xl font-bold mb-4">Desafios Recentes</h2>
            {recentChallenges.length > 0 ? (
              <div className="grid gap-4">
                {recentChallenges.map(challenge => (
                  <Card 
                    key={challenge.id} 
                    className="hover:bg-gray-dark/80 cursor-pointer"
                    onClick={() => navigate(`/challenge/${challenge.id}`)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-bold">{challenge.title}</h3>
                        <p className="text-sm text-gray-light">
                          Concluído em: {formatDate(challenge.dueDate)}
                        </p>
                      </div>
                      <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm">
                        Concluído
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-6">
                <p className="text-gray-light">Você ainda não completou nenhum desafio.</p>
              </Card>
            )}
          </div>
          
          {/* Coluna lateral */}
          <div className="w-full md:w-1/3">
            {/* Progresso */}
            <Card className="mb-6">
              <h2 className="text-xl font-bold mb-4">Seu Progresso</h2>
              
              {progress && (
                <>
                  <div className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span>Desafios concluídos</span>
                      <span className="font-bold">{progress.completedChallenges}/{progress.totalChallenges}</span>
                    </div>
                    <div className="w-full bg-gray-dark rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(progress.completedChallenges / progress.totalChallenges) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span>Sequência atual</span>
                    <span className="font-bold text-primary">{progress.streak} dias</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Última atividade</span>
                    <span>{formatDate(progress.lastActivity)}</span>
                  </div>
                </>
              )}
            </Card>
            
            {/* Links rápidos */}
            <Card>
              <h2 className="text-xl font-bold mb-4">Links Rápidos</h2>
              <div className="space-y-2">
                <Button 
                  variant="secondary" 
                  fullWidth 
                  onClick={() => navigate('/profile')}
                >
                  Ver perfil
                </Button>
                <Button 
                  variant="secondary" 
                  fullWidth 
                  onClick={() => navigate('/challenges')}
                >
                  Todos os desafios
                </Button>
                <Button 
                  variant="secondary" 
                  fullWidth 
                  onClick={() => navigate('/achievements')}
                >
                  Conquistas
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
