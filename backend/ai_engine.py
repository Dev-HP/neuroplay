import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import pandas as pd
from datetime import datetime, timedelta
import json

class AIEngine:
    """
    Motor de IA para análise de desempenho e adaptação de dificuldade
    """
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.difficulty_model = None
        self.performance_history = []
        
    def analyze_session(self, session_data):
        """
        Analisa uma sessão de jogo e retorna insights
        
        Args:
            session_data: dict com dados da sessão
                - accuracy: float (0-100)
                - reaction_time: float (ms)
                - errors: int
                - success_streak: int
                - time_spent: float (segundos)
                - difficulty_level: int (1-10)
        
        Returns:
            dict com análise e recomendações
        """
        
        # Calcular métricas normalizadas
        normalized_accuracy = session_data['accuracy'] / 100
        normalized_reaction = min(session_data['reaction_time'] / 2000, 1)
        normalized_errors = min(session_data['errors'] / 10, 1)
        normalized_streak = min(session_data['success_streak'] / 10, 1)
        
        # Score de performance (0-1)
        performance_score = (
            normalized_accuracy * 0.4 +
            (1 - normalized_reaction) * 0.2 +
            (1 - normalized_errors) * 0.2 +
            normalized_streak * 0.2
        )
        
        # Adicionar ao histórico
        self.performance_history.append({
            'timestamp': datetime.now(),
            'score': performance_score,
            'data': session_data
        })
        
        # Manter apenas últimas 100 sessões
        if len(self.performance_history) > 100:
            self.performance_history = self.performance_history[-100:]
        
        # Gerar insights
        insights = self._generate_insights(performance_score, session_data)
        
        # Recomendar dificuldade
        recommended_difficulty = self._recommend_difficulty(
            session_data['difficulty_level'],
            performance_score
        )
        
        # Detectar padrões
        patterns = self._detect_patterns()
        
        return {
            'performance_score': performance_score,
            'insights': insights,
            'recommended_difficulty': recommended_difficulty,
            'patterns': patterns,
            'session_quality': self._classify_session(performance_score)
        }
    
    def _generate_insights(self, performance_score, session_data):
        """Gera insights personalizados baseados na performance"""
        insights = []
        
        # Análise de precisão
        if session_data['accuracy'] > 90:
            insights.append({
                'type': 'positive',
                'category': 'accuracy',
                'message': 'Excelente precisão! Você está dominando este jogo.',
                'icon': '🎯'
            })
        elif session_data['accuracy'] < 50:
            insights.append({
                'type': 'improvement',
                'category': 'accuracy',
                'message': 'Tente focar mais na precisão do que na velocidade.',
                'icon': '💡'
            })
        
        # Análise de tempo de reação
        if session_data['reaction_time'] < 500:
            insights.append({
                'type': 'positive',
                'category': 'speed',
                'message': 'Reflexos rápidos! Você está muito ágil.',
                'icon': '⚡'
            })
        elif session_data['reaction_time'] > 1500:
            insights.append({
                'type': 'tip',
                'category': 'speed',
                'message': 'Tente responder um pouco mais rápido.',
                'icon': '🏃'
            })
        
        # Análise de erros
        if session_data['errors'] == 0:
            insights.append({
                'type': 'achievement',
                'category': 'errors',
                'message': 'Perfeito! Nenhum erro nesta sessão!',
                'icon': '🏆'
            })
        elif session_data['errors'] > 5:
            insights.append({
                'type': 'attention',
                'category': 'errors',
                'message': 'Muitos erros. Que tal fazer uma pausa?',
                'icon': '☕'
            })
        
        # Análise de sequência de acertos
        if session_data['success_streak'] > 10:
            insights.append({
                'type': 'positive',
                'category': 'consistency',
                'message': f'Incrível! {session_data["success_streak"]} acertos seguidos!',
                'icon': '🔥'
            })
        
        # Análise de tempo de sessão
        if session_data['time_spent'] > 1800:  # 30 minutos
            insights.append({
                'type': 'warning',
                'category': 'fatigue',
                'message': 'Sessão longa. Considere fazer uma pausa.',
                'icon': '⏰'
            })
        
        return insights
    
    def _recommend_difficulty(self, current_difficulty, performance_score):
        """Recomenda próximo nível de dificuldade"""
        
        if performance_score > 0.85:
            # Excelente - aumentar dificuldade
            return min(10, current_difficulty + 1)
        elif performance_score > 0.7:
            # Bom - manter ou aumentar levemente
            return current_difficulty + (1 if np.random.random() > 0.5 else 0)
        elif performance_score < 0.4:
            # Baixo - reduzir dificuldade
            return max(1, current_difficulty - 1)
        elif performance_score < 0.55:
            # Médio-baixo - considerar reduzir
            return max(1, current_difficulty - (1 if np.random.random() > 0.5 else 0))
        else:
            # Manter
            return current_difficulty
    
    def _detect_patterns(self):
        """Detecta padrões no histórico de performance"""
        
        if len(self.performance_history) < 5:
            return {
                'trend': 'insufficient_data',
                'consistency': 0,
                'confidence': 0
            }
        
        # Pegar últimas 20 sessões
        recent = self.performance_history[-20:]
        scores = [h['score'] for h in recent]
        
        # Calcular tendência
        if len(scores) >= 10:
            recent_avg = np.mean(scores[-5:])
            older_avg = np.mean(scores[:5])
            
            if recent_avg > older_avg + 0.1:
                trend = 'improving'
            elif recent_avg < older_avg - 0.1:
                trend = 'declining'
            else:
                trend = 'stable'
        else:
            trend = 'stable'
        
        # Calcular consistência (inverso da variância)
        variance = np.var(scores)
        consistency = max(0, 1 - variance * 2)
        
        # Calcular confiança baseado em quantidade de dados
        confidence = min(len(self.performance_history) / 20, 1)
        
        return {
            'trend': trend,
            'consistency': consistency,
            'average_score': np.mean(scores),
            'confidence': confidence,
            'sessions_analyzed': len(scores)
        }
    
    def _classify_session(self, performance_score):
        """Classifica a qualidade da sessão"""
        if performance_score >= 0.85:
            return 'excellent'
        elif performance_score >= 0.7:
            return 'good'
        elif performance_score >= 0.5:
            return 'average'
        elif performance_score >= 0.3:
            return 'below_average'
        else:
            return 'poor'
    
    def predict_optimal_session_time(self):
        """Prediz tempo ideal de sessão baseado em histórico"""
        
        if len(self.performance_history) < 10:
            return 15  # Default 15 minutos
        
        # Analisar quando performance começa a cair
        sessions = self.performance_history[-30:]
        
        # Agrupar por tempo de sessão
        time_performance = {}
        for session in sessions:
            time_bucket = int(session['data']['time_spent'] / 300) * 5  # Buckets de 5 min
            if time_bucket not in time_performance:
                time_performance[time_bucket] = []
            time_performance[time_bucket].append(session['score'])
        
        # Encontrar ponto onde performance cai significativamente
        optimal_time = 15
        for time, scores in sorted(time_performance.items()):
            avg_score = np.mean(scores)
            if avg_score < 0.6:
                optimal_time = max(10, time - 5)
                break
            optimal_time = time
        
        return min(30, optimal_time)
    
    def generate_personalized_recommendations(self, user_profile):
        """
        Gera recomendações personalizadas baseadas no perfil do usuário
        
        Args:
            user_profile: dict com informações do usuário
                - age: int
                - diagnosis: str ('TDAH', 'TEA', 'both')
                - preferences: dict
                - goals: list
        
        Returns:
            dict com recomendações
        """
        
        recommendations = {
            'games': [],
            'session_duration': self.predict_optimal_session_time(),
            'frequency': 'daily',
            'tips': []
        }
        
        # Recomendações baseadas em diagnóstico
        if user_profile.get('diagnosis') == 'TDAH':
            recommendations['games'].extend([
                {'name': 'Mestres do Sinal', 'priority': 'high', 'reason': 'Treina controle inibitório'},
                {'name': 'Caçador de Alvos', 'priority': 'high', 'reason': 'Melhora atenção sustentada'},
                {'name': 'Memória Dupla', 'priority': 'medium', 'reason': 'Fortalece memória de trabalho'}
            ])
            recommendations['tips'].append('Sessões curtas e frequentes são mais eficazes para TDAH')
            
        elif user_profile.get('diagnosis') == 'TEA':
            recommendations['games'].extend([
                {'name': 'Quebra-cabeça', 'priority': 'high', 'reason': 'Desenvolve planejamento'},
                {'name': 'Jogo da Memória', 'priority': 'high', 'reason': 'Treina reconhecimento de padrões'},
                {'name': 'Ritmo e Sequência', 'priority': 'medium', 'reason': 'Melhora sequenciamento'}
            ])
            recommendations['tips'].append('Rotina consistente ajuda no engajamento')
        
        # Ajustar baseado em padrões detectados
        patterns = self._detect_patterns()
        if patterns['trend'] == 'declining':
            recommendations['tips'].append('Considere reduzir a duração das sessões')
            recommendations['session_duration'] = max(10, recommendations['session_duration'] - 5)
        
        return recommendations
    
    def export_analytics(self):
        """Exporta análises para relatório"""
        
        if not self.performance_history:
            return {'error': 'No data available'}
        
        scores = [h['score'] for h in self.performance_history]
        
        return {
            'total_sessions': len(self.performance_history),
            'average_performance': np.mean(scores),
            'best_performance': np.max(scores),
            'worst_performance': np.min(scores),
            'improvement_rate': self._calculate_improvement_rate(),
            'consistency_score': 1 - np.var(scores),
            'patterns': self._detect_patterns(),
            'last_session': self.performance_history[-1] if self.performance_history else None
        }
    
    def _calculate_improvement_rate(self):
        """Calcula taxa de melhora ao longo do tempo"""
        
        if len(self.performance_history) < 10:
            return 0
        
        # Comparar primeira metade com segunda metade
        mid = len(self.performance_history) // 2
        first_half = [h['score'] for h in self.performance_history[:mid]]
        second_half = [h['score'] for h in self.performance_history[mid:]]
        
        improvement = np.mean(second_half) - np.mean(first_half)
        return improvement

# Instância global
ai_engine = AIEngine()
