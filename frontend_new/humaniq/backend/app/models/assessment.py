from datetime import datetime
from app import db

class Assessment(db.Model):
    __tablename__ = 'avaliacoes'
    
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuarios.id'), nullable=False)
    data = db.Column(db.DateTime, default=datetime.utcnow)
    pontuacao = db.Column(db.Integer, nullable=False)
    feedback = db.Column(db.Text)
    
    # Armazenar as respostas individuais das 12 perguntas
    respostas = db.Column(db.Text)  # Armazenado como JSON string
    
    def to_dict(self):
        return {
            'id': self.id,
            'usuario_id': self.usuario_id,
            'data': self.data.isoformat(),
            'pontuacao': self.pontuacao,
            'feedback': self.feedback,
            'respostas': self.respostas
        }

class Pergunta(db.Model):
    __tablename__ = 'perguntas'
    
    id = db.Column(db.Integer, primary_key=True)
    texto = db.Column(db.Text, nullable=False)
    categoria = db.Column(db.String(50))
    
    def to_dict(self):
        return {
            'id': self.id,
            'texto': self.texto,
            'categoria': self.categoria
        }
