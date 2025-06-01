from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from app.models.desafio import Desafio, Resultado
from app.models.user import User
from app import db

desafio_bp = Blueprint('desafio', __name__)

@desafio_bp.route('/', methods=['GET'])
@jwt_required()
def get_desafios():
    # Buscar todos os desafios ativos
    desafios = Desafio.query.filter_by(status='ativo').all()
    
    # Formatar desafios para retorno
    desafios_formatados = [desafio.to_dict() for desafio in desafios]
    
    return jsonify({
        'desafios': desafios_formatados
    }), 200

@desafio_bp.route('/<int:desafio_id>', methods=['GET'])
@jwt_required()
def get_desafio(desafio_id):
    # Buscar desafio pelo ID
    desafio = Desafio.query.get(desafio_id)
    
    if not desafio:
        return jsonify({'mensagem': 'Desafio não encontrado'}), 404
    
    # Obter ID do usuário a partir do token JWT
    usuario_id = get_jwt_identity()
    
    # Verificar se o usuário já iniciou este desafio
    resultado = Resultado.query.filter_by(
        usuario_id=usuario_id,
        desafio_id=desafio_id
    ).first()
    
    # Se não houver resultado, criar um novo com status 'pendente'
    if not resultado:
        resultado = Resultado(
            usuario_id=usuario_id,
            desafio_id=desafio_id,
            status='pendente'
        )
        db.session.add(resultado)
        db.session.commit()
    
    return jsonify({
        'desafio': desafio.to_dict(),
        'progresso': resultado.to_dict()
    }), 200

@desafio_bp.route('/<int:desafio_id>/iniciar', methods=['POST'])
@jwt_required()
def iniciar_desafio(desafio_id):
    # Buscar desafio pelo ID
    desafio = Desafio.query.get(desafio_id)
    
    if not desafio:
        return jsonify({'mensagem': 'Desafio não encontrado'}), 404
    
    # Obter ID do usuário a partir do token JWT
    usuario_id = get_jwt_identity()
    
    # Verificar se o usuário já iniciou este desafio
    resultado = Resultado.query.filter_by(
        usuario_id=usuario_id,
        desafio_id=desafio_id
    ).first()
    
    # Se não houver resultado, criar um novo
    if not resultado:
        resultado = Resultado(
            usuario_id=usuario_id,
            desafio_id=desafio_id
        )
        db.session.add(resultado)
    
    # Atualizar status para 'em_andamento'
    resultado.status = 'em_andamento'
    resultado.data_inicio = datetime.utcnow()
    
    # Salvar alterações no banco de dados
    db.session.commit()
    
    return jsonify({
        'mensagem': 'Desafio iniciado com sucesso',
        'progresso': resultado.to_dict()
    }), 200

@desafio_bp.route('/<int:desafio_id>/concluir', methods=['POST'])
@jwt_required()
def concluir_desafio(desafio_id):
    # Buscar desafio pelo ID
    desafio = Desafio.query.get(desafio_id)
    
    if not desafio:
        return jsonify({'mensagem': 'Desafio não encontrado'}), 404
    
    # Obter ID do usuário a partir do token JWT
    usuario_id = get_jwt_identity()
    
    # Verificar se o usuário já iniciou este desafio
    resultado = Resultado.query.filter_by(
        usuario_id=usuario_id,
        desafio_id=desafio_id
    ).first()
    
    if not resultado:
        return jsonify({'mensagem': 'Desafio não iniciado'}), 400
    
    data = request.get_json()
    
    # Atualizar status para 'concluido'
    resultado.status = 'concluido'
    resultado.data_conclusao = datetime.utcnow()
    
    # Atualizar pontuação se fornecida
    if 'pontuacao' in data:
        resultado.pontuacao = data['pontuacao']
    
    # Salvar alterações no banco de dados
    db.session.commit()
    
    return jsonify({
        'mensagem': 'Desafio concluído com sucesso',
        'progresso': resultado.to_dict()
    }), 200

@desafio_bp.route('/semanal', methods=['GET'])
@jwt_required()
def get_desafio_semanal():
    # Buscar o desafio mais recente (que seria o desafio da semana)
    desafio_semanal = Desafio.query.filter_by(status='ativo').order_by(Desafio.data_criacao.desc()).first()
    
    if not desafio_semanal:
        return jsonify({'mensagem': 'Nenhum desafio disponível'}), 404
    
    # Obter ID do usuário a partir do token JWT
    usuario_id = get_jwt_identity()
    
    # Verificar se o usuário já iniciou este desafio
    resultado = Resultado.query.filter_by(
        usuario_id=usuario_id,
        desafio_id=desafio_semanal.id
    ).first()
    
    # Se não houver resultado, criar um novo com status 'pendente'
    if not resultado:
        resultado = Resultado(
            usuario_id=usuario_id,
            desafio_id=desafio_semanal.id,
            status='pendente'
        )
        db.session.add(resultado)
        db.session.commit()
    
    return jsonify({
        'desafio_semanal': desafio_semanal.to_dict(),
        'progresso': resultado.to_dict()
    }), 200
