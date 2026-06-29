import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithRedirect,
  getRedirectResult,
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
    'auth/user-not-found': 'No account found with this email. Please register first.',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Invalid email or password. Please check and try again.',
    'auth/email-already-in-use': 'An account with this email already exists. Try signing in.',
    'auth/weak-password': 'Password must be at least 6 characters.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/popup-blocked': 'Pop-up was blocked. The page will redirect you to sign in with Google instead.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    'auth/cancelled-popup-request': 'Sign-in was cancelled.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email. Try a different sign-in method.',
    'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait a few minutes and try again.',
    'auth/invalid-api-key': 'Authentication service misconfiguration. Please contact support.',
    'auth/app-not-authorized': 'This app is not authorized for Firebase Authentication.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.',
    'auth/not-configured': 'Authentication is not set up yet. Firebase credentials are missing.',
    'auth/internal-error': 'Firebase internal error. Make sure your domain is in Firebase Console → Authentication → Authorized domains.',
    'auth/unauthorized-domain': 'This domain is not authorized. Add it in Firebase Console → Authentication → Authorized domains.',
    'auth/auth-domain-config-required': 'Firebase auth domain is not configured.',
    'auth/missing-email': 'Please enter your email address.',
    'auth/missing-password': 'Please enter your password.',
    'auth/timeout': 'The request timed out. Please try again.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/requires-recent-login': 'Please sign in again to complete this action.',
    'auth/credential-already-in-use': 'These credentials are already linked to another account.',
    'auth/web-storage-unsupported': 'Your browser does not support web storage. Please enable cookies and try again.',
    'auth/invalid-action-code': 'The action code is invalid or has expired.',
    'auth/expired-action-code': 'This link has expired. Please request a new one.',
    'auth/redirect-cancelled-by-user': 'Sign-in was cancelled.',
    'auth/redirect-operation-pending': 'A redirect sign-in is already in progress.',
  };
  if (!code) return 'An unexpected error occurred. Please try again.';
  if (map[code]) return map[code];
  return `Sign-in failed (${code}). Please try again.`;
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

    setPersistence(auth, browserLocalPersistence).catch(() => null);

    // Handle Google redirect result when the user returns from OAuth
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setUser(result.user);
        }
      })
      .catch(() => {
        // Redirect result errors are non-fatal — user just needs to sign in again
      });

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Google sign-in uses redirect (no popup) so it works in all environments:
  // Replit preview iframe, deployed apps, Safari, etc.
  const signInWithGoogle = async (): Promise<void> => {
    if (!isFirebaseConfigured) {
      const err = new Error('Authentication is not configured.') as Error & { code: string };
      err.code = 'auth/not-configured';
      throw err;
    }
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    // This navigates the page to Google then back — it does not return normally.
    await signInWithRedirect(auth, provider);
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      const err = new Error('Authentication is not configured.') as Error & { code: string };
      err.code = 'auth/not-configured';
      throw err;
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    if (!isFirebaseConfigured) {
      const err = new Error('Authentication is not configured.') as Error & { code: string };
      err.code = 'auth/not-configured';
      throw err;
    }
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name });
    setUser({ ...credential.user, displayName: name } as User);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured) {
      const err = new Error('Authentication is not configured.') as Error & { code: string };
      err.code = 'auth/not-configured';
      throw err;
    }
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
