---
name: Firebase Auth setup
description: How Firebase Auth is wired — what env vars are needed and what isFirebaseConfigured guards.
---

## Rule
Client-side Firebase auth requires VITE_FIREBASE_API_KEY and VITE_FIREBASE_APP_ID (Web SDK config).
The Firebase Admin SDK (server-side) is NOT used anywhere in this project.

**Why:** The server-side credentials (FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY) are set but the API routes do not call Firebase Admin. All auth is done client-side.

**How to apply:**
- If adding server-side token verification, initialize Admin SDK with the env vars already set.
- `isFirebaseConfigured` in `src/lib/firebase.ts` gates all auth UI. Missing vars → amber warning banner, disabled buttons.
- Web config lives in Firebase Console → Project Settings → Your Apps → Web App → SDK setup.
