"""WSGI entrypoint for the legacy Flask application.

The repository also contains an ``app/`` package for background services, so
importing ``app:app`` is ambiguous. This loader points gunicorn explicitly at
``app.py`` while preserving the existing backend module layout.
"""

import importlib.util
from pathlib import Path


APP_FILE = Path(__file__).with_name("app.py")
_spec = importlib.util.spec_from_file_location("neuroplay_legacy_flask", APP_FILE)
if _spec is None or _spec.loader is None:
    raise RuntimeError(f"Não foi possível carregar {APP_FILE}")

_module = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(_module)
application = _module.app
