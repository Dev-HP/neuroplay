"""
Student Entity - Pure Business Logic (No Framework Dependencies)
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Dict, Any


@dataclass
class Student:
    """Student entity representing a child using the platform"""
    
    id: Optional[int] = None
    name: str = ""
    age: int = 0
    diagnosis: Optional[str] = None
    educator_id: Optional[int] = None
    sensory_profile: Dict[str, Any] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def __post_init__(self):
        if self.sensory_profile is None:
            self.sensory_profile = {
                "visual_sensitivity": 5,
                "audio_sensitivity": 5,
                "haptic_feedback": True,
                "animation_speed": 1.0
            }
    
    def is_valid(self) -> bool:
        """Validate student data"""
        return (
            len(self.name) > 0 and
            3 <= self.age <= 18 and
            self.educator_id is not None
        )
    
    def update_sensory_profile(self, profile: Dict[str, Any]) -> None:
        """Update sensory preferences"""
        self.sensory_profile.update(profile)
        self.updated_at = datetime.utcnow()
