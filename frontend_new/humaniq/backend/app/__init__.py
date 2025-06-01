from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from config import Config

db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Inicialização das extensões
    db.init_app(app)
    jwt.init_app(app)
    CORS(app)
    
    # Rota de saúde para verificar se a API está funcionando
    @app.route('/health')
    def health_check():
        return jsonify({"status": "ok", "message": "API HUMANIQ está funcionando!"})
    
    # Importação e registro dos blueprints
    from app.resources.auth import auth_bp
    from app.resources.user import user_bp
    from app.resources.assessment import assessment_bp
    from app.resources.desafio import desafio_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(assessment_bp, url_prefix='/api/assessments')
    app.register_blueprint(desafio_bp, url_prefix='/api/desafios')
    
    # Criação das tabelas do banco de dados
    with app.app_context():
        db.create_all()
    
    return app
