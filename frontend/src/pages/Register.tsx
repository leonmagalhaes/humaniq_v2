import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Input from '../components/Input';
import Button from '../components/Button';
import Card from '../components/Card';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const [nome, setNome] = useState(''); // Alterado de "name" para "nome"
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState(''); // Alterado de "password" para "senha"
  const [confirmarSenha, setConfirmarSenha] = useState(''); // Alterado de "confirmPassword" para "confirmarSenha"
  const [tipoUsuario, setTipoUsuario] = useState('aluno'); // Novo campo para V2
  const [formErrors, setFormErrors] = useState({
    nome: '', // Alterado de "name" para "nome"
    email: '',
    senha: '', // Alterado de "password" para "senha"
    confirmarSenha: '' // Alterado de "confirmPassword" para "confirmarSenha"
  });
  
  const { register, user, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Se o usuário já estiver autenticado, redireciona baseado no tipo
    if (user) {
      if (user.tipo_usuario === 'professor') {
        navigate('/professor/dashboard');
      } else {
        navigate('/avaliacao-inicial');
      }
    }
  }, [user, navigate]);
  
  const validateForm = () => {
    let valid = true;
    const errors = {
      nome: '', // Alterado de "name" para "nome"
      email: '',
      senha: '', // Alterado de "password" para "senha"
      confirmarSenha: '' // Alterado de "confirmPassword" para "confirmarSenha"
    };
    
    // Validação de nome
    if (!nome) {
      errors.nome = 'O nome é obrigatório';
      valid = false;
    } else if (nome.length < 3) {
      errors.nome = 'O nome deve ter pelo menos 3 caracteres';
      valid = false;
    }
    
    // Validação de email
    if (!email) {
      errors.email = 'O email é obrigatório';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email inválido';
      valid = false;
    }
    
     // Validação de senha
     if (!senha) {
      errors.senha = 'A senha é obrigatória';
      valid = false;
    } else if (senha.length < 6) {
      errors.senha = 'A senha deve ter pelo menos 6 caracteres';
      valid = false;
    }
    

    // Validação de confirmação de senha
    if (senha !== confirmarSenha) {
      errors.confirmarSenha = 'As senhas não coincidem';
      valid = false;
    }
    
    setFormErrors(errors);
    return valid;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
  
    if (validateForm()) {
      try {
        await register(nome, email, senha, tipoUsuario); // Incluindo tipo de usuário
      } catch (err: any) {
        console.error('Erro ao registrar:', err);
      }
    }
  };
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card className="mb-8">
            <h1 className="text-2xl font-bold mb-6 text-center">Criar uma conta no HUMANIQ</h1>

            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-500 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <Input
                type="text"
                name="nome" // Alterado de "name" para "nome"
                label="Nome completo"
                placeholder="Seu nome completo"
                value={nome} // Alterado de "name" para "nome"
                onChange={(e) => setNome(e.target.value)} // Alterado de "setName" para "setNome"
                error={formErrors.nome} // Alterado de "formErrors.name" para "formErrors.nome"
                required
              />

              <Input
                type="email"
                name="email"
                label="Email"
                placeholder="Seu melhor email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={formErrors.email}
                required
              />

              <Input
                type="password"
                name="senha" // Alterado de "password" para "senha"
                label="Senha"
                placeholder="Crie uma senha forte"
                value={senha} // Alterado de "password" para "senha"
                onChange={(e) => setSenha(e.target.value)} // Alterado de "setPassword" para "setSenha"
                error={formErrors.senha} // Alterado de "formErrors.password" para "formErrors.senha"
                required
              />

              <Input
                type="password"
                name="confirmarSenha" // Alterado de "confirmPassword" para "confirmarSenha"
                label="Confirmar senha"
                placeholder="Confirme sua senha"
                value={confirmarSenha} // Alterado de "confirmPassword" para "confirmarSenha"
                onChange={(e) => setConfirmarSenha(e.target.value)} // Alterado de "setConfirmPassword" para "setConfirmarSenha"
                error={formErrors.confirmarSenha} // Alterado de "formErrors.confirmPassword" para "formErrors.confirmarSenha"
                required
              />

              <div className="mb-4">
                <label className="block text-sm font-medium text-white text-opacity-80 mb-2">
                  Tipo de usuário
                </label>
                <select
                  value={tipoUsuario}
                  onChange={(e) => setTipoUsuario(e.target.value)}
                  className="w-full px-3 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-md text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                >
                  <option value="aluno" className="text-gray-800">Aluno</option>
                  <option value="professor" className="text-gray-800">Professor</option>
                </select>
                <p className="text-xs text-white text-opacity-60 mt-1">
                  {tipoUsuario === 'aluno' 
                    ? 'Como aluno, você poderá participar de turmas e realizar desafios.'
                    : 'Como professor, você poderá criar turmas e acompanhar o progresso dos alunos.'
                  }
                </p>
              </div>

              <div className="mb-6">
                <p className="text-sm text-white text-opacity-70">
                  Ao se cadastrar, você concorda com nossos{' '}
                  <a href="#" className="text-secondary hover:underline">
                    Termos de Uso
                  </a>{' '}
                  e{' '}
                  <a href="#" className="text-secondary hover:underline">
                    Política de Privacidade
                  </a>
                  .
                </p>
              </div>

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? 'Cadastrando...' : 'Criar conta'}
              </Button>
            </form>
          </Card>

          <div className="text-center">
            <p className="text-white text-opacity-80">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-secondary hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Register;
