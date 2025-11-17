// Service Worker Registration (sem Firebase)
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Registrar Service Worker principal
      await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('Service Worker registrado com sucesso');
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  }
};

