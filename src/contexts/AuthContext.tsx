import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  department?: string;
  role: string;
  organization_name?: string;
  organization_type?: string;
  user_type?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.warn('Auth initialization timed out');
      setLoading(false);
    }, 3000);

    // Check active sessions and sets the user
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        clearTimeout(loadingTimeout);

        if (session?.user) {
          loadUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        if (!mounted) return;
        console.error('Error getting session:', error);
        clearTimeout(loadingTimeout);
        setLoading(false);
      });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading user profile:', error);
        // Don't set user to null if there's an error - keep the session
        // Only log the error and set loading to false
      } else if (data) {
        setUser(data);
      } else {
        // No data found but no error - user might not have a profile yet
        console.warn('User profile not found for userId:', userId);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      // Don't set user to null on errors - maintain the session
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<User | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    if (data.user) {
      const { data: userData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.error('Error loading user profile:', profileError);
        return null;
      }

      if (userData) {
        setUser(userData);
        return userData;
      }
    }

    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
