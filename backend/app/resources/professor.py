from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Usuario, Turma, Desafio, Resultado, TesteInicialLikert
from app import db
import os

professor_bp = Blueprint('professor', __name__)


@professor_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard_professor():
    """Dashboard do professor com estatísticas gerais"""
    try:
        user_id = get_jwt_identity()
        professor = Usuario.query.get(user_id)
        
        if not professor or professor.tipo_usuario != 'professor':
            return jsonify({'message': 'Acesso negado. Apenas professores podem acessar.'}), 403
        
        # Estatísticas gerais
        turmas = Turma.query.filter_by(professor_id=user_id, ativa=True).all()
        total_alunos = sum(len(turma.alunos) for turma in turmas)
        total_desafios = Desafio.query.filter_by(criado_por=user_id).count()
        
        # Progresso dos alunos
        alunos_com_teste = 0
        for turma in turmas:
            for aluno in turma.alunos:
                if aluno.teste_inicial_concluido:
                    alunos_com_teste += 1
        
        return jsonify({
            'professor': professor.to_dict(),
            'estatisticas': {
                'total_turmas': len(turmas),
                'total_alunos': total_alunos,
                'total_desafios': total_desafios,
                'alunos_com_teste': alunos_com_teste,
                'taxa_conclusao_teste': (alunos_com_teste / total_alunos * 100) if total_alunos > 0 else 0
            },
            'turmas': [turma.to_dict() for turma in turmas]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor', 'error': str(e)}), 500

@professor_bp.route('/turmas', methods=['GET'])
@jwt_required()
def listar_turmas():
    """Lista todas as turmas do professor"""
    try:
        user_id = get_jwt_identity()
        professor = Usuario.query.get(user_id)
        
        if not professor or professor.tipo_usuario != 'professor':
            return jsonify({'message': 'Acesso negado. Apenas professores podem acessar.'}), 403
        
        turmas = Turma.query.filter_by(professor_id=user_id).all()
        return jsonify({
            'turmas': [turma.to_dict() for turma in turmas]
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor', 'error': str(e)}), 500

@professor_bp.route('/turmas', methods=['POST'])
@jwt_required()
def criar_turma():
    """Cria uma nova turma"""
    try:
        user_id = get_jwt_identity()
        professor = Usuario.query.get(user_id)
        
        if not professor or professor.tipo_usuario != 'professor':
            return jsonify({'message': 'Acesso negado. Apenas professores podem acessar.'}), 403
        
        data = request.get_json()
        if not data or not data.get('nome'):
            return jsonify({'message': 'Nome da turma é obrigatório.'}), 400
        
        nova_turma = Turma(
            nome=data.get('nome'),
            professor_id=user_id,
            descricao=data.get('descricao', '')
        )
        
        db.session.add(nova_turma)
        db.session.commit()
        
        return jsonify({
            'message': 'Turma criada com sucesso!',
            'turma': nova_turma.to_dict()
        }), 201
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor', 'error': str(e)}), 500

@professor_bp.route('/turmas/<int:turma_id>/alunos', methods=['GET'])
@jwt_required()
def listar_alunos_turma(turma_id):
    """Lista alunos de uma turma específica"""
    try:
        user_id = get_jwt_identity()
        professor = Usuario.query.get(user_id)
        
        if not professor or professor.tipo_usuario != 'professor':
            return jsonify({'message': 'Acesso negado. Apenas professores podem acessar.'}), 403
        
        turma = Turma.query.filter_by(id=turma_id, professor_id=user_id).first()
        if not turma:
            return jsonify({'message': 'Turma não encontrada.'}), 404
        
        alunos_data = []
        for aluno in turma.alunos:
            aluno_dict = aluno.to_dict()
            
            # Adicionar informações do teste Likert
            teste_likert = TesteInicialLikert.query.filter_by(usuario_id=aluno.id).first()
            if teste_likert:
                aluno_dict['teste_likert'] = teste_likert.to_dict()
            
            # Adicionar progresso nos desafios
            resultados = Resultado.query.filter_by(usuario_id=aluno.id).all()
            aluno_dict['total_desafios_concluidos'] = len([r for r in resultados if r.status == 'concluído'])
            aluno_dict['total_desafios_pendentes'] = len([r for r in resultados if r.status == 'pendente'])
            
            alunos_data.append(aluno_dict)
        
        return jsonify({
            'turma': turma.to_dict(),
            'alunos': alunos_data
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor', 'error': str(e)}), 500

@professor_bp.route('/relatorio-turma/<int:turma_id>', methods=['GET'])
@jwt_required()
def relatorio_turma(turma_id):
    """Gera relatório detalhado de uma turma"""
    try:
        user_id = get_jwt_identity()
        professor = Usuario.query.get(user_id)
        
        if not professor or professor.tipo_usuario != 'professor':
            return jsonify({'message': 'Acesso negado. Apenas professores podem acessar.'}), 403
        
        turma = Turma.query.filter_by(id=turma_id, professor_id=user_id).first()
        if not turma:
            return jsonify({'message': 'Turma não encontrada.'}), 404
        
        # Estatísticas da turma
        total_alunos = len(turma.alunos)
        alunos_com_teste = sum(1 for aluno in turma.alunos if aluno.teste_inicial_concluido)
        
        # Médias por categoria do teste Likert
        categorias_medias = {
            'comunicacao': 0,
            'empatia': 0,
            'inteligencia_emocional': 0,
            'trabalho_equipe': 0,
            'lideranca': 0
        }
        
        testes_realizados = 0
        for aluno in turma.alunos:
            teste = TesteInicialLikert.query.filter_by(usuario_id=aluno.id).first()
            if teste:
                testes_realizados += 1
                for categoria in categorias_medias:
                    valor = getattr(teste, f'pontuacao_{categoria}')
                    if valor:
                        categorias_medias[categoria] += valor
        
        # Calcular médias
        if testes_realizados > 0:
            for categoria in categorias_medias:
                categorias_medias[categoria] /= testes_realizados
        
        # Progresso nos desafios
        desafios_turma = Desafio.query.filter_by(turma_id=turma_id).all()
        progresso_desafios = []
        
        for desafio in desafios_turma:
            resultados = Resultado.query.filter_by(desafio_id=desafio.id).all()
            concluidos = len([r for r in resultados if r.status == 'concluído'])
            total = len(resultados)
            
            progresso_desafios.append({
                'desafio': desafio.to_dict(),
                'total_participantes': total,
                'concluidos': concluidos,
                'taxa_conclusao': (concluidos / total * 100) if total > 0 else 0
            })
        
        return jsonify({
            'turma': turma.to_dict(),
            'estatisticas': {
                'total_alunos': total_alunos,
                'alunos_com_teste': alunos_com_teste,
                'taxa_teste_concluido': (alunos_com_teste / total_alunos * 100) if total_alunos > 0 else 0,
                'medias_categorias': categorias_medias
            },
            'progresso_desafios': progresso_desafios
        }), 200
        
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor', 'error': str(e)}), 500

@professor_bp.route('/desafios', methods=['POST'])
@jwt_required()
def criar_desafio_manual():
    """Cria um desafio manualmente"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        required_fields = ['titulo', 'descricao', 'perguntas', 'desafio_pratico', 'video_url', 'turma_id']
        for field in required_fields:
            if field not in data:
                return jsonify({'message': f'Campo obrigatório ausente: {field}'}), 400

        novo_desafio = Desafio(
            titulo=data['titulo'],
            descricao=data['descricao'],
            perguntas=data['perguntas'],
            desafio_pratico=data['desafio_pratico'],
            video_url=data.get('video_url', ''),
            criado_por=user_id,
            turma_id=data['turma_id'],
            gerado_por_ia=False,
            status='ativo'
        )
        db.session.add(novo_desafio)
        db.session.commit()
        return jsonify({'message': 'Desafio criado com sucesso!', 'desafio': novo_desafio.to_dict()}), 201
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor', 'error': str(e)}), 500

@professor_bp.route('/desafios/<int:desafio_id>', methods=['PUT'])
@jwt_required()
def editar_desafio(desafio_id):
    try:
        user_id = get_jwt_identity()
        desafio = Desafio.query.get(desafio_id)
        if not desafio or desafio.criado_por != user_id:
            return jsonify({'message': 'Desafio não encontrado ou acesso negado'}), 404
        data = request.get_json()
        for field in ['titulo', 'descricao', 'perguntas', 'desafio_pratico', 'video_url']:
            if field in data:
                setattr(desafio, field, data[field])
        db.session.commit()
        return jsonify({'message': 'Desafio atualizado!', 'desafio': desafio.to_dict()}), 200
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor', 'error': str(e)}), 500

@professor_bp.route('/desafios/<int:desafio_id>', methods=['DELETE'])
@jwt_required()
def deletar_desafio(desafio_id):
    try:
        user_id = get_jwt_identity()
        desafio = Desafio.query.get(desafio_id)
        if not desafio or desafio.criado_por != user_id:
            return jsonify({'message': 'Desafio não encontrado ou acesso negado'}), 404
        db.session.delete(desafio)
        db.session.commit()
        return jsonify({'message': 'Desafio deletado com sucesso!'}), 200
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor', 'error': str(e)}), 500

@professor_bp.route('/turmas/<int:turma_id>', methods=['PUT'])
@jwt_required()
def editar_turma(turma_id):
    """Editar turma"""
    try:
        user_id = get_jwt_identity()
        turma = Turma.query.filter_by(id=turma_id, professor_id=user_id).first()
        if not turma:
            return jsonify({'message': 'Turma não encontrada ou acesso negado.'}), 404
        data = request.get_json()
        if 'nome' in data:
            turma.nome = data['nome']
        if 'descricao' in data:
            turma.descricao = data['descricao']
        db.session.commit()
        return jsonify({'message': 'Turma atualizada com sucesso!', 'turma': turma.to_dict()}), 200
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor', 'error': str(e)}), 500

@professor_bp.route('/turmas/<int:turma_id>', methods=['DELETE'])
@jwt_required()
def deletar_turma(turma_id):
    """Excluir turma"""
    try:
        user_id = get_jwt_identity()
        turma = Turma.query.filter_by(id=turma_id, professor_id=user_id).first()
        if not turma:
            return jsonify({'message': 'Turma não encontrada ou acesso negado.'}), 404
        db.session.delete(turma)
        db.session.commit()
        return jsonify({'message': 'Turma excluída com sucesso!'}), 200
    except Exception as e:
        return jsonify({'message': 'Erro interno do servidor', 'error': str(e)}), 500
