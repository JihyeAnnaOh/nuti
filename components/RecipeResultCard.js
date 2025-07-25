import Image from 'next/image';

export default function RecipeResultCard({ recipe, onViewRecipe }) {
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
        <button
          onClick={() => onViewRecipe(recipe)}
          className="mt-2 px-4 py-2 rounded bg-[var(--primary)] text-[var(--text-light)] font-semibold hover:bg-[var(--primary-light)]"
        >
          View Recipe
        </button>
      </div>
    </div>
  );
} 