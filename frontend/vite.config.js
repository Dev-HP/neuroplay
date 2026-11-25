import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Política de segurança de conteúdo aplicada só no build de produção: o servidor
// de desenvolvimento do Vite injeta um script inline (recarregamento ao editar).
const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https:; media-src 'self' data: blob:; worker-src 'self' blob:; object-src 'none'; base-uri 'self'; form-action 'self'";

const cspNoBuild = () => ({
  name: 'neuroplay-csp',
  apply: 'build',
  transformIndexHtml: (html) =>
    html.replace('<meta charset="utf-8" />', `<meta charset="utf-8" />\n    <meta http-equiv="Content-Security-Policy" content="${CSP}" />`),
});

// Mantém as variáveis REACT_APP_* usadas pelo código e pelo deploy.
const VARIAVEIS = ['REACT_APP_API_URL', 'REACT_APP_DEMO_MODE'];

export default defineConfig(({ command, mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), 'REACT_APP_'), ...process.env };
  const define = Object.fromEntries(
    VARIAVEIS.map((nome) => [`process.env.${nome}`, JSON.stringify(env[nome] ?? '')])
  );
  define['process.env.NODE_ENV'] = JSON.stringify(command === 'build' ? 'production' : mode);

  const publicUrl = env.PUBLIC_URL;
  const base = publicUrl ? `${publicUrl.replace(/\/+$/, '')}/` : command === 'build' ? '/neuroplay/' : '/';

  return {
    base,
    define,
    plugins: [react({ include: /\.(js|jsx)$/ }), cspNoBuild()],
    // O código usa JSX em arquivos .js (herança do Create React App).
    esbuild: { loader: 'jsx', include: /src\/.*\.jsx?$/, exclude: [] },
    optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },
    server: { port: 3000 },
    build: {
      outDir: 'build',
      emptyOutDir: true,
      sourcemap: false,
      chunkSizeWarningLimit: 2500,
      rollupOptions: {
        output: {
          entryFileNames: 'static/js/[name]-[hash].js',
          chunkFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: ({ names = [] }) =>
            names.some((n) => n.endsWith('.css')) ? 'static/css/[name]-[hash][extname]' : 'static/media/[name]-[hash][extname]',
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            graficos: ['recharts'],
            tres: ['three', '@react-three/fiber'],
          },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/setupTests.js'],
      include: ['src/**/*.{test,spec}.{js,jsx}', 'src/**/__tests__/**/*.{js,jsx}'],
      css: false,
      coverage: {
        provider: 'v8',
        reporter: ['text-summary', 'lcov'],
        reportsDirectory: 'coverage',
        include: ['src/**/*.{js,jsx}'],
        exclude: ['src/index.js', 'src/**/__tests__/**', 'src/**/*.test.{js,jsx}'],
      },
    },
  };
});
