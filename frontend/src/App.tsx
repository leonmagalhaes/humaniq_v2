import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Importando páginas existentes
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Assessment from './pages/Assessment';
import Dashboard from './pages/Dashboard';
import Challenge from './pages/Challenge';
import Profile from './pages/Profile';

// Importando novas páginas V2
import TesteInicialLikert from './pages/TesteInicialLikert';
import DashboardProfessor from './pages/DashboardProfessor';
import GerenciarTurmas from './pages/GerenciarTurmas';
import EntrarTurma from './pages/EntrarTurma';
import MinhaTurma from './pages/MinhaTurma';
import ProfileProfessor from './pages/ProfileProfessor';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (user) {
    // Redirecionar baseado no tipo de usuário
    if (user.tipo_usuario === 'professor') {
      return <Navigate to="/professor/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const ProfessorRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.tipo_usuario !== 'professor') return <Navigate to="/dashboard" replace />;
  
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={
            <PublicRoute>
             <Login />
            </PublicRoute>
          } />
          <Route path="/cadastro" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          {/* Rotas de Aluno */}
          <Route path="/avaliacao-inicial" element={
            <ProtectedRoute>
              <Assessment />
            </ProtectedRoute>
          } />
          <Route path="/teste-likert" element={
            <ProtectedRoute>
              <TesteInicialLikert />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/desafio/:id" element={
            <ProtectedRoute>
              <Challenge />
            </ProtectedRoute>
          } />
          <Route path="/perfil" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/entrar-turma" element={
            <ProtectedRoute>
              <EntrarTurma />
            </ProtectedRoute>
          } />
          <Route path="/minha-turma" element={
            <ProtectedRoute>
              <MinhaTurma />
            </ProtectedRoute>
          } />
          
          {/* Rotas de Professor */}
          <Route path="/professor/dashboard" element={
            <ProfessorRoute>
              <DashboardProfessor />
            </ProfessorRoute>
          } />
          <Route path="/professor/turmas" element={
            <ProfessorRoute>
              <GerenciarTurmas />
            </ProfessorRoute>
          } />
          <Route path="/professor/perfil" element={
            <ProfessorRoute>
              <ProfileProfessor />
            </ProfessorRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
