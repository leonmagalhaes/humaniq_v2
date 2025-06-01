import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Key, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const EntrarTurma: React.FC = () => {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const entrarTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim()) {
      setErro('Por favor, digite o código da turma.');
      return;
    }

    setLoading(true);
    setErro('');

    try {
      const response = await api.post('/turma/entrar', {
        codigo: codigo.trim().toUpperCase()
      });

      // Atualizar dados do usuário
      if (response.data.usuario) {
        updateUser(response.data.usuario);
      }

      navigate('/minha-turma', {
        state: { message: response.data.message }
      });
    } catch (error: any) {
      setErro(error.response?.data?.message || 'Erro ao entrar na turma.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Users className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Entrar em uma Turma
          </h1>
          <p className="text-gray-200">
            Digite o código fornecido pelo seu professor para se juntar à turma.
          </p>
        </motion.div>

        {/* Status atual */}
        {user?.turma_id && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className="p-4 bg-yellow-50 border-yellow-200">
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Você já está em uma turma
                  </p>
                  <p className="text-sm text-yellow-600">
                    Para entrar em uma nova turma, você precisa sair da atual primeiro.
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <Button
                  variant="secondary"
                  onClick={() => navigate('/minha-turma')}
                >
                  Ver Minha Turma
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-8">
            <form onSubmit={entrarTurma} className="space-y-6">
              <div className="text-center mb-6">
                <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h2 className="text-xl font-semibold text-white">
                  Código da Turma
                </h2>
              </div>

              {erro && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
                >
                  {erro}
                </motion.div>
              )}

              <div>
                <Input
                  name="codigo"
                  label="Código da Turma"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  placeholder="Ex: ABC123"
                  className="text-center text-lg font-mono tracking-wider"
                  maxLength={6}
                  disabled={loading || !!user?.turma_id}
                />
                <p className="text-sm text-gray-200 mt-2 text-center">
                  O código geralmente tem 6 caracteres (letras e números)
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading || !codigo.trim() || !!user?.turma_id}
                className="w-full flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar na Turma</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-white mb-3">
                Como funciona?
              </h3>
              <div className="space-y-3 text-sm text-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <p>Seu professor criará uma turma e fornecerá um código único</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <p>Digite o código acima para se juntar à turma</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <p>Acesse desafios personalizados e acompanhe seu progresso junto com seus colegas</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Botões de navegação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center space-x-4 mt-6"
        >
          <Button
            variant="secondary"
            onClick={() => navigate('/dashboard')}
          >
            Voltar ao Dashboard
          </Button>
          
          {user?.turma_id && (
            <Button
              onClick={() => navigate('/minha-turma')}
            >
              Ver Minha Turma
            </Button>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default EntrarTurma;
