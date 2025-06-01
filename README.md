# HUMANIQ

## Descrição do Projeto

HUMANIQ é uma aplicação web moderna que oferece uma interface amigável para gerenciamento de recursos humanos. O projeto é composto por um backend RESTful desenvolvido em Flask e um frontend interativo construído com React e Tailwind CSS, ambos containerizados com Docker para facilitar a implantação e execução.

## Tecnologias Utilizadas

- **Backend**:
  - Python 3.9+
  - Flask (Framework web)
  - SQLite (Banco de dados)
  - Flask-RESTful (API RESTful)
  - Docker (Containerização)

- **Frontend**:
  - React 18
  - TypeScript
  - Tailwind CSS (Framework CSS)
  - Docker (Containerização)

- **DevOps**:
  - Docker Compose (Orquestração de contêineres)
  - Shell Script (Automação)

## Pré-requisitos

Para executar este projeto, você precisa ter instalado:

- Docker (versão 20.10.0 ou superior)
- Docker Compose (versão 2.0.0 ou superior)
- Git (para clonar o repositório)

## Como Executar o Projeto

### Usando o Script de Inicialização

1. Clone o repositório:
   ```bash
   git clone [URL_DO_REPOSITÓRIO]
   cd humaniq
   ```

2. Execute o script de inicialização:
   ```bash
   ./run.sh
   ```

### Usando Docker Compose Manualmente

1. Clone o repositório:
   ```bash
   git clone [URL_DO_REPOSITÓRIO]
   cd humaniq
   ```

2. Construa e inicie os contêineres:
   ```bash
   docker compose build
   docker compose up -d
   ```

## Como Acessar a Aplicação

- **Frontend**: Acesse http://localhost:3000 no seu navegador
- **Backend API**: Disponível em http://localhost:5000

## Inicialização do Banco de Dados

Para inicializar o banco de dados com dados de exemplo, execute:

```bash
docker compose exec backend python seed.py
```

Este comando executará o script de seed que populará o banco de dados SQLite com dados iniciais necessários para o funcionamento da aplicação.

## Funcionalidades Implementadas

- **Autenticação e Autorização**:
  - Login/Logout de usuários
  - Controle de acesso baseado em perfis

- **Gestão de Funcionários**:
  - Cadastro, edição e exclusão de funcionários
  - Visualização detalhada de perfis
  - Busca e filtragem avançada

- **Gestão de Departamentos**:
  - Criação e gerenciamento de departamentos
  - Associação de funcionários a departamentos

- **Dashboard Analítico**:
  - Visualização de métricas e KPIs
  - Gráficos e relatórios interativos



## Parando os Serviços

Para parar todos os serviços, execute:

```bash
docker compose down
```

Para parar e remover volumes (isso apagará o banco de dados):

```bash
docker compose down -v
```

## Desenvolvimento

### Logs dos Contêineres

Para visualizar os logs do backend:
```bash
docker compose logs -f backend
```

Para visualizar os logs do frontend:
```bash
docker compose logs -f frontend
```

### Acessando o Shell dos Contêineres

Para acessar o shell do backend:
```bash
docker compose exec backend sh
```

Para acessar o shell do frontend:
```bash
docker compose exec frontend sh
```

## Solução de Problemas

- **Erro ao iniciar os contêineres**: Verifique se as portas 3000 e 5000 não estão sendo utilizadas por outros serviços.
- **Frontend não consegue se comunicar com o backend**: Verifique se o backend está rodando corretamente e se a variável de ambiente `REACT_APP_API_URL` está configurada corretamente.
- **Erro no banco de dados**: Execute o comando de seed novamente para reinicializar o banco de dados.
