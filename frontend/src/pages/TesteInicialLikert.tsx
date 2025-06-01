import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, CheckCircle, ArrowRight } from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Pergunta {
  id: number;
  texto: string;
  categoria: string;
  ordem: number;
}

const TesteInicialLikert: React.FC = () => {
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostas, setRespostas] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [paginaAtual, setPaginaAtual] = useState(0);
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const perguntasPorPagina = 2;
  const totalPaginas = Math.ceil(perguntas.length / perguntasPorPagina);

  useEffect(() => {
    carregarPerguntas();
  }, []);

  const carregarPerguntas = async () => {
    try {
      const response = await api.get('/teste-likert/perguntas');
      setPerguntas(response.data.perguntas);
    } catch (error) {
      setErro('Erro ao carregar perguntas do teste.');
    } finally {
      setLoading(false);
    }
  };

  const handleResposta = (perguntaId: number, valor: number) => {
    setRespostas(prev => ({
      ...prev,
      [perguntaId]: valor
    }));
  };

  const proximaPagina = () => {
    if (paginaAtual < totalPaginas - 1) {
      setPaginaAtual(prev => prev + 1);
    }
  };

  const paginaAnterior = () => {
    if (paginaAtual > 0) {
      setPaginaAtual(prev => prev - 1);
    }
  };

  const enviarTeste = async () => {
    if (Object.keys(respostas).length !== perguntas.length) {
      setErro('Por favor, responda todas as perguntas antes de enviar.');
      return;
    }

    setEnviando(true);
    try {
      const response = await api.post('/teste-likert/responder', {
        respostas
      });

      // Atualizar dados do usuário
      if (response.data.usuario) {
        updateUser(response.data.usuario);
      }

      navigate('/dashboard', {
        state: { message: 'Teste inicial concluído com sucesso!' }
      });
    } catch (error: any) {
      setErro(error.response?.data?.message || 'Erro ao enviar teste.');
    } finally {
      setEnviando(false);
    }
  };

  const perguntasAtuais = perguntas.slice(
    paginaAtual * perguntasPorPagina,
    (paginaAtual + 1) * perguntasPorPagina
  );

  const todasRespondidas = perguntasAtuais.every(p => respostas[p.id] !== undefined);
  const testeCompleto = Object.keys(respostas).length === perguntas.length;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <Brain className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
            <p>Carregando teste...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Brain className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-2">
            Teste Inicial de Habilidades Socioemocionais
          </h1>
          <p className="text-gray-200 max-w-2xl mx-auto">
            Este teste nos ajudará a entender melhor seu perfil socioemocional e personalizar 
            sua experiência de aprendizado. Responda com sinceridade.
          </p>
        </motion.div>

        {/* Barra de Progresso */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-200 mb-2">
            <span>Progresso do teste</span>
            <span>{Object.keys(respostas).length} de {perguntas.length} perguntas</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(Object.keys(respostas).length / perguntas.length) * 100}%` }}
            />
          </div>
        </div>

        {erro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
          >
            {erro}
          </motion.div>
        )}

        <Card className="mb-6">
          <div className="p-6">
            <div className="mb-6">
              <span className="text-sm text-gray-400">
                Página {paginaAtual + 1} de {totalPaginas}
              </span>
            </div>

            {perguntasAtuais.map((pergunta, index) => (
              <motion.div
                key={pergunta.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="mb-8 last:mb-0"
              >
                <h3 className="text-lg font-medium text-white mb-4">
                  {pergunta.texto}
                </h3>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Discordo totalmente</span>
                  <div className="flex space-x-4">
                    {[1, 2, 3, 4, 5].map((valor) => (
                      <button
                        key={valor}
                        onClick={() => handleResposta(pergunta.id, valor)}
                        className={`w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                          respostas[pergunta.id] === valor
                            ? 'bg-blue-500 border-blue-500 text-white'
                            : 'border-gray-300 hover:border-blue-400 text-gray-200'
                        }`}
                      >
                        {valor}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">Concordo totalmente</span>
                </div>
              </motion.div>
            ))}
          </div>
        </Card>

        {/* Navegação */}
        <div className="flex justify-between items-center">
          <Button
            variant="secondary"
            onClick={paginaAnterior}
            disabled={paginaAtual === 0}
          >
            Anterior
          </Button>

          <div className="flex space-x-2">
            {Array.from({ length: totalPaginas }, (_, i) => (
              <button
                key={i}
                onClick={() => setPaginaAtual(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === paginaAtual ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {paginaAtual === totalPaginas - 1 ? (
            <Button
              onClick={enviarTeste}
              disabled={!testeCompleto || enviando}
              className="flex items-center space-x-2"
            >
              {enviando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Finalizar Teste</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={proximaPagina}
              disabled={!todasRespondidas}
              className="flex items-center space-x-2"
            >
              <span>Próxima</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TesteInicialLikert;
