"""Integration contract tests for the real NeuroPlay product API."""


def auth_headers(client, email, password, organization_name):
    response = client.post('/api/v1/auth/register', json={
        'nome': f"Educador {email.split('@')[0].upper()}",
        'email': email,
        'senha': password,
        'organizacao_nome': organization_name,
    })
    assert response.status_code == 201, response.get_json()
    payload = response.get_json()
    return payload, {
        'Authorization': f"Bearer {payload['token']}",
        'X-Organization-ID': str(payload['organization_id']),
    }


def test_product_flow_persists_gameplay_and_is_idempotent(client):
    account, headers = auth_headers(client, 'educadora@example.com', 'senha-segura-123', 'Escola Real')

    student_response = client.post('/api/v1/students', headers=headers, json={'apelido': 'Perfil Azul'})
    assert student_response.status_code == 201
    student_id = student_response.get_json()['id']

    consent_response = client.post('/api/v1/consents', headers=headers, json={
        'student_id': student_id,
        'status': 'granted',
        'evidencia': 'aceite institucional registrado',
    })
    assert consent_response.status_code == 201

    payload = {
        'session_id': 'pytest-product-session-001',
        'student_id': student_id,
        'game_type': 'mestres-sinal',
        'score': 30,
        'duration_seconds': 45,
        'acertos': 6,
        'erros': 2,
        'events': [{'type': 'round_completed', 'data': {'round': 1}}],
    }
    first = client.post('/api/v1/gameplay/sync', headers=headers, json=payload)
    assert first.status_code == 201, first.get_json()
    first_id = first.get_json()['session']['id']

    second = client.post('/api/v1/gameplay/sync', headers=headers, json=payload)
    assert second.status_code == 200, second.get_json()
    assert second.get_json()['session']['id'] == first_id

    progress = client.get(f'/api/v1/students/{student_id}/progress', headers=headers)
    assert progress.status_code == 200
    assert len(progress.get_json()['sessions']) == 1
    assert progress.get_json()['student']['pontos_totais'] == 30
    assert account['usuario']['organizacoes'][0]['id'] == int(headers['X-Organization-ID'])


def test_product_flow_enforces_consent_and_tenant_isolation(client):
    _, headers_a = auth_headers(client, 'a@example.com', 'senha-segura-123', 'Organizacao A')
    student_response = client.post('/api/v1/students', headers=headers_a, json={'apelido': 'Perfil A'})
    student_id = student_response.get_json()['id']

    without_consent = client.post('/api/v1/gameplay/sync', headers=headers_a, json={
        'session_id': 'pytest-no-consent-001',
        'student_id': student_id,
        'game_type': 'mestres-sinal',
        'score': 1,
    })
    assert without_consent.status_code == 403

    _, headers_b = auth_headers(client, 'b@example.com', 'senha-segura-123', 'Organizacao B')
    assert client.get(f'/api/v1/students/{student_id}', headers=headers_b).status_code == 404


def test_product_governance_supports_revoke_export_delete_and_audit(client):
    _, headers = auth_headers(client, 'governanca@example.com', 'senha-segura-123', 'Organizacao Governanca')
    student_response = client.post('/api/v1/students', headers=headers, json={'apelido': 'Perfil Governanca'})
    assert student_response.status_code == 201
    student_id = student_response.get_json()['id']

    consent = client.post('/api/v1/consents', headers=headers, json={'student_id': student_id, 'status': 'granted'})
    assert consent.status_code == 201
    consent_id = consent.get_json()['id']

    export = client.get(f'/api/v1/students/{student_id}/export', headers=headers)
    assert export.status_code == 200
    assert export.get_json()['student']['id'] == student_id

    revoke = client.post(f'/api/v1/consents/{consent_id}/revoke', headers=headers)
    assert revoke.status_code == 200
    assert revoke.get_json()['status'] == 'revoked'

    blocked = client.post('/api/v1/gameplay/sync', headers=headers, json={
        'session_id': 'pytest-revoked-consent-001',
        'student_id': student_id,
        'game_type': 'mestres-sinal',
        'score': 4,
    })
    assert blocked.status_code == 403

    audit = client.get('/api/v1/audit-events', headers=headers)
    assert audit.status_code == 200
    assert any(event['action'] == 'consent_revoked' for event in audit.get_json()['events'])

    deleted = client.delete(f'/api/v1/students/{student_id}', headers=headers)
    assert deleted.status_code == 200
    assert deleted.get_json()['status'] == 'deleted'
