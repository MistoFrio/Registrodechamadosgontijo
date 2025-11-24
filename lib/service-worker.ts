// Service Worker Registration (sem Firebase)
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }

  // Evita cache agressivo durante o desenvolvimento,
  // removendo qualquer SW previamente registrado.
  if (process.env.NODE_ENV !== 'production') {
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
    return;
  }

  try {
    await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });
    console.log('Service Worker registrado com sucesso');
  } catch (error) {
    console.error('Erro ao registrar Service Worker:', error);
  }
};

