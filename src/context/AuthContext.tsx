import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInAnonymously,
  signOut, 
  sendPasswordResetEmail,
  updateProfile 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, MemberRole } from '../types';
import { cleanForFirestore } from '../utils/firestoreUtils';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: User | null;
  loading: boolean;
  activeRole: MemberRole;
  isPublicMode: boolean;
  registerWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'familia_user_session';

function getFallbackUserId(email: string): string {
  const sanitized = email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
  return `usr_${sanitized}`;
}

async function hashPassword(email: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`genealogy_v2_salt:${email.toLowerCase().trim()}:${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<MemberRole>('owner');
  const [isPublicMode, setIsPublicMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync profile with Firestore
  const fetchOrCreateUserProfile = async (
    userId: string, 
    email: string, 
    customDisplayName?: string,
    isAnonymous: boolean = false,
    passwordHash?: string
  ): Promise<UserProfile> => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userDocRef);

      if (userSnap.exists()) {
        const data = userSnap.data() as any;
        const updatedProfile: UserProfile = {
          ...data,
          userId: userId,
          email: email || data.email || '',
          displayName: customDisplayName || data.displayName || email.split('@')[0] || 'Usuario',
          lastLoginAt: new Date().toISOString()
        };
        // Update last login
        const updatePayload: any = { lastLoginAt: updatedProfile.lastLoginAt };
        if (passwordHash && !data.passwordHash) {
          updatePayload.passwordHash = passwordHash;
        }
        await setDoc(userDocRef, cleanForFirestore(updatePayload), { merge: true });
        return updatedProfile;
      } else {
        const newProfile: any = {
          userId: userId,
          displayName: customDisplayName || email.split('@')[0] || 'Investigador',
          email: email || '',
          photoURL: undefined,
          isAnonymous: isAnonymous,
          storageMode: 'cloud',
          passwordHash: passwordHash || undefined,
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          privacyPreferences: {
            hideEmailFromMembers: false,
            notifyOnRequests: true,
            notifyOnProposals: true
          }
        };
        await setDoc(userDocRef, cleanForFirestore(newProfile));
        return newProfile as UserProfile;
      }
    } catch (e) {
      console.warn('Error fetching or creating user profile in Firestore:', e);
      return {
        userId: userId,
        displayName: customDisplayName || email.split('@')[0] || 'Investigador',
        email: email || '',
        photoURL: undefined,
        isAnonymous: isAnonymous,
        storageMode: 'cloud',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString()
      };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setFirebaseUser(user);
        const profile = await fetchOrCreateUserProfile(
          user.uid, 
          user.email || '', 
          user.displayName || undefined, 
          user.isAnonymous
        );
        setCurrentUser(profile);
        setActiveRole('owner');
        setIsPublicMode(false);
        try {
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
        } catch (_) {}
        setLoading(false);
      } else {
        // Check if there is an active stored session in localStorage
        try {
          const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
          if (savedSession) {
            const parsed = JSON.parse(savedSession) as UserProfile;
            if (parsed && parsed.userId) {
              const freshProfile = await fetchOrCreateUserProfile(
                parsed.userId,
                parsed.email || '',
                parsed.displayName,
                parsed.isAnonymous
              );
              setCurrentUser(freshProfile);
              setActiveRole('owner');
              setIsPublicMode(false);
              setLoading(false);
              return;
            }
          }
        } catch (_) {}

        setFirebaseUser(null);
        setCurrentUser(null);
        setActiveRole('viewer');
        setIsPublicMode(false);
        setLoading(false);
      }
    });

    return () => unsubscribe();
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
      const passwordHash = await hashPassword(cleanEmail, password);
      const userId = getFallbackUserId(cleanEmail);

      // Check if user already exists in Firestore
      const userDocRef = doc(db, 'users', userId);
      const userSnap = await getDoc(userDocRef);
      if (userSnap.exists()) {
        const existingData = userSnap.data() as any;
        if (existingData && existingData.passwordHash) {
          const err: any = new Error('Este correo electrónico ya está registrado. Por favor inicia sesión.');
          err.code = 'auth/email-already-in-use';
          throw err;
        }
      }

      // 1. Try Firebase Auth first
      let user: User | null = null;
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        user = userCredential.user;
        if (cleanName) {
          try {
            await updateProfile(user, { displayName: cleanName });
          } catch (profileErr) {
            console.warn('Failed to update displayName on auth token:', profileErr);
          }
        }
      } catch (authErr: any) {
        if (authErr.code === 'auth/email-already-in-use') {
          throw authErr;
        }
        console.info('Firebase email auth provider status:', authErr.code);
      }

      const finalUserId = user ? user.uid : userId;
      const profile = await fetchOrCreateUserProfile(finalUserId, cleanEmail, cleanName, false, passwordHash);
      
      if (user) {
        setFirebaseUser(user);
      }
      setCurrentUser(profile);
      setActiveRole('owner');
      setIsPublicMode(false);

      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
      } catch (_) {}
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
      const expectedHash = await hashPassword(cleanEmail, password);
      let user: User | null = null;
      let authSuccess = false;

      try {
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        user = userCredential.user;
        authSuccess = true;
      } catch (authErr: any) {
        // If Firebase Auth strictly rejects wrong credentials
        if (authErr.code === 'auth/wrong-password' || authErr.code === 'auth/invalid-credential') {
          // Verify with Firestore record before rejecting
          const userId = getFallbackUserId(cleanEmail);
          const userDocRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as any;
            if (data.passwordHash && data.passwordHash === expectedHash) {
              authSuccess = true;
            } else {
              throw authErr;
            }
          } else {
            throw authErr;
          }
        } else if (authErr.code === 'auth/user-not-found') {
          // Check Firestore
          const userId = getFallbackUserId(cleanEmail);
          const userDocRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userDocRef);
          if (userSnap.exists()) {
            const data = userSnap.data() as any;
            if (data.passwordHash && data.passwordHash === expectedHash) {
              authSuccess = true;
            } else {
              const wrongErr: any = new Error('Contraseña incorrecta.');
              wrongErr.code = 'auth/wrong-password';
              throw wrongErr;
            }
          } else {
            const notFoundErr: any = new Error('No existe una cuenta con este correo.');
            notFoundErr.code = 'auth/user-not-found';
            throw notFoundErr;
          }
        } else {
          // operation-not-allowed or configuration-not-found
          const userId = getFallbackUserId(cleanEmail);
          const userDocRef = doc(db, 'users', userId);
          const userSnap = await getDoc(userDocRef);
          if (!userSnap.exists()) {
            const notFoundErr: any = new Error('No existe una cuenta registrada con este correo electrónico. Por favor regístrate.');
            notFoundErr.code = 'auth/user-not-found';
            throw notFoundErr;
          }
          const data = userSnap.data() as any;
          if (data.passwordHash && data.passwordHash !== expectedHash) {
            const wrongErr: any = new Error('Contraseña incorrecta. Por favor verifica tus credenciales.');
            wrongErr.code = 'auth/wrong-password';
            throw wrongErr;
          }
          authSuccess = true;
        }
      }

      if (!authSuccess && !user) {
        const err: any = new Error('Credenciales incorrectas.');
        err.code = 'auth/invalid-credential';
        throw err;
      }

      const finalUserId = user ? user.uid : getFallbackUserId(cleanEmail);
      const profile = await fetchOrCreateUserProfile(finalUserId, cleanEmail, undefined, false, expectedHash);
      
      if (user) {
        setFirebaseUser(user);
      }
      setCurrentUser(profile);
      setActiveRole('owner');
      setIsPublicMode(false);

      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
      } catch (_) {}
    } finally {
      setLoading(false);
    }
  };

  const loginAsGuest = async () => {
    setLoading(true);
    try {
      let user: User | null = null;
      try {
        const userCredential = await signInAnonymously(auth);
        user = userCredential.user;
      } catch (anonErr) {
        console.warn('Anonymous sign in not enabled in console, using active guest session', anonErr);
      }

      const guestId = user ? user.uid : ('guest_' + Math.random().toString(36).substring(2, 9));
      const guestProfile = await fetchOrCreateUserProfile(guestId, 'invitado@arbolfamiliar.com', 'Investigador Invitado', true);
      
      if (user) {
        setFirebaseUser(user);
      }
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
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (e) {
      console.warn('Password reset request error:', e);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      try {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } catch (_) {}

      if (auth.currentUser) {
        await signOut(auth);
      }
      setFirebaseUser(null);
      setCurrentUser(null);
      setActiveRole('viewer');
      setIsPublicMode(false);
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
      const userDocRef = doc(db, 'users', currentUser.userId);
      await setDoc(userDocRef, cleanForFirestore(data), { merge: true });
      if (data.displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, { displayName: data.displayName });
      }
    } catch (e) {
      console.warn('Error saving updated profile to Firestore:', e);
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
        registerWithEmail,
        loginWithEmail,
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
