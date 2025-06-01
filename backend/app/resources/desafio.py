from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from app.models import Usuario, Desafio, Resultado
from app import db

desafio_bp = Blueprint('desafio', __name__)

@desafio_bp.route('', methods=['GET'])
@jwt_required()
def listar_desafios():
    """
    Endpoint para listar todos os desafios disponíveis
    ---
    Requer:
      - Token de acesso JWT válido
    Parâmetros de consulta:
      - status: Filtrar por status (ativo, inativo)
    Retorna:
      - Lista de desafios
    """
    current_user_id = get_jwt_identity()
    
    # Filtrar por status se fornecido
    status = request.args.get('status')
    query = Desafio.query
    
    if status:
        query = query.filter_by(status=status)
    
    # Obter todos os desafios
    desafios = query.order_by(Desafio.data_criacao.desc()).all()
    
    # Obter resultados do usuário para cada desafio
    resultados = {r.desafio_id: r for r in Resultado.query.filter_by(usuario_id=int(current_user_id)).all()}
    
    # Preparar dados para retorno
    desafios_data = []
    for desafio in desafios:
        desafio_dict = desafio.to_dict()
        
        # Adicionar informações sobre o progresso do usuário neste desafio
        if desafio.id in resultados:
            resultado = resultados[desafio.id]
            desafio_dict['progresso'] = {
                'status': resultado.status,
                'data_inicio': resultado.data_inicio.isoformat(),
                'data_conclusao': resultado.data_conclusao.isoformat() if resultado.data_conclusao else None,
                'pontuacao': resultado.pontuacao
            }
        else:
            desafio_dict['progresso'] = None
        
        desafios_data.append(desafio_dict)
    
    return jsonify({
        'message': 'Desafios obtidos com sucesso',
        'desafios': desafios_data
    }), 200

@desafio_bp.route('/<int:desafio_id>', methods=['GET'])
@jwt_required()
def obter_desafio(desafio_id):
    """
    Endpoint para obter detalhes de um desafio específico
    ---
    Requer:
      - Token de acesso JWT válido
    Parâmetros:
      - desafio_id: ID do desafio
    Retorna:
      - Detalhes do desafio
    """
    current_user_id = get_jwt_identity()
    
    # Obter o desafio
    desafio = Desafio.query.get(desafio_id)
    
    if not desafio:
        return jsonify({'message': 'Desafio não encontrado'}), 404
    
    # Obter resultado do usuário para este desafio
    resultado = Resultado.query.filter_by(usuario_id=int(current_user_id), desafio_id=desafio_id).first()
    
    # Preparar dados para retorno
    desafio_dict = desafio.to_dict()
    
    # Adicionar informações sobre o progresso do usuário neste desafio
    if resultado:
        desafio_dict['progresso'] = {
            'desafioConcluido': resultado.status == 'concluído',
            'dataInicio': resultado.data_inicio.isoformat(),
            'dataConclusao': resultado.data_conclusao.isoformat() if resultado.data_conclusao else None,
            'pontuacaoQuiz': resultado.pontuacao
        }
    else:
        desafio_dict['progresso'] = None
    
    return jsonify({
        'message': 'Desafio obtido com sucesso',
        'desafio': desafio_dict
    }), 200

@desafio_bp.route('/<int:desafio_id>/iniciar', methods=['POST'])
@jwt_required()
def iniciar_desafio(desafio_id):
    """
    Endpoint para iniciar um desafio
    ---
    Requer:
      - Token de acesso JWT válido
    Parâmetros:
      - desafio_id: ID do desafio
    Retorna:
      - Confirmação de início do desafio
    """
    current_user_id = get_jwt_identity()
    
    # Verificar se o desafio existe
    desafio = Desafio.query.get(desafio_id)
    
    if not desafio:
        return jsonify({'message': 'Desafio não encontrado'}), 404
    
    # Verificar se o usuário já iniciou este desafio
    resultado_existente = Resultado.query.filter_by(usuario_id=int(current_user_id), desafio_id=desafio_id).first()
    
    if resultado_existente:
        return jsonify({
            'message': 'Desafio já iniciado anteriormente',
            'resultado': resultado_existente.to_dict()
        }), 200
    
    # Criar novo registro de resultado
    novo_resultado = Resultado(
        usuario_id=int(current_user_id),
        desafio_id=desafio_id,
        status='pendente',
        data_inicio=datetime.utcnow()
    )
    
    db.session.add(novo_resultado)
    db.session.commit()
    
    return jsonify({
        'message': 'Desafio iniciado com sucesso',
        'resultado': novo_resultado.to_dict()
    }), 201

@desafio_bp.route('/<int:desafio_id>/submeter', methods=['POST'])
@jwt_required()
def submeter_desafio(desafio_id):
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or 'respostasQuiz' not in data:
        return jsonify({
            'message': 'Respostas do quiz são obrigatórias',
            'error': 'MISSING_ANSWERS'
        }), 400
    
    desafio = Desafio.query.get(desafio_id)
    if not desafio:
        return jsonify({
            'message': 'Desafio não encontrado',
            'error': 'CHALLENGE_NOT_FOUND'
        }), 404
    
    # Obter ou criar resultado
    resultado = Resultado.query.filter_by(
        usuario_id=int(current_user_id), 
        desafio_id=desafio_id
    ).first()
    
    if not resultado:
        resultado = Resultado(
            usuario_id=int(current_user_id),
            desafio_id=desafio_id,
            status='em_andamento'
        )
        db.session.add(resultado)
    
    respostas_quiz = data['respostasQuiz']
    
    # Calcular pontuação - 10 pontos por resposta correta
    pontuacao = 0
    for pergunta in desafio.perguntas:
        pergunta_id = str(pergunta['id'])
        if pergunta_id in respostas_quiz:
            resposta_usuario_indice = respostas_quiz[pergunta_id]
            opcoes = pergunta['opcoes']
            resposta_usuario = opcoes[resposta_usuario_indice]
            if resposta_usuario == pergunta['resposta_correta']:
                pontuacao += 1
    
    # Atualizar resultado
    resultado.respostasQuiz = respostas_quiz
    resultado.pontuacao = pontuacao
    
    db.session.commit()
    
    return jsonify({
        'message': 'Respostas submetidas com sucesso',
        'resultado': {
            'pontuacao': pontuacao,
            'total': len(desafio.perguntas),
            'concluido': resultado.status == 'concluído'
        }
    }), 200

@desafio_bp.route('/destaque', methods=['GET'])
@jwt_required()
def obter_desafio_destaque():
    """
    Endpoint para obter o desafio em destaque da semana
    ---
    Requer:
      - Token de acesso JWT válido
    Retorna:
      - Detalhes do desafio em destaque
    """
    current_user_id = get_jwt_identity()
    
    # Obter o desafio mais recente com status ativo
    desafio = Desafio.query.filter_by(status='ativo').order_by(Desafio.data_criacao.desc()).first()
    
    if not desafio:
        return jsonify({'message': 'Nenhum desafio em destaque disponível'}), 404
    
    # Obter resultado do usuário para este desafio
    resultado = Resultado.query.filter_by(usuario_id=int(current_user_id), desafio_id=desafio.id).first()
    
    # Preparar dados para retorno
    desafio_dict = desafio.to_dict()
    
    # Adicionar informações sobre o progresso do usuário neste desafio
    if resultado:
        desafio_dict['progresso'] = resultado.to_dict()
    else:
        desafio_dict['progresso'] = None
    
    return jsonify({
        'message': 'Desafio em destaque obtido com sucesso',
        'desafio': desafio_dict
    }), 200

@desafio_bp.route('/<int:desafio_id>/perguntas', methods=['GET'])
@jwt_required()
def obter_perguntas(desafio_id):
    desafio = Desafio.query.get(desafio_id)
    if not desafio:
        return jsonify({'message': 'Desafio não encontrado'}), 404
    
    perguntas = desafio.perguntas  # já é uma lista/dict, não precisa .to_dict()
    return jsonify({'perguntas': perguntas}), 200

@desafio_bp.route('/<int:desafio_id>/resultado-quiz', methods=['GET'])
@jwt_required()
def obter_resultado_quiz(desafio_id):
    """
    Endpoint para obter o resultado do quiz de um desafio
    """
    current_user_id = get_jwt_identity()
    resultado = Resultado.query.filter_by(usuario_id=current_user_id, desafio_id=desafio_id).first()
    if not resultado:
        return jsonify({'message': 'Resultado não encontrado'}), 404
    
    return jsonify({
        'desafioConcluido': resultado.status == 'concluído',
        'pontuacaoQuiz': resultado.pontuacao
    }), 200

@desafio_bp.route('/<int:desafio_id>/concluir', methods=['POST'])
@jwt_required()
def concluir_desafio(desafio_id):
    """
    Endpoint para marcar um desafio como concluído
    """
    current_user_id = get_jwt_identity()
    resultado = Resultado.query.filter_by(usuario_id=current_user_id, desafio_id=desafio_id).first()
    if not resultado:
        return jsonify({'message': 'Desafio não iniciado'}), 400

    if resultado.status == 'concluído':
        return jsonify({'message': 'Desafio já foi concluído anteriormente'}), 200

    resultado.status = 'concluído'
    resultado.data_conclusao = datetime.utcnow()

    # Adicionar XP ao usuário
    usuario = Usuario.query.get(current_user_id)
    if usuario:
        usuario.adicionar_xp(10)  # Defina o valor de XP por desafio concluído (exemplo: 50)
        db.session.add(usuario)

    db.session.commit()

    return jsonify({'message': 'Desafio concluído com sucesso'}), 200


def calcular_pontuacao_quiz(respostasQuiz, perguntas):
    """
    Função auxiliar para calcular a pontuação do quiz
    """
    # Implementação simplificada: cada resposta correta vale 10 pontos
    pontuacaoQuiz = 0
    
    for pergunta in perguntas:
        id_pergunta = str(pergunta['id'])
        if id_pergunta in respostasQuiz and respostasQuiz[id_pergunta] == pergunta['resposta_correta']:
            pontuacaoQuiz += 10
    
    return pontuacaoQuiz
