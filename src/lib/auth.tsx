import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { type UserRole } from "@/lib/rbac";

type AuthUser = {
  email: string;
  role: UserRole;
  displayName: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  signIn: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  signOut: () => void;
};

type HardcodedUser = {
  password: string;
  role: UserRole;
  displayName: string;
};

const AUTH_STORAGE_KEY = "ims-auth-user";

const HARDCODED_USERS: Record<string, HardcodedUser> = {
  "admin@inventory.com": {
    password: "123456",
    role: "Inventory Manager",
    displayName: "Inventory Manager",
  },
  "staff@inventory.com": {
    password: "123456",
    role: "Warehouse Staff",
    displayName: "Warehouse Staff",
  },
};

function readStoredUser() {
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as AuthUser;
    if (!parsed?.email || !parsed?.role || !parsed?.displayName) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      signIn: (email: string, password: string) => {
        const normalizedEmail = email.trim().toLowerCase();
        const matchedUser = HARDCODED_USERS[normalizedEmail];

        if (!matchedUser || matchedUser.password !== password) {
          return { ok: false, error: "Invalid email or password." };
        }

        const nextUser: AuthUser = {
          email: normalizedEmail,
          role: matchedUser.role,
          displayName: matchedUser.displayName,
        };

        setUser(nextUser);
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextUser));
        return { ok: true };
      },
      signOut: () => {
        setUser(null);
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}

export const demoCredentials = [
  { email: "admin@inventory.com", role: "Inventory Manager", password: "123456" },
  { email: "staff@inventory.com", role: "Warehouse Staff", password: "123456" },
] as const;
