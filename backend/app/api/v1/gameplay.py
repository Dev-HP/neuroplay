"""
Gameplay API - Fast Response with Background Processing
"""
from flask import Blueprint, request, jsonify
from pydantic import BaseModel, ValidationError, Field
from typing import Dict, Any, List
from datetime import datetime
import uuid

from ...infra.tasks.game_tasks import process_game_completion_task
from ...infra.cache.redis_service import RedisService
from ..middlewares.rate_limiter import rate_limiter

gameplay_bp = Blueprint('gameplay', __name__, url_prefix='/api/v1/gameplay')


# Pydantic models for validation
class GameEventModel(BaseModel):
    """Validate incoming game events"""
    type: str = Field(..., min_length=1, max_length=50)
    data: Dict[str, Any]
    timestamp: str


class GameSyncModel(BaseModel):
    """Validate game sync from offline queue"""
    session_id: str
    student_id: int = Field(..., gt=0)
    game_type: str = Field(..., regex='^(cyber_runner|echo_temple|sonic_jump|gravity_lab)$')
    events: List[GameEventModel]
    score: int = Field(..., ge=0)
    duration_seconds: int = Field(..., ge=0)


@gameplay_bp.route('/sync', methods=['POST'])
@rate_limiter.limit(max_requests=100, window_seconds=60)
def sync_gameplay():
    """
    Sync gameplay from offline queue
    
    This is the FAST endpoint:
    1. Validate JSON (Pydantic)
    2. Save to Redis queue
    3. Return "OK" immediately
    4. Celery processes in background
    """
    try:
        # Validate input
        data = GameSyncModel(**request.json)
        
        # Generate session ID if not provided
        session_id = data.session_id or str(uuid.uuid4())
        
        # Save to Redis for quick response
        redis = RedisService()
        redis.set(
            f"session:{session_id}:pending",
            data.dict(),
            ttl=3600  # 1 hour
        )
        
        # Queue background task
        process_game_completion_task.delay(session_id)
        
        # Return immediately (10ms response)
        return jsonify({
            "success": True,
            "session_id": session_id,
            "message": "Gameplay synced successfully",
            "processing": "background"
        }), 202  # Accepted
        
    except ValidationError as e:
        return jsonify({
            "error": "Invalid data",
            "details": e.errors()
        }), 400
    
    except Exception as e:
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500


@gameplay_bp.route('/session/<session_id>/status', methods=['GET'])
def get_session_status(session_id: str):
    """
    Check if background processing is complete
    Frontend can poll this endpoint
    """
    try:
        redis = RedisService()
        
        # Check if still pending
        pending = redis.exists(f"session:{session_id}:pending")
        
        if pending:
            return jsonify({
                "status": "processing",
                "session_id": session_id
            })
        
        # Check if completed
        result = redis.get(f"session:{session_id}:result")
        
        if result:
            return jsonify({
                "status": "completed",
                "session_id": session_id,
                "result": result
            })
        
        return jsonify({
            "status": "not_found",
            "session_id": session_id
        }), 404
        
    except Exception as e:
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500


@gameplay_bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    })
