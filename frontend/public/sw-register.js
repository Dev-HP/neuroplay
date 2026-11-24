// Registro do service worker em arquivo próprio: a política de segurança de
// conteúdo (CSP) do index.html não permite scripts inline.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register((window.location.pathname.indexOf('/neuroplay') === 0 ? '/neuroplay' : '') + '/service-worker.js')
      .catch(function () { /* sem service worker o app continua funcionando */ });
  });
}
