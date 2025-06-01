import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';

interface ChallengeDetail {
  id: number;
  title: string;
  description: string;
  videoUrl: string;
  completed: boolean;
  dueDate: string;
  quiz: {
    id: number;
    question: string;
    options: {
      id: number;
      text: string;
      isCorrect: boolean;
    }[];
  }[];
  practicalChallenge: {
    id: number;
    description: string;
    completed: boolean;
  };
}

const Challenge: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [challenge, setChallenge] = useState<ChallengeDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<{
    correct: number;
    total: number;
    passed: boolean;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [practicalCompleted, setPracticalCompleted] = useState(false);

  useEffect(() => {
    const fetchChallengeData = async () => {
      try {
        const response = await api.get(`/challenges/${id}`);
        setChallenge(response.data);
        
        // Se o desafio já foi completado, marcar o prático como concluído
        if (response.data.completed) {
          setPracticalCompleted(true);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do desafio:', error);
        setError('Não foi possível carregar os dados do desafio. Tente novamente mais tarde.');
        
        // Dados de exemplo para desenvolvimento
        setChallenge({
          id: parseInt(id || '1'),
          title: 'Comunicação Assertiva',
          description: 'Aprenda técnicas de comunicação assertiva para melhorar seus relacionamentos pessoais e profissionais.',
          videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          completed: false,
          dueDate: '2025-05-10',
          quiz: [
            {
              id: 1,
              question: 'Qual é o principal objetivo da comunicação assertiva?',
              options: [
                { id: 1, text: 'Impor sua opinião sobre os outros', isCorrect: false },
                { id: 2, text: 'Evitar conflitos a todo custo', isCorrect: false },
                { id: 3, text: 'Expressar-se de forma clara e respeitosa', isCorrect: true },
                { id: 4, text: 'Falar o mínimo possível', isCorrect: false }
              ]
            },
            {
              id: 2,
              question: 'Qual das seguintes NÃO é uma característica da comunicação assertiva?',
              options: [
                { id: 1, text: 'Manter contato visual', isCorrect: false },
                { id: 2, text: 'Usar linguagem corporal aberta', isCorrect: false },
                { id: 3, text: 'Interromper frequentemente', isCorrect: true },
                { id: 4, text: 'Expressar sentimentos de forma clara', isCorrect: false }
              ]
            },
            {
              id: 3,
              question: 'Qual é a diferença entre ser assertivo e ser agressivo?',
              options: [
                { id: 1, text: 'Não há diferença, são sinônimos', isCorrect: false },
                { id: 2, text: 'Assertividade respeita os direitos dos outros, agressividade não', isCorrect: true },
                { id: 3, text: 'Assertividade é passiva, agressividade é ativa', isCorrect: false },
                { id: 4, text: 'Assertividade é apenas para situações profissionais', isCorrect: false }
              ]
            }
          ],
          practicalChallenge: {
            id: 1,
            description: 'Durante esta semana, pratique a comunicação assertiva em pelo menos três situações diferentes. Anote como foi a experiência e o que você aprendeu.',
            completed: false
          }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallengeData();
  }, [id]);

  const handleQuizAnswer = (questionId: number, optionId: number) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleQuizSubmit = async () => {
    // Verificar se todas as perguntas foram respondidas
    if (challenge && Object.keys(quizAnswers).length !== challenge.quiz.length) {
      setError('Por favor, responda todas as perguntas do quiz.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Em um cenário real, enviaríamos as respostas para o backend
      // const response = await api.post(`/challenges/${id}/quiz`, { answers: quizAnswers });
      // setQuizResult(response.data);
      
      // Para desenvolvimento, calculamos o resultado localmente
      let correctAnswers = 0;
      challenge?.quiz.forEach(question => {
        const selectedOptionId = quizAnswers[question.id];
        const correctOption = question.options.find(option => option.isCorrect);
        
        if (correctOption && selectedOptionId === correctOption.id) {
          correctAnswers++;
        }
      });
      
      const totalQuestions = challenge?.quiz.length || 0;
      const passed = correctAnswers >= Math.ceil(totalQuestions * 0.7); // 70% para passar
      
      setQuizResult({
        correct: correctAnswers,
        total: totalQuestions,
        passed
      });
      
      setQuizSubmitted(true);
    } catch (error) {
      setError('Ocorreu um erro ao enviar suas respostas. Tente novamente.');
      console.error('Erro ao enviar respostas do quiz:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePracticalComplete = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Em um cenário real, enviaríamos a conclusão para o backend
      // await api.post(`/challenges/${id}/practical/complete`);
      
      setPracticalCompleted(true);
    } catch (error) {
      setError('Ocorreu um erro ao marcar o desafio como concluído. Tente novamente.');
      console.error('Erro ao marcar desafio como concluído:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChallengeComplete = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      // Em um cenário real, enviaríamos a conclusão para o backend
      // await api.post(`/challenges/${id}/complete`);
      
      navigate('/dashboard', { state: { message: 'Desafio concluído com sucesso!' } });
    } catch (error) {
      setError('Ocorreu um erro ao marcar o desafio como concluído. Tente novamente.');
      console.error('Erro ao marcar desafio como concluído:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
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

  if (!challenge) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto text-center py-16">
          <h1 className="text-3xl font-bold mb-4">Desafio não encontrado</h1>
          <p className="text-gray-light mb-8">O desafio que você está procurando não existe ou foi removido.</p>
          <Button onClick={() => navigate('/dashboard')}>
            Voltar para o Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{challenge.title}</h1>
          <p className="text-gray-light">Prazo: {formatDate(challenge.dueDate)}</p>
        </div>
        
        {/* Descrição do Desafio */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold mb-4">Sobre este desafio</h2>
          <p className="text-gray-light">{challenge.description}</p>
        </Card>
        
        {/* Vídeo */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold mb-4">Vídeo Explicativo</h2>
          <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
            <iframe
              src={challenge.videoUrl}
              title={challenge.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-64 md:h-96 rounded-lg"
            ></iframe>
          </div>
        </Card>
        
        {/* Quiz */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold mb-4">Quiz</h2>
          
          {quizSubmitted ? (
            <div>
              <div className={`p-4 rounded-lg mb-6 ${
                quizResult?.passed 
                  ? 'bg-green-500/20 border border-green-500' 
                  : 'bg-red-500/20 border border-red-500'
              }`}>
                <h3 className="font-bold mb-2">
                  {quizResult?.passed ? 'Parabéns!' : 'Tente novamente!'}
                </h3>
                <p>
                  Você acertou {quizResult?.correct} de {quizResult?.total} questões.
                </p>
              </div>
              
              {challenge.quiz.map((question) => {
                const selectedOptionId = quizAnswers[question.id];
                const selectedOption = question.options.find(option => option.id === selectedOptionId);
                const correctOption = question.options.find(option => option.isCorrect);
                const isCorrect = selectedOption && correctOption && selectedOption.id === correctOption.id;
                
                return (
                  <div key={question.id} className="mb-6">
                    <h3 className="font-medium mb-2">{question.question}</h3>
                    
                    <div className="space-y-2">
                      {question.options.map((option) => {
                        let bgColor = '';
                        
                        if (option.id === selectedOptionId) {
                          bgColor = isCorrect ? 'bg-green-500/20' : 'bg-red-500/20';
                        } else if (option.isCorrect) {
                          bgColor = 'bg-green-500/20';
                        }
                        
                        return (
                          <div 
                            key={option.id} 
                            className={`p-3 rounded-lg border ${bgColor}`}
                          >
                            {option.text}
                            
                            {option.id === selectedOptionId && !isCorrect && (
                              <span className="ml-2 text-red-400">✗</span>
                            )}
                            
                            {option.isCorrect && (
                              <span className="ml-2 text-green-400">✓</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              {challenge.quiz.map((question) => (
                <div key={question.id} className="mb-6">
                  <h3 className="font-medium mb-3">{question.question}</h3>
                  
                  <div className="space-y-2">
                    {question.options.map((option) => (
                      <button
                        key={option.id}
                        className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                          quizAnswers[question.id] === option.id
                            ? 'border-primary bg-primary/20'
                            : 'border-gray-light hover:border-primary'
                        }`}
                        onClick={() => handleQuizAnswer(question.id, option.id)}
                      >
                        {option.text}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              
              <Button 
                onClick={handleQuizSubmit}
                isLoading={isSubmitting}
                disabled={Object.keys(quizAnswers).length !== challenge.quiz.length}
              >
                Enviar respostas
              </Button>
            </div>
          )}
        </Card>
        
        {/* Desafio Prático */}
        <Card className="mb-8">
          <h2 className="text-xl font-bold mb-4">Desafio Prático</h2>
          <p className="mb-6">{challenge.practicalChallenge.description}</p>
          
          {practicalCompleted ? (
            <div className="bg-green-500/20 border border-green-500 p-4 rounded-lg">
              <p className="font-bold">Desafio prático concluído!</p>
            </div>
          ) : (
            <Button 
              onClick={handlePracticalComplete}
              isLoading={isSubmitting}
              disabled={!quizSubmitted || (quizResult && !quizResult.passed)}
            >
              Marcar como concluído
            </Button>
          )}
        </Card>
        
        {/* Botão de Conclusão */}
        {quizSubmitted && quizResult?.passed && practicalCompleted && !challenge.completed && (
          <div className="text-center">
            <Button 
              onClick={handleChallengeComplete}
              isLoading={isSubmitting}
              className="text-lg py-3 px-8"
            >
              Concluir Desafio
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Challenge;
