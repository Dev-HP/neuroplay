"""Ponto de entrada WSGI do NeuroPlay (gunicorn wsgi:application)."""

from app import app as application

__all__ = ["application"]
