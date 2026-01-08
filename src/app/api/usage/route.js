export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../../lib/firebaseAdmin';

function getTodayKeyUtc() {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

async function verifyIdTokenFromRequest(req) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) return null;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded?.uid || null;
  } catch {
    return null;
  }
}

export async function GET(req) {
  const uid = await verifyIdTokenFromRequest(req);
  if (!uid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // plan
  const userSnap = await adminDb.collection('users').doc(uid).get();
  const plan = userSnap.exists && userSnap.data()?.plan ? String(userSnap.data().plan) : 'free';

  // remaining (for free plan only)
  let remaining = null;
  if (plan !== 'member') {
    const today = getTodayKeyUtc();
    const docId = `${uid}_${today}`;
    const snap = await adminDb.collection('rate_limits').doc(docId).get();
    const count = snap.exists ? Number(snap.data()?.count || 0) : 0;
    const dailyLimit = 2;
    remaining = Math.max(dailyLimit - count, 0);
  }
  return NextResponse.json({ plan, remaining });
}


