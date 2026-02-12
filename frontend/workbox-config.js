/**
 * Workbox Configuration - NeuroPlay 2.5
 * Gera Service Worker automaticamente no build
 */

module.exports = {
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{html,js,css,png,jpg,jpeg,svg,json,woff,woff2,ttf,eot}'
  ],
  swDest: 'build/service-worker.js',
  
  // Ignora arquivos grandes e desnecessários
  globIgnores: [
    '**/node_modules/**/*',
    '**/*.map'
  ],
  
  // Tamanho máximo de arquivo para precache (2MB)
  maximumFileSizeToCacheInBytes: 2 * 1024 * 1024,
  
  // Estratégias de cache em runtime
  runtimeCaching: [
    {
      // API calls - Network First
      urlPattern: /^https?:\/\/.*\/api\/.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-cache',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 5 * 60 // 5 minutos
        },
        cacheableResponse: {
          statuses: [0, 200]
        }
      }
    },
    {
      // Imagens - Cache First
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60 // 30 dias
        }
      }
    },
    {
      // Fontes - Cache First
      urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'fonts-cache',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 365 * 24 * 60 * 60 // 1 ano
        }
      }
    },
    {
      // JS e CSS - Stale While Revalidate
      urlPattern: /\.(?:js|css)$/,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-resources',
        expiration: {
          maxEntries: 60,
          maxAgeSeconds: 7 * 24 * 60 * 60 // 7 dias
        }
      }
    }
  ],
  
  // Skip waiting para atualizar imediatamente
  skipWaiting: true,
  clientsClaim: true
};
