'use client';

import { useEffect, useState, use } from 'react';
import Header from '../../../../components/Header';
import Sidebar from '../../../../components/Sidebar';

const HEALTH_GOALS = [
  'Balanced',
  'Low-carb',
  'High-protein',
  'Vegetarian',
  'Vegan',
  'Low-calorie',
];

const MOCK_MEALS = {
  korean: {
    breakfast: [
      'Kimchi Omelette',
      'Tofu & Veggie Porridge',
      'Korean-Style Avocado Toast',
    ],
    lunch: [
      'Bibimbap (Veggie)',
      'Grilled Chicken Bulgogi Salad',
      'Low-carb Kimchi Fried Rice',
    ],
    dinner: [
      'Samgyetang (Ginseng Chicken Soup)',
      'Spicy Tofu Stew',
      'Grilled Mackerel with Sides',
    ],
    snack: [
      'Roasted Seaweed Snack',
      'Fruit & Nut Mix',
      'Sweet Potato Chips',
    ],
  },
  chinese: {
    breakfast: [
      'Congee with Pickled Veggies',
      'Steamed Buns (Mantou)',
      'Egg & Tomato Stir-fry',
    ],
    lunch: [
      'Mapo Tofu (Vegetarian)',
      'Chicken & Broccoli Stir-fry',
      'Low-carb Cauliflower Fried Rice',
    ],
    dinner: [
      'Steamed Fish with Ginger',
      'Buddha\'s Delight (Vegetarian Hotpot)',
      'Szechuan Chicken with Veggies',
    ],
    snack: [
      'Edamame Beans',
      'Fresh Fruit Platter',
      'Lotus Root Chips',
    ],
  },
};

function getRandomMeal(culture, type) {
  const arr = MOCK_MEALS[culture][type];
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function CountryPage({ params }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { type } = use(params);
  const [healthGoal, setHealthGoal] = useState('Balanced');
  const [mealPlan, setMealPlan] = useState(null);

  useEffect(() => {
    if (type === 'korean' || type === 'chinese') {
      setMealPlan({
        breakfast: getRandomMeal(type, 'breakfast'),
        lunch: getRandomMeal(type, 'lunch'),
        dinner: getRandomMeal(type, 'dinner'),
        snack: getRandomMeal(type, 'snack'),
      });
    }
  }, [type]);

  const regeneratePlan = () => {
    setMealPlan({
      breakfast: getRandomMeal(type, 'breakfast'),
      lunch: getRandomMeal(type, 'lunch'),
      dinner: getRandomMeal(type, 'dinner'),
      snack: getRandomMeal(type, 'snack'),
    });
  };

  const swapMeal = (mealType) => {
    setMealPlan((prev) => ({ ...prev, [mealType]: getRandomMeal(type, mealType) }));
  };

  const exportToPDF = () => {
    alert('Export to PDF coming soon!');
  };

  const shareToWhatsApp = () => {
    const text = `${type.charAt(0).toUpperCase() + type.slice(1)} Meal Plan (%23${healthGoal}):\n\nBreakfast: ${mealPlan.breakfast}\nLunch: ${mealPlan.lunch}\nDinner: ${mealPlan.dinner}\nSnack: ${mealPlan.snack}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  // Show meal planner for Korean and Chinese
  if (type === 'korean' || type === 'chinese') {
    return (
      <div style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }} className="min-h-screen">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <div className="pt-20 relative transition-all duration-300 ease-in-out">
          <Sidebar open={sidebarOpen} />
          <main className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'} pt-8 pb-6 px-6 max-w-2xl mx-auto`}>
            <h1 className="text-3xl font-bold mb-6">🍱 {type.charAt(0).toUpperCase() + type.slice(1)} Meal Planner</h1>
            <form className="mb-8 flex flex-col md:flex-row gap-4 items-center">
              <label className="font-semibold">Health Goal:</label>
              <select
                className="border rounded px-3 py-2 text-base"
                value={healthGoal}
                onChange={e => setHealthGoal(e.target.value)}
              >
                {HEALTH_GOALS.map(goal => (
                  <option key={goal} value={goal}>{goal}</option>
                ))}
              </select>
              <span className="font-semibold">Cultural Preference:</span>
              <span className="px-3 py-2 rounded bg-gray-100 border text-base">{type.charAt(0).toUpperCase() + type.slice(1)}</span>
            </form>

            {mealPlan ? (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Your Daily Plan</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {['breakfast', 'lunch', 'dinner', 'snack'].map(mealType => (
                    <div key={mealType} className="flex flex-col gap-2 border rounded p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold capitalize">{mealType}</span>
                        <button
                          className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200"
                          onClick={() => swapMeal(mealType)}
                          type="button"
                        >
                          Swap
                        </button>
                      </div>
                      <span className="text-base">{mealPlan[mealType]}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
                    onClick={regeneratePlan}
                    type="button"
                  >
                    Regenerate Plan
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-green-600 text-white font-semibold hover:bg-green-700"
                    onClick={exportToPDF}
                    type="button"
                  >
                    Export to PDF
                  </button>
                  <button
                    className="px-4 py-2 rounded bg-[#25D366] text-white font-semibold hover:bg-[#128C7E]"
                    onClick={shareToWhatsApp}
                    type="button"
                  >
                    Share to WhatsApp
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">Loading meal plan...</div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // Fallback for other cuisines
  return (
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }} className="min-h-screen">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="pt-20 relative transition-all duration-300 ease-in-out">
        <Sidebar open={sidebarOpen} />
        <main className={`transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'} pt-8 pb-6 px-6`}>
          <h1 className="text-3xl font-bold mb-6">🌏 {type.charAt(0).toUpperCase() + type.slice(1)} Cuisine</h1>
          <p className="text-gray-500">Meal planner is coming soon for this cuisine.</p>
        </main>
      </div>
    </div>
  );
} 