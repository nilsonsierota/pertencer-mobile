let GoogleSigninModule: any = null;
let StatusCodesModule: any = null;
let configured = false;

export async function ensureGoogleSignin() {
  if (GoogleSigninModule) return true;
  try {
    const mod = await import("@react-native-google-signin/google-signin");
    GoogleSigninModule = mod.GoogleSignin;
    StatusCodesModule = mod.statusCodes;
    return true;
  } catch {
    return false;
  }
}

export async function configureGoogleSignin() {
  const ok = await ensureGoogleSignin();
  if (!ok) return;
  if (configured) return;
  configured = true;
  GoogleSigninModule.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
}

export async function signInWithGoogle() {
  const ok = await ensureGoogleSignin();
  if (!ok) throw new Error("GOOGLE_SIGNIN_NOT_AVAILABLE");
  await GoogleSigninModule.hasPlayServices({ showPlayServicesUpdateDialog: true });
  return GoogleSigninModule.signIn();
}

export { StatusCodesModule as statusCodes };
