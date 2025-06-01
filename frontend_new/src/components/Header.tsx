import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';

const Header: React.FC = () => {
  const { signed, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  return (
    <header className="bg-bgdark py-4 px-6 flex justify-between items-center">
      <Link to="/" className="flex items-center">
        <div className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-lg mr-2"></div>
        <span className="text-white font-bold text-xl">HUMANIQ</span>
      </Link>
      
      <div className="flex items-center space-x-4">
        {signed ? (
          <>
            <Link to="/dashboard" className="text-white hover:text-primary transition-colors">
              Dashboard
            </Link>
            <Link to="/profile" className="text-white hover:text-primary transition-colors">
              Perfil
            </Link>
            <Button variant="secondary" onClick={handleLogout}>
              Sair
            </Button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-white hover:text-primary transition-colors">
              Entrar
            </Link>
            <Button onClick={() => navigate('/register')}>
              Cadastrar-se
            </Button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
