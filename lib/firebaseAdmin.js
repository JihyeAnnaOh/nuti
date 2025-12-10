// Server-only Firebase Admin initialization.
// Requires env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
// Note: PRIVATE_KEY should preserve newlines; if escaped, we replace \\n with \n.

import { initializeApp, getApps, applicationDefault, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

function initAdminApp() {
  if (getApps().length) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  // Fallback for local emulator or environments with application default credentials
  return initializeApp({ credential: applicationDefault() });
}

const adminApp = initAdminApp();
const adminAuth = getAdminAuth(adminApp);
const adminDb = getAdminFirestore(adminApp);

export { adminAuth, adminDb };


