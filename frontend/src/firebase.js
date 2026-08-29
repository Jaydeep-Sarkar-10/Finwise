import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Firebase web configuration.
// These values come from VITE_ environment variables.
// - Local dev: set them in frontend/.env.local (gitignored)
// - Production (Vercel): set them as Vercel environment variables
//
// Note: Firebase web config values (apiKey, projectId, etc.) are
// NOT server-side secrets — they are safe to expose in a browser bundle.
// They are scoped by Firebase Security Rules and authorized domains.

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;