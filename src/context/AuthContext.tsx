"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, signInWithEmailAndPassword, User as FirebaseUser } from "firebase/auth";
import { auth } from "../services/firebase";

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

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) { setLoading(false); return; }
    
    const tryTestLogin = async () => {
      if (process.env.EXPO_PUBLIC_USE_TEST_USER === "true") {
        try {
          const cred = await signInWithEmailAndPassword(auth, "mobile@gmail.com", "power300");
          setUser(cred.user);
        } catch (error) {
          console.log("Erro no login de teste:", error);
          setUser(null);
        }
        setLoading(false);
        return;
      }
      
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        setLoading(false);
      });
      return () => unsubscribe();
    };
    
    tryTestLogin();
  }, []);

  const logout = async () => {
    if (!auth) return;
    setLoading(true);
    try { await firebaseSignOut(auth); } catch (error) { console.error("Erro ao fazer logout:", error); }
    setUser(null);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);