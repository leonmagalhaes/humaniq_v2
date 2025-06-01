import React, { ReactNode } from 'react';
import Header from './Header';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-bgdark flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-gray-dark py-6">
        <div className="container mx-auto px-4 text-center text-gray-light">
          <p>&copy; {new Date().getFullYear()} HUMANIQ. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
