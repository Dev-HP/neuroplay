"""
NeuroPlay 2.5 - Game Session Entity
Entidade pura de domínio (sem dependências de framework)
"""

from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Dict, Any
import uuid


@dataclass
class GameSession:
    """
    Entidade que representa uma sessão de jogo.
    Contém APENAS regras de negócio, sem conhecimento de banco ou HTTP.
    """
    
    session_id: str
    student_id: int
    game_type: str
    score: int
    duration: int  # segundos
    accuracy: float  # 0.0 a 1.0
    completed: bool
    metadata: Dict[str, Any]
    created_at: Optional[datetime] = None
    
    def __post_init__(self):
        """Validações automáticas após criação"""
        if not self.session_id:
            self.session_id = str(uuid.uuid4())
        
        if not self.created_at:
            self.created_at = datetime.utcnow()
        
        # Validações de regra de negócio
        self._validate()
    
    def _validate(self):
        """Valida regras de negócio da entidade"""
        if self.score < 0:
            raise ValueError("Score não pode ser negativo")
        
        if self.duration < 0:
            raise ValueError("Duração não pode ser negativa")
        
        if not 0 <= self.accuracy <= 1:
            raise ValueError("Accuracy deve estar entre 0 e 1")
        
        if self.game_type not in ['cyber_runner', 'echo_temple', 'sonic_jump', 'gravity_lab']:
            raise ValueError(f"Tipo de jogo inválido: {self.game_type}")
    
    def is_valid_score(self) -> bool:
        """
        Anti-Cheat: Detecta pontuações suspeitas
        
        Regras:
        - Cyber Runner: Max 1000 pontos em 60s = 16.6 pts/s
        - Echo Temple: Max 500 pontos
        - Sonic Jump: Max 800 pontos
        - Gravity Lab: Max 600 pontos
        """
        max_scores = {
            'cyber_runner': 1000,
            'echo_temple': 500,
            'sonic_jump': 800,
            'gravity_lab': 600,
        }
        
        max_score = max_scores.get(self.game_type, 1000)
        
        # Verifica se score está dentro do limite
        if self.score > max_score:
            return False
        
        # Verifica taxa de pontos por segundo (anti-bot)
        if self.duration > 0:
            points_per_second = self.score / self.duration
            max_rate = max_score / 60  # Assumindo 60s como tempo mínimo realista
            
            if points_per_second > max_rate * 1.5:  # 50% de margem
                return False
        
        return True
    
    def calculate_difficulty_level(self) -> int:
        """
        Calcula nível de dificuldade baseado em performance
        Retorna: 1 (fácil) a 5 (muito difícil)
        """
        if self.accuracy >= 0.9:
            return 5
        elif self.accuracy >= 0.75:
            return 4
        elif self.accuracy >= 0.6:
            return 3
        elif self.accuracy >= 0.4:
            return 2
        else:
            return 1
    
    def get_performance_rating(self) -> str:
        """
        Retorna rating de performance para feedback
        """
        if self.accuracy >= 0.9 and self.completed:
            return 'excellent'
        elif self.accuracy >= 0.75:
            return 'good'
        elif self.accuracy >= 0.5:
            return 'average'
        else:
            return 'needs_improvement'
    
    def to_dict(self) -> Dict[str, Any]:
        """Serializa para dicionário (para JSON/DB)"""
        return {
            'session_id': self.session_id,
            'student_id': self.student_id,
            'game_type': self.game_type,
            'score': self.score,
            'duration': self.duration,
            'accuracy': self.accuracy,
            'completed': self.completed,
            'metadata': self.metadata,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'difficulty_level': self.calculate_difficulty_level(),
            'performance_rating': self.get_performance_rating(),
        }
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> 'GameSession':
        """Cria entidade a partir de dicionário"""
        created_at = data.get('created_at')
        if isinstance(created_at, str):
            created_at = datetime.fromisoformat(created_at)
        
        return cls(
            session_id=data['session_id'],
            student_id=data['student_id'],
            game_type=data['game_type'],
            score=data['score'],
            duration=data['duration'],
            accuracy=data['accuracy'],
            completed=data['completed'],
            metadata=data.get('metadata', {}),
            created_at=created_at,
        )
