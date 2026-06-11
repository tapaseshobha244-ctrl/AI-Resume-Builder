import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '@/lib/firebase';

export function getFirebaseAuthError(code: string): string {
  const map: Record<string, string> = {
    'auth/user-not-found': 'No account found with this email address.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/email-already-in-use': 'An account with this email already exists. Try signing in.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/popup-blocked': 'Pop-up was blocked. Please allow pop-ups for this site and try again.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email. Try a different sign-in method.',
    'auth/network-request-failed': 'Network error. Please check your connection.',
    'auth/too-many-requests': 'Too many attempts. Please try again later.',
    'auth/invalid-api-key': 'Authentication service is not configured. Please contact support.',
    'auth/app-not-authorized': 'This app is not authorized to use Firebase Authentication.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact support.',
  };
  return map[code] ?? 'An unexpected error occurred. Please try again.';
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  getToken: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    // Enable session persistence across page refreshes
    setPersistence(auth, browserLocalPersistence).catch(() => null);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    if (!isFirebaseConfigured) throw new Error('Firebase is not configured. Please add your Firebase credentials.');
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    await signInWithPopup(auth, provider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    // Force refresh user object so displayName is immediately available
    setUser({ ...credential.user, displayName: name } as User);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured) throw new Error('Firebase is not configured.');
    await sendPasswordResetEmail(auth, email);
  };

  const getToken = async (): Promise<string | null> => {
    if (!user) return null;
    return await user.getIdToken();
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, isConfigured: isFirebaseConfigured, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, resetPassword, getToken }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};
