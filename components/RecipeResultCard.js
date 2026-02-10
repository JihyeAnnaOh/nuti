import Image from 'next/image';
import { useState } from 'react';
import FeedbackWidget from './FeedbackWidget';

/**
 * Compact recipe card with a CTA and embedded feedback block.
 */
export default function RecipeResultCard({ recipe, onViewRecipe, confidence, latency }) {
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState(null); // { type: 'success'|'error', text: string }
  const handleSave = async () => {
    try {
      if (saving) return;
      setSaving(true);
      setSaveNotice(null);
      // Try include ID token if signed in (optional)
      let idToken = null;
      try {
        const { auth } = await import('../lib/firebase');
        if (auth.currentUser) {
          idToken = await auth.currentUser.getIdToken();
        }
      } catch {}
      const res = await fetch('/api/saved-recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(idToken ? { Authorization: `Bearer ${idToken}` } : {})
        },
        body: JSON.stringify({ recipe: { id: recipe.id, title: recipe.title, image: recipe.image } })
      });
      if (!res.ok) {
        throw new Error('Failed to save');
      }
      setSaveNotice({ type: 'success', text: 'Saved to My Page' });
    } catch (e) {
      setSaveNotice({ type: 'error', text: 'Sign in to save recipes' });
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col md:flex-row gap-4 border border-[#EECFD4] mb-4">
      <Image src={recipe.image} alt={recipe.title} width={128} height={128} className="w-32 h-32 object-cover rounded-xl" />
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold mb-2">{recipe.title}</h3>
          {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
            <p className="text-xs text-red-500 mb-2">Missing: {recipe.missingIngredients.join(', ')}</p>
          )}
        </div>
        <div className="space-y-3">
          <button
            onClick={() => onViewRecipe(recipe)}
            className="mt-2 px-4 py-2 rounded bg-[var(--primary)] text-[var(--text-light)] font-semibold hover:bg-[var(--primary-light)]"
          >
            View Recipe
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 rounded ${saving ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold`}
            disabled={saving}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <FeedbackWidget 
            context={`recipe:${recipe.title}`}
            confidence={confidence}
            latency={latency}
            className="border-t pt-3"
          />
          {saveNotice && (
            <div className={`mt-2 text-xs px-3 py-2 rounded ${saveNotice.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
              {saveNotice.text}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 