const configuredApiUrl = process.env.REACT_APP_API_URL || '';

export const API_URL = configuredApiUrl.replace(/\/+$/, '');

export function apiUrl(path = '') {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return API_URL ? `${API_URL}${normalizedPath}` : normalizedPath;
}

export function bearerHeaders(token) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Modo demonstração: sem backend remoto, as rotas da API são atendidas no
// próprio navegador (ver shared/demo/localBackend.js).
export const DEMO_MODE = !API_URL && process.env.REACT_APP_DEMO_MODE === 'true';

export function isDemoMode() {
  return DEMO_MODE;
}

export function isApiConfigured() {
  return Boolean(API_URL) || DEMO_MODE;
}
