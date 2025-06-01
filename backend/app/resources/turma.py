
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Usuario, Turma
from app import db

turma_bp = Blueprint('turma', __name__)

@turma_bp.route('/entrar', methods=['POST'])
@jwt_required()
def entrar_turma():
    """Permite que um aluno entre em uma turma usando código"""
    try:
        user_id = get_jwt_identity()
        aluno = Usuario.query.get(user_id)
        
        if not aluno:
            return jsonify({'message': 'Usuário não encontrado.'}), 404
        
        # Verificar se já está em uma turma
        if aluno.turma_id:
            return jsonify({'message': 'Você já está em uma turma. Saia da turma atual primeiro.'}), 400
        
        data = request.get_json()
        if not data or not data.get('codigo'):
            return jsonify({'message': 'Código da turma é obrigatório.'}), 400
        
        codigo = data.get('codigo').upper()
        turma = Turma.query.filter_by(codigo=codigo, ativa=True).first()
        
        if not turma:
            return jsonify({'message': 'Código de turma inválido ou turma inativa.'}), 404
        
        # Adicionar aluno à turma
        aluno.turma_id = turma.id
        aluno.tipo_usuario = 'aluno'  # Garantir que seja aluno
        db.session.commit()
        
        return jsonify({
            'message': f'Você entrou na turma "{turma.nome}" com sucesso!',
            'turma': turma.to_dict(),
            'usuario': aluno.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor', 'error': str(e)}), 500

@turma_bp.route('/sair', methods=['POST'])
@jwt_required()
def sair_turma():
    """Permite que um aluno saia de uma turma"""
    try:
        user_id = get_jwt_identity()
        aluno = Usuario.query.get(user_id)
        
        if not aluno or not aluno.turma_id:
            return jsonify({'message': 'Você não está em nenhuma turma.'}), 400
        
        turma_nome = aluno.turma.nome if aluno.turma else "turma"
        aluno.turma_id = None
        db.session.commit()
        
        return jsonify({
            'message': f'Você saiu da turma "{turma_nome}" com sucesso!',
            'usuario': aluno.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor', 'error': str(e)}), 500

@turma_bp.route('/minha-turma', methods=['GET'])
@jwt_required()
def minha_turma():
    """Retorna informações da turma do aluno"""
    try:
        user_id = get_jwt_identity()
        aluno = Usuario.query.get(user_id)
        
        if not aluno:
            return jsonify({'message': 'Usuário não encontrado.'}), 404
        
        if not aluno.turma_id:
            return jsonify({'message': 'Você não está em nenhuma turma.'}), 404
        
        turma = aluno.turma
        
        # Informações dos colegas de turma
        colegas = []
        for colega in turma.alunos:
            if colega.id != aluno.id:
                colegas.append({
                    'id': colega.id,
                    'nome': colega.nome,
                    'nivel': colega.nivel,
                    'xp': colega.xp,
                    'desafios_concluidos': colega.calcular_desafios_concluidos()
                })
        
        return jsonify({
            'turma': turma.to_dict(),
            'colegas': colegas,
            'total_colegas': len(colegas)
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor', 'error': str(e)}), 500
