import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, Users, Target, BookOpen, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Challenge {
  desafio_id: number;
  titulo: string;
  descricao: string;
  concluido: boolean;
  prazo: string;
}

interface Progress {
  desafios_concluidos: number;
  totalDesafios: number;
  sequencia: number;
  nivel: number;
  xp: number;
  proximo_nivel_xp: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [weeklyChallenge, setWeeklyChallenge] = useState<Challenge | null>(null);
  const [recentChallenges, setRecentChallenges] = useState<Challenge[]>([]);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Buscar desafio da semana
        try {
          const challengeResponse = await api.get('/desafios/destaque');
          setWeeklyChallenge(challengeResponse.data.desafio);
        } catch (err) {
          console.log('Nenhum desafio em destaque');
        }
        
        // Buscar desafios recentes
        try {
          const recentResponse = await api.get('/desafios');
          setRecentChallenges(
            (recentResponse.data.desafios || []).map((d: any) => ({
              ...d,
              concluido: d.progresso?.status === 'concluído'
            }))
          );
        } catch (err) {
          console.log('Erro ao buscar desafios');
        }
        
        // Buscar progresso do usuário
        try {
          const progressResponse = await api.get('/users/me');
          setProgress({
            desafios_concluidos: progressResponse.data.usuario.desafios_concluidos || 0,
            totalDesafios: recentChallenges.length || 0,
            sequencia: progressResponse.data.usuario.sequencia || 0,
            nivel: progressResponse.data.usuario.nivel || 1,
            xp: progressResponse.data.usuario.xp || 0,
            proximo_nivel_xp: progressResponse.data.usuario.proximo_nivel_xp || 20
          });
        } catch (err) {
          console.log('Erro ao buscar progresso');
        }
        
      } catch (error) {
        console.error('Erro ao buscar dados do dashboard:', error);
        setError('Erro ao carregar dados do dashboard');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Carregando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
          <Button onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Mensagem de sucesso */}
        {location.state?.message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
          >
            {location.state.message}
          </motion.div>
        )}

        {/* Header do Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Olá, {user?.nome}! 👋
          </h1>
          <p className="text-gray-200">
            Continue desenvolvendo suas habilidades socioemocionais.
          </p>
        </motion.div>

        {/* Aviso sobre teste Likert */}
        {!user?.teste_inicial_concluido && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-center space-x-4">
                <Brain className="w-12 h-12 text-blue-500" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    Complete seu Teste Inicial
                  </h3>
                  <p className="text-blue-700 mb-4">
                    Faça nosso teste de habilidades socioemocionais para receber desafios personalizados 
                    e acompanhar melhor seu desenvolvimento.
                  </p>
                  <Button
                    onClick={() => navigate('/teste-likert')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Fazer Teste Agora
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Cards de Progresso */}
        {progress && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Nível Atual</p>
                    <p className="text-3xl font-bold text-blue-600">{progress.nivel}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">XP Total</p>
                    <p className="text-3xl font-bold text-green-600">{progress.xp}</p>
                    <p className="text-xs text-gray-500">Próximo: {progress.proximo_nivel_xp} XP</p>
                  </div>
                  <Target className="w-8 h-8 text-green-500" />
                </div>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Desafios Concluídos</p>
                    <p className="text-3xl font-bold text-purple-600">{progress.desafios_concluidos}</p>
                    <p className="text-xs text-gray-500">de {progress.totalDesafios} disponíveis</p>
                  </div>
                  <BookOpen className="w-8 h-8 text-purple-500" />
                </div>
              </Card>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Sequência</p>
                    <p className="text-3xl font-bold text-orange-600">{progress.sequencia}</p>
                    <p className="text-xs text-gray-500">dias consecutivos</p>
                  </div>
                  <div className="text-orange-500 text-2xl">🔥</div>
                </div>
              </Card>
            </motion.div>
          </div>
        )}

        {/* Ações Rápidas para Alunos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {!user?.teste_inicial_concluido && (
                <Button
                  onClick={() => navigate('/teste-likert')}
                  className="flex items-center justify-center space-x-2 p-4"
                >
                  <Brain className="w-5 h-5" />
                  <span>Fazer Teste Inicial</span>
                </Button>
              )}
              
              {user?.turma_id ? (
                <Button
                  variant="secondary"
                  onClick={() => navigate('/minha-turma')}
                  className="flex items-center justify-center space-x-2 p-4"
                >
                  <Users className="w-5 h-5" />
                  <span>Ver Minha Turma</span>
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={() => navigate('/entrar-turma')}
                  className="flex items-center justify-center space-x-2 p-4"
                >
                  <Users className="w-5 h-5" />
                  <span>Entrar em Turma</span>
                </Button>
              )}
              
              <Button
                variant="secondary"
                onClick={() => navigate('/perfil')}
                className="flex items-center justify-center space-x-2 p-4"
              >
                <Target className="w-5 h-5" />
                <span>Ver Perfil</span>
              </Button>
            </div>
          </Card>
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Desafio da Semana */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Desafio em Destaque
              </h2>
              {weeklyChallenge ? (
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">{weeklyChallenge.titulo}</h3>
                  <p className="text-gray-100 mb-4">{weeklyChallenge.descricao}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-100">
                      Prazo: {new Date(weeklyChallenge.prazo).toLocaleDateString('pt-BR')}
                    </span>
                    <Button onClick={() => navigate(`/desafio/${weeklyChallenge.desafio_id}`)}>
                      {weeklyChallenge.concluido ? 'Ver resultado' : 'Iniciar desafio'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum desafio em destaque no momento.</p>
                </div>
              )}
            </Card>
          </motion.div>
          
          {/* Desafios Recentes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Desafios Disponíveis</h2>
              {recentChallenges.length > 0 ? (
                <div className="space-y-4">
                  {recentChallenges.slice(0, 3).map((challenge) => (
                    <div key={challenge.desafio_id} className="border-l-4 border-blue-500 pl-4">
                      <h4 className="font-medium text-white">{challenge.titulo}</h4>
                      <p className="text-sm text-gray-200 mb-2">{challenge.descricao.substring(0, 80)}...</p>
                      <div className="flex justify-between items-center">
                        <span className={`text-xs px-2 py-1 rounded ${
                          challenge.concluido 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {challenge.concluido ? 'Concluído' : 'Pendente'}
                        </span>
                        <Link 
                          to={`/desafio/${challenge.desafio_id}`}
                          className="text-blue-400 hover:text-blue-200 text-sm"
                        >
                          Ver detalhes
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum desafio disponível no momento.</p>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
