import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from '../firebase/config';
import { UserProfile, MemberRole } from '../types';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  activeRole: MemberRole;
  isPublicMode: boolean;
  isInvited: boolean;
  inviteContext: { targetId?: string; relation?: string } | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  simulateRole: (role: MemberRole, isPublic?: boolean) => void;
  updateProfileData: (data: Partial<UserProfile>) => void;
  acceptInvite: (targetId?: string, relation?: string) => void;
}

const DEFAULT_DEMO_USER: UserProfile = {
  userId: 'user-default-owner',
  displayName: 'Juan Carlos Cantero',
  email: 'fecsoul@gmail.com',
  photoURL: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
  createdAt: '2026-01-10T10:00:00Z',
  lastLoginAt: new Date().toISOString(),
  privacyPreferences: {
    hideEmailFromMembers: false,
    notifyOnRequests: true,
    notifyOnProposals: true
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(DEFAULT_DEMO_USER);
  const [activeRole, setActiveRole] = useState<MemberRole>('owner');
  const [isPublicMode, setIsPublicMode] = useState<boolean>(false);
  const [isInvited, setIsInvited] = useState<boolean>(false);
  const [inviteContext, setInviteContext] = useState<{ targetId?: string; relation?: string } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const inviteParam = urlParams.get('invite');
      const roleParam = urlParams.get('role');
      const targetId = urlParams.get('targetId') || urlParams.get('target') || undefined;
      const relation = urlParams.get('rel') || urlParams.get('relation') || undefined;

      if (inviteParam || roleParam === 'editor' || roleParam === 'collaborator' || targetId) {
        setIsInvited(true);
        setActiveRole('collaborator');
        setIsPublicMode(false);
        setInviteContext({ targetId, relation });
        if (!currentUser) {
          setCurrentUser({
            userId: `invited-${Date.now()}`,
            displayName: 'Familiar Invitado',
            email: 'invitado@familia.org',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString()
          });
        }
      }
    } catch (e) {
      console.warn('Error reading invite params', e);
    }
  }, []);

  const acceptInvite = (targetId?: string, relation?: string) => {
    setIsInvited(true);
    setActiveRole('collaborator');
    setIsPublicMode(false);
    setInviteContext({ targetId, relation });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFirebaseUser(user);
        setCurrentUser({
          userId: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Investigador Genealógico',
          email: user.email || 'usuario@arbolgenealogico.com',
          photoURL: user.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
          createdAt: user.metadata.creationTime || new Date().toISOString(),
          lastLoginAt: new Date().toISOString()
        });
      } else {
        setFirebaseUser(null);
        // Keep demo user if not logged in to enable instant playground experience
        if (!currentUser) {
          setCurrentUser(DEFAULT_DEMO_USER);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.warn('Google popup auth error (might be running in sandboxed iframe), applying authenticated session:', err);
      // Fallback demo authenticated session
      setCurrentUser(DEFAULT_DEMO_USER);
      setActiveRole('owner');
      setIsPublicMode(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      console.warn('SignOut error:', e);
    }
    // Switch to public visitor view
    setCurrentUser(null);
    setActiveRole('viewer');
    setIsPublicMode(true);
  };

  const simulateRole = (role: MemberRole, publicView: boolean = false) => {
    setActiveRole(role);
    setIsPublicMode(publicView);
    if (publicView) {
      setCurrentUser(null);
    } else if (!currentUser) {
      setCurrentUser(DEFAULT_DEMO_USER);
    }
  };

  const updateProfileData = (data: Partial<UserProfile>) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, ...data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        firebaseUser,
        loading,
        activeRole,
        isPublicMode,
        isInvited,
        inviteContext,
        signInWithGoogle,
        logout,
        simulateRole,
        updateProfileData,
        acceptInvite
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
