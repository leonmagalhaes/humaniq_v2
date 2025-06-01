import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';

interface Quiz {
  id: number;
  text: string;
  options: {
    id: number;
    text: string;
    isCorrect: boolean;
  }[];
}

interface Desafio {
  desafio_id: number;
  titulo: string;
  descricao: string;
  status: string;
  prazo: string;
  quiz: Quiz[];
  desafio_pratico: string;
  video_url: string; // <-- Adicione esta linha
  progresso?: {
    desafioConcluido: boolean;
    pontuacaoQuiz: number;
  };
}

interface Pergunta {
  id: number;
  texto: string;
  opcoes: string[];
  opcaoCorreta: number;
  resposta_correta: string;
}

type PontuacaoQuiz = number | {
  correct: number;
  total: number;
  passed: boolean;
} | null;

const Challenge: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [desafio, setDesafio] = useState<Desafio | null>(null);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [respostasQuiz, setRespostasQuiz] = useState<Record<number, number>>({});
  const [quizSubmetido, setQuizSubmetido] = useState(false);
  const [pontuacaoQuiz, setPontuacaoQuiz] = useState<PontuacaoQuiz>(null);
  const [desafioConcluido, setDesafioConcluido] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [submetendo, setSubmetendo] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  useEffect(() => {
    console.log('desafio_id:', id);
    const buscarDadosDesafio = async () => {
      setCarregando(true);
      try {
        // Buscar dados do desafio
        const respostaDesafio = await api.get(`/desafios/${id}`);
        setDesafio(respostaDesafio.data.desafio);
        setDesafioConcluido(respostaDesafio.data.desafio.concluido);
        
        // Buscar perguntas do quiz
        const respostaPerguntas = await api.get(`/desafios/${id}/perguntas`);
        setPerguntas(respostaPerguntas.data.perguntas);
        
        // Verificar se o quiz já foi respondido
        try {
          const respostaQuiz = await api.get(`/desafios/${id}/resultado-quiz`);
          if (respostaQuiz.data.concluido) {
            setQuizSubmetido(true);
            setPontuacaoQuiz({
              correct: respostaQuiz.data.pontuacao,
              total: perguntas.length,
              passed: respostaQuiz.data.pontuacao >= Math.ceil(perguntas.length * 0.7)
            });
          }
        } catch (error) {
          // Quiz ainda não foi respondido, não é um erro
        }
      } catch (error) {
        console.error('Erro ao carregar dados do desafio:', error);
        setErro('Não foi possível carregar os dados do desafio. Tente novamente mais tarde.');
      } finally {
        setCarregando(false);
      }
    };
    
    if (id) {
      buscarDadosDesafio();
    }
  }, [id]);
  
  const selecionarResposta = (idPergunta: number, indiceOpcao: number) => {
    setRespostasQuiz({
      ...respostasQuiz,
      [idPergunta]: indiceOpcao
    });
  };
  
  const submeterQuiz = async () => {
    if (Object.keys(respostasQuiz).length !== perguntas.length) {
      alert('Por favor, responda todas as perguntas antes de enviar.');
      return;
    }

    setSubmetendo(true);

    // Converte as chaves para string
    const respostasQuizStringKeys = Object.fromEntries(
      Object.entries(respostasQuiz).map(([k, v]) => [String(k), v])
    );

    try {
      const resposta = await api.post(`/desafios/${id}/submeter`, { respostasQuiz: respostasQuizStringKeys });
      setQuizSubmetido(true);
      setPontuacaoQuiz(resposta.data.resultado.pontuacao);
    } catch (error) {
      console.error('Erro ao enviar quiz:', error);
      setErro('Não foi possível enviar suas respostas. Tente novamente.');
    } finally {
      setSubmetendo(false);
    }
  };
  
  const marcarComoConcluido = async () => {
    setSubmetendo(true);
    
    try {
      await api.post(`/desafios/${id}/concluir`);
      setDesafioConcluido(true);
      
      // Redirecionar para o dashboard após um breve delay
      setTimeout(() => {
        navigate('/dashboard');
        window.location.reload(); // força recarregar os dados do dashboard
      }, 2000);
    } catch (error) {
      console.error('Erro ao marcar desafio como concluído:', error);
      setErro('Não foi possível marcar o desafio como concluído. Tente novamente.');
    } finally {
      setSubmetendo(false);
    }
  };
  
  // Update the handleQuizSubmit function
  const handleQuizSubmit = async () => {
    // Verify if all questions are answered
    if (perguntas.length === 0 || Object.keys(respostasQuiz).length !== perguntas.length) {
      setErro('Por favor, responda todas as questões antes de enviar.');
      return;
    }

    setSubmetendo(true);
    setErro('');

    try {
      const resposta = await api.post(`/desafios/${id}/submeter`, {
        respostasQuiz: respostasQuiz // Send raw answers, let backend handle validation
      });

      if (resposta.data.resultado) {
        setPontuacaoQuiz({
          correct: resposta.data.resultado.pontuacao,
          total: perguntas.length,
          passed: resposta.data.resultado.pontuacao >= Math.ceil(perguntas.length * 0.7)
        });
        setQuizSubmetido(true);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Erro ao enviar respostas. Tente novamente.';
      setErro(errorMessage);
      console.error('Erro ao enviar quiz:', error);
    } finally {
      setSubmetendo(false);
    }
  };

  // Update the useEffect hook that fetches quiz results
  useEffect(() => {
    const fetchDesafio = async () => {
      try {
        const [desafioResponse, quizResultResponse] = await Promise.all([
          api.get(`/desafios/${id}`),
          api.get(`/desafios/${id}/resultado-quiz`).catch(() => null) // Don't fail if no results yet
        ]);

        setDesafio(desafioResponse.data.desafio);

        if (quizResultResponse?.data) {
          setQuizSubmetido(true);
          setPontuacaoQuiz({
            correct: quizResultResponse.data.pontuacaoQuiz,
            total: perguntas.length,
            passed: quizResultResponse.data.pontuacaoQuiz >= Math.ceil(perguntas.length * 0.7)
          });
        }
      } catch (err: any) {
        const errorMessage = err.response?.data?.message || 'Erro ao carregar desafio';
        setErro(errorMessage);
        console.error('Erro ao carregar dados:', err);
      } finally {
        setCarregando(false);
      }
    };

    if (id) {
      fetchDesafio();
    }
  }, [id]);
  
  function getYoutubeEmbedUrl(url: string) {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_\-]+)/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}`;
    }
    return url; // fallback
  }
  
  if (carregando) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
            <p className="text-xl">Carregando desafio...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (erro) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-red-500">Erro</h2>
              <p className="mb-6">{erro}</p>
              <Button onClick={() => window.location.reload()}>
                Tentar novamente
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  if (!desafio) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Desafio não encontrado</h2>
              <p className="mb-6">O desafio que você está procurando não existe ou foi removido.</p>
              <Button onClick={() => navigate('/dashboard')}>
                Voltar para o Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho do desafio */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{desafio.titulo}</h1>
            <div className="flex items-center justify-between">
              <p className="text-white text-opacity-70">
                Prazo: {new Date(desafio.prazo).toLocaleDateString('pt-BR')}
              </p>
              <span className={`px-3 py-1 rounded-full text-sm ${
                desafioConcluido 
                  ? 'bg-green-500 bg-opacity-20 text-green-500' 
                  : 'bg-yellow-500 bg-opacity-20 text-yellow-500'
              }`}>
                {desafioConcluido ? 'Concluído' : 'Em andamento'}
              </span>
            </div>
          </div>
  
          {/* Descrição do desafio */}
          <Card className="mb-8">
            <h2 className="text-xl font-bold mb-4">Sobre este desafio</h2>
            <p className="text-white text-opacity-90 mb-6">
              {desafio.descricao}
            </p>
          </Card>
  
          {/* Vídeo do desafio */}
          <Card className="mb-8">
            <h2 className="text-xl font-bold mb-4">Vídeo explicativo</h2>
            <div className="aspect-w-16 aspect-h-9 mb-4">
              <iframe
                src={getYoutubeEmbedUrl(desafio.video_url)}
                title="Vídeo do desafio"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-64 md:h-96 rounded-lg"
              />
            </div>
          </Card>
  
          {/* Quiz */}
          <Card className="mb-8">
            <h2 className="text-xl font-bold mb-6">Quiz de compreensão</h2>
  
            {quizSubmetido ? (
              <div>
                <div className={`p-4 rounded-lg mb-6 bg-white bg-opacity-5`}>
                  <p className="font-medium">
                    {pontuacaoQuiz && typeof pontuacaoQuiz === 'object'
                      ? pontuacaoQuiz.passed
                        ? `Parabéns! Você acertou ${pontuacaoQuiz.correct} de ${perguntas.length} perguntas.`
                        : `Você acertou ${pontuacaoQuiz.correct} de ${perguntas.length} perguntas. Reveja o conteúdo e tente novamente.`
                      : null}
                  </p>
                </div>
  
                {perguntas.map((pergunta, index) => (
                  <div key={pergunta.id} className="mb-6">
                    <p className="font-medium mb-3">
                      {index + 1}. {pergunta.texto}
                    </p>
                    <div className="space-y-2">
                      {pergunta.opcoes.map((opcao, optIndex) => {
                        const acertou = respostasQuiz[pergunta.id] === optIndex && opcao === pergunta.resposta_correta;
                        const errou = respostasQuiz[pergunta.id] === optIndex && opcao !== pergunta.resposta_correta;
                        const correta = opcao === pergunta.resposta_correta;
                        return (
                          <div
                            key={optIndex}
                            className={`p-3 rounded-lg
                              ${acertou ? 'bg-green-500 bg-opacity-20' : ''}
                              ${errou ? 'bg-red-500 bg-opacity-20' : ''}
                              ${correta && !acertou ? 'bg-green-500 bg-opacity-10' : ''}
                              ${!acertou && !errou && !correta ? 'bg-white bg-opacity-5' : ''}
                            `}
                          >
                            {opcao}
                            {correta && !acertou && (
                              <span className="ml-2 text-green-600 font-bold">(Correta)</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                {perguntas.map((pergunta, index) => (
                  <div key={pergunta.id} className="mb-6">
                    <p className="font-medium mb-3">
                      {index + 1}. {pergunta.texto}
                    </p>
  
                    <div className="space-y-2">
                      {pergunta.opcoes.map((opcao, optIndex) => (
                        <button
                          key={optIndex}
                          onClick={() => selecionarResposta(pergunta.id, optIndex)}
                          className={`w-full p-3 text-left rounded-lg transition-all ${
                            respostasQuiz[pergunta.id] === optIndex
                              ? 'bg-secondary bg-opacity-30'
                              : 'bg-white bg-opacity-5 hover:bg-opacity-10'
                          }`}
                        >
                          {opcao}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
  
                <Button
                  onClick={submeterQuiz}
                  disabled={Object.keys(respostasQuiz).length !== perguntas.length || submetendo}
                  fullWidth
                >
                  {submetendo ? 'Enviando...' : 'Enviar respostas'}
                </Button>
              </div>
            )}
          </Card>
  
          {/* Desafio prático */}
          <Card className="mb-8">
            <h2 className="text-xl font-bold mb-4">Desafio prático</h2>
            <p className="text-white text-opacity-90 mb-6">
              {desafio.desafio_pratico}
            </p>
          </Card>
  
          {/* Botão de conclusão */}
          {!desafioConcluido && quizSubmetido && (
            <div className="text-center">
              <Button
                onClick={marcarComoConcluido}
                disabled={submetendo}
                className="px-8 py-3"
              >
                {submetendo ? 'Processando...' : 'Marcar desafio como concluído'}
              </Button>
              <p className="text-sm text-white text-opacity-70 mt-2">
                Ao marcar como concluído, você confirma que realizou o desafio prático.
              </p>
            </div>
          )}
  
          {desafioConcluido && (
            <div className="text-center">
              <div className="bg-green-500 bg-opacity-20 text-green-500 p-4 rounded-lg mb-4">
                <p className="font-medium">
                  Parabéns! Você concluiu este desafio com sucesso.
                </p>
              </div>
              <Button
                onClick={() => {
                  navigate('/dashboard');
                  window.location.reload();
                }}
                variant="outline"
              >
                Voltar para o Dashboard
              </Button>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Challenge;