"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

const ALLOWED_EMAILS = (process.env.NEXT_PUBLIC_ALLOWED_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(u.email || "")) {
        signOut(auth);
        setUser(null);
        setError("Tu email no está autorizado para acceder.");
      } else {
        setUser(u);
        setError(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    if (ALLOWED_EMAILS.length > 0 && !ALLOWED_EMAILS.includes(email.trim())) {
      setError("Tu email no está autorizado para acceder.");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: unknown) {
      const msg = (e as { code?: string })?.code;
      if (msg === "auth/invalid-credential" || msg === "auth/wrong-password" || msg === "auth/user-not-found") {
        setError("Email o contraseña incorrectos.");
      } else if (msg === "auth/too-many-requests") {
        setError("Demasiados intentos. Intenta más tarde.");
      } else {
        setError("Error al iniciar sesión. Verifica tus credenciales.");
      }
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
