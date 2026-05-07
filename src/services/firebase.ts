import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

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

// Singleton pattern
let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let initialized = false;

export function getFirebaseServices() {
  if (initialized) {
    return { app, auth, db };
  }
  
  if (isConfigured) {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApps()[0];
    }
    
    if (app) {
      db = getFirestore(app);
      auth = getAuth(app);
    }
  }
  
  initialized = true;
  return { app, auth, db };
}

// Initialize on import
const services = getFirebaseServices();
app = services.app;
auth = services.auth;
db = services.db;

export { app, auth, db };
export default app;