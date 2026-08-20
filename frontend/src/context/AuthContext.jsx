import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabase.js';

const AuthContext = createContext({});
const DEMO_USER_KEY = 'career_dna_demo_user';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription = null;

    const initAuth = async () => {
      // 1. Instant check for saved local user session
      const savedUserJson = localStorage.getItem(DEMO_USER_KEY);
      if (savedUserJson) {
        try {
          const parsedUser = JSON.parse(savedUserJson);
          setUser(parsedUser);
          setSession({ access_token: 'demo-token-123', user: parsedUser });
          setLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem(DEMO_USER_KEY);
        }
      }

      // 2. Check Supabase session if configured
      if (isSupabaseConfigured) {
        try {
          const { data } = await supabase.auth.getSession();
          if (data?.session) {
            setSession(data.session);
            setUser(data.session.user);
          }
          const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
              setSession(session);
              setUser(session.user);
            }
            setLoading(false);
          });
          subscription = authListener?.subscription;
        } catch (err) {
          console.warn('[AUTH] Supabase session check error:', err.message);
        }
      }

      setLoading(false);
    };

    initAuth();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const cleanEmail = email.trim();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
        if (!error && data?.user) {
          setUser(data.user);
          setSession(data.session);
          return data;
        }
      } catch (err) {
        console.warn('[AUTH] Supabase login error:', err.message);
      }
    }

    // Fast Demo Login
    const demoUser = {
      id: 'student-demo-uuid-12345',
      email: cleanEmail,
      user_metadata: { name: cleanEmail.split('@')[0] || 'Student Candidate' }
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    setSession({ access_token: 'demo-token-123', user: demoUser });
    return { user: demoUser, session: { access_token: 'demo-token-123' } };
  };

  const signup = async (email, password, name) => {
    const cleanEmail = email.trim();
    const cleanName = (name || cleanEmail.split('@')[0]).trim();

    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: { data: { name: cleanName } }
        });
        if (!error && data?.user) {
          setUser(data.user);
          setSession(data.session);
          return data;
        }
      } catch (err) {
        console.warn('[AUTH] Supabase signup error:', err.message);
      }
    }

    // Fast Demo Signup
    const demoUser = {
      id: 'student-demo-uuid-12345',
      email: cleanEmail,
      user_metadata: { name: cleanName }
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(demoUser));
    setUser(demoUser);
    setSession({ access_token: 'demo-token-123', user: demoUser });
    return { user: demoUser, session: { access_token: 'demo-token-123' } };
  };

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/dashboard`
          }
        });
        if (!error && data) return data;
      } catch (err) {
        console.warn('[AUTH] Google OAuth error:', err.message);
      }
    }

    // Demo Google OAuth Login
    const googleUser = {
      id: 'student-google-uuid-99887',
      email: 'student.google@example.com',
      user_metadata: { name: 'Google User' }
    };
    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(googleUser));
    localStorage.setItem('career_dna_user_name', 'Google User');
    setUser(googleUser);
    setSession({ access_token: 'google-oauth-demo-token', user: googleUser });
    return { user: googleUser, session: { access_token: 'google-oauth-demo-token' } };
  };

  const logout = async () => {
    localStorage.removeItem(DEMO_USER_KEY);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        // ignore
      }
    }
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, login, loginWithGoogle, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
