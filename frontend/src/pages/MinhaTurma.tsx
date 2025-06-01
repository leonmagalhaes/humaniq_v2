import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Trophy, 
  Target, 
  LogOut,
  Crown,
  Star,
  BookOpen
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Turma {
  id: number;
  nome: string;
  codigo: string;
  descricao: string;
  professor_nome: string;
  total_alunos: number;
  total_desafios: number;
}

interface Colega {
  id: number;
  nome: string;
  nivel: number;
  xp: number;
  desafios_concluidos: number;
}

const MinhaTurma: React.FC = () => {
  const [turma, setTurma] = useState<Turma | null>(null);
  const [colegas, setColegas] = useState<Colega[]>([]);
  const [loading, setLoading] = useState(true);
  const [saindo, setSaindo] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser } = useAuth();

  useEffect(() => {
    if (!user?.turma_id) {
      navigate('/entrar-turma');
      return;
    }
    carregarTurma();
  }, [user?.turma_id, navigate]);

  const carregarTurma = async () => {
    try {
      const response = await api.get('/turma/minha-turma');
      setTurma(response.data.turma);
      setColegas(response.data.colegas);
    } catch (error) {
      console.error('Erro ao carregar turma:', error);
      navigate('/entrar-turma');
    } finally {
      setLoading(false);
    }
  };

  const sairTurma = async () => {
    if (!window.confirm('Tem certeza que deseja sair desta turma?')) return;

    setSaindo(true);
    try {
      const response = await api.post('/turma/sair');
      
      // Atualizar dados do usuário
      if (response.data.usuario) {
        updateUser(response.data.usuario);
      }

      navigate('/dashboard', {
        state: { message: response.data.message }
      });
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao sair da turma.');
    } finally {
      setSaindo(false);
    }
  };

  // Ordenar colegas por XP (ranking)
  const colegasOrdenados = [...colegas].sort((a, b) => b.xp - a.xp);
  const minhaPosicao = colegasOrdenados.findIndex(c => c.id === user?.id) + 1;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Carregando turma...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!turma) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto px-4 py-8 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Você não está em nenhuma turma
          </h1>
          <p className="text-gray-200 mb-6">
            Entre em uma turma para acessar desafios personalizados e interagir com seus colegas.
          </p>
          <Button onClick={() => navigate('/entrar-turma')}>
            Entrar em uma Turma
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
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

        {/* Header da Turma */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {turma.nome}
                </h1>
                <p className="text-gray-100 mb-2">
                  Professor: {turma.professor_nome}
                </p>
                {turma.descricao && (
                  <p className="text-gray-100 mb-4">
                    {turma.descricao}
                  </p>
                )}
                <div className="flex items-center space-x-6 text-sm text-gray-300">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{turma.total_alunos} alunos</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{turma.total_desafios} desafios</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span>Código: </span>
                    <span className="font-mono font-bold text-blue-600">{turma.codigo}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={sairTurma}
                disabled={saindo}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{saindo ? 'Saindo...' : 'Sair da Turma'}</span>
              </Button>
            </div>
          </Card>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Meu Progresso */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Meu Progresso
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-6 h-6 text-blue-500" />
                    <span className="font-medium text-gray-800">Posição no Ranking</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    #{minhaPosicao}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Star className="w-6 h-6 text-green-500" />
                    <span className="font-medium text-gray-800">Nível</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {user?.nivel}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Target className="w-6 h-6 text-purple-500" />
                    <span className="font-medium text-gray-800">XP Total</span>
                  </div>
                  <span className="text-2xl font-bold text-purple-600">
                    {user?.xp}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-6 h-6 text-orange-500" />
                    <span className="font-medium text-gray-800">Desafios Concluídos</span>
                  </div>
                  <span className="text-2xl font-bold text-orange-600">
                    {user?.desafios_concluidos}
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={() => navigate('/dashboard')}
                  className="w-full"
                >
                  Ver Desafios Disponíveis
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Ranking da Turma */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Ranking da Turma
              </h2>

              {colegasOrdenados.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-400">
                    Você é o único aluno nesta turma no momento.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {colegasOrdenados.map((colega, index) => {
                    const isMe = colega.id === user?.id;
                    return (
                      <motion.div
                        key={colega.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className={`flex items-center justify-between p-4 rounded-lg border-2 transition-all ${
                          isMe 
                            ? 'bg-blue-50 border-blue-200' 
                            : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-500 text-white' :
                            'bg-gray-200 text-gray-600'
                          }`}>
                            {index === 0 ? <Crown className="w-4 h-4" /> : index + 1}
                          </div>
                          <div>
                            <h3 className={`font-medium ${isMe ? 'text-blue-800' : 'text-gray-900'}`}>
                              {colega.nome} {isMe && '(Você)'}
                            </h3>
                            <p className="text-sm text-gray-700">
                              {colega.desafios_concluidos} desafios concluídos
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="text-center">
                            <p className="text-gray-700">Nível</p>
                            <p className="font-bold text-blue-600">{colega.nivel}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-700">XP</p>
                            <p className="font-bold text-green-600">{colega.xp}</p>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default MinhaTurma;
