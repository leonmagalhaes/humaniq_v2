FROM python:3.11-slim

WORKDIR /app

# Copiar arquivos de dependências
COPY requirements.txt .

RUN apt-get update && apt-get install -y sqlite3

# Instalar dependências
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o código da aplicação
COPY . .

# Copiar o script de entrada
COPY entrypoint.sh .
RUN chmod +x entrypoint.sh

# Variáveis de ambiente
ENV FLASK_APP=run.py
ENV FLASK_CONFIG=production
ENV PYTHONUNBUFFERED=1

# Expor a porta 5000
EXPOSE 5000

# Entrypoint do container
ENTRYPOINT ["./entrypoint.sh"]
