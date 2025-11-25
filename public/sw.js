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
  const url = new URL(event.request.url);

  // Ignora assets internos do Next.js para evitar servir bundles desatualizados.
  if (url.pathname.startsWith('/_next/')) {
    return fetch(event.request);
  }
  
  // Não fazer cache de requisições de API (Supabase, etc)
  if (url.pathname.startsWith('/rest/v1/') || 
      url.pathname.startsWith('/auth/v1/') ||
      url.pathname.startsWith('/storage/v1/') ||
      url.pathname.startsWith('/realtime/v1/') ||
      url.hostname.includes('supabase.co') ||
      event.request.method !== 'GET') {
    // Para requisições de API, sempre buscar da rede
    return fetch(event.request);
  }
  
  // Para outros recursos, usar cache primeiro
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((response) => {
          // Não fazer cache de respostas que não são bem-sucedidas
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Clonar a resposta para poder fazer cache
          const responseToCache = response.clone();
          
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
  );
});
