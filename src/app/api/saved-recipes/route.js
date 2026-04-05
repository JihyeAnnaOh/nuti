export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '../../../../lib/firebaseAdmin';

async function verifyIdTokenFromRequest(req) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (process.env.NODE_ENV === 'development') {
    if (!token) console.error('[saved-recipes] No Authorization header or token received');
    else if (!adminAuth) console.error('[saved-recipes] Firebase Admin not configured (check env vars)');
  }

  if (!token) return null;
  if (!adminAuth) return null;

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded?.uid || null;
  } catch (e) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[saved-recipes] Token verification failed:', e?.message || e);
      console.error('[saved-recipes] Full error:', e?.code || e?.errorInfo?.code || 'unknown');
    }
    return null;
  }
}

export async function GET(req) {
  const uid = await verifyIdTokenFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const colRef = adminDb.collection('users').doc(uid).collection('saved_recipes');
  const snap = await colRef.orderBy('savedAt', 'desc').limit(100).get();
  const items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return NextResponse.json({ items });
}

export async function POST(req) {
  const uid = await verifyIdTokenFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  const recipe = body?.recipe;
  if (!recipe?.id || !recipe?.title) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const docRef = adminDb.collection('users').doc(uid).collection('saved_recipes').doc(String(recipe.id));
  await docRef.set({
    recipeId: String(recipe.id),
    title: recipe.title,
    image: recipe.image || '',
    savedAt: new Date().toISOString(),
  }, { merge: true });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req) {
  const uid = await verifyIdTokenFromRequest(req);
  if (!uid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const docRef = adminDb.collection('users').doc(uid).collection('saved_recipes').doc(String(id));
  await docRef.delete();
  return NextResponse.json({ ok: true });
}


