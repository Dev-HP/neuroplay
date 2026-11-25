# Arquitetura do NeuroPlay

**Posicionamento:** plataforma educacional de atividades lúdicas e acompanhamento pedagógico. Não é diagnóstico, tratamento nem dispositivo médico.

## Visão geral

```text
Navegador ──► Frontend React (Vite)
                 │  modo demonstração: rotas da API atendidas no próprio navegador (localStorage)
                 │  modo real: HTTPS ──► API Flask (gunicorn) ──► PostgreSQL
                 │
GitHub Pages hospeda só o frontend estático. Docker Compose sobe frontend (nginx) + API + banco.
```

| Camada | Tecnologia | Onde |
|---|---|---|
| Interface | React 18, React Router 7, Vite 7 | `frontend/src/` |
| Jogos | Canvas 2D (4 jogos), React + Framer Motion (2), Three.js via @react-three/fiber (1) | `frontend/src/games/` |
| Gráficos do educador | Recharts | `frontend/src/pages/PainelEducador.js` |
| Estado | Zustand (pontos dos jogos), hooks locais | `frontend/src/store/` |
| API | Flask 3, Flask-SQLAlchemy, Flask-Limiter, PyJWT | `backend/app.py` |
| Banco | PostgreSQL 16 (SQLite nos testes) | `docker-compose.yml` |
| Testes | Vitest + Testing Library; pytest | `frontend/src/**/__tests__`, `backend/tests` |
| CI/CD | GitHub Actions: `ci.yml` (lint, testes, auditoria, Docker) e `deploy-frontend.yml` (Pages) | `.github/workflows/` |

## Modos de execução

O frontend lê duas variáveis no build (`vite.config.js`):

| `REACT_APP_API_URL` | `REACT_APP_DEMO_MODE` | Resultado |
|---|---|---|
| vazio | `true` | **Demonstração.** `shared/demo/localBackend.js` responde às rotas da API dentro do navegador; os dados ficam só no `localStorage` do aparelho. É o que o GitHub Pages publica quando o secret da API não existe. |
| URL HTTPS da API | qualquer | **Real.** As chamadas vão para a API Flask. |
| vazio | vazio | **Mesma origem.** Usado no Docker: o nginx encaminha `/api` para o backend. |

## Modelo de dados

Todas as tabelas são criadas por `flask --app wsgi:application init-db` (o `entrypoint.sh` do container faz isso na subida).

| Tabela | Finalidade |
|---|---|
| `organizations`, `organization_memberships` | Escola/clínica e papel de cada adulto nela (isolamento entre organizações) |
| `users` | Educadores, responsáveis e administradores (senha com hash) |
| `student_profiles` | Perfil pseudonimizado da criança (apelido; sem e-mail nem login próprio) |
| `guardian_links` | Vínculo responsável–estudante |
| `consents` | Consentimento versionado e revogável; sem ele o gameplay identificável não é gravado |
| `activities` | Catálogo de jogos |
| `game_sessions`, `game_events` | Partidas (com chave idempotente) e eventos agregados |
| `refresh_tokens` | Sessões renováveis, guardadas só como hash |
| `audit_events` | Trilha de auditoria por organização |

## API (v1)

| Método | Rota | Regra |
|---|---|---|
| POST | `/api/v1/auth/register`, `/login`, `/refresh`, `/logout` | Login de adultos; limite de tentativas por IP |
| GET | `/api/v1/me` | Identidade e organizações do usuário |
| GET/POST | `/api/v1/organizations` | Organizações do usuário |
| GET/POST | `/api/v1/students` | Perfis da organização |
| GET/DELETE | `/api/v1/students/<id>` · GET `/export` · GET `/progress` | Leitura, exportação, exclusão e progresso descritivo |
| POST | `/api/v1/guardians/link` | Vincula responsável |
| GET/POST | `/api/v1/consents` · POST `/<id>/revoke` | Consentimento |
| GET | `/api/v1/activities` | Catálogo |
| POST | `/api/v1/gameplay/sync` | Grava uma partida (idempotente) |
| POST | `/api/v1/gameplay/sessions` · `/<id>/complete` · GET `/<id>/status` | Fluxo de sessão em duas etapas |
| GET | `/api/v1/audit-events` | Auditoria (administradores) |
| GET | `/health`, `/api/v1/health` | Saúde (o primeiro testa o banco) |

Toda rota de dados confere no servidor se o usuário pertence à organização do estudante; o cliente não escolhe `organization_id`.

## Segurança

Resumo; o detalhe está em [`../seguranca/REVISAO_SEGURANCA.md`](../seguranca/REVISAO_SEGURANCA.md).

- `APP_ENV` assume `production` por padrão; em produção a API recusa `SECRET_KEY` com menos de 32 caracteres ou com o valor de exemplo do `.env.example`.
- Cabeçalhos de segurança na API e no nginx; CSP sem scripts inline no build do frontend.
- Limite de tentativas no login e no cadastro (Flask-Limiter).
- Sem dados clínicos, CPF, localização ou texto livre da criança.

## Decisões

- **Uma API em um arquivo (`app.py`).** O produto é pequeno; a divisão em camadas que existia (`backend/app/`, Celery, Redis, Sentry) nunca foi ligada à aplicação e foi removida.
- **Adaptação de dificuldade no cliente e determinística.** Ver [`LOCAL_ADAPTATION.md`](LOCAL_ADAPTATION.md).
- **Modo demonstração em vez de dados de exemplo no servidor.** Nenhum login de demonstração existe na API.
