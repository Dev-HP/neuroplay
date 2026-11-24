# NeuroPlay 2.5 - Checklist de Deploy

## 🎯 Pré-Requisitos

### Infraestrutura

- [ ] Servidor/Cloud configurado (Railway/Render/AWS/Vercel)
- [ ] PostgreSQL 15+ provisionado
- [ ] Redis 7+ provisionado
- [ ] Domínio configurado (opcional)
- [ ] SSL/TLS configurado (HTTPS)

### Variáveis de Ambiente

#### Backend (.env.production)

```bash
# Flask
FLASK_ENV=production
SECRET_KEY=<gerar-com-python-secrets>
DEBUG=False

# Database
DATABASE_URL=postgresql://user:pass@host:5432/neuroplay

# Redis
REDIS_URL=redis://host:6379/0

# Celery
CELERY_BROKER_URL=redis://host:6379/0
CELERY_RESULT_BACKEND=redis://host:6379/0

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ENVIRONMENT=production

# CORS
CORS_ORIGINS=https://neuroplay.app,https://www.neuroplay.app

# Rate Limiting
RATE_LIMIT_STORAGE_URL=redis://host:6379/1

# Git (para tracking)
GIT_COMMIT=${GITHUB_SHA}
```

#### Frontend (.env.production)

```bash
REACT_APP_API_URL=https://api.neuroplay.app
REACT_APP_SENTRY_DSN=https://xxx@sentry.io/xxx
REACT_APP_ENVIRONMENT=production
```

### GitHub Secrets

- [ ] `SENTRY_DSN` - Sentry Data Source Name
- [ ] `SENTRY_ORG` - Organização no Sentry
- [ ] `SENTRY_AUTH_TOKEN` - Token de autenticação
- [ ] `RAILWAY_WEBHOOK_URL` ou `RENDER_DEPLOY_HOOK` - Webhook de deploy
- [ ] `CODECOV_TOKEN` - Token do Codecov (opcional)

## 🔧 Configuração

### 1. Banco de Dados

```bash
# Criar banco
createdb neuroplay_production

# Executar migrations
psql -h <host> -U <user> -d neuroplay_production -f database/schema.sql

# Verificar
psql -h <host> -U <user> -d neuroplay_production -c "\dt"
```

### 2. Redis

```bash
# Testar conexão
redis-cli -h <host> -p 6379 ping
# Deve retornar: PONG

# Verificar memória
redis-cli -h <host> -p 6379 info memory
```

### 3. Sentry

```bash
# Criar projeto no Sentry
# 1. Acesse https://sentry.io
# 2. Crie novo projeto (Flask + Celery)
# 3. Copie o DSN
# 4. Configure sample rates (ver docs/guides/CI_CD_SETUP.md)
```

### 4. GitHub Actions

```bash
# Adicionar secrets
gh secret set SENTRY_DSN --body "https://xxx@sentry.io/xxx"
gh secret set RAILWAY_WEBHOOK_URL --body "https://railway.app/webhook/xxx"

# Verificar secrets
gh secret list
```

## 🧪 Testes Pré-Deploy

### Testes Locais

```bash
# 1. Executar pipeline completo
.\scripts\test-pipeline.ps1

# 2. Teste de carga local
docker-compose up -d
locust -f tests/load/locustfile.py --headless --users 100 --spawn-rate 20 --run-time 1m --host http://localhost:5000

# 3. Verificar build do frontend
cd frontend
npm run build
# Verificar: build/service-worker.js e build/manifest.json existem
```

### Testes de Integração

```bash
# Backend
cd backend
pytest tests/integration -v

# Frontend
cd frontend
npm run test:ci
```

## 🚀 Deploy

### Opção 1: Railway

```bash
# 1. Instalar CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Criar projeto
railway init

# 4. Adicionar serviços
railway add --service postgres
railway add --service redis

# 5. Deploy
railway up

# 6. Configurar domínio
railway domain
```

### Opção 2: Render

```bash
# 1. Criar render.yaml
cat > render.yaml << EOF
services:
  - type: web
    name: neuroplay-backend
    env: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: gunicorn -w 4 -b 0.0.0.0:5000 backend.app:app
    
  - type: web
    name: neuroplay-frontend
    env: static
    buildCommand: cd frontend && npm ci && npm run build
    staticPublishPath: frontend/build
    
  - type: worker
    name: neuroplay-celery
    env: python
    buildCommand: pip install -r backend/requirements.txt
    startCommand: celery -A backend.app.celery worker

databases:
  - name: neuroplay-db
    databaseName: neuroplay
    user: neuroplay
    
  - name: neuroplay-redis
    plan: starter
EOF

# 2. Deploy via dashboard ou CLI
render deploy
```

### Opção 3: Docker Compose (VPS)

```bash
# 1. Copiar arquivos para servidor
scp -r . user@server:/opt/neuroplay

# 2. SSH no servidor
ssh user@server

# 3. Configurar variáveis
cd /opt/neuroplay
cp .env.example .env.production
nano .env.production  # Editar variáveis

# 4. Build e deploy
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Verificar logs
docker-compose -f docker-compose.prod.yml logs -f
```

## ✅ Verificação Pós-Deploy

### 1. Health Checks

```bash
# Backend
curl https://api.neuroplay.app/health
# Deve retornar: {"status": "healthy"}

# Frontend
curl https://neuroplay.app
# Deve retornar: HTML da aplicação

# Service Worker
curl https://neuroplay.app/service-worker.js
# Deve retornar: JavaScript do SW
```

### 2. Endpoints Críticos

```bash
# API Health
curl https://api.neuroplay.app/api/v1/health

# Gameplay Sync (requer autenticação)
curl -X POST https://api.neuroplay.app/api/v1/gameplay/sync \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"session_id": "test", "student_id": 1, ...}'
```

### 3. Monitoramento

```bash
# Sentry
# 1. Acesse https://sentry.io
# 2. Verifique se eventos estão chegando
# 3. Configure alertas

# Logs
# Railway: railway logs
# Render: render logs
# Docker: docker-compose logs -f
```

### 4. Performance

```bash
# Teste de carga em produção (cuidado!)
locust -f tests/load/locustfile.py \
  --headless \
  --users 50 \
  --spawn-rate 10 \
  --run-time 30s \
  --host https://api.neuroplay.app

# Lighthouse (PWA)
lighthouse https://neuroplay.app \
  --output=json \
  --output-path=./lighthouse-prod.json \
  --only-categories=performance,pwa,accessibility
```

## 🔒 Segurança

### Checklist de Segurança

- [ ] HTTPS habilitado (SSL/TLS)
- [ ] CORS configurado corretamente
- [ ] Rate limiting ativo
- [ ] Secrets não commitados no Git
- [ ] Senhas fortes no banco de dados
- [ ] Redis protegido (senha ou rede privada)
- [ ] Firewall configurado (apenas portas necessárias)
- [ ] Backups automáticos do banco
- [ ] Logs de auditoria ativos
- [ ] Sentry configurado para capturar erros

### Hardening

```bash
# 1. Atualizar dependências
pip list --outdated
npm outdated

# 2. Scan de vulnerabilidades
safety check
npm audit

# 3. Configurar firewall (exemplo UFW)
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable

# 4. Configurar fail2ban (proteção contra brute force)
apt install fail2ban
systemctl enable fail2ban
```

## 📊 Monitoramento Contínuo

### Métricas Importantes

1. **Uptime**
   - Target: 99.9%
   - Ferramenta: UptimeRobot, Pingdom

2. **Response Time**
   - Target: p95 < 500ms
   - Ferramenta: Sentry, New Relic

3. **Error Rate**
   - Target: < 1%
   - Ferramenta: Sentry

4. **Throughput**
   - Target: > 500 RPS
   - Ferramenta: Prometheus, Grafana

5. **Queue Size**
   - Target: < 1000 jobs
   - Ferramenta: Celery Flower

### Alertas Recomendados

```yaml
# Sentry Alerts
- name: High Error Rate
  condition: error_rate > 1%
  notification: slack, email

- name: Slow Response Time
  condition: p95 > 500ms
  notification: slack

- name: Service Down
  condition: uptime < 99%
  notification: slack, sms

# Celery Alerts
- name: Queue Buildup
  condition: queue_size > 1000
  notification: slack

- name: Worker Down
  condition: active_workers == 0
  notification: slack, sms
```

## 🔄 Rollback Plan

### Se algo der errado:

```bash
# 1. Rollback via Git
git revert HEAD
git push origin main

# 2. Rollback via Railway/Render
# Use o dashboard para fazer rollback para deploy anterior

# 3. Rollback via Docker
docker-compose down
git checkout <commit-anterior>
docker-compose up -d --build

# 4. Restaurar banco de dados (se necessário)
pg_restore -h <host> -U <user> -d neuroplay_production backup.dump
```

## 📝 Documentação

### Atualizar após Deploy

- [ ] Atualizar README.md com URL de produção
- [ ] Documentar variáveis de ambiente
- [ ] Atualizar diagramas de arquitetura
- [ ] Criar runbook de operações
- [ ] Documentar procedimentos de backup/restore

## 🎉 Checklist Final

- [ ] Pipeline de CI/CD passando
- [ ] Testes de carga bem-sucedidos
- [ ] Health checks respondendo
- [ ] Sentry recebendo eventos
- [ ] Service Worker funcionando
- [ ] PWA instalável
- [ ] HTTPS ativo
- [ ] Backups configurados
- [ ] Monitoramento ativo
- [ ] Alertas configurados
- [ ] Documentação atualizada
- [ ] Equipe notificada

## 🚨 Contatos de Emergência

```
Desenvolvedor Principal: [nome] - [email] - [telefone]
DevOps: [nome] - [email] - [telefone]
Suporte Sentry: support@sentry.io
Suporte Railway: help@railway.app
Suporte Render: support@render.com
```

---

**Lembre-se:** Deploy é apenas o começo. Monitoramento contínuo é essencial!

**Próximos Passos:**
1. Monitorar logs por 24h
2. Executar teste de carga em horário de pico
3. Coletar feedback dos usuários
4. Iterar e melhorar
