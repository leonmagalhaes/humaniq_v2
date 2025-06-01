import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Users,
  BookOpen,
  Eye,
  Copy,
  Check,
  Brain,
  Target,
  Sparkles,
} from "lucide-react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import Textarea from "../components/Textarea";
import api from "../services/api";
import Modal from "../components/Modal";

interface Turma {
  id: number;
  nome: string;
  codigo: string;
  descricao: string;
  total_alunos: number;
  total_desafios: number;
  data_criacao: string;
}

interface Aluno {
  id: number;
  nome: string;
  email: string;
  nivel: number;
  xp: number;
  teste_inicial_concluido: boolean;
  desafios_concluidos: number;
}

const GerenciarTurmas: React.FC = () => {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [turmaDetalhes, setTurmaDetalhes] = useState<{
    turma: Turma;
    alunos: Aluno[];
  } | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [gerandoDesafio, setGerandoDesafio] = useState(false);
  const [showDesafioModal, setShowDesafioModal] = useState(false);

  // Formulário nova turma
  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [criandoTurma, setCriandoTurma] = useState(false);

  // Geração de desafio IA
  const [temaDesafio, setTemaDesafio] = useState("");
  const [turmaDesafio, setTurmaDesafio] = useState<number | null>(null);

  // Novo desafio
  const [novoDesafio, setNovoDesafio] = useState({
    titulo: "",
    descricao: "",
    perguntas: [
      { id: 1, texto: "", opcoes: ["", "", "", ""], resposta_correta: "" },
      { id: 2, texto: "", opcoes: ["", "", "", ""], resposta_correta: "" },
      { id: 3, texto: "", opcoes: ["", "", "", ""], resposta_correta: "" },
    ],
    desafio_pratico: "",
    video_url: "",
    turma_id: turmaDetalhes?.turma.id || null,
  });

  // Edição de turma
  const [editandoTurma, setEditandoTurma] = useState<Turma | null>(null);
  const [confirmarExclusao, setConfirmarExclusao] = useState<Turma | null>(
    null
  );

  useEffect(() => {
    carregarTurmas();
  }, []);

  const carregarTurmas = async () => {
    try {
      const response = await api.get("/professor/turmas");
      setTurmas(response.data.turmas);
    } catch (error) {
      console.error("Erro ao carregar turmas:", error);
    } finally {
      setLoading(false);
    }
  };

  const criarTurma = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome.trim()) return;

    setCriandoTurma(true);
    try {
      const response = await api.post("/professor/turmas", {
        nome: novoNome,
        descricao: novaDescricao,
      });

      setTurmas((prev) => [...prev, response.data.turma]);
      setNovoNome("");
      setNovaDescricao("");
      setMostrarFormulario(false);
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao criar turma");
    } finally {
      setCriandoTurma(false);
    }
  };

  const verDetalhes = async (turmaId: number) => {
    try {
      const response = await api.get(`/professor/turmas/${turmaId}/alunos`);
      setTurmaDetalhes(response.data);
    } catch (error) {
      console.error("Erro ao carregar detalhes da turma:", error);
    }
  };

  const copiarCodigo = (codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiado(codigo);
    setTimeout(() => setCopiado(null), 2000);
  };

  const gerarDesafioIA = async () => {
    if (!temaDesafio.trim() || !turmaDesafio) return;

    setGerandoDesafio(true);
    try {
      const response = await api.post("/professor/gerar-desafio", {
        turma_id: turmaDesafio,
        tema: temaDesafio,
      });

      alert("Desafio gerado com sucesso!");
      setTemaDesafio("");
      setTurmaDesafio(null);
      carregarTurmas(); // Recarregar para atualizar contadores
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao gerar desafio");
    } finally {
      setGerandoDesafio(false);
    }
  };

  const criarDesafio = async () => {
    try {
      await api.post("/professor/desafios", novoDesafio);
      alert("Desafio criado!");
      setShowDesafioModal(false);
      // Atualize a lista de desafios aqui
    } catch (e) {
      alert("Erro ao criar desafio");
    }
  };

  // Função para editar turma
  const salvarEdicaoTurma = async () => {
    if (!editandoTurma) return;
    try {
      const response = await api.put(`/professor/turmas/${editandoTurma.id}`, {
        nome: editandoTurma.nome,
        descricao: editandoTurma.descricao,
      });
      setTurmas(
        turmas.map((t) => (t.id === editandoTurma.id ? response.data.turma : t))
      );
      setEditandoTurma(null);
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao editar turma");
    }
  };

  // Função para excluir turma
  const excluirTurma = async () => {
    if (!confirmarExclusao) return;
    try {
      await api.delete(`/professor/turmas/${confirmarExclusao.id}`);
      setTurmas(turmas.filter((t) => t.id !== confirmarExclusao.id));
      setConfirmarExclusao(null);
    } catch (error: any) {
      alert(error.response?.data?.message || "Erro ao excluir turma");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p>Carregando turmas...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Gerenciar Turmas
            </h1>
            <p className="text-gray-200">
              Crie e gerencie suas turmas, acompanhe o progresso dos alunos.
            </p>
          </div>
          <Button
            onClick={() => setMostrarFormulario(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nova Turma</span>
          </Button>
        </motion.div>

        {/* Formulário Nova Turma */}
        {mostrarFormulario && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Criar Nova Turma
              </h2>
              <form onSubmit={criarTurma} className="space-y-4">
                <Input
                  name="novoNome"
                  label="Nome da Turma"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Ex: Desenvolvimento Socioemocional 2024"
                  required
                  className="text-black"
                />
                <Textarea
                  name="novaDescricao"
                  label="Descrição (opcional)"
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  placeholder="Descreva os objetivos da turma..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  rows={3}
                />
                <div className="flex space-x-4">
                  <Button type="submit" disabled={criandoTurma}>
                    {criandoTurma ? "Criando..." : "Criar Turma"}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setMostrarFormulario(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </Card>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Card className="p-6 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center space-x-3 mb-4">
              <BookOpen className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Criar Novo Desafio Manualmente
              </h2>
            </div>
            <p className="text-gray-800 mb-4">
              Preencha manualmente um desafio para uma turma. Você poderá
              definir perguntas, alternativas, resposta correta, desafio prático
              e vídeo.
            </p>
            <Button
              onClick={() => setShowDesafioModal(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Novo Desafio</span>
            </Button>
          </Card>
        </motion.div>

        {/* Lista de Turmas */}
        {turmas.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-white mb-2">
                Nenhuma turma criada ainda
              </h3>
              <p className="text-gray-200 mb-6">
                Crie sua primeira turma para começar a acompanhar seus alunos.
              </p>
              <Button onClick={() => setMostrarFormulario(true)}>
                Criar Primeira Turma
              </Button>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {turmas.map((turma, index) => (
              <motion.div
                key={turma.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card className="p-6 hover:shadow-lg transition-shadow bg-gray-900">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white">
                      {turma.nome}
                    </h3>
                    <Button
                      variant="secondary"
                      onClick={() => verDetalhes(turma.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-200">Código:</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-blue-400">
                          {turma.codigo}
                        </span>
                        <button
                          onClick={() => copiarCodigo(turma.codigo)}
                          className="text-gray-400 hover:text-gray-200"
                        >
                          {copiado === turma.codigo ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-200">Alunos:</span>
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-100">
                          {turma.total_alunos}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-200">Desafios:</span>
                      <div className="flex items-center space-x-1">
                        <BookOpen className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-100">
                          {turma.total_desafios}
                        </span>
                      </div>
                    </div>
                  </div>

                  {turma.descricao && (
                    <p className="text-sm text-gray-200 mb-4 line-clamp-2">
                      {turma.descricao}
                    </p>
                  )}

                  <div className="text-xs text-gray-400">
                    Criada em{" "}
                    {new Date(turma.data_criacao).toLocaleDateString("pt-BR")}
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button
                      variant="secondary"
                      onClick={() => setEditandoTurma(turma)}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setConfirmarExclusao(turma)}
                    >
                      Excluir
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
        {/* Novo Desafio Modal */}
        {showDesafioModal && (
          <Modal onClose={() => setShowDesafioModal(false)}>
            <div className="bg-white p-6 rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Criar Novo Desafio
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  criarDesafio();
                }}
                className="space-y-4"
              >
                <Input
                  name="titulo"
                  label="Título do Desafio"
                  value={novoDesafio.titulo}
                  onChange={(e) =>
                    setNovoDesafio({ ...novoDesafio, titulo: e.target.value })
                  }
                  placeholder="Ex: Desenvolvendo Empatia no Trabalho em Equipe"
                  className="w-full bg-white text-gray-900"
                  labelClassName="text-gray-700"
                />

                <div className="w-full">
                  <Textarea
                    name="descricao"
                    label="Descrição do Desafio"
                    value={novoDesafio.descricao}
                    onChange={(e) =>
                      setNovoDesafio({
                        ...novoDesafio,
                        descricao: e.target.value,
                      })
                    }
                    placeholder="Descreva o objetivo e contexto do desafio. Ex: Neste desafio, os alunos irão desenvolver habilidades de empatia através de exercícios práticos..."
                    className="w-full bg-white text-gray-900"
                    labelClassName="text-gray-700"
                    rows={4}
                  />
                </div>

                {novoDesafio.perguntas.map((p, idx) => (
                  <div key={p.id} className="space-y-3 border-t pt-4">
                    <h3 className="text-gray-900 font-medium">
                      Pergunta {idx + 1}
                    </h3>
                    <Input
                      name={`pergunta_${p.id}`}
                      label="Texto da pergunta"
                      value={p.texto}
                      onChange={(e) => {
                        const perguntas = [...novoDesafio.perguntas];
                        perguntas[idx].texto = e.target.value;
                        setNovoDesafio({ ...novoDesafio, perguntas });
                      }}
                      placeholder="Ex: Qual das seguintes atitudes melhor demonstra empatia em um ambiente de trabalho?"
                      className="bg-white text-gray-900"
                      labelClassName="text-gray-700"
                    />
                    {p.opcoes.map((op, opIdx) => (
                      <Input
                        key={opIdx}
                        name={`pergunta_${p.id}_opcao_${opIdx}`}
                        label={`Opção ${opIdx + 1}`}
                        value={op}
                        onChange={(e) => {
                          const perguntas = [...novoDesafio.perguntas];
                          perguntas[idx].opcoes[opIdx] = e.target.value;
                          setNovoDesafio({ ...novoDesafio, perguntas });
                        }}
                        placeholder={`Ex: ${
                          opIdx === 0
                            ? "Ouvir atentamente quando um colega compartilha suas preocupações"
                            : opIdx === 1
                            ? "Oferecer suporte e compreensão em momentos difíceis"
                            : opIdx === 2
                            ? "Reconhecer e validar os sentimentos dos outros"
                            : "Demonstrar interesse genuíno pelo bem-estar da equipe"
                        }`}
                        className="bg-white text-gray-900"
                        labelClassName="text-gray-700"
                      />
                    ))}
                    <Input
                      name={`pergunta_${p.id}_resposta_correta`}
                      label="Resposta Correta (deve ser idêntica a uma das opções acima)"
                      value={p.resposta_correta}
                      onChange={(e) => {
                        const perguntas = [...novoDesafio.perguntas];
                        perguntas[idx].resposta_correta = e.target.value;
                        setNovoDesafio({ ...novoDesafio, perguntas });
                      }}
                      placeholder="Cole aqui exatamente uma das opções acima que será a resposta correta"
                      className="bg-white text-gray-900"
                      labelClassName="text-gray-700"
                    />
                  </div>
                ))}

                <div className="w-full">
                  <Textarea
                    name="desafio_pratico"
                    label="Desafio Prático"
                    value={novoDesafio.desafio_pratico}
                    onChange={(e) =>
                      setNovoDesafio({
                        ...novoDesafio,
                        desafio_pratico: e.target.value,
                      })
                    }
                    placeholder="Descreva uma atividade prática para os alunos aplicarem o conhecimento. Ex: Durante esta semana, pratique a escuta ativa em pelo menos três situações diferentes..."
                    className="w-full bg-white text-gray-900"
                    labelClassName="text-gray-700"
                    rows={4}
                  />
                </div>

                <Input
                  name="video_url"
                  label="URL do Vídeo"
                  value={novoDesafio.video_url}
                  onChange={(e) =>
                    setNovoDesafio({
                      ...novoDesafio,
                      video_url: e.target.value,
                    })
                  }
                  placeholder="Ex: https://www.youtube.com/watch?v=..."
                  className="bg-white text-gray-900"
                  labelClassName="text-gray-700"
                />

                <div className="flex space-x-2 mt-4">
                  <Button type="submit">Salvar Desafio</Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowDesafioModal(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        )}

        {/* Modal Detalhes da Turma */}
        {turmaDetalhes && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setTurmaDetalhes(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 text-gray-900">
                    {turmaDetalhes.turma.nome}
                  </h2>
                  <Button
                    variant="secondary"
                    onClick={() => setTurmaDetalhes(null)}
                  >
                    Fechar
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <Users className="w-8 h-8 text-blue-500" />
                      <div>
                        <p className="text-sm text-gray-700">Total de Alunos</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {turmaDetalhes.alunos.length}
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <Brain className="w-8 h-8 text-green-500" />
                      <div>
                        <p className="text-sm text-gray-700">Teste Concluído</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {
                            turmaDetalhes.alunos.filter(
                              (a) => a.teste_inicial_concluido
                            ).length
                          }
                        </p>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center space-x-3">
                      <Target className="w-8 h-8 text-purple-500" />
                      <div>
                        <p className="text-sm text-gray-700">
                          Média de Desafios
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {turmaDetalhes.alunos.length > 0
                            ? Math.round(
                                turmaDetalhes.alunos.reduce(
                                  (acc, a) => acc + a.desafios_concluidos,
                                  0
                                ) / turmaDetalhes.alunos.length
                              )
                            : 0}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <h3 className="text-lg font-semibold text-white mb-4">
                  Lista de Alunos
                </h3>

                {turmaDetalhes.alunos.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-200">
                      Nenhum aluno inscrito ainda. Compartilhe o código da
                      turma:
                      <span className="font-mono font-bold text-blue-600 ml-2">
                        {turmaDetalhes.turma.codigo}
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {turmaDetalhes.alunos.map((aluno) => (
                      <div
                        key={aluno.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div>
                          <h4 className="text-sm text-gray-900">
                            {aluno.nome}
                          </h4>
                          <p className="text-sm text-gray-700">{aluno.email}</p>
                        </div>
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="text-center">
                            <p className="text-gray-700">Nível</p>
                            <p className="font-bold text-blue-600">
                              {aluno.nivel}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-700">XP</p>
                            <p className="font-bold text-green-600">
                              {aluno.xp}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-700">Desafios</p>
                            <p className="font-bold text-purple-600">
                              {aluno.desafios_concluidos}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-700">Teste</p>
                            <p
                              className={`font-bold ${
                                aluno.teste_inicial_concluido
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {aluno.teste_inicial_concluido ? "✓" : "✗"}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Modal Edição de Turma */}
        {editandoTurma && (
          <Modal onClose={() => setEditandoTurma(null)}>
            <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Editar Turma
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  salvarEdicaoTurma();
                }}
                className="space-y-4"
              >
                <Input
                  name="nome"
                  label="Nome da Turma"
                  value={editandoTurma.nome}
                  onChange={(e) =>
                    setEditandoTurma({ ...editandoTurma, nome: e.target.value })
                  }
                  className="w-full bg-white text-gray-900"
                  labelClassName="text-gray-700"
                />
                <div className="w-full">
                  <Textarea
                    name="descricao"
                    label="Descrição"
                    value={editandoTurma.descricao}
                    onChange={(e) =>
                      setEditandoTurma({
                        ...editandoTurma,
                        descricao: e.target.value,
                      })
                    }
                    className="w-full bg-white text-gray-900"
                    labelClassName="text-gray-700"
                    rows={4}
                  />
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button type="submit">Salvar</Button>
                  <Button
                    variant="secondary"
                    onClick={() => setEditandoTurma(null)}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </Modal>
        )}

        {/* Modal Confirmação Exclusão */}
        {confirmarExclusao && (
          <Modal onClose={() => setConfirmarExclusao(null)}>
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Confirmar exclusão
              </h2>
              <p className="text-gray-700 mb-6">
                Tem certeza que deseja excluir a turma "
                <span className="font-medium text-gray-900">
                  {confirmarExclusao.nome}
                </span>
                "?
                <br />
                <span className="text-sm text-red-600 mt-2 block">
                  Esta ação não pode ser desfeita.
                </span>
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => setConfirmarExclusao(null)}
                >
                  Cancelar
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    excluirTurma();
                    setConfirmarExclusao(null);
                  }}
                >
                  Excluir
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default GerenciarTurmas;
