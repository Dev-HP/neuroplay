# Deploy

**Importante:** este guia não substitui revisão jurídica, RIPD (relatório de impacto à proteção de dados) nem contrato com a escola ou clínica. Antes de usar com crianças reais, cumpra [`../seguranca/LGPD.md`](../seguranca/LGPD.md).

## Frontend no GitHub Pages

O workflow `.github/workflows/deploy-frontend.yml` roda a cada push na `main`: lint, testes, build e publicação em `https://dev-hp.github.io/neuroplay/`.

| Secret de Actions | Efeito |
|---|---|
| sem `REACT_APP_API_URL` | Publica em **modo demonstração**: os dados ficam no navegador de quem usa e nada vai a servidor. |
| `REACT_APP_API_URL=https://api.seu-dominio` | Publica apontando para a API real. |

Ative o Pages em *Settings → Pages → Source: GitHub Actions*. O build copia `index.html` para `404.html` para que links diretos (por exemplo `/neuroplay/educador`) funcionem.

## API em produção

O GitHub Pages não executa backend. A API precisa de um serviço de containers com HTTPS e de um PostgreSQL gerenciado com TLS e backup.

| Item | Requisito |
|---|---|
| API | Imagem de `backend/Dockerfile` (gunicorn em `0.0.0.0:5000`, `wsgi:application`) |
| Banco | PostgreSQL com TLS, backup automático e usuário sem superusuário |
| HTTPS | Certificado válido e redirecionamento HTTP→HTTPS no provedor ou proxy |

Variáveis (no gerenciador de secrets do provedor, nunca no repositório):

```text
APP_ENV=production
SECRET_KEY=<32+ caracteres aleatórios>         # o valor do .env.example é recusado
DATABASE_URL=<URL PostgreSQL com TLS>
CORS_ORIGINS=https://dev-hp.github.io
CONSENT_VERSION=2026-01
JWT_ACCESS_MINUTES=15
REFRESH_TOKEN_DAYS=30
```

Com mais de um worker, o limite de tentativas de login conta por worker. Para um limite único, instale o pacote `redis` e defina `RATELIMIT_STORAGE_URI=redis://...`.

Na primeira subida o `entrypoint.sh` executa `flask --app wsgi:application init-db` (cria tabelas e catálogo). Antes de alterar o schema com dados reais, adote migrações versionadas; nunca recrie o banco em deploy.

### Alternativa: um único servidor com Docker

```bash
cp .env.example .env        # defina POSTGRES_PASSWORD, SECRET_KEY e CORS_ORIGINS
docker compose -f docker-compose.prod.yml up -d --build
```

Sobe PostgreSQL, API e frontend (nginx na porta 80, com `/api` encaminhado à API). Coloque um proxy com HTTPS (Caddy, Traefik ou o balanceador do provedor) na frente.

## Checklist antes de abrir acesso

| Verificação | Evidência |
|---|---|
| Saúde | `curl -f https://api.../health` retorna 200 com `database: ok` |
| CORS | Só o domínio do frontend está liberado |
| Autenticação | Cadastro, login, refresh e logout funcionam; tokens não aparecem em logs |
| Isolamento | O teste automatizado de organizações passa (`pytest`) |
| Consentimento | Partida sem consentimento retorna 403; revogação impede novas partidas |
| Direitos do titular | Exportação e exclusão funcionam para o perfil autorizado |
| Backup | Restauração do PostgreSQL testada |
| Frontend | Build com a API real e sem `REACT_APP_DEMO_MODE` |

## Fluxo de primeiro uso

1. O adulto cria conta e organização.
2. Cria o perfil pseudonimizado do estudante.
3. Registra o consentimento do responsável.
4. O estudante joga; cada partida vai para `/api/v1/gameplay/sync` com chave idempotente.
5. O educador acompanha o progresso descritivo e pode exportar ou excluir os dados.

## O que não fazer

Não publicar com `SECRET_KEY` de exemplo, senha padrão do PostgreSQL, CORS aberto, PgAdmin exposto, SQLite compartilhado ou dados clínicos. Não anunciar efeito terapêutico com base na pontuação dos jogos.
