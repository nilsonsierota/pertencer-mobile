import { getAuth, Auth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithCredential, GoogleAuthProvider, initializeAuth } from "firebase/auth";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

function initializeFirebase() {
  if (!app) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  }
  if (!auth) {
    try {
      auth = getAuth(app);
    } catch (e) {
      console.log("Auth error:", e);
    }
  }
  return auth;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    initializeFirebase();
  }
  return auth!;
}

export async function loginWithEmail(email: string, password: string) {
  const authInstance = getFirebaseAuth();
  return signInWithEmailAndPassword(authInstance, email, password);
}

export async function registerWithEmail(email: string, password: string) {
  const authInstance = getFirebaseAuth();
  return createUserWithEmailAndPassword(authInstance, email, password);
}

export { signInWithCredential, GoogleAuthProvider };