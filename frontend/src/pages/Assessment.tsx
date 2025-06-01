import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';

interface Question {
  id: number;
  texto: string;  // mudando de 'text' para 'texto' para matching com backend
  categoria: string;
  ordem: number;
}

const Assessment: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const response = await api.get('/assessments/perguntas');
        // Corrigindo o acesso aos dados - a API retorna um objeto com a chave 'perguntas'
        setQuestions(response.data.perguntas);
      } catch (error) {
        console.error('Erro ao carregar perguntas:', error);
        setError('Não foi possível carregar as perguntas da avaliação. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, []);
  
  const handleAnswer = (value: number) => {
    setAnswers({
      ...answers,
      [questions[currentQuestion].id]: value
    });
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const handleSubmit = async () => {
    setSubmitting(true);
    
    try {
      // Modificando o formato dos dados enviados
      await api.post('/assessments/submeter', { 
        respostas: answers 
      });
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Erro ao enviar avaliação:', error.response?.data || error);
      setError('Não foi possível enviar sua avaliação. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
            <p className="text-xl">Carregando avaliação...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-red-500">Erro</h2>
              <p className="mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Tentar novamente
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Avaliação Inicial</h1>
            <p className="text-white text-opacity-80">
              Responda às perguntas abaixo para personalizarmos sua jornada de desenvolvimento.
            </p>
          </div>
          
          <Card className="mb-8">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white text-opacity-70">
                  Pergunta {currentQuestion + 1} de {questions.length}
                </span>
                <span className="text-sm text-white text-opacity-70">
                  {Math.round(((currentQuestion + 1) / questions.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-white bg-opacity-10 rounded-full h-2">
                <div 
                  className="bg-secondary h-2 rounded-full" 
                  style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
            
            {questions.length > 0 && (
              <div>
                <h2 className="text-xl font-medium mb-8">
                  {questions[currentQuestion].texto}
                </h2>
                
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      onClick={() => handleAnswer(value)}
                      className={`w-full p-4 rounded-lg transition-all ${
                        answers[questions[currentQuestion].id] === value
                          ? 'bg-secondary text-white'
                          : 'bg-white bg-opacity-5 hover:bg-opacity-10'
                      }`}
                    >
                      {value === 1 && 'Discordo totalmente'}
                      {value === 2 && 'Discordo parcialmente'}
                      {value === 3 && 'Neutro'}
                      {value === 4 && 'Concordo parcialmente'}
                      {value === 5 && 'Concordo totalmente'}
                    </button>
                  ))}
                </div>
                
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className={currentQuestion === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    Anterior
                  </Button>
                  
                  {currentQuestion === questions.length - 1 && Object.keys(answers).length === questions.length && (
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting}
                    >
                      {submitting ? 'Enviando...' : 'Finalizar'}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </Card>
          
          <div className="text-center text-white text-opacity-70 text-sm">
            <p>
              Suas respostas são confidenciais e serão usadas apenas para personalizar sua experiência.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Assessment;
