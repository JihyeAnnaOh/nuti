import { NextResponse } from 'next/server';
import { adminAuth, adminDb, adminAvailable } from '../../../../lib/firebaseAdmin';
import { ROLE_ADMIN, ROLE_USER } from '../../../../lib/userModel';

/**
 * GET /api/admin/verify
 * Verifies the user's Firebase token and checks if they have Admin role.
 * Admin = single person; only role === ROLE_ADMIN is allowed.
 * Requires Authorization: Bearer <idToken>
 * Returns { ok: true, isAdmin: true } or { ok: false }
 */
export async function GET(req) {
  if (!adminAvailable || !adminAuth || !adminDb) {
    return NextResponse.json({ ok: false, error: 'Admin not configured' }, { status: 503 });
  }

  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!token) {
    return NextResponse.json({ ok: false, error: 'No token' }, { status: 401 });
  }

  let uid;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    uid = decoded?.uid;
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 401 });
  }

  if (!uid) {
    return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 401 });
  }

  const userSnap = await adminDb.collection('users').doc(uid).get();
  const role = userSnap.exists ? (userSnap.data()?.role || ROLE_USER) : ROLE_USER;

  if (role !== ROLE_ADMIN) {
    return NextResponse.json({ ok: false, isAdmin: false }, { status: 403 });
  }

  return NextResponse.json({ ok: true, isAdmin: true });
}
