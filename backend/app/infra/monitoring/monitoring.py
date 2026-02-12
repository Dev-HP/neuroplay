"""
NeuroPlay 2.5 - Observabilidade Profissional
Sentry (Erros) + Prometheus (Métricas) + Logging Estruturado
"""

import os
import logging
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.redis import RedisIntegration
from prometheus_client import Counter, Histogram, Gauge, generate_latest
from functools import wraps
import time
from typing import Callable, Any


# ============================================
# MÉTRICAS PROMETHEUS
# ============================================

# Contadores
GAME_SYNCS_TOTAL = Counter(
    'neuroplay_game_syncs_total',
    'Total de jogos sincronizados',
    ['game_type', 'status']
)

ACHIEVEMENTS_UNLOCKED = Counter(
    'neuroplay_achievements_unlocked_total',
    'Total de conquistas desbloqueadas',
    ['achievement_id']
)

API_REQUESTS_TOTAL = Counter(
    'neuroplay_api_requests_total',
    'Total de requisições na API',
    ['method', 'endpoint', 'status']
)

ERRORS_TOTAL = Counter(
    'neuroplay_errors_total',
    'Total de erros',
    ['error_type', 'component']
)

# Histogramas (para latência)
GAME_PROCESSING_TIME = Histogram(
    'neuroplay_game_processing_seconds',
    'Tempo de processamento do jogo no Celery',
    ['game_type'],
    buckets=[0.1, 0.5, 1.0, 2.0, 5.0, 10.0]
)

API_RESPONSE_TIME = Histogram(
    'neuroplay_api_response_seconds',
    'Tempo de resposta da API',
    ['endpoint'],
    buckets=[0.01, 0.05, 0.1, 0.5, 1.0, 2.0]
)

REDIS_OPERATION_TIME = Histogram(
    'neuroplay_redis_operation_seconds',
    'Tempo de operações no Redis',
    ['operation'],
    buckets=[0.001, 0.005, 0.01, 0.05, 0.1]
)

# Gauges (valores instantâneos)
ACTIVE_USERS = Gauge(
    'neuroplay_active_users',
    'Número de usuários ativos'
)

QUEUE_SIZE = Gauge(
    'neuroplay_queue_size',
    'Tamanho da fila do Celery',
    ['queue_name']
)

CACHE_HIT_RATE = Gauge(
    'neuroplay_cache_hit_rate',
    'Taxa de acerto do cache Redis'
)


# ============================================
# CONFIGURAÇÃO DO SENTRY
# ============================================

def init_sentry(app=None):
    """
    Inicializa Sentry para rastreamento de erros
    
    Monitora:
    - Exceções não tratadas
    - Performance de requisições
    - Breadcrumbs de ações do usuário
    """
    sentry_dsn = os.getenv('SENTRY_DSN')
    
    if not sentry_dsn:
        logging.warning('SENTRY_DSN não configurado - Monitoramento desabilitado')
        return
    
    environment = os.getenv('ENVIRONMENT', 'development')
    
    sentry_sdk.init(
        dsn=sentry_dsn,
        environment=environment,
        
        # Integrações
        integrations=[
            FlaskIntegration(),
            CeleryIntegration(),
            RedisIntegration(),
        ],
        
        # Performance Monitoring
        traces_sample_rate=0.1 if environment == 'production' else 1.0,
        
        # Profiling
        profiles_sample_rate=0.1 if environment == 'production' else 1.0,
        
        # Release tracking
        release=os.getenv('APP_VERSION', 'unknown'),
        
        # Filtros
        before_send=filter_sensitive_data,
        
        # Debug
        debug=environment == 'development',
    )
    
    logging.info(f'Sentry inicializado - Environment: {environment}')


def filter_sensitive_data(event, hint):
    """
    Filtra dados sensíveis antes de enviar ao Sentry
    Remove: senhas, tokens, emails, etc
    """
    if 'request' in event:
        # Remove headers sensíveis
        if 'headers' in event['request']:
            sensitive_headers = ['Authorization', 'Cookie', 'X-API-Key']
            for header in sensitive_headers:
                if header in event['request']['headers']:
                    event['request']['headers'][header] = '[FILTERED]'
        
        # Remove dados sensíveis do body
        if 'data' in event['request']:
            sensitive_fields = ['password', 'token', 'email', 'cpf']
            for field in sensitive_fields:
                if field in event['request']['data']:
                    event['request']['data'][field] = '[FILTERED]'
    
    return event


# ============================================
# LOGGING ESTRUTURADO
# ============================================

def setup_logging():
    """
    Configura logging estruturado (JSON)
    Facilita parsing por ferramentas como ELK, Datadog
    """
    import json_logging
    
    json_logging.init_flask(enable_json=True)
    json_logging.init_request_instrument()
    
    # Configuração do logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    
    # Handler para stdout (Docker/Kubernetes)
    handler = logging.StreamHandler()
    handler.setLevel(logging.INFO)
    
    # Formato estruturado
    formatter = logging.Formatter(
        '{"time":"%(asctime)s", "level":"%(levelname)s", '
        '"component":"%(name)s", "message":"%(message)s"}'
    )
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    
    return logger


# ============================================
# DECORADORES PARA MÉTRICAS
# ============================================

def track_time(metric: Histogram, labels: dict = None):
    """
    Decorator para medir tempo de execução
    
    Uso:
        @track_time(GAME_PROCESSING_TIME, {'game_type': 'cyber_runner'})
        def process_game(data):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            start_time = time.time()
            try:
                result = func(*args, **kwargs)
                return result
            finally:
                duration = time.time() - start_time
                if labels:
                    metric.labels(**labels).observe(duration)
                else:
                    metric.observe(duration)
        return wrapper
    return decorator


def count_calls(counter: Counter, labels: dict = None):
    """
    Decorator para contar chamadas de função
    
    Uso:
        @count_calls(GAME_SYNCS_TOTAL, {'game_type': 'cyber_runner', 'status': 'success'})
        def sync_game(data):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            try:
                result = func(*args, **kwargs)
                if labels:
                    counter.labels(**labels).inc()
                else:
                    counter.inc()
                return result
            except Exception as e:
                # Conta erro
                error_labels = labels.copy() if labels else {}
                error_labels['status'] = 'error'
                counter.labels(**error_labels).inc()
                raise e
        return wrapper
    return decorator


def track_errors(component: str):
    """
    Decorator para rastrear erros
    
    Uso:
        @track_errors('game_processor')
        def process_game(data):
            ...
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        def wrapper(*args, **kwargs) -> Any:
            try:
                return func(*args, **kwargs)
            except Exception as e:
                # Incrementa contador de erros
                ERRORS_TOTAL.labels(
                    error_type=type(e).__name__,
                    component=component
                ).inc()
                
                # Envia para Sentry
                sentry_sdk.capture_exception(e)
                
                # Re-raise
                raise e
        return wrapper
    return decorator


# ============================================
# HEALTH CHECK
# ============================================

def get_health_status() -> dict:
    """
    Retorna status de saúde do sistema
    Usado por Kubernetes liveness/readiness probes
    """
    import redis
    from sqlalchemy import text
    from app import db
    
    status = {
        'status': 'healthy',
        'checks': {}
    }
    
    # Check Database
    try:
        db.session.execute(text('SELECT 1'))
        status['checks']['database'] = 'ok'
    except Exception as e:
        status['checks']['database'] = f'error: {str(e)}'
        status['status'] = 'unhealthy'
    
    # Check Redis
    try:
        redis_client = redis.from_url(os.getenv('REDIS_URL', 'redis://localhost:6379'))
        redis_client.ping()
        status['checks']['redis'] = 'ok'
    except Exception as e:
        status['checks']['redis'] = f'error: {str(e)}'
        status['status'] = 'unhealthy'
    
    # Check Celery (via Redis)
    try:
        from celery import Celery
        celery_app = Celery('neuroplay')
        celery_app.config_from_object('celeryconfig')
        
        # Verifica workers ativos
        inspect = celery_app.control.inspect()
        active_workers = inspect.active()
        
        if active_workers:
            status['checks']['celery'] = f'ok ({len(active_workers)} workers)'
        else:
            status['checks']['celery'] = 'warning: no workers'
            status['status'] = 'degraded'
    except Exception as e:
        status['checks']['celery'] = f'error: {str(e)}'
        status['status'] = 'unhealthy'
    
    return status


# ============================================
# ENDPOINT DE MÉTRICAS
# ============================================

def metrics_endpoint():
    """
    Endpoint para Prometheus scraping
    Expõe métricas em formato Prometheus
    """
    return generate_latest(), 200, {'Content-Type': 'text/plain; charset=utf-8'}
