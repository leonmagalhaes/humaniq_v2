from flask import Flask,request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from config import config
from flask_cors import CORS

# Inicialização das extensões
db = SQLAlchemy()
jwt = JWTManager()

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config[config_name])

    # Configurações do JWT
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_COOKIE_CSRF_PROTECT'] = False

    # Inicialização das extensões com a aplicação
    db.init_app(app)
    jwt.init_app(app)
    # Configuração mais específica do CORS
    CORS(app,
         resources={r"/api/*": {"origins": "http://localhost:3000"}},
         supports_credentials=True,
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"])
    # Handler global para ignorar JWT no preflight (OPTIONS)
    @jwt.unauthorized_loader
    def custom_unauthorized_response(err_str):
        if request.method == 'OPTIONS':
            return '', 200  # libera o preflight
        return jsonify({'message': 'Unauthorized'}), 401
    @jwt.invalid_token_loader
    def custom_invalid_token_response(err_str):
        if request.method == 'OPTIONS':
            return '', 200
        return jsonify({'message': 'Invalid token'}), 401

    @jwt.expired_token_loader
    def custom_expired_token_response(jwt_header, jwt_payload):
        if request.method == 'OPTIONS':
            return '', 200
        return jsonify({'message': 'Token expired'}), 401
    # Registro dos blueprints
    from app.resources.auth import auth_bp
    from app.resources.user import user_bp
    from app.resources.assessment import assessment_bp
    from app.resources.desafio import desafio_bp
    from app.resources.professor import professor_bp
    from app.resources.turma import turma_bp
    from app.resources.teste_likert import teste_likert_bp
    
    @app.after_request
    def after_request(response):
     #  response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
     #  response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
     #  response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
     #  response.headers.add('Access-Control-Allow-Credentials', 'true')
        return response

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(user_bp, url_prefix='/api/users')
    app.register_blueprint(assessment_bp, url_prefix='/api/assessments')
    app.register_blueprint(desafio_bp, url_prefix='/api/desafios')
    app.register_blueprint(professor_bp, url_prefix='/api/professor')
    app.register_blueprint(turma_bp, url_prefix='/api/turma')
    app.register_blueprint(teste_likert_bp, url_prefix='/api/teste-likert')

    # Rota de teste para verificar se a API está funcionando
    @app.route('/api/ping', methods=['GET'])
    def ping():
        return {'message': 'API HUMANIQ esta online!'}, 200

    # Criação das tabelas do banco de dados
    with app.app_context():
        db.create_all()

    return app