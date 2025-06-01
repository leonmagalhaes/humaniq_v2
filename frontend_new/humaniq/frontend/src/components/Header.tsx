import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">HUMANIQ</Link>
        
        <nav>
          <ul className="flex space-x-6">
            {isAuthenticated ? (
              <>
                <li>
                  <Link to="/dashboard" className="hover:text-blue-200">Dashboard</Link>
                </li>
                <li>
                  <Link to="/profile" className="hover:text-blue-200">Perfil</Link>
                </li>
                <li>
                  <button 
                    onClick={handleLogout}
                    className="hover:text-blue-200"
                  >
                    Sair
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="hover:text-blue-200">Entrar</Link>
                </li>
                <li>
                  <Link to="/register" className="hover:text-blue-200">Cadastrar</Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
