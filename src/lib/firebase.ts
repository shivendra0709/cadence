import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
let _auth;
try {
  _auth = getAuth(app);
} catch (e) {
  console.warn("getAuth failed, falling back to initializeAuth with no persistence", e);
  const { initializeAuth, inMemoryPersistence } = require('firebase/auth');
  _auth = initializeAuth(app, { persistence: inMemoryPersistence });
}
export const auth = _auth;

// Initialize Firestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Explicitly enable IndexedDB persistence
// IndexedDB persistence disabled in preview environment to prevent multi-tab deadlocks

export const googleProvider = new GoogleAuthProvider();
