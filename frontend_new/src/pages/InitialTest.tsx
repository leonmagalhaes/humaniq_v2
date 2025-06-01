import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';

interface Question {
  id: number;
  text: string;
}

const InitialTest: React.FC = () => {
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Escala Likert
  const options = [
    { value: 1, label: 'Discordo totalmente' },
    { value: 2, label: 'Discordo' },
    { value: 3, label: 'Neutro' },
    { value: 4, label: 'Concordo' },
    { value: 5, label: 'Concordo totalmente' },
  ];

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await api.get('/initial-test/questions');
        setQuestions(response.data);
      } catch (error) {
        setError('Não foi possível carregar as perguntas. Tente novamente mais tarde.');
        console.error('Erro ao carregar perguntas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  // Caso a API não esteja disponível, usamos perguntas de exemplo
  useEffect(() => {
    if (error) {
      setQuestions([
        { id: 1, text: 'Consigo-me adaptar facilmente a novas situações e ambientes.' },
        { id: 2, text: 'Considero-me uma pessoa resiliente quando enfrento desafios.' },
        { id: 3, text: 'Analiso constantemente o que posso melhorar em mim mesmo.' },
        { id: 4, text: 'Tenho facilidade em me comunicar com diferentes tipos de pessoas.' },
        { id: 5, text: 'Consigo gerenciar bem meu tempo e prioridades.' },
        { id: 6, text: 'Sou bom em resolver problemas complexos.' },
        { id: 7, text: 'Tenho facilidade para trabalhar em equipe.' },
        { id: 8, text: 'Sou criativo quando preciso encontrar soluções.' },
        { id: 9, text: 'Consigo manter o foco mesmo em tarefas monótonas.' },
        { id: 10, text: 'Aceito bem críticas construtivas.' },
        { id: 11, text: 'Tenho facilidade para aprender coisas novas.' },
        { id: 12, text: 'Consigo me manter motivado mesmo em situações difíceis.' },
      ]);
      setIsLoading(false);
      setError('');
    }
  }, [error]);

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    // Verificar se todas as perguntas foram respondidas
    if (Object.keys(answers).length !== questions.length) {
      setError('Por favor, responda todas as perguntas antes de continuar.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await api.post('/initial-test/submit', { answers });
      navigate('/dashboard', { state: { message: 'Teste inicial concluído com sucesso!' } });
    } catch (error) {
      setError('Ocorreu um erro ao enviar suas respostas. Tente novamente.');
      console.error('Erro ao enviar respostas:', error);
    } finally {
      setIsSubmitting(false);
    }
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

  const currentQuestion = questions[currentStep];

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Teste Inicial</h1>
        <p className="text-center text-gray-light mb-8">
          Responda às perguntas abaixo para que possamos personalizar sua experiência.
          Este teste nos ajudará a identificar suas áreas de desenvolvimento.
        </p>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-100 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <Card>
          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="text-primary font-medium">Pergunta {currentStep + 1} de {questions.length}</span>
              <span className="text-gray-light">{Math.round(((currentStep + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-dark rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <h2 className="text-xl font-medium mb-6">{currentQuestion.text}</h2>

          <div className="grid grid-cols-5 gap-2 mb-8">
            {options.map((option) => (
              <button
                key={option.value}
                className={`p-3 rounded-lg border-2 transition-all ${
                  answers[currentQuestion.id] === option.value
                    ? 'border-primary bg-primary/20'
                    : 'border-gray-light hover:border-primary'
                }`}
                onClick={() => handleAnswer(currentQuestion.id, option.value)}
              >
                <div className="text-center">
                  <div className="font-medium mb-1">{option.label}</div>
                  <div className="text-2xl">{option.value}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="flex justify-between">
            <Button 
              variant="secondary" 
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              Anterior
            </Button>

            {currentStep < questions.length - 1 ? (
              <Button 
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
              >
                Próxima
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={Object.keys(answers).length !== questions.length}
              >
                Finalizar
              </Button>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default InitialTest;
