from datetime import datetime
from app import db

class Desafio(db.Model):
    __tablename__ = 'desafios'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text, nullable=False)
    video_url = db.Column(db.String(255))
    status = db.Column(db.String(20), default='ativo')  # ativo, inativo
    data_criacao = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    resultados = db.relationship('Resultado', backref='desafio', lazy='dynamic')
    
    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'descricao': self.descricao,
            'video_url': self.video_url,
            'status': self.status,
            'data_criacao': self.data_criacao.isoformat()
        }

class Resultado(db.Model):
    __tablename__ = 'resultados'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    desafio_id = db.Column(db.Integer, db.ForeignKey('desafios.id'), nullable=False)
    status = db.Column(db.String(20), default='pendente')  # pendente, em_andamento, concluido
    data_inicio = db.Column(db.DateTime, default=datetime.utcnow)
    data_conclusao = db.Column(db.DateTime)
    pontuacao = db.Column(db.Integer)
    
    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'desafio_id': self.desafio_id,
            'status': self.status,
            'data_inicio': self.data_inicio.isoformat(),
            'data_conclusao': self.data_conclusao.isoformat() if self.data_conclusao else None,
            'pontuacao': self.pontuacao
        }
