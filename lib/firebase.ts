import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let app: FirebaseApp;
let messaging: Messaging | null = null;

export const initializeFirebase = () => {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  return app;
};

export const getFirebaseMessaging = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    if (!messaging) {
      const app = initializeFirebase();
      messaging = getMessaging(app);
    }
    return messaging;
  }
  return null;
};

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      console.log('Permissão de notificação concedida');

      const messaging = getFirebaseMessaging();
      if (!messaging) {
        throw new Error('Firebase Messaging não está disponível');
      }

      const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
      if (!vapidKey) {
        throw new Error('VAPID key não configurada');
      }

      const token = await getToken(messaging, { vapidKey });
      console.log('Token FCM obtido:', token);
      return token;
    } else {
      console.log('Permissão de notificação negada');
      return null;
    }
  } catch (error) {
    console.error('Erro ao solicitar permissão de notificação:', error);
    return null;
  }
};

export const onMessageListener = () => {
  return new Promise((resolve) => {
    const messaging = getFirebaseMessaging();
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Mensagem recebida em foreground:', payload);
        resolve(payload);
      });
    }
  });
};

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Registrar Service Worker principal
      await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      console.log('Service Worker registrado com sucesso');

      // Registrar Firebase Messaging Service Worker
      await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/firebase-cloud-messaging-push-scope'
      });
      console.log('Firebase Messaging Service Worker registrado com sucesso');
    } catch (error) {
      console.error('Erro ao registrar Service Worker:', error);
    }
  }
};
