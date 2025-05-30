export default function FoodResultCard({ result }) {
    if (!result) return null;
  
    return (
      <div className="p-4 border rounded shadow bg-white mb-6">
        <h3 className="text-xl font-bold mb-2">🍱 AI Result</h3>
        <p><strong>Food:</strong> {result.name}</p>
        <p><strong>Calories(per typical serving):</strong> {result.calories}</p>
        <p><strong>Vegetarian:</strong> {result.vegetarian}</p>
        <p><strong>Halal:</strong> {result.halal}</p>
      </div>
    );
  }
  