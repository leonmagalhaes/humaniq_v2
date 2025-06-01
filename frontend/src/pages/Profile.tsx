import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Line } from 'react-chartjs-2';

// Adicione RadarController aos imports do Chart.js
import { RadialLinearScale, Filler } from 'chart.js';
import { Radar } from 'react-chartjs-2';

// Registre os componentes necessários para o gráfico radar
ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

// Registrar componentes do Chart.js
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface UserProfile {
  nome: string;
  email: string;
  created_at: string;
  desafios_concluidos: number;
  nivel: number;
  xp: number;
  proximo_nivel_xp: number;
  sequencia: number;
}

interface ChallengeHistory {
  id: number;
  title: string;
  completedAt: string;
  score: number;
}

interface ProgressData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

// Adicione uma interface para os dados do radar
interface SkillsData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
    borderWidth: number;
  }[];
}

interface Question {
  id: number;
  texto: string;
  categoria: string;
  ordem: number;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [challengeHistory, setChallengeHistory] = useState<ChallengeHistory[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [skillsData, setSkillsData] = useState<SkillsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado para edição de perfil
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [initialTestDone, setInitialTestDone] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Buscar dados do perfil
        const profileResponse = await api.get('/users/profile'); // Ajustado para `/profile`
        setProfile(profileResponse.data.perfil);
        setEditName(profileResponse.data.perfil.nome);
        setEditEmail(profileResponse.data.perfil.email);
        
        // Buscar progresso do usuário
        const progressResponse = await api.get('/users/progresso'); // Ajustado para `/progresso`
        const chartData: ProgressData = {
          labels: progressResponse.data.progresso.resultados.map((r: any) => r.data_conclusao),
          datasets: [
            {
              label: 'XP Acumulado',
              data: progressResponse.data.progresso.resultados.map((r: any) => r.pontuacao),
              borderColor: '#9340FF',
              backgroundColor: 'rgba(147, 64, 255, 0.2)',
            },
          ],
        };
        setProgressData(chartData);
        
        // Primeiro buscar as perguntas
        const perguntasResponse = await api.get('/assessments/perguntas');
        const perguntas = perguntasResponse.data.perguntas;

        // Depois buscar os resultados do teste
        const testResults = await api.get('/assessments/historico');
        if (testResults.data.avaliacoes && testResults.data.avaliacoes.length > 0) {
          const lastAssessment = testResults.data.avaliacoes[0];
          
          // Agrupar respostas por categoria
          const respostasPorCategoria: { [key: string]: number[] } = {};
          Object.entries(lastAssessment.respostas).forEach(([perguntaId, resposta]) => {
            const pergunta = perguntas.find((p: Question) => p.id === parseInt(perguntaId));
            if (pergunta) {
              if (!respostasPorCategoria[pergunta.categoria]) {
                respostasPorCategoria[pergunta.categoria] = [];
              }
              respostasPorCategoria[pergunta.categoria].push(resposta as number);
            }
          });

          // Calcular média por categoria
          const categorias = Object.keys(respostasPorCategoria);
          const medias = categorias.map(categoria => {
            const respostas = respostasPorCategoria[categoria];
            return respostas.reduce((a, b) => a + b, 0) / respostas.length;
          });

          setSkillsData({
            labels: categorias,
            datasets: [{
              label: 'Suas Habilidades',
              data: medias,
              backgroundColor: 'rgba(147, 64, 255, 0.2)',
              borderColor: '#9340FF',
              borderWidth: 2
            }]
          });
        } else {
          setSkillsData(null);
        }

        // Buscar resultado do teste de Likert
        const likertResult = await api.get('/teste-likert/resultado');
        if (likertResult.data && likertResult.data.teste && likertResult.data.teste.pontuacoes) {
          const pontuacoes = likertResult.data.teste.pontuacoes;
          setSkillsData({
            labels: [
              'Comunicação',
              'Empatia',
              'Inteligência Emocional',
              'Trabalho em Equipe',
              'Liderança'
            ],
            datasets: [{
              label: 'Suas Habilidades',
              data: [
                pontuacoes.comunicacao,
                pontuacoes.empatia,
                pontuacoes.inteligencia_emocional,
                pontuacoes.trabalho_equipe,
                pontuacoes.lideranca
              ],
              backgroundColor: 'rgba(147, 64, 255, 0.2)',
              borderColor: '#9340FF',
              borderWidth: 2
            }]
          });
        } else {
          setSkillsData(null);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do perfil:', error);
        setError('Não foi possível carregar os dados do perfil. Tente novamente mais tarde.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchProfileData();
  }, []);
  
  useEffect(() => {
    const checkInitialTest = async () => {
      try {
        const response = await api.get('/users/initial-test-status'); // Endpoint para verificar o status do teste
        setInitialTestDone(response.data.done);
      } catch (error) {
        console.error('Erro ao verificar o status do teste inicial:', error);
      }
    };

    checkInitialTest();
  }, []);
  
  // Novo efeito para buscar o histórico de desafios
  useEffect(() => {
    const fetchChallengeHistory = async () => {
      try {
        const response = await api.get('/users/challenge-history');
        setChallengeHistory(
          response.data.historico.map((item: any) => ({
            id: item.id,
            title: item.titulo,
            completedAt: item.data_conclusao, // <-- agora o campo bate
            score: item.pontuacao
          }))
        ); // ou .challengeHistory, conforme o backend
      } catch (error) {
        console.error('Erro ao carregar histórico de desafios:', error);
      }
    };
    fetchChallengeHistory();
  }, []);
  
  const validateForm = () => {
    let valid = true;
    const errors = {
      name: '',
      email: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
    
    // Validação de nome
    if (!editName) {
      errors.name = 'O nome é obrigatório';
      valid = false;
    } else if (editName.length < 3) {
      errors.name = 'O nome deve ter pelo menos 3 caracteres';
      valid = false;
    }
    
    // Validação de email
    if (!editEmail) {
      errors.email = 'O email é obrigatório';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(editEmail)) {
      errors.email = 'Email inválido';
      valid = false;
    }
    
    // Validação de senha (apenas se estiver tentando alterar a senha)
    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        errors.currentPassword = 'A senha atual é obrigatória para alterar a senha';
        valid = false;
      }
      
      if (newPassword.length > 0 && newPassword.length < 6) {
        errors.newPassword = 'A nova senha deve ter pelo menos 6 caracteres';
        valid = false;
      }
      
      if (newPassword !== confirmPassword) {
        errors.confirmPassword = 'As senhas não coincidem';
        valid = false;
      }
    }
    
    setFormErrors(errors);
    return valid;
  };
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const updateData: any = {
        name: editName,
        email: editEmail
      };
      
      if (newPassword) {
        updateData.senha_atual = currentPassword;
        updateData.nova_senha = newPassword;
      }
      
      await api.put('/users/perfil', updateData);
      
      setUpdateSuccess(true);
      setIsEditing(false);
      
      // Atualizar o perfil exibido
      const profileResponse = await api.get('/users/profile');
      setProfile(profileResponse.data);
      
      // Limpar campos de senha
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Esconder mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      
      if (error.response?.data?.message) {
        if (error.response.data.message.includes('senha')) {
          setFormErrors({
            ...formErrors,
            currentPassword: error.response.data.message
          });
        } else if (error.response.data.message.includes('email')) {
          setFormErrors({
            ...formErrors,
            email: error.response.data.message
          });
        }
      }
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
            <p className="text-xl">Carregando seu perfil...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-2xl mx-auto">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4 text-red-500">Erro</h2>
              <p className="mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Tentar novamente
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna de informações do perfil */}
          <div>
            <Card className="mb-8">
              {updateSuccess && (
                <div className="bg-green-500 bg-opacity-20 text-green-500 p-4 rounded-lg mb-6">
                  <p>Perfil atualizado com sucesso!</p>
                </div>
              )}
              
              {isEditing ? (
                <form onSubmit={handleUpdateProfile}>
                  <h2 className="text-2xl font-bold mb-6">Editar Perfil</h2>
                  
                  <Input
                    type="text"
                    name="name"
                    label="Nome"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    error={formErrors.name}
                    required
                  />
                  
                  <Input
                    type="email"
                    name="email"
                    label="Email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    error={formErrors.email}
                    required
                  />
                  
                  <div className="border-t border-white border-opacity-10 my-6 pt-6">
                    <h3 className="text-lg font-medium mb-4">Alterar Senha (opcional)</h3>
                    
                    <Input
                      type="password"
                      name="currentPassword"
                      label="Senha Atual"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      error={formErrors.currentPassword}
                    />
                    
                    <Input
                      type="password"
                      name="newPassword"
                      label="Nova Senha"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      error={formErrors.newPassword}
                    />
                    
                    <Input
                      type="password"
                      name="confirmPassword"
                      label="Confirmar Nova Senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      error={formErrors.confirmPassword}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Cancelar
                    </Button>
                    
                    <Button type="submit">
                      Salvar Alterações
                    </Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Seu Perfil</h2>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      Editar
                    </Button>
                  </div>
                  
                  {profile && (
                    <div>
                      <div className="mb-6">
                        <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                          {profile.nome.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="text-xl font-medium">{profile.nome}</h3>
                        <p className="text-white text-opacity-70">{profile.email}</p>
                      </div>
                      
                      <div className="border-t border-white border-opacity-10 my-6 pt-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-white text-opacity-70">Membro desde</p>
                            <p className="font-medium">
                              {new Date(profile.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-white text-opacity-70">Nível</p>
                            <p className="font-medium">{profile.nivel}</p>
                          </div>
                          <div>
                            <p className="text-sm text-white text-opacity-70">Desafios concluídos</p>
                            <p className="font-medium">{profile.desafios_concluidos}</p>
                          </div>
                          <div>
                            <p className="text-sm text-white text-opacity-70">Sequência atual</p>
                            <p className="font-medium">
                              {profile.sequencia || 0} dia{profile.sequencia === 1 ? '' : 's'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-white border-opacity-10 my-6 pt-6">
                        <p className="text-sm text-white text-opacity-70 mb-2">Progresso para o próximo nível</p>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-xs">Nível {profile.nivel}</span>
                          <span className="text-xs">
                            {profile.xp}/{profile.proximo_nivel_xp} XP
                          </span>
                        </div>
                        <div className="w-full bg-white bg-opacity-10 rounded-full h-2">
                          <div 
                            className="bg-secondary h-2 rounded-full" 
                            style={{ width: `${(profile.xp / profile.proximo_nivel_xp) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
          
          {/* Coluna de progresso e histórico */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold mb-8">Seu Progresso</h1>
            
            {/* Gráfico de progresso */}
            <Card className="mb-8">
              <h2 className="text-xl font-bold mb-6">Evolução de XP</h2>
              
              {progressData ? (
                <div className="h-64">
                  <Line 
                    data={progressData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          },
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                          }
                        },
                        x: {
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                          },
                          ticks: {
                            color: 'rgba(255, 255, 255, 0.7)'
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          labels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <p className="text-center text-white text-opacity-70">
                  Dados de progresso não disponíveis.
                </p>
              )}
            </Card>
            
            {/* Gráfico de habilidades - remover a condição initialTestDone */}
            <Card className="mb-8">
              <h2 className="text-xl font-bold mb-6">Suas Habilidades</h2>
              
              {skillsData ? (
                <div className="h-[400px]"> {/* Altura fixa aumentada para melhor visualização */}
                  <Radar 
                    data={skillsData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        r: {
                          min: 0,
                          max: 5,
                          beginAtZero: true,
                          angleLines: {
                            color: 'rgba(255, 255, 255, 0.1)',
                          },
                          grid: {
                            color: 'rgba(255, 255, 255, 0.1)',
                          },
                          ticks: {
                            stepSize: 1,
                            color: 'rgba(255, 255, 255, 0.7)',
                            backdropColor: 'transparent'
                          },
                          pointLabels: {
                            color: 'rgba(255, 255, 255, 0.7)',
                            font: {
                              size: 12
                            }
                          }
                        }
                      },
                      plugins: {
                        legend: {
                          labels: {
                            color: 'rgba(255, 255, 255, 0.7)'
                          }
                        }
                      }
                    }}
                  />
                </div>
              ) : (
                <p className="text-center text-white text-opacity-70">
                  Complete o teste inicial para ver o mapa das suas habilidades.
                </p>
              )}
            </Card>
            
            {/* Histórico de desafios */}
            <Card>
              <h2 className="text-xl font-bold mb-6">Histórico de Desafios</h2>
              
              {challengeHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white border-opacity-10">
                        <th className="text-left py-3 px-4">Desafio</th>
                        <th className="text-center py-3 px-4">Data de conclusão</th>
                        <th className="text-center py-3 px-4">Pontuação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {challengeHistory.map((challenge) => (
                        <tr 
                          key={challenge.id}
                          className="border-b border-white border-opacity-5 hover:bg-white hover:bg-opacity-5"
                        >
                          <td className="py-3 px-4">{challenge.title}</td>
                          <td className="py-3 px-4 text-center">
                            {new Date(challenge.completedAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="bg-secondary bg-opacity-20 text-secondary px-2 py-1 rounded-full">
                              {challenge.score}/3
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center text-white text-opacity-70">
                  Você ainda não concluiu nenhum desafio.
                </p>
              )}
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
