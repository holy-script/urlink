// contexts/AuthContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/utils/supabase/client';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { toast } from 'sonner';
import { getRouteType, extractLocale, ROUTE_CONFIG } from '@/lib/routeConfig';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; }>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null; }>;
  clearError: () => void;
  // Route helpers
  routeType: 'protected' | 'public' | 'open' | 'none';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode; }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  // Get route type for current path  
  const routeType = getRouteType(pathname);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();

        if (!isMounted) return;

        if (sessionError) {
          console.error('Error getting session:', sessionError);
          setError(sessionError);
          toast.error("Failed to retrieve session", {
            description: sessionError.message,
          });
        } else {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
          console.log('Auth initialized, user:', initialSession?.user?.email);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('Auth initialization error:', err);
        const authError = err as AuthError;
        setError(authError);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        console.log('Auth state changed:', event, 'on route:', pathname);
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setLoading(false);
        setError(null);

        // Handle navigation based on auth state changes
        // Only redirect on explicit auth events, not on initial load
        if (event === 'SIGNED_OUT') {
          // Only redirect if user was on a protected route
          if (routeType === 'protected') {
            console.log('Redirecting to login after sign out');
            router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`);
          }
        } else if (event === 'SIGNED_IN' && newSession) {
          // Only redirect if user was on a public route (login/signup)
          if (routeType === 'public') {
            const urlParams = new URLSearchParams(window.location.search);
            const redirectTo = urlParams.get('redirect');

            if (redirectTo && redirectTo !== pathname) {
              console.log('Redirecting to:', redirectTo);
              router.push(redirectTo);
            } else {
              console.log('Redirecting to dashboard after login');
              router.push(`/${locale}/dashboard`);
            }
          }
          // Don't redirect users who are on open routes (like home page)
          // Let them stay where they are
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [pathname, routeType, router, locale]);

  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setError(null);

      // Navigate to home page
      router.push(`/${locale}/`);
      toast.success("Successfully signed out");
    } catch (error) {
      const authError = error as AuthError;
      console.error('Error signing out:', authError);
      setError(authError);
      toast.error("Failed to sign out", {
        description: authError.message,
      });
    } finally {
      setLoading(false);
    }
  }, [router, locale]);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error);
        toast.error("Failed to sign in", {
          description: error.message,
        });
        return { error };
      }

      toast.success("Successfully signed in");
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      toast.error("An unexpected error occurred", {
        description: authError.message,
      });
      return { error: authError };
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setError(error);
        toast.error("Failed to sign up", {
          description: error.message,
        });
        return { error };
      }

      toast.success("Check your email for verification link");
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      toast.error("An unexpected error occurred", {
        description: authError.message,
      });
      return { error: authError };
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/${locale}/reset-password`,
      });

      if (error) {
        setError(error);
        toast.error("Failed to send reset email", {
          description: error.message,
        });
        return { error };
      }

      toast.success("Password reset email sent");
      return { error: null };
    } catch (err) {
      const authError = err as AuthError;
      setError(authError);
      toast.error("An unexpected error occurred", {
        description: authError.message,
      });
      return { error: authError };
    } finally {
      setLoading(false);
    }
  }, [locale]);

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    signOut,
    signIn,
    signUp,
    resetPassword,
    clearError,
    routeType,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
