import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AuthUser } from "../types/auth";

type AuthContextValue = {
  user: AuthUser | null;
  signIn: () => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const STORAGE_KEY = "chronosync.auth.user";

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return;
    }

    try {
      setUser(JSON.parse(saved) as AuthUser);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: () => {
        const nextUser = {
          email: "demo@chronosync.dev",
          name: "Demo User"
        };

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser));
        setUser(nextUser);
      },
      signOut: () => {
        window.localStorage.removeItem(STORAGE_KEY);
        setUser(null);
      }
    }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export { AuthProvider, useAuth };
