import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithCredential, GoogleAuthProvider, getAuth } from "firebase/auth";

export async function loginWithEmail(email: string, password: string) {
  const auth = getAuth();
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail(email: string, password: string) {
  const auth = getAuth();
  return createUserWithEmailAndPassword(auth, email, password);
}

export { signInWithCredential, GoogleAuthProvider };