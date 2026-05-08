import { app } from "./firebase";

export async function loginWithEmail(email: string, password: string) {
  if (!app) throw new Error("Firebase App not initialized");
  const { signInWithEmailAndPassword, getAuth } = await import("firebase/auth");
  return signInWithEmailAndPassword(getAuth(app), email, password);
}

export async function registerWithEmail(email: string, password: string) {
  if (!app) throw new Error("Firebase App not initialized");
  const { createUserWithEmailAndPassword, getAuth } = await import("firebase/auth");
  return createUserWithEmailAndPassword(getAuth(app), email, password);
}

export async function signInWithCredential(credential: any) {
  if (!app) throw new Error("Firebase App not initialized");
  const { signInWithCredential, getAuth } = await import("firebase/auth");
  return signInWithCredential(getAuth(app), credential);
}

export async function GoogleAuthProviderCredential(accessToken: string) {
  const { GoogleAuthProvider } = await import("firebase/auth");
  return GoogleAuthProvider.credential(accessToken);
}