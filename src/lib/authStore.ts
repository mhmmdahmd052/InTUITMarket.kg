import { create } from 'zustand';
import { supabase } from './supabase';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
}

export const useAuthStore = create<AuthStore>()((set) => ({
  user: null,
  isAuthenticated: false,
  
  initialize: async () => {
    // 1. Get initial session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      set({ 
        isAuthenticated: true, 
        user: {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || '',
        }
      });
    }

    // 2. Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({ 
          isAuthenticated: true, 
          user: {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.name || '',
          }
        });
      } else {
        set({ isAuthenticated: false, user: null });
      }
    });
  },

  login: async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || '',
      });

      if (error) {
        return { success: false, error: "auth.invalidCredentials" };
      }

      if (data.user) {
        set({
          isAuthenticated: true,
          user: {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || '',
          }
        });
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: "auth.loginFailed" };
    }
  },

  register: async ({ name, email, password }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: password || '',
        options: {
          data: { name }
        }
      });

      if (error) {
        let errorKey = "auth.registerFailed";
        const msg = error.message.toLowerCase();
        if (msg.includes("already registered") || msg.includes("already exists")) {
          errorKey = "auth.registerFailed"; // We can use registerFailed or add specialized key
        }
        return { success: false, error: errorKey };
      }

      if (data.session?.user) {
        set({
          isAuthenticated: true,
          user: {
            id: data.session.user.id,
            email: data.session.user.email || '',
            name: data.session.user.user_metadata?.name || '',
          }
        });
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: "auth.registerFailed" };
    }
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ isAuthenticated: false, user: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  },

  updateProfile: async (updates) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: { name: updates.name }
      });

      if (error) return { success: false, error: "settings.profileUpdateFailed" };

      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            name: data.user.user_metadata?.name || '',
          }
        });
      }
      return { success: true };
    } catch (err) {
      return { success: false, error: "settings.profileUpdateFailed" };
    }
  }
}));