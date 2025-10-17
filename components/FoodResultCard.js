import Image from 'next/image';
import FeedbackWidget from './FeedbackWidget';

/**
 * Displays the AI detection result with an optional preview image and
 * embeds a contextual feedback widget to rate the result quality.
 */
export default function FoodResultCard({ result, confidence, latency }) {
    if (!result) return null;
  
    return (
      <div className="p-4 border rounded shadow bg-white mb-6">
        <h3 className="text-xl font-bold mb-2">🍱 AI Result</h3>
        {result.preview && (
          <div className="mb-3 flex justify-center">
            <Image src={result.preview} alt="Food Preview" width={256} height={256} className="max-h-64 w-auto rounded shadow" />
          </div>
        )}
        <p><strong>Food:</strong> {result.name}</p>
        <p><strong>Calories(per typical serving):</strong> {result.calories}</p>
        <p><strong>Vegetarian:</strong> {result.vegetarian}</p>
        <p><strong>Halal:</strong> {result.halal}</p>
        
        <div className="mt-4 pt-3 border-t">
          <FeedbackWidget 
            context={`food:${result.name}`}
            confidence={confidence}
            latency={latency}
          />
        </div>
      </div>
    );
  }
  