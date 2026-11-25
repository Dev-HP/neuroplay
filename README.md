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
| Memória Dupla | Memória de trabalho | n-back visual e auditivo |
| Gravity Lab | Flexibilidade cognitiva | Troca de regra (tipo DCCS) |
| Caçador de Alvos | Busca visual | — |
| Sonic Jump | Processamento fonológico | — |

A análise da evidência científica de cada jogo, com o que manter, melhorar e substituir, está em [`docs/pesquisa/ANALISE_JOGOS_EVIDENCIAS.md`](docs/pesquisa/ANALISE_JOGOS_EVIDENCIAS.md).

## Estrutura do repositório

```text
neuroplay/
├── backend/            API Flask (app.py), WSGI, testes pytest e Dockerfile
├── frontend/           App React (Vite)
│   └── src/
│       ├── pages/      Login, painel do estudante e painel do educador
│       ├── games/      Um jogo por pasta
│       ├── features/   Conquistas
│       ├── shared/     Componentes, API, modo demonstração, adaptação, áudio
│       └── store/      Estado global (Zustand)
├── docs/               Documentação (índice em docs/README.md)
└── .github/workflows/  ci.yml (lint, testes, auditoria, Docker) e deploy-frontend.yml (Pages)
```

Detalhes em [`docs/arquitetura/PROJECT_STRUCTURE.md`](docs/arquitetura/PROJECT_STRUCTURE.md).

## Executar localmente

**Só o frontend, em modo demonstração (sem banco):**

```bash
cd frontend
npm ci
REACT_APP_DEMO_MODE=true npm start      # http://localhost:3000
```

**Stack completa com Docker:**

```bash
cp .env.example .env   # troque SECRET_KEY, POSTGRES_PASSWORD e a senha em DATABASE_URL
docker compose up -d --build
```

Frontend em `http://localhost:3000` (o nginx encaminha `/api` para a API) e API em `http://localhost:5000`. Outras formas em [`docs/guias/INSTALACAO.md`](docs/guias/INSTALACAO.md).

## Testes

```bash
cd frontend && npm run lint && npm test     # ESLint sem avisos + 83 testes (Vitest)
cd backend && flake8 . && pytest            # flake8 + 9 testes da API
```

O GitHub Actions roda lint, testes, `npm audit`, `pip-audit` e sobe a stack Docker a cada push; o deploy no GitHub Pages só acontece se lint e testes passarem.

## Modo demonstração e deploy

Sem o secret `REACT_APP_API_URL`, o deploy no GitHub Pages ativa o modo demonstração: as rotas da API (login, estudantes, consentimento, sessões, relatórios) são atendidas no próprio navegador e nada é enviado a servidores. Com o secret configurado, o frontend usa a API real. Veja [`docs/guias/DEPLOY.md`](docs/guias/DEPLOY.md).

## Documentação

| Pasta | Conteúdo |
|---|---|
| [`docs/produto/`](docs/produto/) | Posicionamento, limites de uso e especificação do painel |
| [`docs/arquitetura/`](docs/arquitetura/) | Arquitetura, estrutura, design system e adaptação local |
| [`docs/jogos/`](docs/jogos/) | Os jogos e os recursos comuns |
| [`docs/pesquisa/`](docs/pesquisa/) | Evidência científica, análise dos jogos e artigo |
| [`docs/guias/`](docs/guias/) | Instalação e deploy |
| [`docs/qualidade/`](docs/qualidade/) | Avaliação final de design, auditoria de UX e código, teste prático |
| [`docs/seguranca/`](docs/seguranca/) | Revisão de segurança, LGPD e aviso de privacidade |
| [`docs/marca/`](docs/marca/) | Logo e aplicações |

## Privacidade

Não envie dados pessoais, clínicos ou identificáveis em issues, commits ou fixtures. O uso real com crianças exige as medidas descritas em [`docs/seguranca/`](docs/seguranca/).

## Licença e autor

[MIT](LICENSE) · **Hélio Paulo Leite de Lima** — [GitHub](https://github.com/Dev-HP)
