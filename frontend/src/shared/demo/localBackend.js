/**
 * Modo demonstração do NeuroPlay.
 *
 * Quando o frontend é publicado sem um backend (por exemplo, no GitHub Pages),
 * este módulo simula as rotas /api/v1 do backend Flask diretamente no navegador.
 * Os dados ficam apenas no dispositivo (localStorage) e nunca são enviados a
 * nenhum servidor. O formato das respostas segue o de backend/app.py.
 */

const STORAGE_KEY = 'neuroplay-demo-db-v1';
export const DEMO_EMAIL = 'demo@neuroplay.app';
export const DEMO_PASSWORD = 'neuroplay-demo';

const ACTIVITIES = [
  ['cyber-runner-canvas', 'Cyber-Runner', 'Corrida com decisões rápidas e obstáculos', 'atenção_e_controle_inibitorio'],
  ['echo-temple', 'Templo dos Ecos', 'Memória visuoespacial e navegação', 'memoria_de_trabalho'],
  ['sonic-jump', 'Sonic Jump', 'Processamento de sons e timing', 'processamento_auditivo'],
  ['gravity-lab', 'Gravity Lab', 'Resolução de problemas e flexibilidade', 'flexibilidade_cognitiva'],
  ['mestres-sinal', 'Mestres do Sinal', 'Respostas a sinais e controle de impulsos', 'controle_inibitorio'],
  ['cacador-alvos', 'Caçador de Alvos', 'Atenção visual e seleção de alvos', 'atencao_visual'],
  ['memoria-dupla', 'Memória Dupla', 'Memória de trabalho visuoespacial', 'memoria_de_trabalho']
].map(([slug, nome, descricao, dominio], index) => ({
  id: index + 1, slug, nome, descricao, dominio, dificuldade: 1, versao: '1.0.0'
}));

let memoryDb = null;

function nowIso() {
  return new Date().toISOString();
}

function emptyDb() {
  return {
    seq: { user: 1, org: 1, student: 1, consent: 1 },
    users: [{
      id: 1,
      nome: 'Educador(a) Demonstração',
      email: DEMO_EMAIL,
      senha: DEMO_PASSWORD,
      tipo: 'educador',
      orgId: 1
    }],
    orgs: [{ id: 1, nome: 'Escola Demonstração' }],
    students: [{ id: 1, orgId: 1, apelido: 'Aluno Demo', ano_nascimento: 2017, ativo: true }],
    consents: [{ id: 1, student_id: 1, status: 'granted', versao: 'demo', criado_em: nowIso() }],
    sessions: [],
    tokens: {}
  };
}

function loadDb() {
  if (memoryDb) return memoryDb;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    memoryDb = raw ? JSON.parse(raw) : emptyDb();
  } catch (_error) {
    memoryDb = emptyDb();
  }
  return memoryDb;
}

function saveDb(db) {
  memoryDb = db;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (_error) {
    // Sem armazenamento disponível: os dados ficam só na memória desta aba.
  }
}

export function resetDemoData() {
  memoryDb = null;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch (_error) {
    // ignorado
  }
}

function userPayload(db, user) {
  const org = db.orgs.find((item) => item.id === user.orgId);
  return {
    id: user.id,
    nome: user.nome,
    email: user.email,
    tipo: user.tipo,
    role: user.tipo,
    organizacoes: org ? [{ id: org.id, nome: org.nome, papel: 'owner' }] : []
  };
}

function hasConsent(db, studentId) {
  const latest = db.consents.filter((item) => item.student_id === studentId).slice(-1)[0];
  return Boolean(latest && latest.status === 'granted');
}

function sessionPayload(session) {
  return { ...session, id: session.session_id };
}

function studentPayload(db, student) {
  const completed = db.sessions.filter((item) => item.student_id === student.id && item.status === 'completed');
  const last = completed.map((item) => item.completed_at).sort().slice(-1)[0] || null;
  return {
    id: student.id,
    nome: student.apelido,
    apelido: student.apelido,
    codigo: `DEMO-${String(student.id).padStart(4, '0')}`,
    pontos_totais: completed.reduce((sum, item) => sum + item.score, 0),
    nivel: 1 + Math.min(9, Math.floor(completed.length / 5)),
    jogos_completos: completed.length,
    ultima_atividade: last,
    consentimento_ativo: hasConsent(db, student.id)
  };
}

function issueToken(db, user) {
  const token = `demo-${user.id}-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
  db.tokens[token] = user.id;
  saveDb(db);
  return token;
}

function currentUser(db, headers) {
  const auth = headers.authorization || headers.Authorization || '';
  const token = String(auth).replace(/^Bearer\s+/i, '') || readSessionToken();
  const userId = db.tokens[token];
  return db.users.find((item) => item.id === userId) || null;
}

function readSessionToken() {
  try {
    return window.sessionStorage.getItem('token') || '';
  } catch (_error) {
    return '';
  }
}

function asInt(value) {
  const parsed = Math.floor(Number(value));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

const ok = (data, status = 200) => ({ status, data });
const fail = (status, error, code) => ({ status, data: { error, code: code || undefined } });

/** Resolve uma requisição da API usando o banco local. */
export function handleDemoRequest(method, url, body = {}, headers = {}) {
  const db = loadDb();
  const path = String(url).replace(/^https?:\/\/[^/]+/i, '').split('?')[0].replace(/\/+$/, '');
  const verb = String(method || 'GET').toUpperCase();
  const data = body && typeof body === 'object' ? body : {};

  if (path.endsWith('/health')) return ok({ status: 'healthy', mode: 'demo' });
  if (verb === 'GET' && /\/api\/v1\/activities$/.test(path)) return ok({ activities: ACTIVITIES });

  if (verb === 'POST' && /\/auth\/login$/.test(path)) {
    const email = String(data.email || '').trim().toLowerCase();
    const user = db.users.find((item) => item.email === email && item.senha === String(data.senha || data.password || ''));
    if (!user) return fail(401, 'Credenciais inválidas', 'INVALID_CREDENTIALS');
    return ok({ token: issueToken(db, user), usuario: userPayload(db, user) });
  }

  if (verb === 'POST' && /\/auth\/register$/.test(path)) {
    const nome = String(data.nome || '').trim();
    const email = String(data.email || '').trim().toLowerCase();
    const senha = String(data.senha || data.password || '');
    if (nome.length < 2 || !email.includes('@') || senha.length < 10) {
      return fail(400, 'Nome, e-mail válido e senha com pelo menos 10 caracteres são obrigatórios', 'VALIDATION_ERROR');
    }
    if (db.users.some((item) => item.email === email)) return fail(400, 'E-mail já cadastrado', 'VALIDATION_ERROR');
    const org = { id: ++db.seq.org, nome: String(data.organizacao_nome || `Organização de ${nome}`).slice(0, 160) };
    const user = { id: ++db.seq.user, nome, email, senha, tipo: 'educador', orgId: org.id };
    db.orgs.push(org);
    db.users.push(user);
    return ok({ token: issueToken(db, user), usuario: userPayload(db, user), organization_id: org.id }, 201);
  }

  if (verb === 'POST' && /\/auth\/refresh$/.test(path)) {
    const user = currentUser(db, {});
    if (!user) return fail(401, 'Sessão expirada');
    return ok({ token: readSessionToken(), usuario: userPayload(db, user) });
  }

  const user = currentUser(db, headers);
  if (!user) return fail(401, 'Autenticação necessária', 'UNAUTHORIZED');
  const orgStudents = db.students.filter((item) => item.orgId === user.orgId && item.ativo);

  if (verb === 'POST' && /\/auth\/logout$/.test(path)) {
    Object.keys(db.tokens).forEach((token) => { if (db.tokens[token] === user.id) delete db.tokens[token]; });
    saveDb(db);
    return ok({ success: true });
  }
  if (verb === 'GET' && /\/api\/v1\/me$/.test(path)) return ok({ usuario: userPayload(db, user) });

  if (/\/api\/v1\/students$/.test(path)) {
    if (verb === 'GET') {
      return ok({ students: orgStudents.map((item) => studentPayload(db, item)), organization_id: user.orgId });
    }
    if (verb === 'POST') {
      const apelido = String(data.apelido || data.nome || '').trim();
      if (apelido.length < 2) return fail(400, 'Apelido do estudante é obrigatório');
      const student = { id: ++db.seq.student, orgId: user.orgId, apelido: apelido.slice(0, 120), ano_nascimento: data.ano_nascimento || null, ativo: true };
      db.students.push(student);
      saveDb(db);
      return ok(studentPayload(db, student), 201);
    }
  }

  const studentMatch = path.match(/\/api\/v1\/students\/(\d+)(\/progress)?$/);
  if (verb === 'GET' && studentMatch) {
    const student = orgStudents.find((item) => item.id === Number(studentMatch[1]));
    if (!student) return fail(404, 'Estudante não encontrado', 'NOT_FOUND');
    if (!studentMatch[2]) return ok(studentPayload(db, student));
    const sessions = db.sessions
      .filter((item) => item.student_id === student.id)
      .sort((a, b) => String(b.completed_at).localeCompare(String(a.completed_at)))
      .map(sessionPayload);
    return ok({ student: studentPayload(db, student), sessions });
  }

  if (verb === 'POST' && /\/api\/v1\/consents$/.test(path)) {
    const student = orgStudents.find((item) => item.id === Number(data.student_id));
    if (!student) return fail(404, 'Estudante não encontrado', 'NOT_FOUND');
    const status = String(data.status || 'granted').toLowerCase();
    const consent = { id: ++db.seq.consent, student_id: student.id, status, versao: 'demo', criado_em: nowIso() };
    db.consents.push(consent);
    saveDb(db);
    return ok({ id: consent.id, student_id: student.id, status, versao: consent.versao }, 201);
  }

  if (verb === 'POST' && /\/api\/v1\/gameplay\/sync$/.test(path)) {
    const student = orgStudents.find((item) => item.id === Number(data.student_id || data.aluno_id));
    if (!student) return fail(404, 'Estudante não encontrado ou não autorizado');
    if (!hasConsent(db, student.id)) return fail(403, 'Consentimento válido é necessário antes de registrar gameplay');
    const sessionId = String(data.session_id || `demo-${Date.now()}`);
    const existing = db.sessions.find((item) => item.session_id === sessionId);
    if (existing) return ok({ success: true, processing: 'completed', session: sessionPayload(existing) });
    const acertos = asInt(data.acertos);
    const erros = asInt(data.erros);
    const total = acertos + erros;
    const activity = ACTIVITIES.find((item) => item.slug === data.game_type) || null;
    const session = {
      session_id: sessionId,
      student_id: student.id,
      activity_id: activity ? activity.id : null,
      game_type: String(data.game_type || 'desconhecido'),
      score: asInt(data.score ?? data.pontos),
      duration_seconds: asInt(data.duration_seconds ?? data.tempo_gasto),
      acertos,
      erros,
      accuracy: total ? Math.round((acertos / total) * 10000) / 10000 : null,
      status: 'completed',
      started_at: nowIso(),
      completed_at: nowIso()
    };
    db.sessions.push(session);
    saveDb(db);
    return ok({ success: true, processing: 'completed', session: sessionPayload(session) }, 201);
  }

  if (verb === 'POST' && (/\/achievements\/unlock$/.test(path) || /\/telemetry\/batch$/.test(path))) {
    return ok({ success: true, mode: 'demo' });
  }

  return fail(404, 'Rota não disponível no modo demonstração', 'NOT_FOUND');
}

function parseBody(body) {
  if (!body) return {};
  if (typeof body === 'string') {
    try { return JSON.parse(body); } catch (_error) { return {}; }
  }
  return typeof body === 'object' ? body : {};
}

function isApiPath(url) {
  return /(^|\/)api\//.test(String(url || '')) || /\/health$/.test(String(url || ''));
}

/** Instala o backend local no axios e no fetch. */
export function installDemoBackend(axiosInstance) {
  if (typeof window === 'undefined' || window.__neuroplayDemoInstalled) return;
  window.__neuroplayDemoInstalled = true;

  if (axiosInstance) {
    const defaultAdapter = axiosInstance.defaults.adapter;
    axiosInstance.defaults.adapter = (config) => {
      if (!isApiPath(config.url)) {
        const adapter = typeof defaultAdapter === 'function' ? defaultAdapter : axiosInstance.getAdapter?.(defaultAdapter);
        return adapter(config);
      }
      const result = handleDemoRequest(config.method, config.url, parseBody(config.data), config.headers || {});
      const response = { data: result.data, status: result.status, statusText: String(result.status), headers: {}, config, request: {} };
      if (result.status >= 400) {
        const error = new Error(result.data?.error || `Erro ${result.status}`);
        error.isAxiosError = true;
        error.config = config;
        error.response = response;
        return Promise.reject(error);
      }
      return Promise.resolve(response);
    };
  }

  const originalFetch = window.fetch ? window.fetch.bind(window) : null;
  window.fetch = (input, init = {}) => {
    const url = typeof input === 'string' ? input : input?.url;
    if (!isApiPath(url) && originalFetch) return originalFetch(input, init);
    const headers = {};
    const rawHeaders = init.headers || {};
    if (typeof rawHeaders.forEach === 'function' && !Array.isArray(rawHeaders)) {
      rawHeaders.forEach((value, key) => { headers[key] = value; });
    } else {
      Object.assign(headers, rawHeaders);
    }
    const result = handleDemoRequest(init.method || 'GET', url, parseBody(init.body), headers);
    const body = JSON.stringify(result.data);
    if (typeof window.Response === 'function') {
      return Promise.resolve(new window.Response(body, { status: result.status, headers: { 'Content-Type': 'application/json' } }));
    }
    return Promise.resolve({ ok: result.status < 400, status: result.status, json: async () => result.data, text: async () => body });
  };
}
