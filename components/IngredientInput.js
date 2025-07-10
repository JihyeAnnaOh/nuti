import { useState } from 'react';

export default function IngredientInput({ ingredients, setIngredients }) {
  const [input, setInput] = useState('');

  const addIngredient = () => {
    const trimmed = input.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients([...ingredients, trimmed]);
      setInput('');
    }
  };

  const removeIngredient = (ing) => {
    setIngredients(ingredients.filter(i => i !== ing));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-[#B48C8C] mb-4">🥕 Your Ingredients</h3>
      
      {/* Ingredients Display */}
      <div className="bg-white rounded-3xl shadow-lg p-6 border border-[#EECFD4] min-h-[80px]">
        <div className="flex flex-wrap gap-3 mb-4">
          {ingredients.length === 0 ? (
            <p className="text-gray-400 italic">No ingredients added yet...</p>
          ) : (
            ingredients.map(ing => (
              <span key={ing} className="bg-[#EECFD4] text-[#3B3B3B] px-4 py-2 rounded-full flex items-center gap-2 text-sm font-semibold shadow-sm hover:shadow-md transition-shadow">
                {ing}
                <button 
                  onClick={() => removeIngredient(ing)} 
                  className="ml-1 text-[#B48C8C] hover:text-red-500 text-lg font-bold transition-colors"
                >
                  ×
                </button>
              </span>
            ))
          )}
        </div>
        
        {/* Input Field */}
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') addIngredient(); }}
            placeholder="Add an ingredient (e.g., chicken, rice, tomatoes)..."
            className="flex-1 border border-[#EECFD4] rounded-xl px-4 py-3 bg-white text-[#3B3B3B] focus:outline-none focus:ring-2 focus:ring-[#B48C8C] focus:border-transparent transition"
          />
          <button 
            onClick={addIngredient} 
            className="px-6 py-3 rounded-xl bg-[var(--primary)] text-[var(--text-light)] font-semibold hover:opacity-90 transition shadow-lg hover:shadow-xl"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
} 