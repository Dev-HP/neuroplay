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

export function isApiConfigured() {
  return Boolean(API_URL);
}
