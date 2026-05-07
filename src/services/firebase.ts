import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, initializeAuth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const isConfigured = firebaseConfig.apiKey && firebaseConfig.projectId;

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function getReactNativePersistence(storage: typeof AsyncStorage) {
  return {
    type: 'LOCAL',
    _isAvailable: async () => {
      try {
        await storage.setItem('___test___', 'test');
        await storage.removeItem('___test___');
        return true;
      } catch {
        return false;
      }
    },
    _set: (key: string, value: unknown) => storage.setItem(key, JSON.stringify(value)),
    _get: async <T>(key: string): Promise<T | null> => {
      const value = await storage.getItem(key);
      return value ? JSON.parse(value) : null;
    },
    _remove: (key: string) => storage.removeItem(key),
  };
}

if (isConfigured) {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (e) {
    console.warn('Failed to initialize auth with persistence:', e);
    auth = getAuth(app);
  }
}

export { app, auth, db };
export default app;