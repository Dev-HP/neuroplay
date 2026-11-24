import { handleDemoRequest, resetDemoData, DEMO_EMAIL, DEMO_PASSWORD } from '../localBackend';

function login() {
  const result = handleDemoRequest('POST', '/api/v1/auth/login', { email: DEMO_EMAIL, senha: DEMO_PASSWORD });
  return { Authorization: `Bearer ${result.data.token}` };
}

describe('backend local do modo demonstração', () => {
  beforeEach(() => {
    window.localStorage.clear();
    resetDemoData();
  });

  test('autentica a conta demonstração e rejeita senha errada', () => {
    const okResult = handleDemoRequest('POST', '/api/v1/auth/login', { email: DEMO_EMAIL, senha: DEMO_PASSWORD });
    expect(okResult.status).toBe(200);
    expect(okResult.data.usuario.tipo).toBe('educador');
    expect(okResult.data.usuario.organizacoes).toHaveLength(1);

    const bad = handleDemoRequest('POST', '/api/v1/auth/login', { email: DEMO_EMAIL, senha: 'errada' });
    expect(bad.status).toBe(401);
  });

  test('exige autenticação nas rotas protegidas', () => {
    expect(handleDemoRequest('GET', '/api/v1/students').status).toBe(401);
  });

  test('cria estudante e só registra jogo após consentimento', () => {
    const headers = login();
    const created = handleDemoRequest('POST', '/api/v1/students', { apelido: 'Estrela' }, headers);
    expect(created.status).toBe(201);
    expect(created.data.consentimento_ativo).toBe(false);

    const sync = { student_id: created.data.id, game_type: 'mestres-sinal', session_id: 'sessao-teste-1', score: 120, acertos: 8, erros: 2 };
    expect(handleDemoRequest('POST', '/api/v1/gameplay/sync', sync, headers).status).toBe(403);

    expect(handleDemoRequest('POST', '/api/v1/consents', { student_id: created.data.id }, headers).status).toBe(201);
    const saved = handleDemoRequest('POST', '/api/v1/gameplay/sync', sync, headers);
    expect(saved.status).toBe(201);
    expect(saved.data.session.accuracy).toBe(0.8);

    const progress = handleDemoRequest('GET', `/api/v1/students/${created.data.id}/progress`, {}, headers);
    expect(progress.data.student.pontos_totais).toBe(120);
    expect(progress.data.sessions).toHaveLength(1);
  });

  test('não duplica sessão com o mesmo session_id', () => {
    const headers = login();
    const sync = { student_id: 1, game_type: 'mestres-sinal', session_id: 'sessao-repetida', score: 50, acertos: 5, erros: 5 };
    handleDemoRequest('POST', '/api/v1/gameplay/sync', sync, headers);
    handleDemoRequest('POST', '/api/v1/gameplay/sync', sync, headers);
    const progress = handleDemoRequest('GET', '/api/v1/students/1/progress', {}, headers);
    expect(progress.data.sessions).toHaveLength(1);
  });

  test('valida o cadastro de nova organização', () => {
    expect(handleDemoRequest('POST', '/api/v1/auth/register', { nome: 'A', email: 'x', senha: '1' }).status).toBe(400);
    const created = handleDemoRequest('POST', '/api/v1/auth/register', { nome: 'Prof. Ana', email: 'ana@escola.br', senha: 'senha-segura-1', organizacao_nome: 'Escola X' });
    expect(created.status).toBe(201);
    expect(created.data.usuario.organizacoes[0].nome).toBe('Escola X');
  });
});
