"""
NeuroPlay 2.5 - Repository Interfaces
Contratos puros (Dependency Inversion Principle)
"""

from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any
from ..entities.game_session import GameSession


class IStudentRepository(ABC):
    """Interface para repositório de estudantes"""
    
    @abstractmethod
    def get_by_id(self, student_id: int) -> Optional[Dict[str, Any]]:
        """Busca estudante por ID"""
        pass
    
    @abstractmethod
    def update(self, student_data: Dict[str, Any]) -> bool:
        """Atualiza dados do estudante"""
        pass
    
    @abstractmethod
    def add_xp(self, student_id: int, xp: int) -> Dict[str, Any]:
        """Adiciona XP ao estudante"""
        pass


class IGameRepository(ABC):
    """Interface para repositório de jogos"""
    
    @abstractmethod
    def save_session(self, session: GameSession) -> bool:
        """Salva sessão de jogo"""
        pass
    
    @abstractmethod
    def get_session(self, session_id: str) -> Optional[GameSession]:
        """Busca sessão por ID"""
        pass
    
    @abstractmethod
    def get_student_sessions(
        self, 
        student_id: int, 
        game_type: Optional[str] = None,
        limit: int = 10
    ) -> List[GameSession]:
        """Busca sessões de um estudante"""
        pass
    
    @abstractmethod
    def get_statistics(self, student_id: int) -> Dict[str, Any]:
        """Retorna estatísticas do estudante"""
        pass


class IAchievementRepository(ABC):
    """Interface para repositório de conquistas"""
    
    @abstractmethod
    def unlock_achievement(
        self, 
        student_id: int, 
        achievement_id: str
    ) -> bool:
        """Desbloqueia conquista"""
        pass
    
    @abstractmethod
    def get_student_achievements(self, student_id: int) -> List[Dict[str, Any]]:
        """Lista conquistas do estudante"""
        pass
