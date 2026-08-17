"""Shared pytest fixtures for the real NeuroPlay API."""

import os
import sys
from pathlib import Path

import pytest

backend_path = Path(__file__).parent.parent
sys.path.insert(0, str(backend_path))
os.environ.setdefault("APP_ENV", "test")
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")
os.environ.setdefault("SECRET_KEY", "test-secret-neuroplay-01234567890123456789")

from wsgi import application as flask_app  # noqa: E402
from wsgi import _module as app_module  # noqa: E402


@pytest.fixture
def app():
    flask_app.config.update(TESTING=True)
    with flask_app.app_context():
        app_module.db.drop_all()
        app_module.db.create_all()
        app_module.seed_activities()
    yield flask_app
    with flask_app.app_context():
        app_module.db.session.remove()
        app_module.db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def runner(app):
    return app.test_cli_runner()
