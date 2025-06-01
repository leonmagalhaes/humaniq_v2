import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Plus, 
  Eye,
  Brain,
  Target,
  Award
} from 'lucide-react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Estatisticas {
  total_turmas: number;
  total_alunos: number;
  total_desafios: number;
  alunos_com_teste: number;
  taxa_conclusao_teste: number;
}

interface Turma {
  id: number;
  nome: string;
  codigo: string;
  total_alunos: number;
  total_desafios: number;
}

const DashboardProfessor: React.FC = () => {
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    carregarDashboard();
  }, []);

  const carregarDashboard = async () => {
    try {
      const response = await api.get('/professor/dashboard');
      setEstatisticas(response.data.estatisticas);
      setTurmas(response.data.turmas);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            Bem-vindo, {user?.nome}!
          </h1>
          <p className="text-gray-200">
            Acompanhe o progresso dos seus alunos e gerencie suas turmas.
          </p>
        </motion.div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-200">Total de Turmas</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {estatisticas?.total_turmas || 0}
                  </p>
                </div>
                <Users className="w-12 h-12 text-blue-500" />
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-200">Total de Alunos</p>
                  <p className="text-3xl font-bold text-green-600">
                    {estatisticas?.total_alunos || 0}
                  </p>
                </div>
                <Target className="w-12 h-12 text-green-500" />
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
                  <p className="text-sm text-gray-200">Desafios Criados</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {estatisticas?.total_desafios || 0}
                  </p>
                </div>
                <BookOpen className="w-12 h-12 text-purple-500" />
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
                  <p className="text-sm text-gray-200">Taxa de Teste Concluído</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {estatisticas?.taxa_conclusao_teste?.toFixed(1) || 0}%
                  </p>
                </div>
                <Brain className="w-12 h-12 text-orange-500" />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Ações Rápidas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => navigate('/professor/turmas')}
                className="flex items-center justify-center space-x-2 p-4"
              >
                <Plus className="w-5 h-5" />
                <span>Criar Nova Turma</span>
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => navigate('/professor/turmas')}
                className="flex items-center justify-center space-x-2 p-4"
              >
                <Eye className="w-5 h-5" />
                <span>Gerenciar Turmas</span>
              </Button>
              
              <Button
                variant="secondary"
                className="flex items-center justify-center space-x-2 p-4"
                disabled
              >
                <TrendingUp className="w-5 h-5" />
                <span>Relatórios</span>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Lista de Turmas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">
                Suas Turmas
              </h2>
              <Button
                onClick={() => navigate('/professor/turmas')}
              >
                Ver Todas
              </Button>
            </div>

            {turmas.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  Nenhuma turma criada ainda
                </h3>
                <p className="text-gray-200 mb-4">
                  Crie sua primeira turma para começar a acompanhar seus alunos.
                </p>
                <Button onClick={() => navigate('/professor/turmas')}>
                  Criar Primeira Turma
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {turmas.slice(0, 6).map((turma, index) => (
                  <motion.div
                    key={turma.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="font-medium text-white mb-2">
                      {turma.nome}
                    </h3>
                    <div className="text-sm text-gray-200 space-y-1">
                      <p>Código: <span className="font-mono font-bold">{turma.codigo}</span></p>
                      <p>{turma.total_alunos} alunos</p>
                      <p>{turma.total_desafios} desafios</p>
                    </div>
                    <Button
                      variant="secondary"
                      className="w-full mt-3"
                      onClick={() => navigate(`/professor/turmas`)}
                    >
                      Gerenciar
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
};

export default DashboardProfessor;
