"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, User as FirebaseUser } from "firebase/auth";

interface AuthContextProps {
  user: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  logout: async () => {},
});

const isDevelopment = process.env.NODE_ENV === "development" || process.env.EXPO_PUBLIC_USE_TEST_USER === "true";
const TEST_EMAIL = "mobile@gmail.com";
const TEST_PASSWORD = "power300";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { getAuth } = await import("firebase/auth");
        const { app } = await import("../services/firebase");

        if (!app) {
          if (mounted) setLoading(false);
          return;
        }

        const auth = getAuth(app);

        if (isDevelopment) {
          try {
            const cred = await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD);
            if (mounted) setUser(cred.user);
          } catch (error) {
            console.log("Erro no login de teste:", error);
            if (mounted) setUser(null);
          }
          if (mounted) setLoading(false);
          return;
        }

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
          if (mounted) {
            setUser(currentUser);
            setLoading(false);
          }
        });
        return () => unsubscribe();
      } catch (e) {
        console.log("Auth init error:", e);
        if (mounted) setLoading(false);
      }
    };

    initAuth();
    return () => { mounted = false; };
  }, []);

  const logout = async () => {
    try {
      const { getAuth } = await import("firebase/auth");
      const { app } = await import("../services/firebase");
      if (!app) return;
      setLoading(true);
      await firebaseSignOut(getAuth(app));
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