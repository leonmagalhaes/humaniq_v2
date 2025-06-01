import json
from app import create_app, db
from app.models.user import User
from app.models.assessment import Pergunta
from app.models.desafio import Desafio

def seed_database():
    print("Iniciando população do banco de dados...")
    
    # Criar usuário de teste
    if not User.query.filter_by(email='teste@humaniq.com.br').first():
        usuario_teste = User(
            nome='Usuário Teste',
            email='teste@humaniq.com.br'
        )
        usuario_teste.set_senha('senha123')
        db.session.add(usuario_teste)
        print("Usuário de teste criado.")
    
    # Criar perguntas do teste inicial
    if Pergunta.query.count() == 0:
        perguntas = [
            {"texto": "Eu me sinto confortável expressando minhas emoções.", "categoria": "emocional"},
            {"texto": "Consigo identificar facilmente o que estou sentindo.", "categoria": "emocional"},
            {"texto": "Tenho facilidade em me colocar no lugar dos outros.", "categoria": "social"},
            {"texto": "Consigo manter a calma em situações de estresse.", "categoria": "emocional"},
            {"texto": "Tenho boas relações interpessoais no trabalho/escola.", "categoria": "social"},
            {"texto": "Consigo resolver conflitos de forma construtiva.", "categoria": "social"},
            {"texto": "Tenho consciência das minhas forças e fraquezas.", "categoria": "autoconhecimento"},
            {"texto": "Consigo me adaptar facilmente a mudanças.", "categoria": "adaptabilidade"},
            {"texto": "Tenho facilidade em tomar decisões importantes.", "categoria": "decisão"},
            {"texto": "Consigo me comunicar claramente com os outros.", "categoria": "comunicação"},
            {"texto": "Tenho objetivos claros para minha vida pessoal e profissional.", "categoria": "propósito"},
            {"texto": "Consigo lidar bem com críticas construtivas.", "categoria": "autoconhecimento"}
        ]
        
        for pergunta_data in perguntas:
            pergunta = Pergunta(
                texto=pergunta_data["texto"],
                categoria=pergunta_data["categoria"]
            )
            db.session.add(pergunta)
        print("Perguntas do teste inicial criadas.")
    
    # Criar desafios
    if Desafio.query.count() == 0:
        desafios = [
            {
                "titulo": "Diário de Emoções",
                "descricao": "Neste desafio, você irá manter um diário de emoções por 7 dias, registrando como se sente em diferentes momentos do dia e identificando os gatilhos dessas emoções.",
                "video_url": "https://www.youtube.com/watch?v=exemplo1"
            },
            {
                "titulo": "Prática de Escuta Ativa",
                "descricao": "Durante este desafio, você irá praticar a escuta ativa em suas conversas, focando completamente no que a outra pessoa está dizendo sem interromper ou pensar na sua resposta.",
                "video_url": "https://www.youtube.com/watch?v=exemplo2"
            },
            {
                "titulo": "Meditação Diária",
                "descricao": "Este desafio consiste em praticar 10 minutos de meditação todos os dias durante uma semana, focando na respiração e observando seus pensamentos sem julgamento.",
                "video_url": "https://www.youtube.com/watch?v=exemplo3"
            }
        ]
        
        for desafio_data in desafios:
            desafio = Desafio(
                titulo=desafio_data["titulo"],
                descricao=desafio_data["descricao"],
                video_url=desafio_data["video_url"],
                status="ativo"
            )
            db.session.add(desafio)
        print("Desafios criados.")
    
    # Commit das alterações
    db.session.commit()
    print("Banco de dados populado com sucesso!")

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        # Criar todas as tabelas
        db.create_all()
        # Popular o banco de dados
        seed_database()
