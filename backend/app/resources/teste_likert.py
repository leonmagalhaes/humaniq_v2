from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Usuario, TesteInicialLikert, PerguntaTeste
from app import db

teste_likert_bp = Blueprint('teste_likert', __name__)


@teste_likert_bp.route('/perguntas', methods=['GET'])
@jwt_required()
def obter_perguntas():
    """Retorna as perguntas do teste inicial Likert"""
    try:
        perguntas = PerguntaTeste.query.order_by(PerguntaTeste.ordem).all()
        return jsonify({
            'perguntas': [pergunta.to_dict() for pergunta in perguntas]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor', 'error': str(e)}), 500

@teste_likert_bp.route('/responder', methods=['POST'])
@jwt_required()
def responder_teste():
    """Processa as respostas do teste inicial Likert"""
    try:
        user_id = get_jwt_identity()
        usuario = Usuario.query.get(user_id)
        
        if not usuario:
            return jsonify({'message': 'Usuário não encontrado.'}), 404
        
        # Verificar se já fez o teste
        teste_existente = TesteInicialLikert.query.filter_by(usuario_id=user_id).first()
        if teste_existente:
            return jsonify({'message': 'Você já realizou o teste inicial.'}), 400
        
        data = request.get_json()
        if not data or not data.get('respostas'):
            return jsonify({'message': 'Respostas são obrigatórias.'}), 400
        
        respostas = data.get('respostas')
        
        # Validar respostas (devem ser de 1 a 5)
        for pergunta_id, resposta in respostas.items():
            if not isinstance(resposta, int) or resposta < 1 or resposta > 5:
                return jsonify({'message': f'Resposta inválida para pergunta {pergunta_id}. Deve ser entre 1 e 5.'}), 400
        
        # Criar registro do teste
        teste = TesteInicialLikert(
            usuario_id=user_id,
            respostas=respostas
        )
        
        # Calcular pontuações por categoria
        teste.calcular_pontuacoes()
        
        db.session.add(teste)
        
        # Marcar teste como concluído no usuário
        usuario.teste_inicial_concluido = True
        db.session.commit()
        
        return jsonify({
            'message': 'Teste realizado com sucesso!',
            'teste': teste.to_dict(),
            'usuario': usuario.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor', 'error': str(e)}), 500

@teste_likert_bp.route('/resultado', methods=['GET'])
@jwt_required()
def obter_resultado():
    """Retorna o resultado do teste Likert do usuário"""
    try:
        user_id = get_jwt_identity()
        teste = TesteInicialLikert.query.filter_by(usuario_id=user_id).first()
        
        if not teste:
            return jsonify({'message': 'Teste não encontrado. Realize o teste primeiro.'}), 404
        
        return jsonify({
            'teste': teste.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor', 'error': str(e)}), 500

