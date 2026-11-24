# Deploy do backend real do NeuroPlay

**Status:** guia operacional para o MVP funcional.  
**Importante:** este documento não substitui revisão jurídica, DPIA/RIPD, política de segurança ou contrato de processamento de dados.

## Topologia mínima

O frontend pode continuar no GitHub Pages, mas a API precisa de um serviço de containers com HTTPS público, PostgreSQL gerenciado e Redis gerenciado. O provedor escolhido deve oferecer TLS, secrets, logs, backup e controle de acesso; o código não presume Render, Railway, Fly.io ou outro fornecedor específico.

| Serviço | Requisito |
|---|---|
| API | Executar `gunicorn --bind 0.0.0.0:5000 --workers 2 --timeout 120 wsgi:application` a partir de `backend/`. |
| Banco | PostgreSQL com TLS, backup automático, usuário sem privilégio de superusuário e política de retenção definida. |
| Redis | Instância privada/TLS para filas e cache; não armazene dados pessoais em chaves de longa duração. |
| HTTPS | URL estável, certificado válido e redirecionamento HTTP→HTTPS no provedor/reverse proxy. |
| Frontend | GitHub Pages com secret `REACT_APP_API_URL` apontando para a URL HTTPS da API. |

## Secrets e variáveis

Configure estes valores no secret manager do provedor, nunca no repositório:

```text
APP_ENV=production
FLASK_ENV=production
SECRET_KEY=<32+ caracteres aleatórios>
DATABASE_URL=<URL PostgreSQL com TLS>
REDIS_URL=<URL Redis com TLS>
CELERY_BROKER_URL=<URL Redis da fila>
CELERY_RESULT_BACKEND=<URL Redis da fila>
CORS_ORIGINS=https://dev-hp.github.io
CONSENT_VERSION=2026-01
JWT_ACCESS_MINUTES=15
REFRESH_TOKEN_DAYS=30
```

No repositório Neuroplay, configure o secret de Actions `REACT_APP_API_URL` com a mesma URL HTTPS pública, por exemplo `https://api.seu-dominio.example`. Não use `http://localhost:5000`, domínio inexistente ou credenciais demo.

## Inicialização

O container do backend usa `backend/entrypoint.sh`. Na primeira execução ele chama `flask --app wsgi:application init-db`, cria as tabelas do modelo real e publica o catálogo não pessoal de atividades. Para uma operação com dados persistentes, evolua este bootstrap para migrações versionadas antes de aplicar alterações de schema em produção; não execute `drop_all` ou recrie o banco em deploy.

O healthcheck é `GET /health`. A resposta precisa ser HTTP 200 e conter `status=healthy` e `database=ok`. O endpoint `/api/v1/health` é informativo e não substitui monitoramento de dependências.

## Checklist antes de abrir acesso

| Verificação | Evidência necessária |
|---|---|
| API | `curl -f https://api.example/health` retorna 200 sem stack trace. |
| CORS | O domínio `https://dev-hp.github.io` está explicitamente permitido. |
| Auth | Cadastro, login, refresh e logout funcionam; refresh token é HttpOnly e Secure. |
| Tenant | Teste automatizado prova que organização A não acessa estudante de B. |
| Consentimento | Gameplay sem consentimento retorna 403; revogação impede novas sessões. |
| Dados | Exportação e exclusão funcionam para perfil autorizado. |
| Observabilidade | Logs não incluem senha, token, payload infantil bruto ou PII desnecessária. |
| Backup | Restauração de PostgreSQL foi testada e o RPO/RTO foi documentado. |
| Frontend | O build foi feito com `REACT_APP_DEMO_MODE=false` e a API real; nenhuma credencial aparece no bundle. |
| Segurança | HTTPS, dependências atualizadas, rate limiting, política de retenção e revisão de permissões concluídos. |

## Fluxo de primeiro uso

1. O adulto cria uma conta e uma organização pelo frontend.
2. O usuário cria um perfil pseudonimizado de estudante.
3. O usuário registra o consentimento correspondente à finalidade de gameplay educacional, após verificar a base legal e autorização aplicável.
4. O perfil selecionado abre o painel de atividades.
5. O jogo envia a sessão para `/api/v1/gameplay/sync`, usando `student_id`, `game_type`, métricas agregadas e uma chave idempotente.
6. O educador consulta o progresso e pode exportar os dados autorizados.
7. Revogação, exportação ou exclusão devem ser atendidas conforme a política institucional e registradas em auditoria.

## O que não deve ser feito

Não publique o backend com `SECRET_KEY` de exemplo, PostgreSQL com senha padrão, CORS aberto, PgAdmin público, SQLite compartilhado, login demo, estudante de fixture ou dados clínicos. Não anuncie eficácia terapêutica com base em score de gameplay. Caso o produto venha a receber finalidade de prevenção, diagnóstico, tratamento, reabilitação ou monitoramento clínico, faça avaliação regulatória e clínica específica antes de comercializar ou disponibilizar essa funcionalidade.
