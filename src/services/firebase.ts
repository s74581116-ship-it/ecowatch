import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';

// Check for Firebase environment configuration
const envConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export const isFirebaseConfigured: boolean = Boolean(
  envConfig.apiKey &&
  envConfig.projectId &&
  envConfig.apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  envConfig.projectId !== 'YOUR_PROJECT_ID'
);

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(envConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);

    // Validate connection asynchronously per Firebase skill guidelines
    if (typeof window !== 'undefined') {
      getDocFromServer(doc(db, '_connection_test', 'status')).catch((error) => {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.warn('Firebase client is offline or network is restricted.');
        }
      });
    }
  } catch (err) {
    console.error('Error initializing Firebase SDK:', err);
  }
}

export { app, db, auth };
