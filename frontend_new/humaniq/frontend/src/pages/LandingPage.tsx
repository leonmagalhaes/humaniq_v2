import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';

const LandingPage: React.FC = () => {
  return (
    <Layout>
      <div className="text-center max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Bem-vindo ao HUMANIQ</h1>
        <p className="text-xl mb-8">
          A plataforma que revoluciona a forma como avaliamos o potencial humano.
        </p>
        
        <div className="flex justify-center space-x-4">
          <Link to="/register">
            <Button variant="primary">Começar Agora</Button>
          </Link>
          <Link to="/login">
            <Button variant="outline">Entrar</Button>
          </Link>
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Avaliações Personalizadas</h2>
            <p>Crie avaliações adaptadas às necessidades específicas da sua empresa.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Desafios Interativos</h2>
            <p>Avalie candidatos com desafios que simulam situações reais de trabalho.</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-3">Análise de Resultados</h2>
            <p>Obtenha insights valiosos sobre o desempenho dos candidatos.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LandingPage;
