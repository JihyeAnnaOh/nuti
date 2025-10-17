import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

/**
 * Firebase initialization for the client.
 *
 * Reads public environment variables (NEXT_PUBLIC_*) to configure Firebase and
 * exposes a singleton Firestore instance (`db`) for the rest of the app.
 *
 * Note: Use server-only keys (no NEXT_PUBLIC) on the server if you add admin SDKs.
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase app and Firestore (client-side SDK)
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };