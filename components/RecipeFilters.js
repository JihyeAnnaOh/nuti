const CUISINES = ['Any', 'Korean', 'Chinese', 'Japanese', 'Vietnamese', 'Lebanese', 'Indian', 'Malaysian', 'Italian', 'American'];
const DIETS = ['Any', 'Vegetarian', 'Vegan', 'Halal', 'Low-calorie', 'Gluten Free'];
const TIMES = [15, 30, 45, 60];

/**
 * Filter controls for recipe discovery.
 * Drives query params for `getRecipesByIngredients`.
 */
export default function RecipeFilters({ filters, setFilters }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-[#B48C8C] mb-4 mt-8">🔍 Filter Your Recipes</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Cuisine Filter */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-[#EECFD4] hover:shadow-xl transition-shadow">
          <label className="block text-sm font-semibold mb-3 text-[#7C7C7C]">🌍 Cuisine</label>
          <select
            className="w-full border border-[#EECFD4] rounded-xl px-4 py-3 bg-white text-[#3B3B3B] focus:outline-none focus:ring-2 focus:ring-[#B48C8C] focus:border-transparent transition"
            value={filters.cuisine}
            onChange={e => setFilters(f => ({ ...f, cuisine: e.target.value }))}
          >
            {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Dietary Filter */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-[#EECFD4] hover:shadow-xl transition-shadow">
          <label className="block text-sm font-semibold mb-3 text-[#7C7C7C]">🥗 Dietary</label>
          <select
            className="w-full border border-[#EECFD4] rounded-xl px-4 py-3 bg-white text-[#3B3B3B] focus:outline-none focus:ring-2 focus:ring-[#B48C8C] focus:border-transparent transition"
            value={filters.diet}
            onChange={e => setFilters(f => ({ ...f, diet: e.target.value }))}
          >
            {DIETS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Time Filter */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-[#EECFD4] hover:shadow-xl transition-shadow">
          <label className="block text-sm font-semibold mb-3 text-[#7C7C7C]">⏱️ Max Time</label>
          <select
            className="w-full border border-[#EECFD4] rounded-xl px-4 py-3 bg-white text-[#3B3B3B] focus:outline-none focus:ring-2 focus:ring-[#B48C8C] focus:border-transparent transition"
            value={filters.time}
            onChange={e => setFilters(f => ({ ...f, time: e.target.value }))}
          >
            <option value="">Any time</option>
            {TIMES.map(t => <option key={t} value={t}>{t} min</option>)}
          </select>
        </div>

        {/* Ingredients Filter */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-[#EECFD4] hover:shadow-xl transition-shadow">
          <label className="block text-sm font-semibold mb-3 text-[#7C7C7C]">🥘 Max Ingredients</label>
          <input
            type="number"
            min={1}
            placeholder="Any"
            className="w-full border border-[#EECFD4] rounded-xl px-4 py-3 bg-white text-[#3B3B3B] focus:outline-none focus:ring-2 focus:ring-[#B48C8C] focus:border-transparent transition"
            value={filters.maxIngredients}
            onChange={e => setFilters(f => ({ ...f, maxIngredients: e.target.value }))}
          />
        </div>
      </div>
    </div>
  );
} 