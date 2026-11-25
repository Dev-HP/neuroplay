// Registro do service worker. Fica no bundle (e não em script inline) porque a
// política de segurança de conteúdo do build só permite scripts do próprio site.
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}service-worker.js`)
      .catch(() => { /* sem service worker o app continua funcionando */ });
  });
}
