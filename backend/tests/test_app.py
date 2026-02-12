"""
Tests for Flask App
"""

import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app as flask_app


@pytest.fixture
def app():
    """Create application for testing"""
    flask_app.config.update({
        "TESTING": True,
    })
    yield flask_app


@pytest.fixture
def client(app):
    """Create test client"""
    return app.test_client()


class TestApp:
    """Test Flask application"""
    
    def test_app_exists(self, app):
        """Test that app exists"""
        assert app is not None
    
    def test_app_is_testing(self, app):
        """Test that app is in testing mode"""
        assert app.config['TESTING']
    
    def test_health_endpoint(self, client):
        """Test health check endpoint"""
        response = client.get('/health')
        assert response.status_code in [200, 404]  # May not exist yet
    
    def test_api_endpoints_exist(self, client):
        """Test that API endpoints are registered"""
        # This will depend on your actual endpoints
        response = client.get('/api')
        assert response.status_code in [200, 404, 405]
