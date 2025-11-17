// Firebase Messaging Service Worker
// Este arquivo DEVE estar na raiz do domínio público para funcionar corretamente

importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Configuração do Firebase (será inicializado dinamicamente)
// IMPORTANTE: Substitua estas variáveis com suas credenciais reais do Firebase
const firebaseConfig = {
  apiKey: "your_firebase_api_key_here",
  authDomain: "your_project_id.firebaseapp.com",
  projectId: "your_project_id_here",
  storageBucket: "your_project_id.appspot.com",
  messagingSenderId: "your_sender_id_here",
  appId: "your_app_id_here"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

// Obter instância do Firebase Messaging
const messaging = firebase.messaging();

// Lidar com mensagens em background
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Mensagem recebida em background:', payload);

  const notificationTitle = payload.notification?.title || 'Novo Chamado';
  const notificationOptions = {
    body: payload.notification?.body || 'Você tem uma nova notificação',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'ticket-notification',
    requireInteraction: true,
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Lidar com clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notificação clicada:', event);

  event.notification.close();

  // Abrir ou focar na janela do admin
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Verificar se já existe uma janela aberta
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes('/admin') && 'focus' in client) {
            return client.focus();
          }
        }
        // Se não existir, abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow('/admin');
        }
      })
  );
});
