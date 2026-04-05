// Server-only Firebase Admin initialization.
// Option A: Env vars FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
// Option B: firebase-service-account.json in project root (avoids .env key formatting issues)

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth as getAdminAuth } from 'firebase-admin/auth';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

function findServiceAccountJsonPath() {
  const cwd = process.cwd();
  const preferred = join(cwd, 'firebase-service-account.json');
  if (existsSync(preferred)) return preferred;
  // Firebase downloads names like: projectId-firebase-adminsdk-xxxxx.json
  const files = readdirSync(cwd).filter(
    (f) => f.endsWith('.json') && f.includes('firebase-adminsdk')
  );
  if (files.length === 1) return join(cwd, files[0]);
  return null;
}

function initAdminApp() {
  if (getApps().length) {
    return getApps()[0];
  }

  // Option B: Load from service account JSON (prefers firebase-service-account.json, else *firebase-adminsdk*.json)
  try {
    const jsonPath = findServiceAccountJsonPath();
    if (jsonPath) {
      const json = JSON.parse(readFileSync(jsonPath, 'utf8'));
      if (json.project_id && json.client_email && json.private_key) {
        return initializeApp({
          credential: cert({
            projectId: json.project_id,
            clientEmail: json.client_email,
            privateKey: json.private_key,
          }),
        });
      }
    }
  } catch {
    // No JSON file or invalid - fall through to env vars
  }

  // Option A: Load from env vars
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  } else {
    privateKey = undefined;
  }

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }

  return null;
}

const adminApp = initAdminApp();
const adminAvailable = !!adminApp;
const adminAuth = adminAvailable ? getAdminAuth(adminApp) : null;
const adminDb = adminAvailable ? getAdminFirestore(adminApp) : null;

export { adminAuth, adminDb, adminAvailable };


