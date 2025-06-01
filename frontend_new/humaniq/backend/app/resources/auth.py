from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User
from app import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/registrar', methods=['POST'])
def registrar():
    data = request.get_json()
    
    # Verificar se todos os campos necessários estão presentes
    if not all(k in data for k in ('nome', 'email', 'senha')):
        return jsonify({'mensagem': 'Dados incompletos'}), 400
    
    # Verificar se o e-mail já está em uso
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'mensagem': 'E-mail já cadastrado'}), 400
    
    # Criar novo usuário
    novo_usuario = User(
        nome=data['nome'],
        email=data['email']
    )
    novo_usuario.set_senha(data['senha'])
    
    # Salvar no banco de dados
    db.session.add(novo_usuario)
    db.session.commit()
    
    # Gerar token de acesso
    access_token = create_access_token(identity=novo_usuario.id)
    
    return jsonify({
        'mensagem': 'Usuário registrado com sucesso',
        'usuario': novo_usuario.to_dict(),
        'access_token': access_token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    
    # Verificar se todos os campos necessários estão presentes
    if not all(k in data for k in ('email', 'senha')):
        return jsonify({'mensagem': 'Dados incompletos'}), 400
    
    # Buscar usuário pelo e-mail
    usuario = User.query.filter_by(email=data['email']).first()
    
    # Verificar se o usuário existe e a senha está correta
    if not usuario or not usuario.verificar_senha(data['senha']):
        return jsonify({'mensagem': 'Credenciais inválidas'}), 401
    
    # Gerar token de acesso
    access_token = create_access_token(identity=usuario.id)
    
    return jsonify({
        'mensagem': 'Login realizado com sucesso',
        'usuario': usuario.to_dict(),
        'access_token': access_token
    }), 200

@auth_bp.route('/perfil', methods=['GET'])
@jwt_required()
def perfil():
    # Obter ID do usuário a partir do token JWT
    usuario_id = get_jwt_identity()
    
    # Buscar usuário pelo ID
    usuario = User.query.get(usuario_id)
    
    if not usuario:
        return jsonify({'mensagem': 'Usuário não encontrado'}), 404
    
    return jsonify({
        'usuario': usuario.to_dict()
    }), 200
