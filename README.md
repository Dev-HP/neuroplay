<p align="center"><img src="docs/marca/neuroplay-icon.svg" width="120" alt="Logo NeuroPlay"></p>

# NeuroPlay

> Plataforma web educacional de jogos lúdicos para inclusão digital de crianças com TEA e TDAH, com acompanhamento descritivo das sessões por educadores.

**Acesse:** https://dev-hp.github.io/neuroplay — clique em **"Entrar como educador demonstração"**.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> **Limite de uso:** o NeuroPlay é software educacional. Não é dispositivo médico, não faz diagnóstico, não promete tratamento ou melhora clínica e não substitui avaliação profissional.

## O que é

| Área | Implementação |
|---|---|
| Jogos | 7 jogos, um processo cognitivo por jogo (veja a tabela abaixo), com controles por toque, mouse e teclado |
| Estudantes | Perfis pseudonimizados criados por um adulto autorizado; sem login infantil |
| Governança | Consentimento versionado, revogação, auditoria, exportação e exclusão lógica |
| Relatórios | Indicadores descritivos por estudante (pontos, acertos, erros, duração) e exportação CSV |
| Acesso | Organizações, papéis `owner`/`admin`/`educador`, JWT de curta duração e refresh token rotacionável |
| Publicação | GitHub Pages em **modo demonstração** (dados só no navegador) ou API Flask + PostgreSQL |

## Jogos

| Jogo | Processo | Tarefa de referência |
|---|---|---|
| Mestres do Sinal | Controle inibitório | Go/No-Go (75% Go / 25% No-Go) |
| Cyber-Runner | Atenção em multitarefa | Escolha rápida com distratores |
| Templo dos Ecos | Memória visuoespacial | Sequência tipo Corsi |
| Memória Dupla | Memória de trabalho | n-back |
| Gravity Lab | Flexibilidade cognitiva | Troca de regra (tipo DCCS) |
| Caçador de Alvos | Busca visual | — |
| Sonic Jump | Processamento fonológico | — |

A análise da evidência científica de cada jogo, com o que manter, melhorar e substituir, está em [`docs/pesquisa/ANALISE_JOGOS_EVIDENCIAS.md`](docs/pesquisa/ANALISE_JOGOS_EVIDENCIAS.md).

## Estrutura do repositório

```text
neuroplay/
├── backend/            API Flask (app.py), WSGI, testes Pytest e Dockerfile
├── frontend/           App React
│   └── src/
│       ├── pages/      Login, painel do estudante e painel do educador
│       ├── games/      Um jogo por pasta + games/shared (feedback e telemetria)
│       ├── features/   Conquistas
│       ├── shared/     Componentes, API, modo demonstração, adaptação, utilitários
│       └── store/      Estado global (Zustand)
├── database/           schema.sql
├── docs/               Documentação (índice em docs/README.md)
├── legacy/pygame/      Protótipos desktop antigos (fora do produto)
├── scripts/            Scripts de apoio (PowerShell/Bash)
├── tests/load/         Teste de carga (Locust)
└── .github/workflows/  CI, testes e deploy no GitHub Pages
```

Detalhes em [`docs/arquitetura/PROJECT_STRUCTURE.md`](docs/arquitetura/PROJECT_STRUCTURE.md).

## Executar localmente

**Só o frontend, em modo demonstração (sem banco):**

```bash
cd frontend
npm ci --legacy-peer-deps
REACT_APP_DEMO_MODE=true npm start
```

**Stack completa com Docker:**

```bash
cp .env.example .env   # troque SECRET_KEY, POSTGRES_PASSWORD e DATABASE_URL
docker compose up -d --build
```

Frontend em `http://localhost:3000` e API em `http://localhost:5000`.

**Backend manual:**

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
export APP_ENV=development SECRET_KEY='uma-chave-local-com-pelo-menos-32-caracteres'
export DATABASE_URL='sqlite:///neuroplay-development.db'
flask --app wsgi:application init-db
gunicorn --bind 127.0.0.1:5000 wsgi:application
```

Em produção, use PostgreSQL, secrets próprios e HTTPS.

## Testes

```bash
cd backend && pytest -q                                   # 15 testes da API (11 ativos + 4 opcionais)
cd frontend && CI=true npm test -- --watchAll=false       # 146 testes (18 suítes)
```

O GitHub Actions roda as duas suítes a cada push e publica o frontend no GitHub Pages.

## Modo demonstração e deploy

Sem o secret `REACT_APP_API_URL`, o deploy no GitHub Pages ativa o modo demonstração: as rotas da API (login, estudantes, consentimento, sessões, relatórios) são atendidas no próprio navegador e nada é enviado a servidores. Com o secret configurado, o frontend usa a API real. Veja [`docs/guias/DEPLOY_BACKEND.md`](docs/guias/DEPLOY_BACKEND.md).

## Documentação

| Pasta | Conteúdo |
|---|---|
| [`docs/produto/`](docs/produto/) | Posicionamento, limites de uso, roadmap e especificação do painel |
| [`docs/arquitetura/`](docs/arquitetura/) | Arquitetura, modelo de dados, adaptação local e design system |
| [`docs/pesquisa/`](docs/pesquisa/) | Evidência científica, análise dos jogos e artigo |
| [`docs/jogos/`](docs/jogos/) | Guias dos jogos e sistema de conquistas |
| [`docs/guias/`](docs/guias/) | Instalação e deploy |
| [`docs/qualidade/`](docs/qualidade/) | Auditoria de UX e código, teste prático e estratégia de testes |
| [`docs/seguranca/`](docs/seguranca/) | Revisão de segurança e requisitos de LGPD |
| [`docs/marca/`](docs/marca/) | Logo e aplicações |
| [`docs/historico/`](docs/historico/) | Relatórios e planos antigos, mantidos só como registro |

## Privacidade

Não envie dados pessoais, clínicos ou identificáveis em issues, commits ou fixtures. O uso real com crianças exige as medidas descritas em [`docs/seguranca/`](docs/seguranca/).

## Licença e autor

[MIT](LICENSE) · **Hélio Paulo Leite de Lima** — [GitHub](https://github.com/Dev-HP)
