import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase/client';
import { UserProfile, MemberRole } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  activeRole: MemberRole;
  isPublicMode: boolean;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsGuest: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const SESSION_STORAGE_KEY = 'familia_supabase_user_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<MemberRole>('owner');
  const [isPublicMode, setIsPublicMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync / create profile in Supabase public.users
  const syncSupabaseUserProfile = async (
    userId: string, 
    email: string, 
    customDisplayName?: string,
    photoUrl?: string,
    isAnonymous: boolean = false
  ): Promise<UserProfile> => {
    try {
      // 1. Try to read existing profile from Supabase
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data && !error) {
        const userProfile: UserProfile = {
          userId: data.id,
          displayName: customDisplayName || data.display_name || email.split('@')[0] || 'Investigador',
          email: email || data.email || '',
          photoURL: photoUrl || data.photo_url || undefined,
          phone: data.phone || undefined,
          bio: data.bio || undefined,
          isAnonymous: isAnonymous,
          storageMode: 'cloud',
          createdAt: data.created_at || new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          privacyPreferences: data.privacy_preferences || {
            hideEmailFromMembers: false,
            notifyOnRequests: true,
            notifyOnProposals: true
          }
        };

        // Update last login
        await supabase
          .from('users')
          .update({ last_login_at: userProfile.lastLoginAt, display_name: userProfile.displayName })
          .eq('id', userId);

        return userProfile;
      }

      // If not exists in table, insert
      const newProfile: UserProfile = {
        userId: userId,
        displayName: customDisplayName || email.split('@')[0] || 'Investigador',
        email: email || '',
        photoURL: photoUrl || undefined,
        isAnonymous: isAnonymous,
        storageMode: 'cloud',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        privacyPreferences: {
          hideEmailFromMembers: false,
          notifyOnRequests: true,
          notifyOnProposals: true
        }
      };

      await supabase.from('users').upsert({
        id: userId,
        email: newProfile.email,
        display_name: newProfile.displayName,
        photo_url: newProfile.photoURL,
        storage_mode: 'cloud',
        created_at: newProfile.createdAt,
        last_login_at: newProfile.lastLoginAt,
        privacy_preferences: newProfile.privacyPreferences
      });

      return newProfile;
    } catch (e) {
      console.warn('Error fetching or creating user profile in Supabase table:', e);
      return {
        userId: userId,
        displayName: customDisplayName || email.split('@')[0] || 'Investigador',
        email: email || '',
        photoURL: photoUrl || undefined,
        isAnonymous: isAnonymous,
        storageMode: 'cloud',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
    }
  };

  useEffect(() => {
    // 1. Check initial session from Supabase
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const u = session.user;
        const profile = await syncSupabaseUserProfile(
          u.id, 
          u.email || '', 
          u.user_metadata?.full_name || u.user_metadata?.name || u.user_metadata?.display_name,
          u.user_metadata?.avatar_url || u.user_metadata?.picture
        );
        setCurrentUser(profile);
        setActiveRole('owner');
        setIsPublicMode(false);
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
        } catch (_) {}
      } else {
        // Fallback to guest session if active in localStorage
        try {
          const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
          if (savedSession) {
            const parsed = JSON.parse(savedSession) as UserProfile;
            if (parsed && parsed.userId) {
              setCurrentUser(parsed);
              setActiveRole('owner');
              setIsPublicMode(false);
              setLoading(false);
              return;
            }
          }
        } catch (_) {}
        setCurrentUser(null);
      }
      setLoading(false);
    });

    // 2. Listen to Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const u = session.user;
        const profile = await syncSupabaseUserProfile(
          u.id, 
          u.email || '', 
          u.user_metadata?.full_name || u.user_metadata?.name,
          u.user_metadata?.avatar_url || u.user_metadata?.picture
        );
        setCurrentUser(profile);
        setActiveRole('owner');
        setIsPublicMode(false);
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
        } catch (_) {}
      } else if (event === 'SIGNED_OUT') {
        try {
          localStorage.removeItem(SESSION_STORAGE_KEY);
        } catch (_) {}
        setCurrentUser(null);
        setActiveRole('viewer');
        setIsPublicMode(false);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const registerWithEmail = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = displayName.trim() || cleanEmail.split('@')[0] || 'Investigador';

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLoading(false);
      const err: any = new Error('Formato de correo electrónico inválido.');
      err.code = 'auth/invalid-email';
      throw err;
    }

    if (!password || password.length < 6) {
      setLoading(false);
      const err: any = new Error('La contraseña debe tener al menos 6 caracteres.');
      err.code = 'auth/weak-password';
      throw err;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            full_name: cleanName,
            display_name: cleanName
          }
        }
      });

      if (error) {
        const customErr: any = new Error(error.message);
        customErr.code = error.name || 'supabase_auth_error';
        throw customErr;
      }

      if (data?.user) {
        const profile = await syncSupabaseUserProfile(data.user.id, cleanEmail, cleanName);
        setCurrentUser(profile);
        setActiveRole('owner');
        setIsPublicMode(false);
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
        } catch (_) {}
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setLoading(false);
      const err: any = new Error('Formato de correo electrónico inválido.');
      err.code = 'auth/invalid-email';
      throw err;
    }

    if (!password) {
      setLoading(false);
      const err: any = new Error('Por favor ingresa tu contraseña.');
      err.code = 'auth/wrong-password';
      throw err;
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) {
        const customErr: any = new Error(error.message);
        customErr.code = error.name || 'supabase_auth_error';
        throw customErr;
      }

      if (data?.user) {
        const profile = await syncSupabaseUserProfile(
          data.user.id, 
          cleanEmail, 
          data.user.user_metadata?.full_name || data.user.user_metadata?.name
        );
        setCurrentUser(profile);
        setActiveRole('owner');
        setIsPublicMode(false);
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
        } catch (_) {}
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) {
        throw error;
      }
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = async () => {
    setLoading(true);
    try {
      const guestId = 'guest_' + Math.random().toString(36).substring(2, 9);
      const guestProfile: UserProfile = {
        userId: guestId,
        displayName: 'Investigador Invitado',
        email: 'invitado@arbolfamiliar.com',
        isAnonymous: true,
        storageMode: 'cloud',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };

      setCurrentUser(guestProfile);
      setActiveRole('owner');
      setIsPublicMode(false);
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(guestProfile));
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) {
      throw error;
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch (_) {}
      await supabase.auth.signOut();
      setCurrentUser(null);
      setActiveRole('viewer');
      setIsPublicMode(false);
    } catch (e) {
      console.warn('Error during sign out:', e);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
      const updatePayload: any = {};
      if (data.displayName !== undefined) updatePayload.display_name = data.displayName;
      if (data.photoURL !== undefined) updatePayload.photo_url = data.photoURL;
      if (data.phone !== undefined) updatePayload.phone = data.phone;
      if (data.bio !== undefined) updatePayload.bio = data.bio;
      if (data.privacyPreferences !== undefined) updatePayload.privacy_preferences = data.privacyPreferences;

      await supabase.from('users').update(updatePayload).eq('id', currentUser.userId);
    } catch (e) {
      console.warn('Error saving updated profile to Supabase:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        activeRole,
        isPublicMode,
        registerWithEmail,
        loginWithEmail,
        loginWithGoogle,
        loginAsGuest,
        sendPasswordReset,
        logout,
        updateProfileData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
