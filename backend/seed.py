import os
from flask import Flask
from app import create_app, db
from app.models import Usuario, PerguntaTeste, Desafio, Turma, TesteInicialLikert
from datetime import datetime, timedelta, timezone

def seed_perguntas_teste():
    if PerguntaTeste.query.count() == 0:
        print("Criando perguntas do teste inicial...")
        perguntas = [
            PerguntaTeste(
                texto="Eu me sinto confortável ao expressar minhas opiniões em grupo",
                categoria="Comunicação",
                ordem=1
            ),
            PerguntaTeste(
                texto="Consigo identificar facilmente como as outras pessoas estão se sentindo",
                categoria="Empatia",
                ordem=2
            ),
            PerguntaTeste(
                texto="Mantenho a calma em situações de pressão ou conflito",
                categoria="Inteligência Emocional",
                ordem=3
            ),
            PerguntaTeste(
                texto="Adapto facilmente minha forma de comunicação dependendo da pessoa com quem estou falando",
                categoria="Comunicação Adaptativa",
                ordem=4
            ),
            PerguntaTeste(
                texto="Consigo trabalhar produtivamente mesmo quando discordo das pessoas da equipe",
                categoria="Trabalho em Equipe",
                ordem=5
            ),
            PerguntaTeste(
                texto="Tenho facilidade para receber e processar feedback construtivo",
                categoria="Desenvolvimento Pessoal",
                ordem=6
            ),
            PerguntaTeste(
                texto="Costumo ouvir atentamente antes de formar uma opinião ou responder",
                categoria="Escuta Ativa",
                ordem=7
            ),
            PerguntaTeste(
                texto="Reconheço e assumo responsabilidade pelos meus erros",
                categoria="Autoconsciência",
                ordem=8
            ),
            PerguntaTeste(
                texto="Consigo mediar conflitos entre pessoas de forma construtiva",
                categoria="Resolução de Conflitos",
                ordem=9
            ),
            PerguntaTeste(
                texto="Mantenho-me motivado mesmo diante de desafios difíceis",
                categoria="Resiliência",
                ordem=10
            )
        ]
        db.session.add_all(perguntas)
        db.session.commit()
        print(f"Criadas {len(perguntas)} perguntas do teste inicial.")

def seed_usuarios_exemplo():
    """Cria usuários de exemplo para V2"""
    print("Criando usuários de exemplo...")
    
    # Professor exemplo
    if Usuario.query.filter_by(email='professor@humaniq.com').first() is None:
        professor = Usuario(
            nome='Prof. Maria Silva',
            email='professor@humaniq.com',
            senha='professor123'
        )
        professor.tipo_usuario = 'professor'
        db.session.add(professor)
        db.session.commit()
        print("Professor exemplo criado!")
    
    # Aluno independente (mantém compatibilidade V1)
    if Usuario.query.filter_by(email='teste@gmail.com').first() is None:
        aluno_independente = Usuario(
            nome='Usuário Teste',
            email='teste@gmail.com',
            senha='teste123'
        )
        aluno_independente.tipo_usuario = 'aluno'
        db.session.add(aluno_independente)
        db.session.commit()
        print("Aluno independente criado!")
    
    # Alunos de exemplo
    alunos_exemplo = [
        ('João Santos', 'joao@exemplo.com'),
        ('Ana Costa', 'ana@exemplo.com'),
        ('Pedro Lima', 'pedro@exemplo.com'),
        ('Carla Souza', 'carla@exemplo.com')
    ]
    
    for nome, email in alunos_exemplo:
        if Usuario.query.filter_by(email=email).first() is None:
            aluno = Usuario(nome=nome, email=email, senha='123456')
            aluno.tipo_usuario = 'aluno'
            db.session.add(aluno)
    
    db.session.commit()
    print("Alunos de exemplo criados!")

def seed_turmas_exemplo():
    """Cria turmas de exemplo"""
    print("Criando turmas de exemplo...")
    
    professor = Usuario.query.filter_by(email='professor@humaniq.com').first()
    if professor and Turma.query.count() == 0:
        # Turma exemplo
        turma = Turma(
            nome='Desenvolvimento Socioemocional 2024',
            professor_id=professor.id,
            descricao='Turma focada no desenvolvimento de habilidades socioemocionais para estudantes universitários.'
        )
        db.session.add(turma)
        db.session.commit()
        
        # Adicionar alguns alunos à turma
        alunos = Usuario.query.filter_by(tipo_usuario='aluno').limit(3).all()
        for aluno in alunos:
            if aluno.email != 'teste@gmail.com':  # Manter aluno independente
                aluno.turma_id = turma.id
        
        db.session.commit()
        print(f"Turma '{turma.nome}' criada com código: {turma.codigo}")

def seed_testes_likert_exemplo():
    """Cria testes Likert de exemplo"""
    print("Criando testes Likert de exemplo...")
    
    alunos_com_turma = Usuario.query.filter(
        Usuario.tipo_usuario == 'aluno',
        Usuario.turma_id.isnot(None)
    ).all()
    
    for aluno in alunos_com_turma:
        if not TesteInicialLikert.query.filter_by(usuario_id=aluno.id).first():
            # Respostas simuladas (valores entre 1-5)
            respostas_exemplo = {
                '1': 4, '2': 3, '3': 4, '4': 5, '5': 3,
                '6': 4, '7': 3, '8': 4, '9': 3, '10': 4
            }
            
            teste = TesteInicialLikert(
                usuario_id=aluno.id,
                respostas=respostas_exemplo,
                analise_ia="Análise de exemplo: O aluno demonstra boas habilidades de comunicação e inteligência emocional, com oportunidades de crescimento em trabalho em equipe."
            )
            teste.calcular_pontuacoes()
            db.session.add(teste)
            
            # Marcar teste como concluído
            aluno.teste_inicial_concluido = True
    
    db.session.commit()
    print("Testes Likert de exemplo criados!")

def seed_database():
    """
    Função para popular o banco de dados com dados iniciais
    """
    print("Iniciando população do banco de dados...")
    
    # Criar usuários de exemplo (V2)
    seed_usuarios_exemplo()
    
    # Criar perguntas do teste inicial
    seed_perguntas_teste()
    
    # Criar turmas de exemplo
    seed_turmas_exemplo()
    
    # Criar testes Likert de exemplo
    seed_testes_likert_exemplo()
    
    # Criar desafios de exemplo
    prazo = datetime.now(timezone.utc) + timedelta(days=7)
    if Desafio.query.count() == 0:
        print("Criando desafios de exemplo...")
        desafios = [
            Desafio(
                titulo="Comunicação Assertiva",
                descricao="Aprenda a se comunicar de forma clara, direta e respeitosa, expressando suas ideias e sentimentos sem agredir ou submeter-se aos outros.",
                video_url="https://www.youtube.com/watch?v=rqE_mxXlZik",
                status="ativo",
                prazo=prazo,
                perguntas=[
                    {"id": 1, "texto": "Qual é o principal objetivo da comunicação assertiva?", "opcoes": ["Impor sua opinião", "Expressar-se sem agredir ou submeter-se", "Evitar conflitos a todo custo", "Falar o mínimo possível"], "resposta_correta": "Expressar-se sem agredir ou submeter-se"},
                    {"id": 2, "texto": "Qual destas NÃO é uma característica da comunicação assertiva?", "opcoes": ["Clareza", "Respeito", "Manipulação", "Honestidade"], "resposta_correta": "Manipulação"},
                    {"id": 3, "texto": "Qual a diferença entre comunicação assertiva e agressiva?", "opcoes": ["Não há diferença", "A assertiva respeita os direitos dos outros, a agressiva não", "A assertiva é sempre passiva", "A agressiva é mais eficaz"], "resposta_correta": "A assertiva respeita os direitos dos outros, a agressiva não"}
                ],
                desafio_pratico="Identifique uma situação recente em que você não se comunicou de forma assertiva. Descreva como poderia ter agido diferente usando os princípios da comunicação assertiva."
            ),
            Desafio(
                titulo="Inteligência Emocional",
                descricao="Desenvolva sua capacidade de reconhecer e gerenciar suas próprias emoções e compreender as emoções dos outros.",
                video_url="https://www.youtube.com/watch?v=PAVaaGa_gug",
                status="ativo",
                prazo=prazo,
                perguntas=[
                    {"id": 1, "texto": "Quais são os quatro componentes principais da inteligência emocional segundo Daniel Goleman?", "opcoes": ["Autoconsciência, autogestão, consciência social e gestão de relacionamentos", "Felicidade, tristeza, raiva e medo", "QI, personalidade, motivação e sorte", "Pensamento, sentimento, intuição e sensação"], "resposta_correta": "Autoconsciência, autogestão, consciência social e gestão de relacionamentos"},
                    {"id": 2, "texto": "Por que a inteligência emocional é importante no ambiente de trabalho?", "opcoes": ["Não é importante, apenas o conhecimento técnico importa", "Ajuda a manipular colegas", "Melhora o trabalho em equipe e a liderança", "Permite ignorar problemas interpessoais"], "resposta_correta": "Melhora o trabalho em equipe e a liderança"},
                    {"id": 3, "texto": "Como podemos desenvolver nossa inteligência emocional?", "opcoes": ["Nascemos com ela, não pode ser desenvolvida", "Apenas através de terapia", "Através de prática, reflexão e feedback", "Ignorando nossas emoções"], "resposta_correta": "Através de prática, reflexão e feedback"}
                ],
                desafio_pratico="Mantenha um diário emocional por uma semana, anotando situações que despertaram emoções intensas, como você reagiu e como poderia ter gerenciado melhor essas emoções."
            ),
            Desafio(
                titulo="Empatia e Escuta Ativa",
                descricao="Aprenda a se colocar no lugar do outro e a ouvir verdadeiramente, sem julgamentos ou interrupções.",
                video_url="https://www.youtube.com/watch?v=K5Kj-G7aVvY&t=60s",
                status="ativo",
                prazo=prazo,
                perguntas=[
                    {"id": 1, "texto": "O que é escuta ativa?", "opcoes": ["Ouvir enquanto faz outras atividades", "Ouvir atentamente, demonstrando interesse e compreensão", "Concordar com tudo que a pessoa diz", "Interromper para dar conselhos"], "resposta_correta": "Ouvir atentamente, demonstrando interesse e compreensão"},
                    {"id": 2, "texto": "Qual destas NÃO é uma técnica de escuta ativa?", "opcoes": ["Parafrasear o que foi dito", "Fazer perguntas para clarificar", "Manter contato visual", "Pensar na sua resposta enquanto a pessoa fala"], "resposta_correta": "Pensar na sua resposta enquanto a pessoa fala"},
                    {"id": 3, "texto": "Como a empatia se relaciona com a escuta ativa?", "opcoes": ["Não há relação entre elas", "A empatia dificulta a escuta ativa", "A escuta ativa é uma forma de demonstrar empatia", "Empatia é o oposto de escuta ativa"], "resposta_correta": "A escuta ativa é uma forma de demonstrar empatia"}
                ],
                desafio_pratico="Escolha uma pessoa próxima e pratique a escuta ativa em uma conversa. Não interrompa, faça perguntas abertas e demonstre que está realmente interessado. Depois, reflita sobre como foi a experiência."
            )
        ]
        db.session.add_all(desafios)
        db.session.commit()
        print(f"Criados {len(desafios)} desafios de exemplo.")
    
    print("População do banco de dados concluída com sucesso!")

if __name__ == '__main__':
    # Criar a aplicação com configuração de desenvolvimento
    app = create_app('development')
    
    # Criar contexto da aplicação
    with app.app_context():
        # Criar todas as tabelas
        db.create_all()
        
        # Popular o banco de dados
        seed_database()
