/**
 * Recipe search client built on Spoonacular.
 *
 * Uses `findByIngredients` to make ingredient matching forgiving (e.g. "chicken"
 * will match recipes with "chicken breast/thigh/drumstick"), then enriches
 * with `informationBulk` to obtain instructions, nutrition, cuisines, diets, etc.
 */
const SPOONACULAR_API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
const API_BASE = 'https://api.spoonacular.com';

/**
 * Fetch recipes that match provided ingredients and filters.
 *
 * @param {string[]} ingredients
 * @param {{ cuisine?: string, diet?: string, time?: number, maxIngredients?: number }} filters
 * @returns {Promise<Array<object>>}
 */
export async function getRecipesByIngredients(ingredients, filters) {
  // 1) Find candidate recipes by ingredients (forgiving matching)
  const findParams = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY,
    ingredients: ingredients.join(','),
    number: '20',
    ranking: '1', // maximize used ingredients
    ignorePantry: 'true',
  });

  const findUrl = `${API_BASE}/recipes/findByIngredients?${findParams.toString()}`;
  const findRes = await fetch(findUrl);
  if (!findRes.ok) throw new Error('Failed to fetch recipes');
  const found = await findRes.json();

  if (!Array.isArray(found) || found.length === 0) {
    return [];
  }

  const ids = found.map(r => r.id).slice(0, 20);

  // 2) Enrich with bulk information (instructions, nutrition, cuisines, diets)
  const bulkParams = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY,
    ids: ids.join(','),
    includeNutrition: 'true',
  });
  const bulkUrl = `${API_BASE}/recipes/informationBulk?${bulkParams.toString()}`;
  const bulkRes = await fetch(bulkUrl);
  if (!bulkRes.ok) throw new Error('Failed to fetch recipe details');
  const detailedList = await bulkRes.json();

  const idToFound = new Map(found.map(r => [r.id, r]));

  // 3) Normalize shape
  let normalized = detailedList.map(d => {
    const base = idToFound.get(d.id) || {};
    const calories = d.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount;
    const instructions = d.analyzedInstructions?.[0]?.steps?.map(step => step.step).join('\n\n') || d.instructions;
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

  // 4) Apply client-side filters to preserve UX controls
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
      // "Halal" not available from Spoonacular; keep recipe
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