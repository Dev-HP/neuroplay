# 📁 Estrutura do Projeto NeuroPlay

## 🌳 Árvore de Diretórios

```
neuroplay/
├── 📂 .github/
│   └── workflows/              # GitHub Actions CI/CD
│       ├── backend-ci.yml     # CI do backend
│       ├── deploy-frontend.yml # Deploy do frontend
│       ├── docker-build.yml   # Build do Docker
│       ├── full-stack-ci.yml  # CI completo
│       ├── production.yml     # Pipeline de produção
│       └── test-automation.yml # Testes automatizados
│
├── 📂 backend/                 # Backend Flask (Python)
│   ├── app/                   # Código da aplicação
│   │   ├── api/              # Rotas da API
│   │   │   ├── v1/          # Versão 1 da API
│   │   │   └── middlewares/ # Middlewares (auth, rate limit, etc)
│   │   ├── core/            # Lógica de negócio
│   │   │   ├── entities/    # Entidades de domínio
│   │   │   ├── use_cases/   # Casos de uso
│   │   │   └── interfaces/  # Interfaces/Abstrações
│   │   └── infra/           # Infraestrutura
│   │       ├── cache/       # Redis cache
│   │       ├── monitoring/  # Sentry, métricas
│   │       └── tasks/       # Celery tasks
│   ├── tests/                # Testes do backend
│   ├── app.py               # Ponto de entrada
│   ├── requirements.txt     # Dependências Python
│   └── Dockerfile           # Container do backend
│
├── 📂 frontend/                # Frontend React
│   ├── public/               # Arquivos estáticos
│   ├── src/
│   │   ├── __tests__/       # Testes E2E e integração
│   │   ├── features/        # Features (achievements, etc)
│   │   │   └── achievements/
│   │   │       ├── hooks/   # Custom hooks
│   │   │       ├── services/ # Lógica de negócio
│   │   │       └── __tests__/ # Testes de feature
│   │   ├── games/           # Jogos
│   │   │   ├── CyberRunner/
│   │   │   ├── EchoTemple/
│   │   │   ├── GravityLab/
│   │   │   ├── SonicJump/
│   │   │   └── shared/      # Componentes compartilhados
│   │   ├── pages/           # Páginas/Rotas
│   │   │   ├── Login.js
│   │   │   ├── PainelAluno.js
│   │   │   ├── PainelEducador.js
│   │   │   ├── JogoMestresSinal.js
│   │   │   ├── JogoMemoriaDupla.js
│   │   │   └── JogoCacadorAlvos.js
│   │   ├── shared/          # Código compartilhado
│   │   │   ├── components/  # Componentes reutilizáveis
│   │   │   ├── utils/       # Utilitários
│   │   │   │   ├── aiAdaptation.js
│   │   │   │   ├── errorCascadeDetector.js
│   │   │   │   └── audioManager.js
│   │   │   ├── db/          # IndexedDB
│   │   │   └── sync/        # Background sync
│   │   ├── store/           # Estado global (Zustand)
│   │   ├── App.js           # Componente raiz
│   │   ├── App.css          # Estilos globais
│   │   └── index.css        # Design system
│   ├── package.json         # Dependências Node
│   └── Dockerfile           # Container do frontend
│
├── 📂 database/               # Banco de dados
│   └── schema.sql            # Schema PostgreSQL
│
├── 📂 docs/                   # Documentação
│   ├── guides/               # Guias de usuário
│   │   ├── SETUP.md         # Guia de setup
│   │   └── CI_CD_SETUP.md   # Setup de CI/CD
│   ├── architecture/         # Arquitetura
│   │   ├── ARQUITETURA_V2.md
│   │   ├── CLEAN_ARCHITECTURE_GUIDELINES.md
│   │   └── NEUROPLAY_2.5_UPGRADE.md
│   ├── development/          # Docs de desenvolvimento
│   │   ├── progress/        # Relatórios de progresso
│   │   ├── planning/        # Planejamento
│   │   ├── commits/         # Docs de commits
│   │   ├── testing/         # Estratégias de teste
│   │   └── analysis/        # Análises técnicas
│   └── api/                  # Documentação da API
│
├── 📂 games_pygame/           # Protótipos de jogos (Python)
│   └── cyber_runner.py
│
├── 📂 paper/                  # Artigos científicos
│   ├── neuroplay_article.tex
│   ├── neuroplay_artigo_pt.tex
│   └── analysis.py
│
├── 📂 scripts/                # Scripts utilitários
│   ├── organize-docs.ps1     # Organizar documentação
│   ├── prepare-deploy.ps1    # Preparar deploy
│   ├── pre-commit-check.ps1  # Verificação pré-commit
│   ├── test-all.ps1          # Executar todos os testes
│   └── validate-setup.ps1    # Validar setup
│
├── 📂 tests/                  # Testes integrados
│   └── load/                 # Testes de carga
│       └── locustfile.py     # Locust tests
│
├── 📄 .dockerignore          # Arquivos ignorados no Docker
├── 📄 .env.example           # Exemplo de variáveis de ambiente
├── 📄 .gitignore             # Arquivos ignorados no Git
├── 📄 CHANGELOG.md           # Histórico de versões
├── 📄 CONTRIBUTING.md        # Guia de contribuição
├── 📄 docker-compose.yml     # Docker Compose (dev)
├── 📄 docker-compose.prod.yml # Docker Compose (prod)
├── 📄 LICENSE                # Licença MIT
├── 📄 package.json           # Dependências root (workspace)
└── 📄 README.md              # Documentação principal
```

## 🎯 Convenções de Diretórios

### Backend (`/backend`)

- **`app/api/`** - Camada de apresentação (controllers)
- **`app/core/`** - Lógica de negócio (Clean Architecture)
- **`app/infra/`** - Infraestrutura (DB, cache, monitoring)
- **`tests/`** - Testes unitários e de integração

### Frontend (`/frontend`)

- **`src/pages/`** - Páginas/rotas da aplicação
- **`src/features/`** - Features isoladas (DDD-like)
- **`src/games/`** - Jogos terapêuticos
- **`src/shared/`** - Código compartilhado entre features
- **`src/store/`** - Estado global

### Documentação (`/docs`)

- **`guides/`** - Guias práticos para usuários
- **`architecture/`** - Decisões arquiteturais
- **`development/`** - Docs de desenvolvimento interno
- **`api/`** - Documentação da API REST

## 📦 Principais Arquivos

### Configuração

| Arquivo | Propósito |
|---------|-----------|
| `.env.example` | Template de variáveis de ambiente |
| `docker-compose.yml` | Orquestração de containers (dev) |
| `docker-compose.prod.yml` | Orquestração de containers (prod) |
| `package.json` | Dependências Node.js (root) |
| `frontend/package.json` | Dependências React |
| `backend/requirements.txt` | Dependências Python |

### Documentação

| Arquivo | Propósito |
|---------|-----------|
| `README.md` | Documentação principal do projeto |
| `CHANGELOG.md` | Histórico de mudanças |
| `CONTRIBUTING.md` | Guia para contribuidores |
| `LICENSE` | Licença MIT |

### CI/CD

| Arquivo | Propósito |
|---------|-----------|
| `.github/workflows/full-stack-ci.yml` | Pipeline completo |
| `.github/workflows/production.yml` | Deploy de produção |
| `.github/workflows/test-automation.yml` | Testes automatizados |

## 🔑 Arquivos Sensíveis (Não Commitados)

```
❌ NUNCA commitar:
├── .env                    # Variáveis de ambiente reais
├── .env.local
├── .env.production
├── credentials.json        # Credenciais de serviços
├── service-account.json
├── *.key, *.pem           # Chaves privadas
└── backend/instance/       # Banco SQLite local
```

## 📋 Arquivos Gerados (Build)

```
⚠️  Ignorados no Git:
├── node_modules/          # Dependências Node
├── backend/venv/          # Ambiente virtual Python
├── frontend/build/        # Build de produção
├── __pycache__/          # Cache Python
└── *.log                 # Logs
```

## 🚀 Fluxo de Trabalho

### Desenvolvimento Local

1. Clone o projeto
2. Copie `.env.example` → `.env`
3. Execute `docker-compose up` ou instale dependências manualmente
4. Acesse `localhost:3000` (frontend) e `localhost:5000` (backend)

### Deploy

1. Push para `main` trigger CI/CD
2. Testes automatizados executam
3. Build de containers
4. Deploy para ambiente (Railway/Render/Vercel)

## 🧪 Testes

```
tests/
├── frontend/src/__tests__/     # Testes React (Jest)
├── backend/tests/              # Testes Python (pytest)
└── tests/load/                 # Testes de carga (Locust)
```

## 📚 Mais Informações

- [Guia de Setup](guides/SETUP.md)
- [Arquitetura](architecture/ARQUITETURA_V2.md)
- [CI/CD Setup](guides/CI_CD_SETUP.md)
- [Como Contribuir](../CONTRIBUTING.md)

---

**Última Atualização:** 13/02/2026  
**Versão:** 2.5.0
