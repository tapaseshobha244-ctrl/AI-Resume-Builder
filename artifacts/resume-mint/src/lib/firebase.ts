import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

export const isFirebaseConfigured =
  !!(apiKey && authDomain && projectId && appId) &&
  !apiKey.startsWith('mock') &&
  !apiKey.startsWith('demo');

const firebaseConfig = {
  apiKey: apiKey || 'demo-placeholder',
  authDomain: authDomain || `${projectId || 'demo'}.firebaseapp.com`,
  projectId: projectId || 'demo',
  storageBucket: `${projectId || 'demo'}.appspot.com`,
  appId: appId || '1:000000000000:web:000000000000',
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
