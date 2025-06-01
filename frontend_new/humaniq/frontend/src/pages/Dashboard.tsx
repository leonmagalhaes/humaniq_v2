import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import api from '../services/api';

interface Assessment {
  id: number;
  title: string;
  description: string;
  created_at: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  
  useEffect(() => {
    fetchAssessments();
  }, []);
  
  const fetchAssessments = async () => {
    try {
      const response = await api.get('/api/assessments');
      setAssessments(response.data);
    } catch (err) {
      setError('Erro ao carregar avaliações');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    try {
      const response = await api.post('/api/assessments', {
        title: newTitle,
        description: newDescription
      });
      
      setAssessments([...assessments, response.data]);
      setNewTitle('');
      setNewDescription('');
      setShowCreateForm(false);
    } catch (err) {
      setError('Erro ao criar avaliação');
      console.error(err);
    } finally {
      setCreating(false);
    }
  };
  
  const handleAssessmentClick = (id: number) => {
    navigate(`/assessment/${id}`);
  };
  
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Minhas Avaliações</h1>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancelar' : 'Nova Avaliação'}
          </Button>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {showCreateForm && (
          <Card className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Criar Nova Avaliação</h2>
            <form onSubmit={handleCreateAssessment}>
              <Input
                id="title"
                label="Título"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
                  Descrição <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                />
              </div>
              
              <Button
                type="submit"
                variant="primary"
                disabled={creating}
              >
                {creating ? 'Criando...' : 'Criar Avaliação'}
              </Button>
            </form>
          </Card>
        )}
        
        {loading ? (
          <p>Carregando avaliações...</p>
        ) : assessments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Você ainda não possui avaliações.</p>
            {!showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)}>
                Criar Primeira Avaliação
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assessments.map((assessment) => (
              <Card 
                key={assessment.id} 
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleAssessmentClick(assessment.id)}
              >
                <h2 className="text-xl font-semibold mb-2">{assessment.title}</h2>
                <p className="text-gray-600 mb-3">{assessment.description}</p>
                <p className="text-sm text-gray-500">
                  Criado em: {new Date(assessment.created_at).toLocaleDateString()}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
