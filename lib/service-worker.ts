// Service Worker Registration (sem Firebase)
export const registerServiceWorker = async () => {
  // Verificar se estamos no navegador
  if (typeof window === 'undefined') {
    return;
  }

  // Verificar suporte a Service Worker (Chrome, Firefox, Safari, Edge)
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker não é suportado neste navegador');
    return;
  }

  // Verificar se estamos em HTTPS ou localhost (requisito do Chrome)
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    console.warn('Service Worker requer HTTPS em produção');
    return;
  }

  // Evita cache agressivo durante o desenvolvimento,
  // removendo qualquer SW previamente registrado.
  if (process.env.NODE_ENV !== 'production') {
    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));

      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(
          cacheKeys
            .filter((key) => key.startsWith('chamados-'))
            .map((key) => caches.delete(key))
        );
      }
    } catch (error) {
      console.warn('Erro ao limpar service workers em desenvolvimento:', error);
    }
    return;
  }

  try {
    // Verificar se já existe um service worker registrado
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    // Aguardar o service worker estar pronto
    if (registration.installing) {
      registration.installing.addEventListener('statechange', function() {
        if (this.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('Service Worker instalado e ativo');
        }
      });
    } else if (registration.waiting) {
      console.log('Service Worker aguardando ativação');
    } else if (registration.active) {
      console.log('Service Worker já está ativo');
    }

    // Tratar atualizações do service worker
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('Nova versão do Service Worker disponível');
          }
        });
      }
    });

    console.log('Service Worker registrado com sucesso');
  } catch (error: any) {
    // Não mostrar erro crítico, apenas logar
    console.warn('Erro ao registrar Service Worker (não crítico):', error?.message || error);
    // O sistema deve funcionar mesmo sem service worker
  }
};

