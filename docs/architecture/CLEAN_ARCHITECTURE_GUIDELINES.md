# NeuroPlay 2.5 - Diretrizes de Clean Architecture

## 🎯 Filosofia: Pragmatismo sobre Purismo

Clean Architecture é uma ferramenta, não uma religião. Use-a onde faz sentido, ignore onde não faz.

## 📊 Quando Usar Clean Architecture

### ✅ USE para Lógica de Negócio Complexa

**Exemplos:**
- Processamento de sessões de jogo
- Cálculo de conquistas
- Sistema de gamificação
- Geração de relatórios
- Sincronização offline

**Por quê?**
- Lógica complexa que muda frequentemente
- Precisa ser testável isoladamente
- Pode ter múltiplas implementações
- Regras de negócio críticas

**Estrutura:**
```
backend/app/core/
├── entities/
│   ├── game_session.py      # Entidade de domínio
│   └── achievement.py
├── use_cases/
│   ├── process_game_completion.py  # Lógica de negócio
│   └── unlock_achievement.py
└── interfaces/
    └── repositories.py       # Contratos
```

### ❌ NÃO USE para CRUD Simples

**Exemplos:**
- Listar alunos
- Atualizar perfil
- Mudar senha
- Buscar jogo por ID
- Listar conquistas

**Por quê?**
- Não há lógica de negócio
- É apenas mapeamento de dados
- Over-engineering desnecessário
- Mais código = mais bugs

**Estrutura Simples:**
```python
# backend/app/api/v1/students.py

@bp.route('/students', methods=['GET'])
def list_students():
    """Lista todos os estudantes - CRUD simples"""
    students = Student.query.all()
    return jsonify([s.to_dict() for s in students])

@bp.route('/students/<int:id>', methods=['GET'])
def get_student(id):
    """Busca estudante por ID - CRUD simples"""
    student = Student.query.get_or_404(id)
    return jsonify(student.to_dict())
```

## 🏗️ Arquitetura em Camadas

### Camada 1: Entities (Domínio)

**O que é:** Objetos de negócio puros, sem dependências externas

**Quando usar:**
- Lógica que pertence ao objeto (ex: validações)
- Comportamentos intrínsecos (ex: calcular pontuação)

**Exemplo:**
```python
# backend/app/core/entities/game_session.py

from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class GameSession:
    """Entidade de domínio - Sessão de Jogo"""
    
    session_id: str
    student_id: int
    game_type: str
    score: int
    duration: int
    accuracy: float
    completed: bool
    created_at: datetime
    metadata: dict
    
    def is_high_score(self, previous_best: int) -> bool:
        """Lógica de domínio: verifica se é recorde"""
        return self.score > previous_best
    
    def calculate_stars(self) -> int:
        """Lógica de domínio: calcula estrelas (1-3)"""
        if self.accuracy >= 0.9 and self.completed:
            return 3
        elif self.accuracy >= 0.7 and self.completed:
            return 2
        elif self.completed:
            return 1
        return 0
    
    def validate(self) -> list[str]:
        """Lógica de domínio: validações"""
        errors = []
        
        if self.score < 0:
            errors.append("Score não pode ser negativo")
        
        if not 0 <= self.accuracy <= 1:
            errors.append("Accuracy deve estar entre 0 e 1")
        
        if self.duration < 0:
            errors.append("Duração não pode ser negativa")
        
        return errors
```

### Camada 2: Use Cases (Aplicação)

**O que é:** Orquestração de lógica de negócio

**Quando usar:**
- Lógica que envolve múltiplas entidades
- Operações complexas com múltiplos passos
- Regras de negócio que mudam frequentemente

**Exemplo:**
```python
# backend/app/core/use_cases/process_game_completion.py

from backend.app.core.entities.game_session import GameSession
from backend.app.core.interfaces.repositories import (
    GameSessionRepository,
    AchievementRepository,
    StudentRepository
)

class ProcessGameCompletionUseCase:
    """
    Use Case: Processar conclusão de jogo
    
    Responsabilidades:
    1. Validar sessão
    2. Salvar no banco
    3. Verificar conquistas
    4. Atualizar estatísticas
    5. Notificar educador (se necessário)
    """
    
    def __init__(
        self,
        session_repo: GameSessionRepository,
        achievement_repo: AchievementRepository,
        student_repo: StudentRepository
    ):
        self.session_repo = session_repo
        self.achievement_repo = achievement_repo
        self.student_repo = student_repo
    
    def execute(self, session: GameSession) -> dict:
        """Executa o caso de uso"""
        
        # 1. Validar
        errors = session.validate()
        if errors:
            raise ValueError(f"Sessão inválida: {errors}")
        
        # 2. Salvar sessão
        saved_session = self.session_repo.save(session)
        
        # 3. Verificar conquistas
        student = self.student_repo.get_by_id(session.student_id)
        unlocked = self._check_achievements(session, student)
        
        # 4. Atualizar estatísticas
        self._update_statistics(session, student)
        
        # 5. Verificar se precisa notificar educador
        should_notify = self._should_notify_educator(session, student)
        
        return {
            'session_id': saved_session.session_id,
            'unlocked_achievements': unlocked,
            'should_notify_educator': should_notify,
        }
    
    def _check_achievements(self, session: GameSession, student) -> list:
        """Verifica conquistas desbloqueadas"""
        # Lógica complexa de conquistas
        pass
    
    def _update_statistics(self, session: GameSession, student) -> None:
        """Atualiza estatísticas do estudante"""
        # Lógica de estatísticas
        pass
    
    def _should_notify_educator(self, session: GameSession, student) -> bool:
        """Verifica se deve notificar educador"""
        # Lógica de notificação
        pass
```

### Camada 3: Interfaces (Contratos)

**O que é:** Abstrações para dependências externas

**Quando usar:**
- Quando precisa trocar implementação (ex: banco de dados)
- Quando precisa mockar em testes
- Quando há múltiplas implementações possíveis

**Exemplo:**
```python
# backend/app/core/interfaces/repositories.py

from abc import ABC, abstractmethod
from typing import Optional, List
from backend.app.core.entities.game_session import GameSession

class GameSessionRepository(ABC):
    """Interface para repositório de sessões"""
    
    @abstractmethod
    def save(self, session: GameSession) -> GameSession:
        """Salva sessão no banco"""
        pass
    
    @abstractmethod
    def get_by_id(self, session_id: str) -> Optional[GameSession]:
        """Busca sessão por ID"""
        pass
    
    @abstractmethod
    def get_by_student(self, student_id: int) -> List[GameSession]:
        """Busca sessões de um estudante"""
        pass
```

### Camada 4: Infrastructure (Implementação)

**O que é:** Implementações concretas das interfaces

**Exemplo:**
```python
# backend/app/infra/repositories/sqlalchemy_game_session_repository.py

from backend.app.core.interfaces.repositories import GameSessionRepository
from backend.app.core.entities.game_session import GameSession
from backend.app.models import GameSessionModel

class SQLAlchemyGameSessionRepository(GameSessionRepository):
    """Implementação com SQLAlchemy"""
    
    def save(self, session: GameSession) -> GameSession:
        model = GameSessionModel.from_entity(session)
        db.session.add(model)
        db.session.commit()
        return model.to_entity()
    
    def get_by_id(self, session_id: str) -> Optional[GameSession]:
        model = GameSessionModel.query.get(session_id)
        return model.to_entity() if model else None
    
    def get_by_student(self, student_id: int) -> List[GameSession]:
        models = GameSessionModel.query.filter_by(student_id=student_id).all()
        return [m.to_entity() for m in models]
```

### Camada 5: API (Controllers)

**O que é:** Endpoints HTTP que orquestram use cases

**Exemplo:**
```python
# backend/app/api/v1/gameplay.py

from flask import Blueprint, request, jsonify
from backend.app.core.use_cases.process_game_completion import ProcessGameCompletionUseCase
from backend.app.core.entities.game_session import GameSession

bp = Blueprint('gameplay', __name__)

@bp.route('/gameplay/sync', methods=['POST'])
def sync_game_session():
    """Endpoint para sincronizar sessão de jogo"""
    
    # 1. Parse request
    data = request.get_json()
    
    # 2. Criar entidade
    session = GameSession(
        session_id=data['session_id'],
        student_id=data['student_id'],
        game_type=data['game_type'],
        score=data['score'],
        duration=data['duration'],
        accuracy=data['accuracy'],
        completed=data['completed'],
        created_at=datetime.fromisoformat(data['created_at']),
        metadata=data.get('metadata', {}),
    )
    
    # 3. Executar use case
    use_case = ProcessGameCompletionUseCase(
        session_repo=get_session_repository(),
        achievement_repo=get_achievement_repository(),
        student_repo=get_student_repository(),
    )
    
    result = use_case.execute(session)
    
    # 4. Retornar resposta
    return jsonify(result), 200
```

## 🎯 Regras de Ouro

### 1. CRUD Simples = Controller Direto

```python
# ✅ BOM: Simples e direto
@bp.route('/students', methods=['GET'])
def list_students():
    students = Student.query.all()
    return jsonify([s.to_dict() for s in students])
```

```python
# ❌ RUIM: Over-engineering
class ListStudentsUseCase:
    def __init__(self, student_repo: StudentRepository):
        self.student_repo = student_repo
    
    def execute(self) -> List[Student]:
        return self.student_repo.get_all()

# Não faça isso para CRUD simples!
```

### 2. Lógica de Negócio = Use Case

```python
# ✅ BOM: Use case para lógica complexa
class ProcessGameCompletionUseCase:
    def execute(self, session: GameSession) -> dict:
        # 1. Validar
        # 2. Salvar
        # 3. Verificar conquistas
        # 4. Atualizar estatísticas
        # 5. Notificar
        pass
```

### 3. Validações Simples = Entity

```python
# ✅ BOM: Validação no domínio
class GameSession:
    def validate(self) -> list[str]:
        errors = []
        if self.score < 0:
            errors.append("Score inválido")
        return errors
```

### 4. Dependências Externas = Interface

```python
# ✅ BOM: Interface para trocar implementação
class GameSessionRepository(ABC):
    @abstractmethod
    def save(self, session: GameSession) -> GameSession:
        pass

# Implementações:
# - SQLAlchemyGameSessionRepository
# - MongoGameSessionRepository
# - InMemoryGameSessionRepository (testes)
```

## 📁 Estrutura de Pastas Recomendada

```
backend/app/
├── core/                    # Lógica de negócio (Clean Architecture)
│   ├── entities/           # Objetos de domínio
│   ├── use_cases/          # Casos de uso complexos
│   └── interfaces/         # Contratos
│
├── infra/                  # Implementações
│   ├── repositories/       # Implementações de repositórios
│   ├── cache/             # Redis, etc
│   ├── tasks/             # Celery
│   └── monitoring/        # Sentry, Prometheus
│
├── api/                    # Controllers
│   └── v1/
│       ├── gameplay.py    # Endpoints de jogo (usa use cases)
│       ├── students.py    # CRUD simples (sem use cases)
│       └── achievements.py
│
└── models/                 # SQLAlchemy models
    ├── student.py
    └── game_session.py
```

## 🧪 Testabilidade

### Use Cases são Fáceis de Testar

```python
# tests/unit/use_cases/test_process_game_completion.py

def test_process_game_completion_unlocks_achievement():
    # Arrange
    session = GameSession(...)
    mock_session_repo = Mock(GameSessionRepository)
    mock_achievement_repo = Mock(AchievementRepository)
    mock_student_repo = Mock(StudentRepository)
    
    use_case = ProcessGameCompletionUseCase(
        session_repo=mock_session_repo,
        achievement_repo=mock_achievement_repo,
        student_repo=mock_student_repo,
    )
    
    # Act
    result = use_case.execute(session)
    
    # Assert
    assert len(result['unlocked_achievements']) > 0
```

### CRUD Simples Testa no Integration Test

```python
# tests/integration/test_students_api.py

def test_list_students(client):
    response = client.get('/api/v1/students')
    assert response.status_code == 200
    assert len(response.json) > 0
```

## 📚 Resumo

| Cenário | Abordagem | Exemplo |
|---------|-----------|---------|
| CRUD simples | Controller direto | Listar alunos |
| Lógica complexa | Use Case | Processar jogo |
| Validação simples | Entity | Validar score |
| Dependência externa | Interface | Repositório |
| Cálculo de domínio | Entity | Calcular estrelas |

**Lembre-se:** Clean Architecture é uma ferramenta para gerenciar complexidade. Se não há complexidade, não use a ferramenta!
