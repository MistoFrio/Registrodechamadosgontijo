// Service Worker para PWA
const CACHE_NAME = 'chamados-v2';
const urlsToCache = [
  '/',
  '/admin',
  '/manifest.json'
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Interceptar requisições
self.addEventListener('fetch', (event) => {
  // Chrome requer que todas as requisições sejam tratadas com event.respondWith
  // ou que não sejam interceptadas (return fetch)
  
  try {
    const url = new URL(event.request.url);

    // Ignora assets internos do Next.js para evitar servir bundles desatualizados.
    if (url.pathname.startsWith('/_next/')) {
      event.respondWith(fetch(event.request));
      return;
    }
    
    // Não fazer cache de requisições de API (Supabase, etc)
    if (url.pathname.startsWith('/rest/v1/') || 
        url.pathname.startsWith('/auth/v1/') ||
        url.pathname.startsWith('/storage/v1/') ||
        url.pathname.startsWith('/realtime/v1/') ||
        url.pathname.startsWith('/api/') ||
        url.hostname.includes('supabase.co') ||
        event.request.method !== 'GET') {
      // Para requisições de API, sempre buscar da rede (sem cache)
      event.respondWith(fetch(event.request));
      return;
    }
    
    // Para outros recursos, usar cache primeiro (network-first para Chrome)
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Verificar se a resposta é válida antes de fazer cache
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clonar a resposta para poder fazer cache
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache).catch((err) => {
              console.warn('Erro ao fazer cache:', err);
            });
          });
          
          return response;
        })
        .catch(() => {
          // Se a rede falhar, tentar usar cache
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || new Response('Offline', { status: 503 });
          });
        })
    );
  } catch (error) {
    // Em caso de erro, sempre buscar da rede
    event.respondWith(fetch(event.request));
  }
});
