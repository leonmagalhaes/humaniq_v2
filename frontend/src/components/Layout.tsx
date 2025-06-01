import React from 'react';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
  transparentHeader?: boolean;
  className?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  transparentHeader = false,
  className = '',
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-primary">
      <Header transparent={transparentHeader} />
      <main className={`flex-grow ${className}`}>
        {children}
      </main>
      <footer className="bg-primary bg-opacity-90 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-white text-opacity-70 text-sm">
                &copy; {new Date().getFullYear()} HUMANIQ. Todos os direitos reservados.
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-white text-opacity-70 hover:text-secondary">
                Termos de Uso
              </a>
              <a href="#" className="text-white text-opacity-70 hover:text-secondary">
                Política de Privacidade
              </a>
              <a href="#" className="text-white text-opacity-70 hover:text-secondary">
                Contato
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
