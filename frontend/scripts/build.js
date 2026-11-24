// Build de produção. O runtime do webpack vai para um arquivo .js em vez de ficar
// inline no index.html, para respeitar a CSP (script-src 'self').
process.env.INLINE_RUNTIME_CHUNK = 'false';
require('react-scripts/scripts/build');
