# NeuroPlay 2.5 - Guia de CI/CD

## 🎯 Visão Geral

O pipeline de CI/CD do NeuroPlay garante que **nenhum código ruim chegue à produção**. Cada commit passa por 7 estágios de validação antes do deploy.

## 📋 Estágios do Pipeline

### 1. Quality Check (~2min)
- Linting (Black + Flake8)
- Testes unitários (Pytest)
- Cobertura de código

### 2. Frontend Build (~3min)
- Testes do frontend (Jest)
- Build de produção
- Validação de PWA (Service Worker + Manifest)

### 3. Load Test (~2min)
- Sobe ambiente completo (Redis + PostgreSQL)
- Executa Locust com 50 usuários simultâneos
- Valida RPS, latência e taxa de erro

### 4. Security Scan
- Trivy (vulnerabilidades em dependências)
- Safety (vulnerabilidades Python)

### 5. Docker Build
- Valida builds do backend e frontend
- Testa docker-compose

### 6. Deploy (apenas main)
- Deploy automático para produção
- Notificação ao Sentry

### 7. Smoke Tests
- Health checks pós-deploy
- Validação de endpoints críticos

## 🚀 Configuração Inicial

### 1. Secrets do GitHub

Configure os seguintes secrets em `Settings > Secrets and variables > Actions`:

```bash
# Sentry (Monitoramento)
SENTRY_DSN=https://xxx@sentry.io/xxx
SENTRY_ORG=your-org
SENTRY_AUTH_TOKEN=xxx

# Deploy (escolha um)
RAILWAY_WEBHOOK_URL=https://railway.app/webhook/xxx
RENDER_DEPLOY_HOOK=https://api.render.com/deploy/xxx
VERCEL_TOKEN=xxx

# Codecov (opcional)
CODECOV_TOKEN=xxx
```

### 2. Variáveis de Ambiente

Crie um arquivo `.env.production` no backend:

```bash
# Flask
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-change-this

# Database
DATABASE_URL=postgresql://user:pass@host:5432/neuroplay

# Redis
REDIS_URL=redis://host:6379/0

# Sentry
SENTRY_DSN=https://xxx@sentry.io/xxx

# Git (para tracking de releases)
GIT_COMMIT=${GITHUB_SHA}
```

## 🔧 Configuração do Sentry

### Amostragem Inteligente

O Sentry está configurado para evitar explosão de eventos:

```python
# Produção
traces_sample_rate: 10%    # Apenas 10% das transações
profiles_sample_rate: 5%   # Apenas 5% dos perfis
error_sample_rate: 100%    # Todos os erros

# Staging
traces_sample_rate: 50%
profiles_sample_rate: 25%
error_sample_rate: 100%
```

### Amostragem Customizada

Endpoints críticos têm prioridade:

- Health checks: 0% (ignorados)
- Endpoints críticos (/gameplay, /sync): 50%
- Outros endpoints: 10%
- Erros: 100% (sempre capturados)

### Uso no Código

```python
from backend.app.infra.monitoring.sentry_config import (
    init_sentry,
    capture_exception_with_context
)

# Inicialização (app.py)
init_sentry(app)

# Captura de exceções com contexto
try:
    process_game_session(data)
except Exception as e:
    capture_exception_with_context(e, context={
        'student_id': data.get('student_id'),
        'game_type': data.get('game_type'),
    })
    raise
```

## 🎮 Service Worker - Versionamento

### Problema: Cache Antigo

Se você corrigir um bug, o usuário pode não ver a mudança porque o navegador usa o cache antigo.

### Solução 1: Skip Waiting (Implementado)

O Service Worker já está configurado com `skipWaiting()`:

```javascript
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
```

### Solução 2: Notificação de Atualização

Adicione no React (frontend/src/App.js):

```javascript
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Nova versão disponível
      if (window.confirm('Nova versão disponível! Recarregar?')) {
        window.location.reload();
      }
    });
  }
}, []);
```

### Solução 3: Versionamento de Assets

O Webpack/Create React App já gera hashes nos nomes dos arquivos:

```
main.a4b3c2d1.js
main.e5f6g7h8.css
```

Isso garante que novos builds sempre baixem arquivos novos.

## 🧪 Testes de Carga

### Executar Localmente

```bash
# Teste rápido (30s, 50 usuários)
locust -f tests/load/locustfile.py \
  --headless \
  --users 50 \
  --spawn-rate 10 \
  --run-time 30s \
  --host http://localhost:5000

# Teste de estresse (5min, 500 usuários)
locust -f tests/load/locustfile.py \
  --headless \
  --users 500 \
  --spawn-rate 25 \
  --run-time 5m \
  --host http://localhost:5000

# Teste com interface web
locust -f tests/load/locustfile.py --host http://localhost:5000
# Acesse: http://localhost:8089
```

### Métricas de Sucesso

O pipeline falha se:

- Taxa de erro > 1%
- Tempo de resposta médio > 100ms
- p95 > 500ms
- p99 > 1000ms

### Interpretando Resultados

```
Total de requisições: 15000
Falhas: 45 (0.3%)              ✅ < 1%
RPS médio: 520                 ✅ > 500
Tempo médio: 85ms              ✅ < 100ms
p95: 320ms                     ✅ < 500ms
p99: 780ms                     ✅ < 1000ms
```

## 🐳 Docker Compose para Desenvolvimento

### Subir Ambiente Completo

```bash
# Sobe tudo (backend, frontend, redis, postgres)
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down

# Rebuild após mudanças
docker-compose up -d --build
```

### Estrutura do docker-compose.yml

```yaml
services:
  backend:
    build: ./backend
    ports: ["5000:5000"]
    depends_on: [postgres, redis]
  
  frontend:
    build: ./frontend
    ports: ["3000:80"]
  
  postgres:
    image: postgres:15-alpine
    volumes: [./data/postgres:/var/lib/postgresql/data]
  
  redis:
    image: redis:7-alpine
    volumes: [./data/redis:/data]
  
  celery:
    build: ./backend
    command: celery -A app.celery worker
    depends_on: [redis, postgres]
```

## 🚨 Troubleshooting

### Pipeline Falha no Load Test

**Sintoma:** Locust reporta alta taxa de erro

**Causas comuns:**
1. Banco de dados não inicializou a tempo
2. Redis não está acessível
3. Celery não está rodando

**Solução:**
```yaml
# Adicione health checks no docker-compose
postgres:
  healthcheck:
    test: ["CMD", "pg_isready"]
    interval: 10s
    timeout: 5s
    retries: 5
```

### Service Worker Não Atualiza

**Sintoma:** Usuários não veem mudanças após deploy

**Solução:**
1. Verifique se `skipWaiting()` está ativo
2. Force atualização: `Ctrl+Shift+R` (hard reload)
3. Limpe cache: DevTools > Application > Clear Storage

### Sentry Explodindo de Eventos

**Sintoma:** Cota do Sentry esgotada rapidamente

**Solução:**
1. Reduza `traces_sample_rate` para 5%
2. Adicione mais filtros em `before_send`
3. Use `in_app_include` para focar no seu código

## 📊 Monitoramento Pós-Deploy

### Métricas Importantes

1. **Sentry Dashboard**
   - Taxa de erro
   - Latência (p50, p95, p99)
   - Throughput (RPS)

2. **Logs**
   - Erros 5xx
   - Timeouts
   - Fila do Celery

3. **Infraestrutura**
   - CPU < 80%
   - Memória < 80%
   - Disco < 80%

### Alertas Recomendados

```yaml
# Sentry Alerts
- name: High Error Rate
  condition: error_rate > 1%
  action: notify_slack

- name: Slow Response Time
  condition: p95 > 500ms
  action: notify_slack

- name: Queue Buildup
  condition: celery_queue > 1000
  action: notify_slack
```

## 🎯 Checklist Pré-Deploy

- [ ] Todos os testes passando localmente
- [ ] Teste de carga executado com sucesso
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets do GitHub configurados
- [ ] Sentry configurado e testado
- [ ] Backup do banco de dados
- [ ] Plano de rollback definido
- [ ] Monitoramento ativo

## 📚 Recursos Adicionais

- [Locust Documentation](https://docs.locust.io/)
- [Sentry Best Practices](https://docs.sentry.io/platforms/python/guides/flask/)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Workbox (Service Worker)](https://developers.google.com/web/tools/workbox)

## 🤝 Contribuindo

Ao fazer um PR:

1. Certifique-se de que todos os testes passam
2. Adicione testes para novas funcionalidades
3. Atualize a documentação se necessário
4. Aguarde o pipeline completar antes de mergear

---

**Lembre-se:** O pipeline é seu amigo. Se ele falha, é porque encontrou um problema real. Não ignore os erros!
