import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import api from '../services/api';

interface Desafio {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  created_at: string;
}

interface Assessment {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

const Assessment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    const fetchAssessment = async () => {
      try {
        const assessmentResponse = await api.get(`/api/assessments/${id}`);
        setAssessment(assessmentResponse.data);
        
        const desafiosResponse = await api.get(`/api/desafios?assessment_id=${id}`);
        setDesafios(desafiosResponse.data);
      } catch (err) {
        setError('Erro ao carregar avaliação');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssessment();
  }, [id]);
  
  const handleDesafioClick = (desafioId: number) => {
    navigate(`/challenge/${desafioId}`);
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="text-center">
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }
  
  if (error || !assessment) {
    return (
      <Layout>
        <div className="text-center">
          <p className="text-red-500">{error || 'Avaliação não encontrada'}</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Voltar para Dashboard
          </Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{assessment.title}</h1>
        <p className="text-gray-700 mb-8">{assessment.description}</p>
        
        <h2 className="text-2xl font-semibold mb-4">Desafios</h2>
        
        {desafios.length === 0 ? (
          <p>Nenhum desafio disponível para esta avaliação.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {desafios.map((desafio) => (
              <Card key={desafio.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <div onClick={() => handleDesafioClick(desafio.id)}>
                  <h3 className="text-xl font-semibold mb-2">{desafio.title}</h3>
                  <p className="text-gray-600 mb-3">{desafio.description}</p>
                  <div className="flex justify-between items-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      desafio.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      desafio.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {desafio.difficulty}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
        
        <Button onClick={() => navigate('/dashboard')} className="mt-8">
          Voltar para Dashboard
        </Button>
      </div>
    </Layout>
  );
};

export default Assessment;
