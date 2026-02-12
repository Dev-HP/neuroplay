"""
NeuroPlay 2.5 - Configuração Inteligente do Sentry
Evita explosão de eventos e custos desnecessários
"""

import os
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration
from sentry_sdk.integrations.celery import CeleryIntegration
from sentry_sdk.integrations.redis import RedisIntegration


def init_sentry(app=None):
    """
    Inicializa Sentry com configurações otimizadas
    
    Estratégia:
    - Produção: 10% de transações de sucesso, 100% de erros
    - Staging: 50% de tudo
    - Development: Desabilitado
    """
    
    environment = os.getenv('FLASK_ENV', 'development')
    sentry_dsn = os.getenv('SENTRY_DSN')
    
    if not sentry_dsn:
        if app:
            app.logger.info("Sentry DSN não configurado - monitoramento desabilitado")
        return
    
    # Configurações por ambiente
    config = {
        'production': {
            'traces_sample_rate': 0.1,  # 10% das transações
            'profiles_sample_rate': 0.05,  # 5% dos perfis
            'error_sample_rate': 1.0,  # 100% dos erros
        },
        'staging': {
            'traces_sample_rate': 0.5,  # 50% das transações
            'profiles_sample_rate': 0.25,  # 25% dos perfis
            'error_sample_rate': 1.0,  # 100% dos erros
        },
        'development': {
            'traces_sample_rate': 0.0,  # Desabilitado
            'profiles_sample_rate': 0.0,  # Desabilitado
            'error_sample_rate': 0.0,  # Desabilitado
        },
    }
    
    env_config = config.get(environment, config['development'])
    
    # Função de amostragem customizada
    def traces_sampler(sampling_context):
        """
        Amostragem inteligente baseada no tipo de transação
        
        Prioridades:
        - Erros: 100% (sempre captura)
        - Endpoints críticos: 50%
        - Endpoints normais: 10%
        - Health checks: 0% (ignora)
        """
        
        # Sempre captura erros
        if sampling_context.get('parent_sampled') is True:
            return 1.0
        
        # Ignora health checks
        transaction_context = sampling_context.get('transaction_context', {})
        op = transaction_context.get('op', '')
        name = transaction_context.get('name', '')
        
        if 'health' in name.lower():
            return 0.0
        
        # Endpoints críticos (gameplay, sync)
        critical_endpoints = ['/api/v1/gameplay', '/api/v1/sync', '/api/v1/achievements']
        if any(endpoint in name for endpoint in critical_endpoints):
            return 0.5  # 50% dos endpoints críticos
        
        # Outros endpoints
        return env_config['traces_sample_rate']
    
    # Função para filtrar eventos antes de enviar
    def before_send(event, hint):
        """
        Filtra eventos antes de enviar ao Sentry
        
        Ignora:
        - Erros esperados (404, 401)
        - Erros de validação
        - Rate limiting
        """
        
        # Ignora erros HTTP esperados
        if 'exc_info' in hint:
            exc_type, exc_value, tb = hint['exc_info']
            
            # Ignora erros de autenticação/autorização
            if 'Unauthorized' in str(exc_value) or 'Forbidden' in str(exc_value):
                return None
            
            # Ignora rate limiting
            if 'Rate limit exceeded' in str(exc_value):
                return None
        
        # Ignora 404s
        if event.get('request', {}).get('url', '').endswith('/favicon.ico'):
            return None
        
        # Adiciona contexto extra
        event.setdefault('tags', {})
        event['tags']['environment'] = environment
        
        return event
    
    # Inicializa Sentry
    sentry_sdk.init(
        dsn=sentry_dsn,
        environment=environment,
        
        # Integrações
        integrations=[
            FlaskIntegration(
                transaction_style='url',  # Agrupa por URL pattern
            ),
            CeleryIntegration(
                monitor_beat_tasks=True,
                exclude_beat_tasks=[],
            ),
            RedisIntegration(),
        ],
        
        # Amostragem
        traces_sampler=traces_sampler,
        profiles_sample_rate=env_config['profiles_sample_rate'],
        
        # Filtros
        before_send=before_send,
        
        # Performance
        send_default_pii=False,  # Não envia PII
        attach_stacktrace=True,  # Anexa stack trace
        
        # Agrupamento de erros
        in_app_include=['backend.app'],  # Só código da aplicação
        
        # Release tracking
        release=os.getenv('GIT_COMMIT', 'unknown'),
        
        # Debug
        debug=environment == 'development',
    )
    
    if app:
        app.logger.info(f"Sentry inicializado - Ambiente: {environment}")
        app.logger.info(f"Sample rates - Traces: {env_config['traces_sample_rate']}, Profiles: {env_config['profiles_sample_rate']}")


def capture_exception_with_context(exception, context=None):
    """
    Captura exceção com contexto adicional
    
    Args:
        exception: Exceção a ser capturada
        context: Dicionário com contexto adicional
    """
    with sentry_sdk.push_scope() as scope:
        if context:
            for key, value in context.items():
                scope.set_context(key, value)
        
        sentry_sdk.capture_exception(exception)


def capture_message_with_context(message, level='info', context=None):
    """
    Captura mensagem com contexto adicional
    
    Args:
        message: Mensagem a ser capturada
        level: Nível de severidade (debug, info, warning, error, fatal)
        context: Dicionário com contexto adicional
    """
    with sentry_sdk.push_scope() as scope:
        if context:
            for key, value in context.items():
                scope.set_context(key, value)
        
        sentry_sdk.capture_message(message, level=level)


# ============================================
# EXEMPLO DE USO
# ============================================

"""
# No app.py:
from backend.app.infra.monitoring.sentry_config import init_sentry

app = Flask(__name__)
init_sentry(app)


# Em qualquer lugar do código:
from backend.app.infra.monitoring.sentry_config import (
    capture_exception_with_context,
    capture_message_with_context
)

try:
    process_game_session(session_data)
except Exception as e:
    capture_exception_with_context(e, context={
        'student_id': session_data.get('student_id'),
        'game_type': session_data.get('game_type'),
    })
    raise


# Para mensagens importantes:
capture_message_with_context(
    'Fila de sincronização atingiu 1000 itens',
    level='warning',
    context={'queue_size': 1000}
)
"""
