import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  transparent?: boolean;
}

const Header: React.FC<HeaderProps> = ({ transparent = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <header className={`w-full py-4 ${transparent ? 'absolute top-0 left-0 z-10' : 'bg-primary'}`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-white">
          HUMANIQ
        </Link>
        
        {/* Menu para desktop */}
        <div className="hidden md:flex items-center space-x-6">
          {user ? (
            <>
              {user.tipo_usuario === 'professor' ? (
                <>
                  <Link to="/professor/dashboard" className="text-white hover:text-secondary transition-colors">
                    Dashboard
                  </Link>
                  <Link to="/professor/turmas" className="text-white hover:text-secondary transition-colors">
                    Turmas
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/dashboard" className="text-white hover:text-secondary transition-colors">
                    Dashboard
                  </Link>
                  {user.turma_id ? (
                    <Link to="/minha-turma" className="text-white hover:text-secondary transition-colors">
                      Minha Turma
                    </Link>
                  ) : (
                    <Link to="/entrar-turma" className="text-white hover:text-secondary transition-colors">
                      Entrar em Turma
                    </Link>
                  )}
                </>
              )}
              <Link
                to={user.tipo_usuario === 'professor' ? '/professor/perfil' : '/perfil'}
                className="text-white hover:text-secondary transition-colors"
              >
                Perfil
              </Link>
              <button 
                onClick={handleLogout}
                className="text-white hover:text-secondary transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:text-secondary transition-colors">
                Entrar
              </Link>
              <Link to="/cadastro" className="bg-secondary text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition-colors">
                Cadastrar-se
              </Link>
            </>
          )}
        </div>
        
        {/* Menu hamburguer para mobile */}
        <div className="md:hidden">
          <button 
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-white focus:outline-none"
          >
            {menuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>
      
      {/* Menu mobile */}
      {menuOpen && (
        <div className="md:hidden bg-primary py-4 px-4">
          <div className="flex flex-col space-y-4">
            {user ? (
              <>
                {user.tipo_usuario === 'professor' ? (
                  <>
                    <Link 
                      to="/professor/dashboard" 
                      className="text-white hover:text-secondary transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/professor/turmas" 
                      className="text-white hover:text-secondary transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Turmas
                    </Link>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="text-white hover:text-secondary transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    {user.turma_id ? (
                      <Link 
                        to="/minha-turma" 
                        className="text-white hover:text-secondary transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        Minha Turma
                      </Link>
                    ) : (
                      <Link 
                        to="/entrar-turma" 
                        className="text-white hover:text-secondary transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        Entrar em Turma
                      </Link>
                    )}
                  </>
                )}
                <Link 
                  to="/perfil" 
                  className="text-white hover:text-secondary transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Perfil
                </Link>
                <button 
                  onClick={() => {
                    handleLogout();
                    setMenuOpen(false);
                  }}
                  className="text-white hover:text-secondary transition-colors text-left"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-white hover:text-secondary transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  Entrar
                </Link>
                <Link 
                  to="/cadastro" 
                  className="bg-secondary text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition-colors inline-block w-fit"
                  onClick={() => setMenuOpen(false)}
                >
                  Cadastrar-se
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
