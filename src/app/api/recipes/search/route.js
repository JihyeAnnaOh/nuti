export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '../../../../../lib/firebaseAdmin';

const SPOONACULAR_BASE = 'https://api.spoonacular.com';
const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;

function getTodayKeyUtc() {
  const now = new Date();
  // UTC YYYYMMDD
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

async function getUserPlan(uid) {
  if (!uid) return 'free';
  const docRef = adminDb.collection('users').doc(uid);
  const snap = await docRef.get();
  const plan = snap.exists && snap.data()?.plan ? String(snap.data().plan) : 'free';
  return plan;
}

async function incrementAndCheckLimit(subjectId, dailyLimit) {
  const todayKey = getTodayKeyUtc();
  const docId = `${subjectId}_${todayKey}`;
  const docRef = adminDb.collection('rate_limits').doc(docId);

  return await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(docRef);
    const now = new Date();

    if (!snap.exists) {
      tx.set(docRef, {
        subjectId,
        count: 1,
        windowStart: now.toISOString(),
        type: 'recipe_search',
      });
      return { allowed: true, remaining: Math.max(dailyLimit - 1, 0) };
    } else {
      const data = snap.data();
      const count = (data?.count || 0) + 1;
      if (count > dailyLimit) {
        return { allowed: false, remaining: 0 };
      }
      tx.update(docRef, { count });
      return { allowed: true, remaining: Math.max(dailyLimit - count, 0) };
    }
  });
}

async function fetchRecipesFromSpoonacular(ingredients, filters) {
  // Step 1: findByIngredients for forgiving matching
  const findParams = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY,
    ingredients: ingredients.join(','),
    number: '20',
    ranking: '1',
    ignorePantry: 'true',
  });
  const findRes = await fetch(`${SPOONACULAR_BASE}/recipes/findByIngredients?${findParams.toString()}`);
  if (!findRes.ok) {
    throw new Error('Upstream findByIngredients failed');
  }
  const found = await findRes.json();
  if (!Array.isArray(found) || found.length === 0) return [];

  const ids = found.map(r => r.id).slice(0, 20);

  // Step 2: Bulk details
  const bulkParams = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY,
    ids: ids.join(','),
    includeNutrition: 'true',
  });
  const bulkRes = await fetch(`${SPOONACULAR_BASE}/recipes/informationBulk?${bulkParams.toString()}`);
  if (!bulkRes.ok) {
    throw new Error('Upstream informationBulk failed');
  }
  const detailedList = await bulkRes.json();

  const idToFound = new Map(found.map(r => [r.id, r]));

  // Normalize
  let normalized = detailedList.map(d => {
    const base = idToFound.get(d.id) || {};
    const calories = d.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount;
    const instructions = d.analyzedInstructions?.[0]?.steps?.map(step => step.step).join('\\n\\n') || d.instructions;
    const ingredientsList = Array.isArray(d.extendedIngredients)
      ? d.extendedIngredients.map(i => `${i.amount ?? ''} ${i.unit ?? ''} ${i.name}`.trim())
      : [];
    const missingIngredients = Array.isArray(base.missedIngredients)
      ? base.missedIngredients.map(i => i.name)
      : [];
    return {
      id: d.id,
      title: d.title,
      image: d.image,
      calories,
      instructions,
      ingredients: ingredientsList,
      missingIngredients,
      readyInMinutes: d.readyInMinutes,
      cuisines: d.cuisines || [],
      diets: d.diets || [],
      vegetarian: d.vegetarian,
      vegan: d.vegan,
      glutenFree: d.glutenFree,
      extendedIngredients: d.extendedIngredients,
    };
  });

  // Filters
  const cuisine = filters?.cuisine;
  if (cuisine && cuisine !== 'Any') {
    const wanted = cuisine.toLowerCase();
    normalized = normalized.filter(r => (r.cuisines || []).some(c => c.toLowerCase() === wanted));
  }

  const diet = filters?.diet;
  if (diet && diet !== 'Any') {
    const d = diet.toLowerCase();
    normalized = normalized.filter(r => {
      if (d === 'vegetarian') return r.vegetarian === true || (r.diets || []).includes('vegetarian');
      if (d === 'vegan') return r.vegan === true || (r.diets || []).includes('vegan');
      if (d === 'gluten free' || d === 'gluten-free') return r.glutenFree === true || (r.diets || []).includes('gluten free');
      if (d === 'low-calorie' || d === 'low calorie') return typeof r.calories === 'number' && r.calories <= 500;
      if (d === 'halal') return true;
      return true;
    });
  }

  const time = filters?.time;
  if (time) {
    normalized = normalized.filter(r => typeof r.readyInMinutes === 'number' && r.readyInMinutes <= Number(time));
  }

  const maxIngredients = filters?.maxIngredients;
  if (maxIngredients) {
    normalized = normalized.filter(r => Array.isArray(r.extendedIngredients) && r.extendedIngredients.length <= Number(maxIngredients));
  }

  return normalized;
}

export async function POST(req) {
  if (!SPOONACULAR_API_KEY) {
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const ingredients = Array.isArray(body?.ingredients) ? body.ingredients : [];
  const filters = body?.filters || {};
  if (ingredients.length === 0) {
    return NextResponse.json({ results: [] });
  }

  // Identify user or guest
  const uid = await verifyIdTokenFromRequest(req);
  const cookieStore = cookies();
  let visitorId = cookieStore.get('visitorId')?.value;
  if (!uid && !visitorId) {
    visitorId = crypto.randomUUID();
  }

  // Rate limit (members unlimited)
  let plan = 'free';
  if (uid) {
    plan = await getUserPlan(uid);
  }

  let limited = false;
  let remaining = null;
  if (!uid || plan !== 'member') {
    const subjectId = uid || visitorId;
    const dailyLimit = 2; // free cap
    const res = await incrementAndCheckLimit(subjectId, dailyLimit);
    limited = !res.allowed;
    remaining = res.remaining;
    if (limited) {
      return NextResponse.json({ error: 'Daily search limit reached', plan, remaining: 0 }, { status: 429 });
    }
  }

  // Fetch recipes
  try {
    const results = await fetchRecipesFromSpoonacular(ingredients, filters);
    const response = NextResponse.json({ results, plan, remaining });
    // Set visitorId cookie if newly assigned
    if (!uid && visitorId && !cookieStore.get('visitorId')) {
      response.cookies.set('visitorId', visitorId, {
        httpOnly: true,
        sameSite: 'lax',
        secure: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 365, // 1 year
      });
    }
    return response;
  } catch (e) {
    return NextResponse.json({ error: 'Upstream error' }, { status: 502 });
  }
}


