# Instalação e execução local

## Requisitos

- Node.js 22.12 ou mais novo (frontend)
- Python 3.11 ou mais novo (backend)
- Docker com Compose v2 (opcional, para a stack completa)

## 1. Só o frontend, em modo demonstração

Não precisa de banco nem de backend: as rotas da API são simuladas no navegador.

```bash
cd frontend
npm ci
REACT_APP_DEMO_MODE=true npm start      # http://localhost:3000
```

No Windows (PowerShell): `$env:REACT_APP_DEMO_MODE="true"; npm start`.

## 2. Stack completa com Docker

```bash
cp .env.example .env      # troque SECRET_KEY, POSTGRES_PASSWORD e a senha dentro de DATABASE_URL
docker compose up -d --build
```

| Serviço | Endereço |
|---|---|
| Frontend (nginx, encaminha `/api` para o backend) | http://localhost:3000 |
| API | http://localhost:5000 (`/health` testa o banco) |
| PgAdmin (opcional) | `docker compose --profile admin up -d pgadmin` → http://127.0.0.1:5050 |

O backend cria as tabelas e o catálogo de atividades na primeira subida.

## 3. Backend sem Docker

```bash
cd backend
python -m venv .venv && source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements-test.txt
export APP_ENV=development SECRET_KEY='uma-chave-local-com-pelo-menos-32-caracteres'
export DATABASE_URL='sqlite:///neuroplay-development.db'
flask --app wsgi:application init-db
flask --app wsgi:application run --port 5000
```

Para o frontend usar essa API: `REACT_APP_API_URL=http://localhost:5000 npm start` (o `CORS_ORIGINS` padrão já libera `http://localhost:3000`).

## Testes e verificação

```bash
cd frontend && npm run lint && npm test          # ESLint (zero avisos) e Vitest
cd backend && flake8 . && pytest                 # flake8 e pytest
```

Os mesmos comandos rodam no GitHub Actions (`.github/workflows/ci.yml`), junto com `npm audit`, `pip-audit` e a subida da stack Docker.
