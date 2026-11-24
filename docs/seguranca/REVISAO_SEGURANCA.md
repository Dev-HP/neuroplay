# Revisão de segurança — NeuroPlay

Data: 24/11/2026 · Escopo: API Flask (`backend/app.py`), frontend React, Docker/Compose e GitHub Actions.

**Método:** leitura do código de autenticação, autorização, isolamento entre organizações, exportação e telemetria; auditoria de dependências (`pip-audit` e `npm audit`); checagem de cabeçalhos e CSP no navegador (34 telas, desktop e celular); revisão de configurações de deploy e CI.

## 1. Corrigido nesta revisão

| # | Gravidade | Problema | Correção |
|---|---|---|---|
| 1 | Alta | **Padrão "development" quando `APP_ENV`/`FLASK_ENV` não estão definidos.** Um deploy esquecido (Render, Railway, VPS) subiria com a chave JWT fixa que está no código e com SQLite: qualquer pessoa poderia forjar tokens de login. | Padrão passou a ser **produção** (falha fechada): sem `APP_ENV=development/test`, a API exige `SECRET_KEY` de 32+ caracteres e `DATABASE_URL`. |
| 2 | Alta | **Sem limite de tentativas** em login e cadastro (o Flask-Limiter estava instalado, mas não era usado): força bruta e *credential stuffing*. | Login: 10/min e 50/h por IP; cadastro: 5/min e 20/h; refresh: 30/min. Em produção com vários workers, use `RATELIMIT_STORAGE_URI=redis://…`. |
| 3 | Alta | **Dependências com vulnerabilidades conhecidas:** PyJWT 2.8.0 (19 avisos), Werkzeug 3.0.1 (13), Flask-CORS 4.0.0 (10), gunicorn 21.2 (4), python-socketio, Flask, scikit-learn, python-dotenv, sentry-sdk; no frontend, axios, form-data e lodash (altas). | Versões corrigidas. `pip-audit`: **0 vulnerabilidades**. `npm audit` (produção): 0 altas, 3 moderadas (ver seção 2). |
| 4 | Média | **IDOR na telemetria:** `GET /api/telemetry/session/<id>` devolvia o resumo de qualquer sessão a qualquer usuário autenticado, inclusive de outra organização. | Só responde se a sessão de jogo pertence a um estudante que o usuário pode acessar. Teste automatizado incluído. |
| 5 | Média | **Senha padrão do banco** (`neuroplay_prod`) e `SECRET_KEY` de exemplo no `docker-compose.prod.yml`. | Variáveis obrigatórias (`${VAR:?…}`); o compose não sobe sem elas. |
| 6 | Média | **Google Fonts** carregado de servidor externo: o IP de cada criança ia para o Google a cada acesso. | Removido; fonte do sistema. |
| 7 | Média | **Sem CSP no frontend.** O token de acesso fica no `sessionStorage`; um XSS conseguiria lê-lo. | CSP via `<meta>` sem scripts inline (`script-src 'self'`); runtime do webpack em arquivo (`scripts/build.js`); registro do service worker movido para `sw-register.js`. Verificado: 0 violações nas 34 telas. |
| 8 | Média | **API sem cabeçalhos de segurança.** | `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, CSP da API, `Permissions-Policy`, `Cache-Control: no-store` em `/api/` e HSTS em produção. |
| 9 | Baixa | **Injeção de fórmula no CSV** exportado (um apelido como `=HYPERLINK(...)` executaria no Excel). | Células que começam com `= + - @` recebem prefixo `'`; nome do arquivo sanitizado. |
| 10 | Baixa | `innerHTML` com dados de conquista sem escape. | Valores escapados. |
| 11 | Baixa | Deploy do GitHub Pages também rodava em *pull request*; 3 workflows sem permissões mínimas do token. | Deploy só em push/manual; `permissions: contents: read` nos workflows. |
| 12 | Baixa | Telemetria aceitava lotes sem limite de eventos. | Máximo de 500 eventos por lote (413 acima disso). |

## 2. Pendências (risco aceito, com plano)

| Item | Risco | Por que não agora | Plano |
|---|---|---|---|
| React Router 6 → 7 e `uuid` | 3 avisos moderados: *open redirect* com barra invertida e checagem de buffer no `uuid` | Atualização de versão principal. O app só navega para rotas internas fixas e não usa `uuid` com buffer | Migrar para React Router 7 numa versão dedicada, com teste de todas as rotas |
| Detecção de reuso de refresh token | Um token roubado e usado antes do dono só é invalidado na próxima renovação | Exige o conceito de "família de tokens" no banco | Ao detectar reuso de um token já revogado, revogar todos os tokens do usuário |
| Enumeração de e-mail no cadastro | A mensagem "E-mail já cadastrado" revela contas existentes | Mitigado pelo limite de tentativas | Mensagem genérica + confirmação por e-mail (`email_verificado` existe e não é usado) |
| Token de acesso no `sessionStorage` | Exposto a XSS (mitigado por CSP e expiração de 15 min) | Mudança de arquitetura do login | Manter o access token só em memória e renovar pelo cookie `HttpOnly` |
| MFA para educadores e administradores | Conta de adulto comprometida expõe dados de várias crianças | Funcionalidade nova | TOTP opcional, obrigatório para `owner`/`admin` |
| Exclusão definitiva | A exclusão é lógica; a LGPD exige eliminação ao fim do tratamento | Precisa de política de retenção | Rotina que apaga dados após o prazo definido (ver `LGPD.md`) |
| `backend/app/` | Pacote de "arquitetura limpa" paralelo, não usado pelo servidor (o WSGI carrega `app.py`) | Fora do escopo desta revisão | Consolidar ou remover, para não haver dois códigos de API |
| Telemetria em SQLite local | Não é isolada por organização nem tem retenção | Módulo legado | Migrar para o PostgreSQL com `organization_id`, ou desligar |

## 3. O que já estava correto

- Senhas com hash do Werkzeug e mínimo de 10 caracteres; refresh token guardado como hash SHA-256, com rotação e cookie `HttpOnly` no caminho `/api/v1/auth`.
- JWT HS256 com emissor validado e expiração de 15 minutos; algoritmo fixado na verificação.
- Isolamento por organização nas rotas de estudantes, consentimento, sessões e exportação (testado).
- Jogadas só são salvas com consentimento ativo; idempotência por `session_id`.
- Corpo de requisição limitado a 2 MB; erros internos sem *stack trace* para o cliente.
- Container roda como usuário sem privilégios (`USER appuser`).
- Sentry com `send_default_pii=False`.

## 4. Checklist para colocar em produção com dados reais

- [ ] `APP_ENV=production`, `SECRET_KEY` aleatória de 64 caracteres, `DATABASE_URL` de PostgreSQL gerenciado com TLS.
- [ ] `CORS_ORIGINS` só com o domínio real do frontend.
- [ ] `RATELIMIT_STORAGE_URI` apontando para o Redis.
- [ ] HTTPS obrigatório no proxy, com HSTS.
- [ ] Backups automáticos e criptografados do banco, com teste de restauração.
- [ ] Alertas de erro (Sentry) e de tentativas de login em excesso.
- [ ] Dependabot ou `pip-audit`/`npm audit` no CI, falhando em vulnerabilidade alta.
- [ ] Revisão das pendências da seção 2 e dos requisitos de `LGPD.md`.

## Referências

- OWASP Top 10 e OWASP ASVS (requisitos de verificação de segurança de aplicações).
- ANPD, *Guia orientativo de segurança da informação para agentes de tratamento de pequeno porte*.
