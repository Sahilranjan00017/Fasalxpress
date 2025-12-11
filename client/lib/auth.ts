import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import type { Session, User } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase URL or Anon Key");
}

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  error: Error | null;
}

export function useSupabaseAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabaseClient.auth.getSession();

        if (sessionError) throw sessionError;

        if (mounted) {
          setAuthState({
            user: session?.user || null,
            session,
            isLoading: false,
            error: null,
          });
        }
      } catch (error) {
        if (mounted) {
          setAuthState({
            user: null,
            session: null,
            isLoading: false,
            error:
              error instanceof Error ? error : new Error("Auth init failed"),
          });
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setAuthState({
          user: session?.user || null,
          session,
          isLoading: false,
          error: null,
        });
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signInWithEmail = async (email: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      const { error } = await supabaseClient.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Sign in failed"),
        isLoading: false,
      }));
      throw error;
    }
  };

  const verifyEmailOtp = async (email: string, token: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      const { data, error } = await supabaseClient.auth.verifyOtp({
        email,
        token,
        type: "email",
      });

      if (error) throw error;

      setAuthState({
        user: data.user,
        session: data.session,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error : new Error("OTP verification failed"),
        isLoading: false,
      }));
      throw error;
    }
  };

  const signInWithPhone = async (phone: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      const { error } = await supabaseClient.auth.signInWithOtp({
        phone,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) throw error;
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error : new Error("Phone sign in failed"),
        isLoading: false,
      }));
      throw error;
    }
  };

  const verifyPhoneOtp = async (phone: string, token: string) => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      const { data, error } = await supabaseClient.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });

      if (error) throw error;

      setAuthState({
        user: data.user,
        session: data.session,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error:
          error instanceof Error ? error : new Error("OTP verification failed"),
        isLoading: false,
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setAuthState((prev) => ({ ...prev, isLoading: true, error: null }));
      const { error } = await supabaseClient.auth.signOut();

      if (error) throw error;

      setAuthState({
        user: null,
        session: null,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setAuthState((prev) => ({
        ...prev,
        error: error instanceof Error ? error : new Error("Sign out failed"),
        isLoading: false,
      }));
      throw error;
    }
  };

  return {
    ...authState,
    signInWithEmail,
    verifyEmailOtp,
    signInWithPhone,
    verifyPhoneOtp,
    signOut,
  };
}

export function getCurrentUser(): User | null {
  const session = supabaseClient.auth.session();
  return session?.user || null;
}

export async function getCurrentSession() {
  const {
    data: { session },
  } = await supabaseClient.auth.getSession();
  return session;
}
