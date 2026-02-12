"""
NeuroPlay 2.5 - Process Game Completion Use Case
Lógica de negócio PURA - 100% testável sem mocks de framework
"""

from typing import Dict, Any, List
from ..entities.game_session import GameSession
from ..interfaces.repositories import (
    IStudentRepository, 
    IGameRepository,
    IAchievementRepository
)


class ProcessGameCompletion:
    """
    Use Case: Processar conclusão de jogo
    
    Responsabilidades:
    1. Validar sessão (anti-cheat)
    2. Calcular XP e gamificação
    3. Verificar conquistas
    4. Persistir dados
    5. Retornar feedback
    
    NÃO conhece Flask, Celery, SQLAlchemy - apenas regras de negócio
    """
    
    def __init__(
        self,
        student_repo: IStudentRepository,
        game_repo: IGameRepository,
        achievement_repo: IAchievementRepository
    ):
        self.student_repo = student_repo
        self.game_repo = game_repo
        self.achievement_repo = achievement_repo
    
    def execute(self, session_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executa o caso de uso
        
        Args:
            session_data: Dados da sessão de jogo
        
        Returns:
            Resultado com XP, level, conquistas, etc
        
        Raises:
            ValueError: Se dados inválidos ou suspeitos
        """
        
        # 1. Reconstrói entidade (validação automática)
        session = GameSession.from_dict(session_data)
        
        # 2. Anti-Cheat
        if not session.is_valid_score():
            raise ValueError(
                f"Pontuação suspeita detectada: {session.score} pontos "
                f"em {session.duration}s no jogo {session.game_type}"
            )
        
        # 3. Busca estudante
        student = self.student_repo.get_by_id(session.student_id)
        if not student:
            raise ValueError(f"Estudante {session.student_id} não encontrado")
        
        # 4. Calcula XP (regra de negócio)
        xp_gained = self._calculate_xp(session)
        bonus_xp = self._calculate_bonus_xp(session, student)
        total_xp = xp_gained + bonus_xp
        
        # 5. Atualiza XP do estudante
        updated_student = self.student_repo.add_xp(session.student_id, total_xp)
        
        # 6. Verifica conquistas desbloqueadas
        new_achievements = self._check_achievements(session, updated_student)
        
        # 7. Persiste sessão
        self.game_repo.save_session(session)
        
        # 8. Retorna resultado
        return {
            'session_id': session.session_id,
            'xp_gained': xp_gained,
            'bonus_xp': bonus_xp,
            'total_xp': total_xp,
            'new_total_xp': updated_student['xp'],
            'level': updated_student['level'],
            'leveled_up': updated_student.get('leveled_up', False),
            'new_achievements': new_achievements,
            'performance_rating': session.get_performance_rating(),
            'difficulty_level': session.calculate_difficulty_level(),
            'feedback': self._generate_feedback(session, new_achievements),
        }
    
    def _calculate_xp(self, session: GameSession) -> int:
        """
        Calcula XP base da sessão
        
        Regras:
        - Score base: 1 XP por ponto
        - Bônus de accuracy: +50% se >= 90%
        - Bônus de velocidade: +25% se completou rápido
        - Bônus de conclusão: +100 XP se completou
        """
        base_xp = session.score
        
        # Bônus de accuracy
        if session.accuracy >= 0.9:
            base_xp = int(base_xp * 1.5)
        elif session.accuracy >= 0.75:
            base_xp = int(base_xp * 1.25)
        
        # Bônus de velocidade (específico por jogo)
        speed_thresholds = {
            'cyber_runner': 120,  # 2 minutos
            'echo_temple': 180,   # 3 minutos
            'sonic_jump': 90,     # 1.5 minutos
            'gravity_lab': 150,   # 2.5 minutos
        }
        
        threshold = speed_thresholds.get(session.game_type, 120)
        if session.duration < threshold and session.completed:
            base_xp = int(base_xp * 1.25)
        
        # Bônus de conclusão
        if session.completed:
            base_xp += 100
        
        return base_xp
    
    def _calculate_bonus_xp(
        self, 
        session: GameSession, 
        student: Dict[str, Any]
    ) -> int:
        """
        Calcula XP bônus baseado em contexto do estudante
        
        Regras:
        - Primeira vez no jogo: +200 XP
        - Streak diário: +50 XP por dia consecutivo (max 500)
        - Melhoria de performance: +100 XP
        """
        bonus = 0
        
        # Primeira vez no jogo
        games_played = student.get('games_played', {})
        if session.game_type not in games_played:
            bonus += 200
        
        # Streak diário
        streak = student.get('daily_streak', 0)
        bonus += min(streak * 50, 500)
        
        # Melhoria de performance
        last_accuracy = student.get('last_accuracy', {}).get(session.game_type, 0)
        if session.accuracy > last_accuracy + 0.1:  # Melhorou 10%+
            bonus += 100
        
        return bonus
    
    def _check_achievements(
        self, 
        session: GameSession, 
        student: Dict[str, Any]
    ) -> List[Dict[str, Any]]:
        """
        Verifica conquistas desbloqueadas
        
        Retorna lista de conquistas novas
        """
        new_achievements = []
        
        # Conquistas baseadas em sessão
        achievement_checks = [
            # Primeira vez
            ('first_' + session.game_type, lambda: True),
            
            # Performance
            ('perfect_score_' + session.game_type, 
             lambda: session.accuracy >= 0.95 and session.completed),
            
            # Velocidade
            ('speed_demon_' + session.game_type,
             lambda: session.duration < 60 and session.completed),
        ]
        
        for achievement_id, condition in achievement_checks:
            if condition():
                unlocked = self.achievement_repo.unlock_achievement(
                    session.student_id,
                    achievement_id
                )
                if unlocked:
                    new_achievements.append({
                        'id': achievement_id,
                        'unlocked_at': session.created_at.isoformat(),
                    })
        
        return new_achievements
    
    def _generate_feedback(
        self, 
        session: GameSession, 
        achievements: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Gera feedback personalizado para o estudante
        """
        rating = session.get_performance_rating()
        
        messages = {
            'excellent': 'Incrível! Você está dominando este jogo! 🌟',
            'good': 'Muito bem! Continue assim! 👏',
            'average': 'Bom trabalho! Você está melhorando! 💪',
            'needs_improvement': 'Continue tentando! Você vai conseguir! 🎯',
        }
        
        feedback = {
            'message': messages.get(rating, 'Parabéns por jogar!'),
            'rating': rating,
            'achievements_unlocked': len(achievements),
            'suggestions': self._generate_suggestions(session),
        }
        
        return feedback
    
    def _generate_suggestions(self, session: GameSession) -> List[str]:
        """Gera sugestões de melhoria"""
        suggestions = []
        
        if session.accuracy < 0.7:
            suggestions.append('Tente focar mais na precisão do que na velocidade')
        
        if not session.completed:
            suggestions.append('Tente completar o jogo na próxima vez')
        
        if session.duration > 300:  # 5 minutos
            suggestions.append('Tente ser mais rápido nas decisões')
        
        return suggestions
