export async function loginWithEmail(email: string, password: string) {
  const { signInWithEmailAndPassword, getAuth } = await import("firebase/auth");
  const { app } = await import("./firebase");
  if (!app) throw new Error("Firebase App not initialized");
  return signInWithEmailAndPassword(getAuth(app), email, password);
}

export async function registerWithEmail(email: string, password: string) {
  const { createUserWithEmailAndPassword, getAuth } = await import("firebase/auth");
  const { app } = await import("./firebase");
  if (!app) throw new Error("Firebase App not initialized");
  return createUserWithEmailAndPassword(getAuth(app), email, password);
}

export async function signInWithCredential(credential: any) {
  const { signInWithCredential, getAuth } = await import("firebase/auth");
  const { app } = await import("./firebase");
  if (!app) throw new Error("Firebase App not initialized");
  return signInWithCredential(getAuth(app), credential);
}

export async function GoogleAuthProviderCredential(accessToken: string) {
  const { GoogleAuthProvider } = await import("firebase/auth");
  return GoogleAuthProvider.credential(accessToken);
}