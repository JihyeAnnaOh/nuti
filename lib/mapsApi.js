export function getMapsSearchUrl(ingredient) {
  return `https://www.google.com/maps/search/${encodeURIComponent(ingredient + ' grocery store')}`;
} 