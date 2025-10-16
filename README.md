#  RPG Conjunto - Plataforma de Gerenciamento

![License](https://img.shields.io/badge/license-MIT-blue.svg)

Bem-vindo à plataforma de gerenciamento de RPG Conjunto! Este projeto é um monorepo que contém um backend em Node.js e um frontend em Next.js, projetado para facilitar a criação e o gerenciamento de campanhas e personagens de RPG de mesa.

## ✨ Funcionalidades

- **Gerenciamento de Campanhas**: Crie, edite e visualize suas campanhas de RPG.
- **Criação de Personagens**: Um fluxo guiado e detalhado para criar personagens, com cálculos automáticos de atributos e estatísticas.
- **Sistema de Convites**: Convide jogadores para suas campanhas via e-mail ou com um link permanente.
- **Autenticação**: Sistema seguro de registro e login de usuários.

## 🛠️ Tecnologias Utilizadas

O projeto é containerizado com Docker para garantir um ambiente de desenvolvimento consistente.

| Serviço      | Tecnologia/Framework | Descrição                                      |
|--------------|----------------------|--------------------------------------------------|
| `frontend`   | Next.js, React, TypeScript, Tailwind CSS | Interface do usuário e experiência do cliente.   |
| `backend`    | Node.js, Express, TypeScript, Prisma ORM | API REST, lógica de negócios e acesso ao banco. |
| `mysql`      | MySQL                | Banco de dados relacional para persistência.     |
| `phpmyadmin` | phpMyAdmin           | Interface web para gerenciamento do MySQL.       |

## 🚀 Começando

Siga os passos abaixo para configurar e executar o projeto localmente.

### Pré-requisitos

- Docker e Docker Compose
- Git

### 1. Clone o Repositório

```bash
git clone https://github.com/seu-usuario/rpg-conjunto-site.git
cd rpg-conjunto-site
```

### 2. Configure as Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto, copiando o exemplo `.env.example`. Este arquivo centraliza as configurações que serão usadas pelo Docker Compose.

```bash
cp .env.example .env
```

Agora, edite o arquivo `.env` e preencha as variáveis com os valores desejados.

### 3. Suba os Containers

Com o Docker em execução, suba todos os serviços em modo "detached" (-d) e force a reconstrução das imagens (--build) na primeira vez.

```bash
docker compose up -d --build
```

Após a conclusão, os serviços estarão disponíveis nos seguintes endereços (considerando as portas padrão do `.env.example`):

- **Frontend**: http://localhost:4000
- **Backend**: http://localhost:3000
- **phpMyAdmin**: http://localhost:8080

## 💻 Desenvolvimento

Para garantir a qualidade e a consistência do código, utilizamos `pre-commit` hooks que executam linters, formatadores e checagens de tipo antes de cada commit.

### Configurando os Hooks de Pré-Commit

1.  Instale o `pre-commit`:
    ```bash
    # Usando pip (recomendado)
    pip install pre-commit

    # Ou usando Homebrew (macOS)
    brew install pre-commit
    ```

2.  Instale os hooks no seu repositório local:
    ```bash
    pre-commit install
    ```

A partir de agora, os hooks serão executados automaticamente a cada `git commit`.

### Comandos Úteis do Docker Compose

- **Ver logs de um serviço**:
  ```bash
  docker compose logs -f <nome-do-servico> # ex: backend
  ```
- **Acessar o terminal de um container**:
  ```bash
  docker compose exec <nome-do-servico> bash
  ```
- **Parar todos os serviços**:
  ```bash
  docker compose down
  ```

## scripts

A pasta `/scripts` contém automações úteis para o gerenciamento do ambiente Docker.

- **`reset_docker_compose.sh`**: Para e remove todos os containers, volumes, redes e imagens associadas ao projeto, e então recria tudo do zero em modo `detached`. **Atenção: todos os dados do banco de dados serão perdidos.**
  ```bash
  ./scripts/reset_docker_compose.sh
  ```
- **`reset_docker_compose_dev.sh`**: Similar ao script anterior, mas sobe os containers em modo interativo, exibindo os logs diretamente no terminal. Útil para depuração.
  ```bash
  ./scripts/reset_docker_compose_dev.sh
  ```

> **Dica**: Dê permissão de execução aos scripts com `chmod +x scripts/*.sh`.

## 📁 Estrutura do Projeto

```
rpg-conjunto-site/
├── backend/         # Código-fonte da API (Node.js, Prisma)
├── frontend/        # Código-fonte da interface (Next.js)
├── scripts/         # Scripts de automação
├── .env.example     # Exemplo de variáveis de ambiente
├── .pre-commit-config.yaml # Configuração dos hooks de pré-commit
├── docker-compose.yml # Orquestração dos serviços Docker
└── README.md        # Este arquivo
```
