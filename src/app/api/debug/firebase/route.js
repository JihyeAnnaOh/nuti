/**
 * Development-only endpoint to diagnose Firebase Admin config.
 * Visit http://localhost:3000/api/debug/firebase when running locally.
 */
import { NextResponse } from 'next/server';
import { adminAvailable } from '../../../../../lib/firebaseAdmin';

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 });
  }

  const hasProjectId = !!process.env.FIREBASE_PROJECT_ID;
  const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
  const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;
  const privateKeyLength = process.env.FIREBASE_PRIVATE_KEY?.length ?? 0;
  const privateKeyStartsCorrect = process.env.FIREBASE_PRIVATE_KEY?.includes('BEGIN PRIVATE KEY') ?? false;

  return NextResponse.json({
    adminConfigured: adminAvailable,
    env: {
      FIREBASE_PROJECT_ID: hasProjectId ? '✓ set' : '✗ missing',
      FIREBASE_CLIENT_EMAIL: hasClientEmail ? '✓ set' : '✗ missing',
      FIREBASE_PRIVATE_KEY: hasPrivateKey ? `✓ set (${privateKeyLength} chars)` : '✗ missing',
      privateKeyFormat: privateKeyStartsCorrect ? '✓ looks valid' : '✗ check format (should start with -----BEGIN PRIVATE KEY-----)',
    },
    hint: !adminAvailable
      ? 'Firebase Admin is NOT configured. Check env vars and restart dev server.'
      : 'Firebase Admin is configured. If save still fails, check terminal for [saved-recipes] error when you click Save.',
  });
}
