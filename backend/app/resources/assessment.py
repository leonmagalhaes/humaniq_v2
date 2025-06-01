from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Usuario, Avaliacao, PerguntaTeste
from app import db

assessment_bp = Blueprint('assessment', __name__)

@assessment_bp.route('/perguntas', methods=['GET'])
@jwt_required()
def obter_perguntas():
    perguntas = PerguntaTeste.query.order_by(PerguntaTeste.ordem).all()
    return jsonify({
        'perguntas': [{
            'id': p.id,
            'texto': p.texto,
            'categoria': p.categoria,
            'ordem': p.ordem
        } for p in perguntas]
    }), 200

@assessment_bp.route('/submeter', methods=['POST'])
@jwt_required()
def submeter_avaliacao():
    """
    Endpoint para submeter as respostas do teste inicial
    ---
    Requer:
      - Token de acesso JWT válido
    Parâmetros:
      - respostas: Objeto JSON com as respostas do teste (id_pergunta: valor_resposta)
    Retorna:
      - Resultado da avaliação com pontuação e feedback
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'respostas' not in data:
        return jsonify({'message': 'Dados incompletos. Respostas são obrigatórias.'}), 400
    
    respostas = data['respostas']
    
    # Verificar se todas as perguntas foram respondidas
    perguntas = PerguntaTeste.query.all()
    ids_perguntas = [str(p.id) for p in perguntas]
    
    for id_pergunta in ids_perguntas:
        if id_pergunta not in respostas:
            return jsonify({'message': f'Resposta para a pergunta {id_pergunta} não foi fornecida'}), 400
    
    # Calcular pontuação (média das respostas)
    # Considerando que as respostas são valores de 1 a 5 (escala Likert)
    valores_respostas = [int(valor) for valor in respostas.values()]
    pontuacao = sum(valores_respostas) / len(valores_respostas)
    
    # Gerar feedback com base na pontuação
    feedback = gerar_feedback(pontuacao)
    
    # Criar registro de avaliação
    nova_avaliacao = Avaliacao(
        usuario_id=int(current_user_id),
        pontuacao=int(pontuacao * 20),  # Converter para escala de 0-100
        feedback=feedback,
        respostas=respostas
    )
    
    db.session.add(nova_avaliacao)
    db.session.commit()
    
    return jsonify({
        'message': 'Avaliação submetida com sucesso',
        'avaliacao': nova_avaliacao.to_dict()
    }), 201

@assessment_bp.route('/historico', methods=['GET'])
@jwt_required()
def obter_historico():
    current_user_id = get_jwt_identity()
    avaliacoes = Avaliacao.query.filter_by(
        usuario_id=int(current_user_id)
    ).order_by(Avaliacao.data.desc()).all()
    
    return jsonify({
        'message': 'Histórico obtido com sucesso',
        'avaliacoes': [avaliacao.to_dict() for avaliacao in avaliacoes]
    }), 200

def gerar_feedback(pontuacao):
    """
    Função auxiliar para gerar feedback com base na pontuação
    """
    if pontuacao >= 4.5:
        return "Excelente! Você demonstra um alto nível de autoconhecimento e habilidades interpessoais."
    elif pontuacao >= 3.5:
        return "Muito bom! Você possui boas habilidades interpessoais, mas ainda há espaço para crescimento."
    elif pontuacao >= 2.5:
        return "Bom. Você está no caminho certo, mas pode melhorar suas habilidades interpessoais com prática."
    elif pontuacao >= 1.5:
        return "Regular. Recomendamos focar no desenvolvimento de suas habilidades interpessoais."
    else:
        return "Você está apenas começando sua jornada. Os desafios ajudarão você a desenvolver suas habilidades."
