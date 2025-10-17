/**
 * Builds a Google Maps search URL for grocery stores carrying a given ingredient.
 *
 * @param {string} ingredient
 * @returns {string} A shareable Google Maps URL
 */
export function getMapsSearchUrl(ingredient) {
  return `https://www.google.com/maps/search/${encodeURIComponent(ingredient + ' grocery store')}`;
}