/**
 * Client helper to call our protected search API.
 * The server enforces member limits and proxies Spoonacular.
 */
import { auth } from './firebase';

/**
 * Fetch recipes that match provided ingredients and filters.
 *
 * @param {string[]} ingredients
 * @param {{ cuisine?: string, diet?: string, time?: number, maxIngredients?: number }} filters
 * @returns {Promise<Array<object>>}
 */
export async function getRecipesByIngredients(ingredients, filters) {
  // Optionally include Firebase ID token
  let idToken = null;
  try {
    const user = auth.currentUser;
    if (user) {
      idToken = await user.getIdToken();
    }
  } catch {}

  const res = await fetch('/api/recipes/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
    },
    body: JSON.stringify({ ingredients, filters }),
  });

  if (res.status === 429) {
    const data = await res.json();
    const err = new Error('Daily search limit reached');
    err.code = 429;
    err.plan = data?.plan;
    err.remaining = data?.remaining;
    throw err;
  }

  if (!res.ok) {
    throw new Error('Failed to fetch recipes');
  }

  const data = await res.json();
  return data?.results || [];
}