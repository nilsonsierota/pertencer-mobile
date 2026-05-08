import { auth } from "./firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

export async function loginWithEmail(email: string, password: string) {
  if (!auth) throw new Error("Firebase Auth not initialized");
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(email: string, password: string) {
  if (!auth) throw new Error("Firebase Auth not initialized");
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signInWithCredential(credential: any) {
  const { signInWithCredential: fn } = await import("firebase/auth");
  if (!auth) throw new Error("Firebase Auth not initialized");
  return fn(auth, credential);
}

export async function GoogleAuthProviderCredential(accessToken: string) {
  const { GoogleAuthProvider } = await import("firebase/auth");
  return GoogleAuthProvider.credential(accessToken);
}