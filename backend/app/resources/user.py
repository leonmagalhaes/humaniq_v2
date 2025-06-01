from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Usuario, Avaliacao, Resultado
from app import db
from werkzeug.security import generate_password_hash

user_bp = Blueprint('user', __name__)

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def obter_perfil():
    """
    Endpoint para obter o perfil do usuário autenticado
    ---
    Requer:
      - Token de acesso JWT válido
    Retorna:
      - Informações do perfil do usuário
    """
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(int(current_user_id))
    
    if not usuario:
        return jsonify({'message': 'Usuário não encontrado'}), 404
    
    # Obter avaliações e resultados do usuário
    avaliacoes = Avaliacao.query.filter_by(usuario_id=int(current_user_id)).all()
    resultados = Resultado.query.filter_by(usuario_id=int(current_user_id)).all()
    
    # Preparar dados para retorno
    perfil = usuario.to_dict()
    perfil['avaliacoes'] = [avaliacao.to_dict() for avaliacao in avaliacoes]
    perfil['resultados'] = [resultado.to_dict() for resultado in resultados]
    
    return jsonify({
        'message': 'Perfil obtido com sucesso',
        'perfil': perfil
    }), 200

@user_bp.route('/perfil', methods=['PUT'])
@jwt_required()
def atualizar_perfil():
    """
    Endpoint para atualizar o perfil do usuário autenticado
    ---
    Requer:
      - Token de acesso JWT válido
    Parâmetros:
      - nome: Novo nome do usuário (opcional)
      - email: Novo email do usuário (opcional)
      - senha_atual: Senha atual (obrigatória para alterar a senha)
      - nova_senha: Nova senha (opcional)
    Retorna:
      - Informações atualizadas do perfil
    """
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(int(current_user_id))
    
    if not usuario:
        return jsonify({'message': 'Usuário não encontrado'}), 404
    
    data = request.get_json()
    
    if not data:
        return jsonify({'message': 'Nenhum dado fornecido para atualização'}), 400
    
    # Atualizar nome se fornecido
    if 'nome' in data and data['nome']:
        usuario.nome = data['nome']
    
    # Atualizar email se fornecido
    if 'email' in data and data['email']:
        # Verificar se o novo email já está em uso por outro usuário
        email_existente = Usuario.query.filter_by(email=data['email']).first()
        if email_existente and email_existente.id != int(current_user_id):
            return jsonify({'message': 'Email já está em uso por outro usuário'}), 409
        
        usuario.email = data['email']
    
    # Atualizar senha se fornecida
    if 'nova_senha' in data and data['nova_senha']:
        # Verificar se a senha atual foi fornecida e está correta
        if not data.get('senha_atual'):
            return jsonify({'message': 'Senha atual é obrigatória para alterar a senha'}), 400
        
        if not usuario.verificar_senha(data['senha_atual']):
            return jsonify({'message': 'Senha atual incorreta'}), 401
        
        # Atualizar a senha
        usuario.senha_hash = generate_password_hash(data['nova_senha'])
    
    # Salvar alterações
    db.session.commit()
    
    return jsonify({
        'message': 'Perfil atualizado com sucesso',
        'usuario': usuario.to_dict()
    }), 200

@user_bp.route('/progresso', methods=['GET'])
@jwt_required()
def obter_progresso():
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(int(current_user_id))
    
    if not usuario:
        return jsonify({'message': 'Usuário não encontrado'}), 404
    
    # Obter resultados dos desafios do usuário
    resultados = Resultado.query.filter_by(
        usuario_id=int(current_user_id),
        status='concluído'
    ).order_by(Resultado.data_conclusao.asc()).all()
    
    progresso = {
        'nivel': usuario.nivel,
        'xp': usuario.xp,
        'proximo_nivel_xp': usuario.calcular_proximo_nivel_xp(),
        'desafios_concluidos': usuario.calcular_desafios_concluidos(),
        'sequencia': usuario.calcular_sequencia(),
        'resultados': [{
            'data_conclusao': r.data_conclusao.strftime('%d/%m/%Y'),
            'pontuacao': r.pontuacao
        } for r in resultados]
    }
    
    return jsonify({
        'message': 'Progresso obtido com sucesso',
        'progresso': progresso
    }), 200

@user_bp.route('/challenge-history', methods=['GET'])
@jwt_required()
def obter_historico_desafios():
    """
    Endpoint para obter o histórico de desafios do usuário
    ---
    Requer:
      - Token de acesso JWT válido
    Retorna:
      - Lista de desafios concluídos pelo usuário
    """
    current_user_id = get_jwt_identity()
    
    # Obter resultados dos desafios concluídos
    resultados = Resultado.query.filter_by(usuario_id=int(current_user_id), status='concluído').all()
    
    historico = [
        {
            'id': resultado.desafio_id,
            'titulo': resultado.desafio.titulo,
            'data_conclusao': resultado.data_conclusao.isoformat(),
            'pontuacao': resultado.pontuacao
        }
        for resultado in resultados
    ]
    
    return jsonify({
        'message': 'Histórico de desafios obtido com sucesso',
        'historico': historico
    }), 200

@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Endpoint para obter informações do usuário atual
    ---
    Requer:
    - Token de acesso JWT válido
    Retorna:
    - Informações do usuário atual
    """
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(int(current_user_id))

    if not usuario:
        return jsonify({'message': 'Usuário não encontrado'}), 404

    return jsonify({
        'message': 'Usuário obtido com sucesso',
        'usuario': usuario.to_dict()
    }), 200

@user_bp.route('/initial-test-status', methods=['GET'])
@jwt_required()
def verificar_teste_inicial():
    """
    Endpoint para verificar se o teste inicial foi concluído
    """
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(current_user_id)

    if not usuario:
        return jsonify({'message': 'Usuário não encontrado'}), 404

    # Supondo que o status do teste inicial está armazenado no campo `teste_inicial_concluido`
    return jsonify({'done': usuario.teste_inicial_concluido}), 200

@user_bp.route('/register', methods=['POST'])
def registro():
    data = request.get_json()

    if not data or not data.get('nome') or not data.get('email') or not data.get('senha'):
        return jsonify({'message': 'Dados incompletos. Nome, email e senha são obrigatórios.'}), 400

    if Usuario.query.filter_by(email=data.get('email')).first():
        return jsonify({'message': 'Email já cadastrado. Utilize outro email.'}), 409

    novo_usuario = Usuario(
        nome=data.get('nome'),
        email=data.get('email'),
        senha=data.get('senha'),
        teste_inicial_concluido=False  # Define como False por padrão
    )

    db.session.add(novo_usuario)
    db.session.commit()

    return jsonify({'message': 'Usuário registrado com sucesso'}), 201

@user_bp.route('/complete-initial-test', methods=['POST'])
@jwt_required()
def concluir_teste_inicial():
    """
    Endpoint para marcar o teste inicial como concluído
    """
    current_user_id = get_jwt_identity()
    usuario = Usuario.query.get(current_user_id)

    if not usuario:
        return jsonify({'message': 'Usuário não encontrado'}), 404

    usuario.teste_inicial_concluido = True
    db.session.commit()

    return jsonify({'message': 'Teste inicial concluído com sucesso'}), 200