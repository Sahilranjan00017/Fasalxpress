import { createContext, useContext, ReactNode, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface Session {
  user: User | null;
  access_token?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
  // Legacy Supabase auth methods are stubbed; PIN login is handled via API routes.
  signInWithEmail: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, token: string) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check if user is already logged in (stored in localStorage)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setSession({ user: parsedUser });
    }
    setIsLoading(false);
  }, []);

  const signOut = async () => {
    localStorage.removeItem("user");
    localStorage.removeItem("session");
    setUser(null);
    setSession(null);
    window.location.href = "/login";
  };

  // Stubbed legacy Supabase auth methods to avoid runtime errors in components
  const unsupported = async () => {
    throw new Error("Supabase email/phone auth is disabled. Use PIN login.");
  };

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    error: null,
    signInWithEmail: unsupported,
    verifyEmailOtp: unsupported,
    signInWithPhone: unsupported,
    verifyPhoneOtp: unsupported,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.warn("useAuth called outside AuthProvider");
    const unsupported = async () => {
      throw new Error("Supabase email/phone auth is disabled. Use PIN login.");
    };
    return {
      user: null,
      session: null,
      isLoading: false,
      error: null,
      signInWithEmail: unsupported,
      verifyEmailOtp: unsupported,
      signInWithPhone: unsupported,
      verifyPhoneOtp: unsupported,
      signOut: async () => {},
      isAuthenticated: false,
    } as AuthContextType;
  }
  return context;
}