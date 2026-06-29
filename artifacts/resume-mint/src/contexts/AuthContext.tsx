import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
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
    'auth/popup-blocked': 'Pop-up blocked by browser.',
    'auth/popup-closed-by-user': 'Sign-in cancelled.',
    'auth/cancelled-popup-request': 'Sign-in cancelled.',
    'auth/account-exists-with-different-credential': 'An account already exists with this email. Try a different sign-in method.',
    'auth/network-request-failed': 'Network error. Please check your internet connection.',
    'auth/too-many-requests': 'Too many failed attempts. Please wait a few minutes.',
    'auth/invalid-api-key': 'Invalid Firebase API key. Check your VITE_FIREBASE_API_KEY.',
    'auth/app-not-authorized': 'This app is not authorized for Firebase Authentication.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Go to Firebase Console → Authentication → Sign-in method and enable it.',
    'auth/not-configured': 'Firebase is not configured. Add VITE_FIREBASE_API_KEY and VITE_FIREBASE_APP_ID.',
    'auth/internal-error': 'Firebase error. Make sure your domain is in Firebase Console → Authentication → Authorized domains.',
    'auth/unauthorized-domain': 'Domain not authorized. Add it in Firebase Console → Authentication → Authorized domains.',
    'auth/auth-domain-config-required': 'Firebase auth domain is not configured.',
    'auth/missing-email': 'Please enter your email address.',
    'auth/missing-password': 'Please enter your password.',
    'auth/timeout': 'Request timed out. Please try again.',
    'auth/user-disabled': 'This account has been disabled.',
    'auth/requires-recent-login': 'Please sign in again to complete this action.',
    'auth/credential-already-in-use': 'These credentials are already linked to another account.',
    'auth/web-storage-unsupported': 'Enable cookies and web storage in your browser settings.',
    'auth/invalid-action-code': 'The action code is invalid or has expired.',
    'auth/expired-action-code': 'This link has expired. Please request a new one.',
    'auth/redirect-cancelled-by-user': 'Sign-in cancelled.',
    'auth/redirect-operation-pending': 'A sign-in is already in progress.',
  };
  if (!code) return 'An unexpected error occurred. Please try again.';
  return map[code] ?? `Sign-in failed (${code}). Please try again.`;
}

/** True when running inside an iframe (e.g. Replit preview pane) */
export function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
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

    // Collect the result after a Google redirect (non-iframe path)
    getRedirectResult(auth)
      .then((result) => { if (result?.user) setUser(result.user); })
      .catch(() => null);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    if (!isFirebaseConfigured) {
      const err = new Error('Not configured') as Error & { code: string };
      err.code = 'auth/not-configured';
      throw err;
    }
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');

    if (isInIframe()) {
      // Inside Replit preview iframe: can't do popup or redirect reliably.
      // Throw a special code so the UI can show an "open in new tab" prompt.
      const err = new Error('iframe') as Error & { code: string };
      err.code = 'auth/iframe-detected';
      throw err;
    }

    // Outside iframe: try popup first (best UX), fall back to redirect.
    try {
      await signInWithPopup(auth, provider);
    } catch (e: unknown) {
      const code = (e as { code?: string })?.code ?? '';
      if (code === 'auth/popup-blocked' || code === 'auth/popup-closed-by-user') {
        await signInWithRedirect(auth, provider);
      } else {
        throw e;
      }
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      const err = new Error('Not configured') as Error & { code: string };
      err.code = 'auth/not-configured';
      throw err;
    }
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signUpWithEmail = async (name: string, email: string, password: string) => {
    if (!isFirebaseConfigured) {
      const err = new Error('Not configured') as Error & { code: string };
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
      const err = new Error('Not configured') as Error & { code: string };
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
