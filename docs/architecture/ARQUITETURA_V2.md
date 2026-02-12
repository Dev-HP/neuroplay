# Arquitetura NeuroPlay 2.0 - Alta Resiliência

## Visão Geral

O NeuroPlay 2.0 implementa uma arquitetura **Local-First** com **processamento assíncrono** para garantir:
- ✅ Funcionamento offline completo
- ✅ Latência zero para jogos
- ✅ Resiliência a falhas de rede
- ✅ Escalabilidade horizontal
- ✅ Segurança paranóica para dados de crianças

## Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    CRIANÇA / TABLET                         │
│                    (Offline-First)                          │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS + WSS
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  CDN / Cloudflare                           │
│              (Cache + DDoS Protection)                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Nginx / API Gateway                            │
│         (Load Balancer + Rate Limiting)                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
       ┌───────────────┴───────────────┐
       ▼                               ▼
┌──────────────┐              ┌──────────────┐
│   Frontend   │              │   Backend    │
│   (React)    │              │   (Flask)    │
│              │              │              │
│ IndexedDB ◄──┼──────────────┼──► Redis     │
│ (Local DB)   │  Background  │   (Cache)    │
│              │     Sync     │              │
│ Service      │              │ Celery       │
│ Worker       │              │ Workers      │
└──────────────┘              └──────┬───────┘
                                     │
                       ┌─────────────┴─────────────┐
                       ▼                           ▼
                ┌──────────────┐          ┌──────────────┐
                │  PostgreSQL  │          │   Celery     │
                │   (Primary)  │          │   Workers    │
                │              │          │              │
                │ + Read       │          │ Background   │
                │   Replica    │          │ Processing   │
                └──────────────┘          └──────────────┘
```

## Componentes Principais

### 1. Frontend - Local-First (PWA)

**Tecnologias:**
- React 18 (UI)
- IndexedDB (Banco local)
- Service Worker (Sync em background)
- React Konva (Canvas para jogos - performance)

**Fluxo:**
1. Jogo salva TUDO no IndexedDB (latência zero)
2. React lê do IndexedDB (não da API)
3. Service Worker sincroniza em background quando online

**Arquivos:**
```
frontend/src/
├── shared/
│   ├── db/
│   │   └── indexedDB.js          # Banco local
│   ├── sync/
│   │   └── backgroundSync.js     # Sincronização
│   └── workers/
│       └── service-worker.js     # PWA worker
```

### 2. Backend - Modular Monolith (Clean Architecture)

**Tecnologias:**
- Flask (API)
- Celery (Background tasks)
- Redis (Cache + Queue)
- PostgreSQL (Database)
- Pydantic (Validation)

**Estrutura:**
```
backend/app/
├── api/                    # Interface (Entrada)
│   ├── v1/
│   │   ├── auth.py        # Autenticação
│   │   ├── gameplay.py    # Sync de jogos (FAST)
│   │   └── reports.py     # Relatórios
│   └── middlewares/
│       └── rate_limiter.py # Anti-DDoS
│
├── core/                   # Regras de Negócio (Framework Agnostic)
│   ├── entities/
│   │   ├── student.py
│   │   └── game_session.py
│   └── use_cases/
│       └── process_game_completion.py
│
└── infra/                  # Implementação Técnica
    ├── database/          # SQLAlchemy models
    ├── cache/
    │   └── redis_service.py
    └── tasks/
        ├── celery_app.py
        └── game_tasks.py  # Background workers
```

### 3. Fluxo de Dados - Fire and Forget

**Problema Antigo:**
```
Aluno termina jogo → API recebe → API calcula pontos → 
API verifica nível → API salva → API retorna
⏱️ Demora: 2-5 segundos
```

**Solução Nova:**
```
Aluno termina jogo → API recebe → Redis queue → Responde "OK"
⏱️ Demora: 10ms

Em paralelo (background):
Celery Worker → Processa → Calcula → Salva → Atualiza cache
```

**Código:**
```python
# API Endpoint (FAST)
@gameplay_bp.route('/sync', methods=['POST'])
@rate_limiter.limit(max_requests=100, window_seconds=60)
def sync_gameplay():
    # 1. Valida JSON (Pydantic)
    data = GameSyncModel(**request.json)
    
    # 2. Salva no Redis
    redis.set(f"session:{session_id}:pending", data.dict())
    
    # 3. Queue background task
    process_game_completion_task.delay(session_id)
    
    # 4. Retorna imediatamente (10ms)
    return jsonify({"success": True}), 202
```

### 4. Banco de Dados - Otimização Brutal

**Problema:** Relatórios de educadores fazem `SELECT SUM(pontos)` em milhões de linhas.

**Solução:** Materialized Views

```sql
-- Tabela agregada (atualizada toda noite)
CREATE TABLE daily_stats_student (
    student_id INT,
    date DATE,
    total_score INT,
    games_played INT,
    avg_accuracy FLOAT,
    PRIMARY KEY (student_id, date)
);

-- Celery task (roda toda noite às 2am)
@celery_app.task
def calculate_daily_stats():
    # Agrega dados do dia anterior
    # Educador lê dessa tabela enxuta
```

## Segurança - Paranóica

### 1. Autenticação
- ✅ JWT em Cookie HttpOnly (JavaScript não acessa)
- ✅ CSRF Protection (Flask-WTF)
- ✅ Refresh Tokens (Access Token dura 15min)

### 2. Rate Limiting
```python
# Login: 5 tentativas/minuto
@rate_limiter.limit(max_requests=5, window_seconds=60)
def login():
    ...

# Sync: 100 requisições/minuto
@rate_limiter.limit(max_requests=100, window_seconds=60)
def sync_gameplay():
    ...
```

### 3. Validação de Entrada (Pydantic)
```python
class GameSyncModel(BaseModel):
    session_id: str
    student_id: int = Field(..., gt=0)
    game_type: str = Field(..., regex='^(cyber_runner|echo_temple|sonic_jump|gravity_lab)$')
    score: int = Field(..., ge=0)
```

## Deploy - GitHub Pages + Backend

### Frontend (GitHub Pages)
```yaml
# .github/workflows/deploy-frontend.yml
- Build React
- Deploy to GitHub Pages
- URL: https://[username].github.io/neuroplay
```

### Backend (Railway / Render / Fly.io)
```yaml
# docker-compose.yml
services:
  backend:      # Flask API
  celery_worker: # Background tasks
  celery_beat:   # Scheduled tasks
  redis:         # Cache + Queue
  postgres:      # Database
```

## Performance

### Métricas Esperadas
- ✅ Latência de jogo: 0ms (local)
- ✅ API response: <50ms (sync endpoint)
- ✅ Background processing: 1-5s
- ✅ Relatórios: <200ms (materialized views)
- ✅ Offline: Funciona 100%

### Escalabilidade
- Horizontal: Adicionar mais workers Celery
- Vertical: Aumentar Redis memory
- Database: Read replicas para relatórios

## Próximos Passos

1. ✅ Estrutura criada
2. ⏳ Implementar endpoints da API
3. ⏳ Configurar Celery tasks
4. ⏳ Integrar IndexedDB nos jogos
5. ⏳ Deploy e testes de carga

## Referências

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Local-First Software](https://www.inkandswitch.com/local-first/)
- [Celery Best Practices](https://docs.celeryproject.org/en/stable/userguide/tasks.html#best-practices)
