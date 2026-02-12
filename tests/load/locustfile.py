"""
NeuroPlay 2.5 - Teste de Carga com Locust
Simula 1000+ crianças jogando simultaneamente

Comando para rodar:
    locust -f tests/load/locustfile.py --host=http://localhost:5000 --users 1000 --spawn-rate 50

Métricas esperadas (sistema saudável):
- RPS: 500+
- Failure Rate: < 1%
- Response Time (p95): < 100ms
- Response Time (p99): < 500ms
"""

from locust import HttpUser, task, between, events
import random
import uuid
import json
from datetime import datetime


# ============================================
# DADOS DE TESTE
# ============================================

GAME_TYPES = ['cyber_runner', 'echo_temple', 'sonic_jump', 'gravity_lab']

STUDENT_IDS = list(range(1, 101))  # 100 estudantes de teste


def generate_game_session():
    """Gera dados realistas de sessão de jogo"""
    game_type = random.choice(GAME_TYPES)
    
    # Scores realistas por jogo
    score_ranges = {
        'cyber_runner': (100, 1000),
        'echo_temple': (50, 500),
        'sonic_jump': (100, 800),
        'gravity_lab': (80, 600),
    }
    
    # Durações realistas (segundos)
    duration_ranges = {
        'cyber_runner': (60, 300),
        'echo_temple': (90, 400),
        'sonic_jump': (45, 200),
        'gravity_lab': (70, 350),
    }
    
    score_range = score_ranges[game_type]
    duration_range = duration_ranges[game_type]
    
    return {
        'session_id': str(uuid.uuid4()),
        'student_id': random.choice(STUDENT_IDS),
        'game_type': game_type,
        'score': random.randint(*score_range),
        'duration': random.randint(*duration_range),
        'accuracy': round(random.uniform(0.5, 1.0), 2),
        'completed': random.choice([True, True, True, False]),  # 75% completam
        'metadata': {
            'obstacles_dodged': random.randint(10, 50),
            'power_ups_collected': random.randint(0, 10),
            'mistakes': random.randint(0, 15),
        },
        'created_at': datetime.utcnow().isoformat(),
    }


# ============================================
# USUÁRIO SIMULADO
# ============================================

class ChildGamer(HttpUser):
    """
    Simula comportamento de uma criança jogando
    
    Padrão de uso:
    1. Login (1x)
    2. Joga vários jogos (peso 10)
    3. Consulta conquistas (peso 3)
    4. Consulta estatísticas (peso 2)
    """
    
    # Tempo de espera entre ações (1-5 segundos)
    wait_time = between(1, 5)
    
    def on_start(self):
        """Executado quando usuário inicia"""
        self.student_id = random.choice(STUDENT_IDS)
        self.login()
    
    def login(self):
        """Simula login"""
        response = self.client.post('/api/v1/auth/login', json={
            'username': f'student_{self.student_id}',
            'password': 'test123'
        }, name='/api/v1/auth/login')
        
        if response.status_code == 200:
            self.token = response.json().get('token')
        else:
            self.token = 'fake-token-for-testing'
    
    @task(10)
    def submit_game_score(self):
        """
        Tarefa principal: Submeter pontuação de jogo
        Peso 10 = 10x mais frequente que outras tarefas
        """
        session_data = generate_game_session()
        session_data['student_id'] = self.student_id
        
        with self.client.post(
            '/api/v1/gameplay/sync',
            json=session_data,
            headers={'Authorization': f'Bearer {self.token}'},
            catch_response=True,
            name='/api/v1/gameplay/sync'
        ) as response:
            if response.status_code == 200:
                response.success()
            elif response.status_code == 202:
                # Aceito para processamento assíncrono
                response.success()
            else:
                response.failure(f'Status {response.status_code}')
    
    @task(3)
    def get_achievements(self):
        """Consulta conquistas do estudante"""
        self.client.get(
            f'/api/v1/achievements/student/{self.student_id}',
            headers={'Authorization': f'Bearer {self.token}'},
            name='/api/v1/achievements/student/:id'
        )
    
    @task(2)
    def get_statistics(self):
        """Consulta estatísticas do estudante"""
        self.client.get(
            f'/api/v1/statistics/student/{self.student_id}',
            headers={'Authorization': f'Bearer {self.token}'},
            name='/api/v1/statistics/student/:id'
        )
    
    @task(1)
    def get_leaderboard(self):
        """Consulta ranking"""
        self.client.get(
            '/api/v1/leaderboard',
            name='/api/v1/leaderboard'
        )


# ============================================
# CENÁRIOS DE TESTE ESPECÍFICOS
# ============================================

class StressTestUser(HttpUser):
    """
    Teste de estresse: Submissões rápidas sem espera
    Simula pico de tráfego (ex: final de aula)
    """
    wait_time = between(0.1, 0.5)  # Muito rápido
    
    @task
    def rapid_fire_submissions(self):
        """Submissões em rajada"""
        for _ in range(5):
            session_data = generate_game_session()
            self.client.post('/api/v1/gameplay/sync', json=session_data)


class ReadHeavyUser(HttpUser):
    """
    Teste de leitura: Muitas consultas, poucas escritas
    Simula educador consultando dados
    """
    wait_time = between(0.5, 2)
    
    @task(10)
    def read_statistics(self):
        student_id = random.choice(STUDENT_IDS)
        self.client.get(f'/api/v1/statistics/student/{student_id}')
    
    @task(5)
    def read_achievements(self):
        student_id = random.choice(STUDENT_IDS)
        self.client.get(f'/api/v1/achievements/student/{student_id}')
    
    @task(1)
    def write_game(self):
        session_data = generate_game_session()
        self.client.post('/api/v1/gameplay/sync', json=session_data)


# ============================================
# EVENTOS E MÉTRICAS CUSTOMIZADAS
# ============================================

@events.test_start.add_listener
def on_test_start(environment, **kwargs):
    """Executado no início do teste"""
    print("\n" + "="*60)
    print("🚀 INICIANDO TESTE DE CARGA - NEUROPLAY 2.5")
    print("="*60)
    print(f"Target: {environment.host}")
    print(f"Users: {environment.runner.target_user_count if hasattr(environment.runner, 'target_user_count') else 'N/A'}")
    print("="*60 + "\n")


@events.test_stop.add_listener
def on_test_stop(environment, **kwargs):
    """Executado no final do teste"""
    stats = environment.stats
    
    print("\n" + "="*60)
    print("📊 RESULTADO DO TESTE DE CARGA")
    print("="*60)
    print(f"Total de requisições: {stats.total.num_requests}")
    print(f"Falhas: {stats.total.num_failures} ({stats.total.fail_ratio*100:.2f}%)")
    print(f"RPS médio: {stats.total.total_rps:.2f}")
    print(f"Tempo de resposta médio: {stats.total.avg_response_time:.2f}ms")
    print(f"Tempo de resposta p95: {stats.total.get_response_time_percentile(0.95):.2f}ms")
    print(f"Tempo de resposta p99: {stats.total.get_response_time_percentile(0.99):.2f}ms")
    print("="*60)
    
    # Critérios de sucesso
    success = True
    
    if stats.total.fail_ratio > 0.01:  # > 1% de falhas
        print("❌ FALHOU: Taxa de erro acima de 1%")
        success = False
    
    if stats.total.avg_response_time > 100:  # > 100ms
        print("⚠️  AVISO: Tempo de resposta médio alto")
    
    if stats.total.get_response_time_percentile(0.95) > 500:  # p95 > 500ms
        print("❌ FALHOU: p95 acima de 500ms")
        success = False
    
    if success:
        print("✅ TESTE PASSOU: Sistema está escalável!")
    
    print("="*60 + "\n")


# ============================================
# CONFIGURAÇÕES RECOMENDADAS
# ============================================

"""
CENÁRIOS DE TESTE:

1. Teste de Carga Normal (500 usuários):
   locust -f locustfile.py --host=http://localhost:5000 --users 500 --spawn-rate 25 --run-time 5m

2. Teste de Estresse (1000 usuários):
   locust -f locustfile.py --host=http://localhost:5000 --users 1000 --spawn-rate 50 --run-time 10m

3. Teste de Pico (2000 usuários em 30s):
   locust -f locustfile.py --host=http://localhost:5000 --users 2000 --spawn-rate 100 --run-time 2m

4. Teste de Resistência (24 horas):
   locust -f locustfile.py --host=http://localhost:5000 --users 200 --spawn-rate 10 --run-time 24h

5. Teste Distribuído (múltiplas máquinas):
   # Master
   locust -f locustfile.py --master --expect-workers 4
   
   # Workers (em outras máquinas)
   locust -f locustfile.py --worker --master-host=<master-ip>

MÉTRICAS DE SUCESSO:
- RPS: > 500 requisições/segundo
- Failure Rate: < 1%
- Response Time (avg): < 100ms
- Response Time (p95): < 500ms
- Response Time (p99): < 1000ms
- CPU: < 80%
- Memory: < 80%
- Redis Queue: < 1000 jobs
"""
