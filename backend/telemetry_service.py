"""
Serviço de Telemetria para NeuroPlay 2.0
Processa e armazena dados de performance cognitiva
"""

from datetime import datetime
from typing import List, Dict, Any
import json

class TelemetryService:
    """
    Gerencia coleta e análise de telemetria dos jogos
    """
    
    def __init__(self, db_connection):
        self.db = db_connection
    
    def process_batch(self, events: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Processa lote de eventos de telemetria
        
        Args:
            events: Lista de eventos com dados de performance
            
        Returns:
            Resultado do processamento
        """
        try:
            processed_count = 0
            errors = []
            
            for event in events:
                try:
                    self._store_event(event)
                    processed_count += 1
                except Exception as e:
                    errors.append({
                        'event': event,
                        'error': str(e)
                    })
            
            return {
                'success': True,
                'processed': processed_count,
                'total': len(events),
                'errors': errors
            }
            
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def _store_event(self, event: Dict[str, Any]):
        """
        Armazena evento individual no banco
        """
        cursor = self.db.cursor()
        
        # Extrai dados do evento
        session_id = event.get('session_id')
        game_module = event.get('game_module')
        event_type = event.get('event_type')
        timestamp = event.get('timestamp', datetime.utcnow().isoformat())
        
        # Dados específicos do evento
        event_data = {
            k: v for k, v in event.items()
            if k not in ['session_id', 'game_module', 'event_type', 'timestamp']
        }
        
        # Insere no banco
        cursor.execute("""
            INSERT INTO cognitive_events (
                session_id,
                game_module,
                event_type,
                timestamp,
                event_data
            ) VALUES (?, ?, ?, ?, ?)
        """, (
            session_id,
            game_module,
            event_type,
            timestamp,
            json.dumps(event_data)
        ))
        
        self.db.commit()
    
    def get_session_summary(self, session_id: str) -> Dict[str, Any]:
        """
        Gera resumo de uma sessão de jogo
        
        Args:
            session_id: ID da sessão
            
        Returns:
            Resumo com métricas agregadas
        """
        cursor = self.db.cursor()
        
        # Busca todos os eventos da sessão
        cursor.execute("""
            SELECT event_type, event_data, timestamp
            FROM cognitive_events
            WHERE session_id = ?
            ORDER BY timestamp
        """, (session_id,))
        
        events = cursor.fetchall()
        
        if not events:
            return {'error': 'Sessão não encontrada'}
        
        # Processa eventos
        summary = {
            'session_id': session_id,
            'total_events': len(events),
            'start_time': events[0][2] if events else None,
            'end_time': events[-1][2] if events else None,
            'metrics': self._calculate_metrics(events)
        }
        
        return summary
    
    def _calculate_metrics(self, events: List[tuple]) -> Dict[str, Any]:
        """
        Calcula métricas cognitivas a partir dos eventos
        """
        metrics = {
            'go_nogo': {
                'total_responses': 0,
                'correct_responses': 0,
                'incorrect_responses': 0,
                'avg_reaction_time': 0,
                'accuracy': 0
            },
            'math': {
                'total_attempts': 0,
                'correct_answers': 0,
                'avg_reaction_time': 0,
                'accuracy': 0
            }
        }
        
        go_nogo_times = []
        math_times = []
        
        for event_type, event_data_json, timestamp in events:
            event_data = json.loads(event_data_json)
            
            if event_type == 'go_nogo_response':
                metrics['go_nogo']['total_responses'] += 1
                
                if event_data.get('was_correct'):
                    metrics['go_nogo']['correct_responses'] += 1
                else:
                    metrics['go_nogo']['incorrect_responses'] += 1
                
                reaction_time = event_data.get('reaction_time_ms', 0)
                if reaction_time > 0:
                    go_nogo_times.append(reaction_time)
            
            elif event_type == 'math_solve':
                metrics['math']['total_attempts'] += 1
                
                if event_data.get('was_correct'):
                    metrics['math']['correct_answers'] += 1
                
                reaction_time = event_data.get('reaction_time_ms', 0)
                if reaction_time > 0:
                    math_times.append(reaction_time)
        
        # Calcula médias
        if go_nogo_times:
            metrics['go_nogo']['avg_reaction_time'] = sum(go_nogo_times) / len(go_nogo_times)
        
        if metrics['go_nogo']['total_responses'] > 0:
            metrics['go_nogo']['accuracy'] = (
                metrics['go_nogo']['correct_responses'] / 
                metrics['go_nogo']['total_responses']
            )
        
        if math_times:
            metrics['math']['avg_reaction_time'] = sum(math_times) / len(math_times)
        
        if metrics['math']['total_attempts'] > 0:
            metrics['math']['accuracy'] = (
                metrics['math']['correct_answers'] / 
                metrics['math']['total_attempts']
            )
        
        return metrics
    
    def get_user_progress(self, user_id: int, game_module: str) -> Dict[str, Any]:
        """
        Analisa progresso do usuário em um módulo específico
        
        Args:
            user_id: ID do usuário
            game_module: Nome do módulo (ex: 'cyber_runner')
            
        Returns:
            Análise de progresso com tendências
        """
        cursor = self.db.cursor()
        
        # Busca todas as sessões do usuário neste módulo
        cursor.execute("""
            SELECT DISTINCT session_id
            FROM cognitive_events
            WHERE game_module = ?
            ORDER BY timestamp
        """, (game_module,))
        
        sessions = cursor.fetchall()
        
        if not sessions:
            return {'error': 'Nenhuma sessão encontrada'}
        
        # Analisa cada sessão
        session_summaries = []
        for (session_id,) in sessions:
            summary = self.get_session_summary(session_id)
            session_summaries.append(summary)
        
        # Calcula tendências
        progress = {
            'total_sessions': len(session_summaries),
            'sessions': session_summaries,
            'trends': self._calculate_trends(session_summaries)
        }
        
        return progress
    
    def _calculate_trends(self, sessions: List[Dict]) -> Dict[str, Any]:
        """
        Calcula tendências de melhoria ao longo das sessões
        """
        if len(sessions) < 2:
            return {'message': 'Dados insuficientes para análise de tendência'}
        
        # Extrai métricas de cada sessão
        accuracies = []
        reaction_times = []
        
        for session in sessions:
            metrics = session.get('metrics', {})
            go_nogo = metrics.get('go_nogo', {})
            
            if go_nogo.get('accuracy'):
                accuracies.append(go_nogo['accuracy'])
            
            if go_nogo.get('avg_reaction_time'):
                reaction_times.append(go_nogo['avg_reaction_time'])
        
        trends = {}
        
        # Tendência de precisão
        if len(accuracies) >= 2:
            first_half = sum(accuracies[:len(accuracies)//2]) / (len(accuracies)//2)
            second_half = sum(accuracies[len(accuracies)//2:]) / (len(accuracies) - len(accuracies)//2)
            
            trends['accuracy_improvement'] = {
                'first_half': first_half,
                'second_half': second_half,
                'change': second_half - first_half,
                'percentage': ((second_half - first_half) / first_half * 100) if first_half > 0 else 0
            }
        
        # Tendência de tempo de reação
        if len(reaction_times) >= 2:
            first_half = sum(reaction_times[:len(reaction_times)//2]) / (len(reaction_times)//2)
            second_half = sum(reaction_times[len(reaction_times)//2:]) / (len(reaction_times) - len(reaction_times)//2)
            
            trends['reaction_time_improvement'] = {
                'first_half': first_half,
                'second_half': second_half,
                'change': first_half - second_half,  # Menor é melhor
                'percentage': ((first_half - second_half) / first_half * 100) if first_half > 0 else 0
            }
        
        return trends
