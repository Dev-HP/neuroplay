"""
Tests for Flask App
"""

import pytest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# Import app.py directly by manipulating sys.modules
import importlib.util
spec = importlib.util.spec_from_file_location("app_main", os.path.join(os.path.dirname(__file__), '..', 'app.py'))
app_main = importlib.util.module_from_spec(spec)
spec.loader.exec_module(app_main)


@pytest.fixture
def app():
    """Create application for testing"""
    flask_app = app_main.app
    flask_app.config.update({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
    })
    
    with flask_app.app_context():
        app_main.db.create_all()
    
    yield flask_app
    
    with flask_app.app_context():
        app_main.db.drop_all()


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
        assert response.status_code == 200
        data = response.get_json()
        assert 'status' in data
    
    def test_api_health_endpoint(self, client):
        """Test API health check endpoint"""
        response = client.get('/api/v1/health')
        assert response.status_code == 200
        data = response.get_json()
        assert data['status'] == 'healthy'
        assert data['version'] == '2.5.0'
