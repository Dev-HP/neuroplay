"""Testes básicos da aplicação Flask (usam os fixtures de conftest.py)."""


def test_app_em_modo_de_teste(app):
    assert app.config["TESTING"]


def test_health_confirma_o_banco(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert data["database"] == "ok"


def test_api_health(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.get_json()
    assert data["status"] == "healthy"
    assert data["version"] == "3.1.0"


def test_rotas_legadas_foram_removidas(client):
    assert client.post("/api/auth/login", json={}).status_code == 404
    assert client.get("/api/alunos").status_code == 404
    assert client.get("/api/telemetry/session/qualquer").status_code == 404


def test_producao_recusa_secret_de_exemplo(monkeypatch):
    import app as app_module

    monkeypatch.setattr(app_module, "IS_PRODUCTION", True)
    monkeypatch.setenv("SECRET_KEY", "replace-with-at-least-32-random-characters")
    try:
        app_module._secret_key()
    except RuntimeError:
        pass
    else:
        raise AssertionError("o secret de exemplo foi aceito em produção")

    monkeypatch.setenv("SECRET_KEY", "k9F2vQ7xL1pZ8mW4tR6yB3nC5hJ0sD2eG7aU1iO9")
    assert app_module._secret_key().startswith("k9F2")
