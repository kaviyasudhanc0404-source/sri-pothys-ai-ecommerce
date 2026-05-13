import { createContext, useContext, useState, type ReactNode, useEffect, useCallback, useMemo, useRef } from "react";
import { apiRequest } from "@/services/api";
import { safeStorage } from "@/lib/storage";

type JwtPayload = {
  exp?: number;
  [key: string]: unknown;
};

function parseJwtPayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");

    const json = atob(padded);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function getTokenExpiryMs(token: string): number | null {
  const payload = parseJwtPayload(token);
  if (!payload?.exp || typeof payload.exp !== "number") return null;
  return payload.exp * 1000;
}

function isTokenExpired(token: string): boolean {
  const expMs = getTokenExpiryMs(token);
  if (!expMs) return false;
  return Date.now() >= expMs;
}

interface User {
  id: string;
  _id?: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "user" | "admin";
  phone?: string;
  dateOfBirth?: string;
  gender?: "Male" | "Female" | "Other";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (firstName: string, lastName: string, email: string, password: string, phone?: string) => Promise<User>;
  updateUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const logoutTimerIdRef = useRef<number | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedToken = safeStorage.get("authToken");
    const savedUser = safeStorage.get("authUser");
    if (savedToken && savedUser) {
      try {
        if (isTokenExpired(savedToken)) {
          safeStorage.remove("authToken");
          safeStorage.remove("authUser");
          return;
        }
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        safeStorage.remove("authToken");
        safeStorage.remove("authUser");
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ token: string; user: User }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      setUser(data.user);
      safeStorage.set("authToken", data.token);
      safeStorage.set("authUser", JSON.stringify(data.user));
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string, phone?: string): Promise<User> => {
    setIsLoading(true);
    try {
      const data = await apiRequest<{ token: string; user: User }>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ firstName, lastName, email, password, phone }),
      });
      setToken(data.token);
      setUser(data.user);
      safeStorage.set("authToken", data.token);
      safeStorage.set("authUser", JSON.stringify(data.user));
      return data.user;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    safeStorage.remove("authToken");
    safeStorage.remove("authUser");
  }, []);

  useEffect(() => {
    const handler = () => logout();
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [logout]);

  useEffect(() => {
    if (logoutTimerIdRef.current) {
      window.clearTimeout(logoutTimerIdRef.current);
      logoutTimerIdRef.current = null;
    }

    if (!token) return;

    const expMs = getTokenExpiryMs(token);
    if (!expMs) return;

    const msUntilExpiry = expMs - Date.now();
    if (msUntilExpiry <= 0) {
      logout();
      return;
    }

    logoutTimerIdRef.current = window.setTimeout(() => {
      logout();
    }, msUntilExpiry);

    return () => {
      if (logoutTimerIdRef.current) {
        window.clearTimeout(logoutTimerIdRef.current);
        logoutTimerIdRef.current = null;
      }
    };
  }, [token, logout]);

  const updateUser = useCallback((nextUser: User) => {
    setUser(nextUser);
    safeStorage.set("authUser", JSON.stringify(nextUser));
  }, []);

  const isAuthenticated = useMemo(() => {
    if (!token) return false;
    if (isTokenExpired(token)) return false;
    return true;
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, updateUser, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
