const SPOONACULAR_API_KEY = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com/recipes/complexSearch';

export async function getRecipesByIngredients(ingredients, filters) {
  const params = new URLSearchParams({
    apiKey: SPOONACULAR_API_KEY,
    includeIngredients: ingredients.join(','),
    number: 10,
    addRecipeInformation: 'true',
    fillIngredients: 'true',
    addRecipeInstructions: 'true',
  });
  if (filters.cuisine && filters.cuisine !== 'Any') params.append('cuisine', filters.cuisine);
  if (filters.diet && filters.diet !== 'Any') params.append('diet', filters.diet);
  if (filters.time) params.append('maxReadyTime', filters.time);
  if (filters.maxIngredients) params.append('maxIngredients', filters.maxIngredients);

  const url = `${BASE_URL}?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch recipes');
  const data = await res.json();
  // Map results to include missingIngredients, calories, and instructions
  return (data.results || []).map(r => ({
    id: r.id,
    title: r.title,
    image: r.image,
    calories: r.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount,
    missingIngredients: r.missedIngredients?.map(i => i.name) || [],
    instructions: r.analyzedInstructions?.[0]?.steps?.map(step => step.step).join('\n\n') || r.instructions,
    ingredients: r.extendedIngredients?.map(i => `${i.amount} ${i.unit} ${i.name}`) || [],
    ...r,
  }));
} 