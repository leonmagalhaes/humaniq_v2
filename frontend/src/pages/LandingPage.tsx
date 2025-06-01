import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Card from '../components/Card';

const LandingPage: React.FC = () => {
  return (
    <Layout transparentHeader className="flex flex-col">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary to-secondary opacity-30 z-0"></div>
        <div className="container mx-auto px-4 z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Desenvolva seu potencial humano
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white text-opacity-90">
              Transforme sua vida através de desafios semanais que desenvolvem habilidades essenciais para o sucesso pessoal e profissional.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/cadastro">
                <Button variant="primary" className="text-lg px-8 py-3">
                  Começar agora
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" className="text-lg px-8 py-3">
                  Já tenho uma conta
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Como Funciona</h2>
            <p className="text-xl text-white text-opacity-80 max-w-2xl mx-auto">
              Uma jornada estruturada para desenvolver seu potencial humano em apenas 3 passos
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Passo 1 */}
            <Card className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">1</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Teste Inicial</h3>
              <p className="text-white text-opacity-80">
                Responda a um questionário que identifica suas áreas de desenvolvimento prioritárias e personaliza sua jornada.
              </p>
            </Card>
            
            {/* Passo 2 */}
            <Card className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">2</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Desafios Semanais</h3>
              <p className="text-white text-opacity-80">
                Receba desafios personalizados toda semana que combinam teoria e prática para desenvolver novas habilidades.
              </p>
            </Card>
            
            {/* Passo 3 */}
            <Card className="text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-bold">3</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Conquistas</h3>
              <p className="text-white text-opacity-80">
                Acompanhe seu progresso, desbloqueie conquistas e veja sua evolução em tempo real.
              </p>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Link to="/cadastro">
              <Button variant="primary" className="text-lg px-8 py-3">
                Comece sua jornada
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Frases Motivacionais */}
      <section className="py-20 bg-secondary bg-opacity-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Inspiração para sua jornada</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <blockquote className="text-xl italic mb-4">
                "O maior risco é não correr risco algum. Em um mundo que muda rapidamente, a única estratégia garantida a falhar é não correr riscos."
              </blockquote>
              <p className="text-right text-white text-opacity-80">— Mark Zuckerberg</p>
            </Card>
            
            <Card>
              <blockquote className="text-xl italic mb-4">
                "Não é sobre ter ideias. É sobre fazer as ideias acontecerem."
              </blockquote>
              <p className="text-right text-white text-opacity-80">— Scott Belsky</p>
            </Card>
            
            <Card>
              <blockquote className="text-xl italic mb-4">
                "Seu tempo é limitado, então não o desperdice vivendo a vida de outra pessoa."
              </blockquote>
              <p className="text-right text-white text-opacity-80">— Steve Jobs</p>
            </Card>
            
            <Card>
              <blockquote className="text-xl italic mb-4">
                "O sucesso não é final, o fracasso não é fatal: é a coragem de continuar que conta."
              </blockquote>
              <p className="text-right text-white text-opacity-80">— Winston Churchill</p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Pronto para transformar sua vida?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white text-opacity-90">
            Junte-se a milhares de jovens que estão desenvolvendo seu potencial humano com o HUMANIQ.
          </p>
          <Link to="/cadastro">
            <Button variant="primary" className="text-lg px-10 py-4">
              Cadastrar-se gratuitamente
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default LandingPage;
