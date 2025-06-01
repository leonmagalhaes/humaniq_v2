from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
from app import db

class User(db.Model):
    __tablename__ = 'usuarios'
    
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha_hash = db.Column(db.String(128))
    data_cadastro = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relacionamentos
    avaliacoes = db.relationship('Assessment', backref='usuario', lazy='dynamic')
    resultados = db.relationship('Resultado', backref='usuario', lazy='dynamic')
    
    def set_senha(self, senha):
        self.senha_hash = generate_password_hash(senha)
        
    def verificar_senha(self, senha):
        return check_password_hash(self.senha_hash, senha)
    
    def to_dict(self):
        return {
            'id': self.id,
            'nome': self.nome,
            'email': self.email,
            'data_cadastro': self.data_cadastro.isoformat()
        }
