import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 md:py-24 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
          Desenvolva seu potencial humano
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-gray-light">
          Descubra suas habilidades, supere desafios e transforme sua jornada pessoal e profissional.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={() => navigate('/register')} className="text-lg py-3 px-8">
            Começar agora
          </Button>
          <Button variant="secondary" onClick={() => navigate('/login')} className="text-lg py-3 px-8">
            Já tenho uma conta
          </Button>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="py-16 bg-dark-purple rounded-3xl my-16 px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Como Funciona</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">1</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Teste Inicial</h3>
            <p className="text-gray-light">
              Responda a um questionário para identificarmos suas áreas de desenvolvimento e potenciais.
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">2</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Desafios Semanais</h3>
            <p className="text-gray-light">
              Receba desafios personalizados que estimulam seu crescimento e desenvolvimento.
            </p>
          </Card>
          
          <Card className="text-center">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold">3</span>
            </div>
            <h3 className="text-xl font-bold mb-3">Conquistas</h3>
            <p className="text-gray-light">
              Acompanhe seu progresso, desbloqueie conquistas e celebre sua evolução.
            </p>
          </Card>
        </div>
      </section>

      {/* Frases Motivacionais */}
      <section className="py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-12">Inspiração para sua jornada</h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-gradient-to-br from-primary/20 to-secondary/20">
            <blockquote className="text-xl italic">
              "O maior prazer da vida é fazer o que as pessoas dizem que você não é capaz de fazer."
            </blockquote>
            <p className="mt-4 font-bold">Walter Bagehot</p>
          </Card>
          
          <Card className="bg-gradient-to-br from-primary/20 to-secondary/20">
            <blockquote className="text-xl italic">
              "O sucesso não é final, o fracasso não é fatal: é a coragem de continuar que conta."
            </blockquote>
            <p className="mt-4 font-bold">Winston Churchill</p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 text-center bg-gradient-to-r from-primary/30 to-secondary/30 rounded-3xl my-16 px-6">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Pronto para transformar sua vida?</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto">
          Junte-se a milhares de pessoas que estão descobrindo seu potencial com o HUMANIQ.
        </p>
        <Button onClick={() => navigate('/register')} className="text-lg py-3 px-8">
          Cadastrar-se gratuitamente
        </Button>
      </section>
    </Layout>
  );
};

export default Landing;
