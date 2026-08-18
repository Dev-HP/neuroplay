# NeuroPlay

> Plataforma web educacional de atividades lúdicas com jogos interativos e acompanhamento descritivo de sessões autorizadas.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Status do produto

O NeuroPlay possui um **MVP funcional** com API Flask, PostgreSQL, Redis/Celery, autenticação de adultos, organizações, perfis de estudantes pseudonimizados, consentimento versionado, persistência de gameplay, idempotência, isolamento multi-organização, auditoria, exportação e exclusão lógica.

A publicação do frontend no GitHub Pages não hospeda o backend. Para operar publicamente com dados reais, é necessário configurar uma hospedagem HTTPS para a API, banco PostgreSQL e Redis, além dos secrets descritos em [`docs/DEPLOY_BACKEND.md`](docs/DEPLOY_BACKEND.md). Sem essa configuração, o frontend informa que a API não está disponível e não usa dados fictícios como fallback.

> **Limite de uso:** o NeuroPlay é software educacional de atividades lúdicas. Não é dispositivo médico, não fornece diagnóstico, não promete tratamento ou melhora clínica e não substitui avaliação profissional.

## O que está implementado

| Área | Implementação real |
|---|---|
| Autenticação | Cadastro, login, logout, access token curto, refresh token rotacionável e revogação de sessão. |
| Organizações | Tenant, memberships e papéis `owner`, `admin` e `educador`. |
| Estudantes | Perfis pseudonimizados criados por adulto autorizado; sem login infantil por e-mail no MVP. |
| Governança | Consentimento versionado, revogação, auditoria, exportação e exclusão lógica. |
| Gameplay | Sessões persistidas por atividade, score, duração, acertos, erros, eventos limitados e idempotency key. |
| Relatórios | Indicadores descritivos por estudante e exportação CSV; nenhum score é interpretado como diagnóstico. |
| Jogos | Cyber-Runner, Templo dos Ecos, Sonic Jump, Gravity Lab, Mestres do Sinal, Caçador de Alvos e Memória Dupla. |
| Operação | Docker Compose, healthcheck, WSGI explícito, inicialização do schema, testes automatizados e GitHub Actions. |

## Pesquisa e posicionamento

As atividades são inspiradas em tarefas de atenção, memória de trabalho, controle inibitório e flexibilidade cognitiva. A literatura sobre serious games sugere potencial de engajamento e de melhoria em alguns desfechos, mas também aponta heterogeneidade, amostras pequenas e evidência insuficiente para claims específicos. O NeuroPlay, portanto, registra dados de interação para acompanhamento pedagógico e não para inferência clínica.

Consulte [`docs/PRODUCT_POSITIONING.md`](docs/PRODUCT_POSITIONING.md), [`docs/PRODUCT_ARCHITECTURE.md`](docs/PRODUCT_ARCHITECTURE.md) e [`docs/ACADEMIC_RESEARCH.md`](docs/ACADEMIC_RESEARCH.md) para o posicionamento, modelo de dados, evidência e critérios de evolução do produto.

## Execução local com dados reais de desenvolvimento

```bash
git clone https://github.com/Dev-HP/neuroplay.git
cd neuroplay
cp .env.example .env
```

Edite `.env` e substitua `SECRET_KEY`, `POSTGRES_PASSWORD`, `DATABASE_URL` e demais valores. Em seguida, suba os serviços:

```bash
docker compose up -d --build
```

Acesse o frontend em `http://localhost:3000` e a API em `http://localhost:5000`. O perfil PgAdmin é opcional e deve ser iniciado apenas para administração local:

```bash
docker compose --profile admin up -d pgadmin
```

O entrypoint do backend cria as tabelas e publica o catálogo de atividades na primeira inicialização. Em produção, use migrações controladas e backup gerenciado conforme a documentação operacional.

## Execução manual do backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export APP_ENV=development
export SECRET_KEY='uma-chave-local-com-pelo-menos-32-caracteres'
export DATABASE_URL='sqlite:///neuroplay-development.db'
flask --app wsgi:application init-db
gunicorn --bind 127.0.0.1:5000 wsgi:application
```

Para produção, não use SQLite, não use secrets de exemplo e não exponha o servidor sem HTTPS reverso.

## Arquitetura

```text
React + jogos canvas/Three.js
            │ HTTPS + Bearer access token
            ▼
Flask API v1 + WSGI + RBAC + tenant isolation
            │
            ├── PostgreSQL: contas, organizações, consentimentos e sessões
            ├── Redis/Celery: tarefas assíncronas opcionais
            └── Auditoria, healthcheck e exportação
```

A API principal está em `backend/app.py`, o entrypoint WSGI em `backend/wsgi.py`, os contratos de integração em `backend/tests/test_product_api.py` e o cliente comum dos jogos em `frontend/src/shared/api/gameplay.js`.

## Validação local

```bash
cd backend
pytest -q

cd ../frontend
CI=true npm test -- --watchAll=false --passWithNoTests
CI=false GENERATE_SOURCEMAP=false npm run build
cp build/index.html build/404.html
```

Os testes de produto verificam cadastro, consentimento, persistência, idempotência e isolamento entre organizações. A suíte do frontend cobre 17 suítes e 141 testes, incluindo a política local de adaptação e o motor compartilhado dos jogos.

## Documentação

| Documento | Conteúdo |
|---|---|
| [`docs/PRODUCT_ARCHITECTURE.md`](docs/PRODUCT_ARCHITECTURE.md) | Escopo v1, modelo de dados, API, segurança e critérios de aceite. |
| [`docs/DEPLOY_BACKEND.md`](docs/DEPLOY_BACKEND.md) | Deploy HTTPS, variáveis, banco, Redis e configuração do GitHub Pages. |
| [`docs/LOCAL_ADAPTATION.md`](docs/LOCAL_ADAPTATION.md) | Política local de adaptação de dificuldade, limites, segurança e evolução futura. |
| [`docs/PRODUCT_POSITIONING.md`](docs/PRODUCT_POSITIONING.md) | Promessa, limites educacionais e critérios para futuros claims. |
| [`docs/architecture/ARQUITETURA.md`](docs/architecture/ARQUITETURA.md) | Arquitetura histórica e componentes do projeto. |
| [`docs/guides/DEPLOY.md`](docs/guides/DEPLOY.md) | Procedimentos existentes de deploy. |

## Privacidade e segurança

Não envie dados pessoais, clínicos ou identificáveis para issues, commits ou fixtures. O MVP foi desenhado para usar identificadores pedagógicos mínimos, consentimento e papéis de acesso, mas uma operação com crianças ainda exige revisão jurídica, política de retenção, DPIA/RIPD, responsáveis definidos, backup, monitoramento e validação institucional antes de uso real.

## Contribuição e licença

Contribuições são bem-vindas por meio de issues e pull requests. O projeto está sob a licença [MIT](LICENSE). Toda contribuição envolvendo dados de crianças deve usar dados sintéticos e manter a minimização como requisito de revisão.

## Autor

**Hélio Paulo Leite de Lima** — [GitHub](https://github.com/Dev-HP)
