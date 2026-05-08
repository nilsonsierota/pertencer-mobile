"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface AuthContextProps {
  user: any;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  logout: async () => {},
});

const TEST_EMAIL = "mobile@gmail.com";
const TEST_PASSWORD = "power300";

let initializedAuth: any = null;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    let unsubscribe: any = null;

    const initAuth = async () => {
      try {
        const firebase = await import("firebase/compat/app");
        const auth = await import("firebase/compat/auth");
        
        const app = firebase.default.initializeApp({
          apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
          authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
          projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
          storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
          messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
          appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
          measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
        });

        initializedAuth = firebase.default.auth(app);

        if (process.env.EXPO_PUBLIC_USE_TEST_USER === "true") {
          try {
            const cred = await firebase.default.auth().signInWithEmailAndPassword(TEST_EMAIL, TEST_PASSWORD);
            if (mounted) setUser(cred.user);
          } catch (error) {
            if (mounted) setUser(null);
          }
          if (mounted) setLoading(false);
          return;
        }

        unsubscribe = firebase.default.auth().onAuthStateChanged((currentUser: any) => {
          if (mounted) {
            setUser(currentUser);
            setLoading(false);
          }
        });
      } catch (e) {
        if (mounted) setLoading(false);
      }
    };

    initAuth();
    return () => { 
      mounted = false; 
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const logout = async () => {
    try {
      const firebase = await import("firebase/compat/app");
      setLoading(true);
      await firebase.default.auth().signOut();
      setUser(null);
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);