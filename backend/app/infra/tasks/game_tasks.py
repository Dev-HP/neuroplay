"""
Celery Tasks for Game Processing
These run in background workers
"""
from .celery_app import celery_app
from ..cache.redis_service import RedisService
from ...core.use_cases.process_game_completion import ProcessGameCompletion


@celery_app.task(name='process_game_completion', bind=True, max_retries=3)
def process_game_completion_task(self, session_id: str):
    """
    Background task to process game completion
    This is called after the API returns "OK" to the client
    """
    try:
        # Initialize services (in production, use dependency injection)
        cache = RedisService()
        
        # Execute use case
        # use_case = ProcessGameCompletion(session_repo, achievement_repo, cache)
        # result = use_case.execute(session_id)
        
        # For now, just log
        print(f"Processing game completion for session: {session_id}")
        
        return {"status": "success", "session_id": session_id}
        
    except Exception as exc:
        # Retry with exponential backoff
        raise self.retry(exc=exc, countdown=2 ** self.request.retries)


@celery_app.task(name='calculate_daily_stats')
def calculate_daily_stats_task():
    """
    Scheduled task to calculate daily statistics
    Runs every night to populate materialized views
    """
    try:
        # This would aggregate data into daily_stats_student table
        print("Calculating daily stats...")
        
        return {"status": "success", "timestamp": "now"}
        
    except Exception as e:
        print(f"Error calculating stats: {e}")
        return {"status": "error", "error": str(e)}


@celery_app.task(name='update_rankings')
def update_rankings_task(game_type: str):
    """
    Update game rankings
    Called after each game completion
    """
    try:
        print(f"Updating rankings for {game_type}")
        
        # This would update a ranking table or Redis sorted set
        
        return {"status": "success", "game_type": game_type}
        
    except Exception as e:
        print(f"Error updating rankings: {e}")
        return {"status": "error", "error": str(e)}
