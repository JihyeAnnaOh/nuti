/**
 * Public Spoonacular recipe page URL (approx. slug from title + numeric id).
 */
export function getSpoonacularRecipeUrl(recipeId, title) {
  const id = String(recipeId ?? '').trim();
  if (!id) return 'https://spoonacular.com/recipes';
  const slug = String(title || 'recipe')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `https://spoonacular.com/recipes/${slug}-${id}`;
}
