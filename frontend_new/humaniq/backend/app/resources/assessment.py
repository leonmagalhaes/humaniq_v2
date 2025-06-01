from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
from app.models.assessment import Assessment, Pergunta
from app.models.user import User
from app import db

assessment_bp = Blueprint('assessment', __name__)

@assessment_bp.route('/perguntas', methods=['GET'])
@jwt_required()
def get_perguntas():
    # Buscar todas as perguntas do teste
    perguntas = Pergunta.query.all()
    
    # Formatar perguntas para retorno
    perguntas_formatadas = [pergunta.to_dict() for pergunta in perguntas]
    
    return jsonify({
        'perguntas': perguntas_formatadas
    }), 200

@assessment_bp.route('/submeter', methods=['POST'])
@jwt_required()
def submeter_assessment():
    # Obter ID do usuário a partir do token JWT
    usuario_id = get_jwt_identity()
    
    # Verificar se o usuário existe
    usuario = User.query.get(usuario_id)
    if not usuario:
        return jsonify({'mensagem': 'Usuário não encontrado'}), 404
    
    data = request.get_json()
    
    # Verificar se as respostas foram fornecidas
    if 'respostas' not in data:
        return jsonify({'mensagem': 'Respostas não fornecidas'}), 400
    
    # Verificar se há 12 respostas
    respostas = data['respostas']
    if len(respostas) != 12:
        return jsonify({'mensagem': 'O teste deve conter exatamente 12 respostas'}), 400
    
    # Calcular pontuação (média das respostas)
    pontuacao = sum(respostas) / len(respostas)
    
    # Criar nova avaliação
    nova_avaliacao = Assessment(
        usuario_id=usuario_id,
        pontuacao=pontuacao,
        feedback=data.get('feedback', ''),
        respostas=json.dumps(respostas)
    )
    
    # Salvar no banco de dados
    db.session.add(nova_avaliacao)
    db.session.commit()
    
    return jsonify({
        'mensagem': 'Avaliação submetida com sucesso',
        'avaliacao': nova_avaliacao.to_dict()
    }), 201

@assessment_bp.route('/historico', methods=['GET'])
@jwt_required()
def get_historico():
    # Obter ID do usuário a partir do token JWT
    usuario_id = get_jwt_identity()
    
    # Buscar avaliações do usuário
    avaliacoes = Assessment.query.filter_by(usuario_id=usuario_id).order_by(Assessment.data.desc()).all()
    
    # Formatar avaliações para retorno
    avaliacoes_formatadas = [avaliacao.to_dict() for avaliacao in avaliacoes]
    
    return jsonify({
        'avaliacoes': avaliacoes_formatadas
    }), 200
