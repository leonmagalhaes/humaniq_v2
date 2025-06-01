from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user import User
from app.models.desafio import Resultado
from app import db

user_bp = Blueprint('user', __name__)

@user_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    # Verificar se o usuário atual tem permissão para acessar este perfil
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({'mensagem': 'Acesso não autorizado'}), 403
    
    # Buscar usuário pelo ID
    usuario = User.query.get(user_id)
    
    if not usuario:
        return jsonify({'mensagem': 'Usuário não encontrado'}), 404
    
    return jsonify({
        'usuario': usuario.to_dict()
    }), 200

@user_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    # Verificar se o usuário atual tem permissão para atualizar este perfil
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({'mensagem': 'Acesso não autorizado'}), 403
    
    # Buscar usuário pelo ID
    usuario = User.query.get(user_id)
    
    if not usuario:
        return jsonify({'mensagem': 'Usuário não encontrado'}), 404
    
    data = request.get_json()
    
    # Atualizar campos do usuário
    if 'nome' in data:
        usuario.nome = data['nome']
    
    # Atualizar senha se fornecida
    if 'senha' in data:
        usuario.set_senha(data['senha'])
    
    # Salvar alterações no banco de dados
    db.session.commit()
    
    return jsonify({
        'mensagem': 'Perfil atualizado com sucesso',
        'usuario': usuario.to_dict()
    }), 200

@user_bp.route('/<int:user_id>/progresso', methods=['GET'])
@jwt_required()
def get_user_progress(user_id):
    # Verificar se o usuário atual tem permissão para acessar este perfil
    current_user_id = get_jwt_identity()
    if current_user_id != user_id:
        return jsonify({'mensagem': 'Acesso não autorizado'}), 403
    
    # Buscar usuário pelo ID
    usuario = User.query.get(user_id)
    
    if not usuario:
        return jsonify({'mensagem': 'Usuário não encontrado'}), 404
    
    # Buscar resultados dos desafios do usuário
    resultados = Resultado.query.filter_by(usuario_id=user_id).all()
    
    # Formatar resultados para retorno
    resultados_formatados = [resultado.to_dict() for resultado in resultados]
    
    return jsonify({
        'usuario': usuario.to_dict(),
        'progresso': resultados_formatados
    }), 200
