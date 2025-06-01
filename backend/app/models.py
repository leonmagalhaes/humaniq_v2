from datetime import datetime, timedelta, timezone
from app import db
from werkzeug.security import generate_password_hash, check_password_hash

class Usuario(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha_hash = db.Column(db.String(256), nullable=False)
    data_cadastro = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    teste_inicial_concluido = db.Column(db.Boolean, default=False)
    nivel = db.Column(db.Integer, default=1)
    xp = db.Column(db.Integer, default=0)
    
    # Novos campos para V2
    tipo_usuario = db.Column(db.String(20), default='aluno')  # 'aluno' ou 'professor'
    turma_id = db.Column(db.Integer, db.ForeignKey('turmas.id'), nullable=True)
    
    # Relacionamentos
    avaliacoes = db.relationship('Avaliacao', backref='usuario', lazy=True)
    resultados = db.relationship('Resultado', backref='usuario', lazy=True)
    
    # Relacionamentos para professor
    turmas_criadas = db.relationship('Turma', foreign_keys='Turma.professor_id', backref='professor', lazy=True)
    desafios_criados = db.relationship('Desafio', foreign_keys='Desafio.criado_por', backref='criador', lazy=True)
    
    def __init__(self, nome, email, senha, teste_inicial_concluido=False):
        self.nome = nome
        self.email = email
        self.senha_hash = generate_password_hash(senha)
        self.teste_inicial_concluido = teste_inicial_concluido
    
    def verificar_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)
    
    def calcular_proximo_nivel_xp(self):
        """Calcula XP necessário para o próximo nível"""
        return self.nivel * 20  
    
    def calcular_desafios_concluidos(self):
        """Calcula número de desafios concluídos"""
        return Resultado.query.filter_by(
            usuario_id=self.id, 
            status='concluído'
        ).count()
    
    def to_dict(self):
        """Converte o usuário em um dicionário"""
        data = {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'data_cadastro': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'created_at': self.data_cadastro.isoformat() if self.data_cadastro else None,
            'teste_inicial_concluido': self.teste_inicial_concluido,
            'nivel': self.nivel,
            'xp': self.xp,
            'proximo_nivel_xp': self.calcular_proximo_nivel_xp(),
            'desafios_concluidos': self.calcular_desafios_concluidos(),
            'tipo_usuario': self.tipo_usuario,
            'turma_id': self.turma_id
        }
        
        # Adicionar informações da turma se for aluno
        if self.tipo_usuario == 'aluno' and self.turma_id:
            turma = Turma.query.get(self.turma_id)
            if turma:
                data['turma'] = {
                    'id': turma.id,
                    'nome': turma.nome,
                    'codigo': turma.codigo
                }
        
        # Adicionar informações de professor se for professor
        if self.tipo_usuario == 'professor':
            data['turmas_criadas'] = len(self.turmas_criadas)
            data['total_alunos'] = sum(len(turma.alunos) for turma in self.turmas_criadas)
        
        return data

    def calcular_sequencia(self):
        """Calcula a sequência atual de dias consecutivos"""
        resultados = Resultado.query.filter_by(
            usuario_id=self.id,
            status='concluído'
        ).order_by(Resultado.data_conclusao.desc()).all()
        
        if not resultados:
            return 0
            
        sequencia = 1
        data_anterior = resultados[0].data_conclusao.date()
        
        for resultado in resultados[1:]:
            data_atual = resultado.data_conclusao.date()
            if (data_anterior - data_atual).days == 1:
                sequencia += 1
                data_anterior = data_atual
            else:
                break
        
        return sequencia
    
    def adicionar_xp(self, quantidade):
        """Adiciona XP e atualiza nível se necessário"""
        self.xp += quantidade

        # Verifica se deve subir de nível
        while self.xp >= self.calcular_proximo_nivel_xp():
            self.xp -= self.calcular_proximo_nivel_xp()
            self.nivel += 1

        return self.nivel

class Avaliacao(db.Model):
    __tablename__ = 'avaliacoes'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    data = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    pontuacao = db.Column(db.Integer, nullable=False)
    feedback = db.Column(db.Text)
    
    # Armazenar as respostas do teste como JSON
    respostas = db.Column(db.JSON)
    
    def calcular_medias_por_categoria(self):
        if not self.respostas:
            return {}
            
        perguntas = PerguntaTeste.query.all()
        categorias = {}
        
        for pergunta in perguntas:
            if str(pergunta.id) in self.respostas:
                if pergunta.categoria not in categorias:
                    categorias[pergunta.categoria] = []
                categorias[pergunta.categoria].append(self.respostas[str(pergunta.id)])
        
        return {
            categoria: sum(valores) / len(valores)
            for categoria, valores in categorias.items()
        }
    
    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'data': self.data.isoformat(),
            'pontuacao': self.pontuacao,
            'feedback': self.feedback,
            'respostas': self.respostas,
            'medias_por_categoria': self.calcular_medias_por_categoria()
        }

class Desafio(db.Model):
    __tablename__ = 'desafios'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text, nullable=False)
    video_url = db.Column(db.String(255))
    status = db.Column(db.String(20), default='ativo')  # ativo, inativo
    data_criacao = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    prazo = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc) + timedelta(days=7))
    
    # Novos campos para V2
    criado_por = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=True)  # ID do professor que criou
    turma_id = db.Column(db.Integer, db.ForeignKey('turmas.id'), nullable=True)  # Desafio específico para uma turma
    gerado_por_ia = db.Column(db.Boolean, default=False)  # Se foi gerado por IA
    
    # Perguntas do quiz relacionadas ao desafio
    perguntas = db.Column(db.JSON)
    
    # Detalhes do desafio prático
    desafio_pratico = db.Column(db.Text)
    
    # Relacionamentos
    resultados = db.relationship('Resultado', backref='desafio', lazy=True)
    
    def to_dict(self):
        return {
            'desafio_id': self.id,
            'titulo': self.titulo,
            'descricao': self.descricao,
            'video_url': self.video_url,
            'status': self.status,
            'data_criacao': self.data_criacao.isoformat(),
            'prazo': self.prazo.isoformat() if self.prazo else None,
            'perguntas': self.perguntas,
            'desafio_pratico': self.desafio_pratico
        }

class Resultado(db.Model):
    __tablename__ = 'resultados'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    desafio_id = db.Column(db.Integer, db.ForeignKey('desafios.id'), nullable=False)
    status = db.Column(db.String(20), default='pendente')  # pendente, concluído, falhou
    data_inicio = db.Column(db.DateTime, default=datetime.utcnow)
    data_conclusao = db.Column(db.DateTime)
    
    # Respostas do quiz e do desafio prático
    respostas_quiz = db.Column(db.JSON)
    resposta_pratica = db.Column(db.Text)
    
    # Pontuação obtida
    pontuacao = db.Column(db.Integer, default=0)
    
    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'desafio_id': self.desafio_id,
            'status': self.status,
            'data_inicio': self.data_inicio.isoformat(),
            'data_conclusao': self.data_conclusao.isoformat() if self.data_conclusao else None,
            'pontuacao': self.pontuacao,
            'respostas_quiz': self.respostas_quiz,
            'resposta_pratica': self.resposta_pratica
        }

# Modelo para as perguntas do teste inicial
class PerguntaTeste(db.Model):
    __tablename__ = 'perguntas_teste'
    
    id = db.Column(db.Integer, primary_key=True)
    texto = db.Column(db.String(500), nullable=False)
    categoria = db.Column(db.String(100), nullable=False)
    ordem = db.Column(db.Integer, nullable=False)
    
    def to_dict(self):
        return {
            'id': self.id,
            'texto': self.texto,
            'categoria': self.categoria,
            'ordem': self.ordem
        }

# Novos modelos para V2

class Turma(db.Model):
    __tablename__ = 'turmas'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    codigo = db.Column(db.String(10), unique=True, nullable=False)  # Código para alunos entrarem
    descricao = db.Column(db.Text)
    professor_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    data_criacao = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    ativa = db.Column(db.Boolean, default=True)
    
    # Relacionamentos
    alunos = db.relationship('Usuario', foreign_keys='Usuario.turma_id', backref='turma', lazy=True)
    desafios = db.relationship('Desafio', foreign_keys='Desafio.turma_id', backref='turma', lazy=True)
    
    def gerar_codigo(self):
        """Gera um código único para a turma"""
        import random
        import string
        while True:
            codigo = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            if not Turma.query.filter_by(codigo=codigo).first():
                return codigo
    
    def __init__(self, nome, professor_id, descricao=None):
        self.nome = nome
        self.professor_id = professor_id
        self.descricao = descricao
        self.codigo = self.gerar_codigo()
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'codigo': self.codigo,
            'descricao': self.descricao,
            'professor_id': self.professor_id,
            'professor_nome': self.professor.nome if self.professor else None,
            'data_criacao': self.data_criacao.isoformat(),
            'ativa': self.ativa,
            'total_alunos': len(self.alunos),
            'total_desafios': len(self.desafios)
        }

class TesteInicialLikert(db.Model):
    __tablename__ = 'teste_inicial_likert'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    data_realizacao = db.Column(db.DateTime, default=datetime.now(timezone.utc))
    
    # Respostas das perguntas Likert (1-5)
    respostas = db.Column(db.JSON, nullable=False)
    
    # Análise gerada por IA
    analise_ia = db.Column(db.Text)
    
    # Pontuações por categoria
    pontuacao_comunicacao = db.Column(db.Float)
    pontuacao_empatia = db.Column(db.Float)
    pontuacao_inteligencia_emocional = db.Column(db.Float)
    pontuacao_trabalho_equipe = db.Column(db.Float)
    pontuacao_lideranca = db.Column(db.Float)
    
    # Relacionamento
    usuario = db.relationship('Usuario', backref='teste_likert', lazy=True)
    
    def calcular_pontuacoes(self):
        """Calcula as pontuações por categoria baseado nas respostas"""
        if not self.respostas:
            return
        
        # Mapeamento de perguntas por categoria (baseado no seed.py)
        categorias = {
            'comunicacao': [1, 4, 7],  # Perguntas relacionadas à comunicação
            'empatia': [2, 9],  # Perguntas relacionadas à empatia
            'inteligencia_emocional': [3, 8, 10],  # Perguntas relacionadas à IE
            'trabalho_equipe': [5, 6],  # Perguntas relacionadas ao trabalho em equipe
            'lideranca': [9]  # Perguntas relacionadas à liderança
        }
        
        for categoria, perguntas in categorias.items():
            total = sum(self.respostas.get(str(p), 0) for p in perguntas)
            media = total / len(perguntas) if perguntas else 0
            setattr(self, f'pontuacao_{categoria}', media)
    
    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'data_realizacao': self.data_realizacao.isoformat(),
            'respostas': self.respostas,
            'analise_ia': self.analise_ia,
            'pontuacoes': {
                'comunicacao': self.pontuacao_comunicacao,
                'empatia': self.pontuacao_empatia,
                'inteligencia_emocional': self.pontuacao_inteligencia_emocional,
                'trabalho_equipe': self.pontuacao_trabalho_equipe,
                'lideranca': self.pontuacao_lideranca
            }
        }
