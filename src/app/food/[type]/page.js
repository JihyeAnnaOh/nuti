'use client';

/**
 * Food type listing page backed by Firestore.
 *
 * - Reads from `test` collection filtering by `name == type`
 * - Displays simple cards per meal with basic attributes
 * - Offers a share-as-image utility using `html-to-image`
 */

import { useEffect, useState, useRef } from 'react';
import { use } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Header from '../../../../components/Header';
import Sidebar from '../../../../components/Sidebar';
import { toPng } from "html-to-image";

export default function FoodTypePage({ params }) {
  const [meals, setMeals] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const type = use(params).type;
  const mealPlanRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      const q = query(collection(db, "test"), where("name", "==", type));
      const querySnapshot = await getDocs(q);
      const mealList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setMeals(mealList);
    }
    fetchData();
  }, [type]);

  // Export a DOM node as a PNG image
  const handleExport = async (ref) => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { cacheBust: true });
      // Option 1: Download the image
      const link = document.createElement("a");
      link.download = "meal-plan.png";
      link.href = dataUrl;
      link.click();

      // Option 2: Open share dialog (if supported)
      // if (navigator.share) {
      //   const response = await fetch(dataUrl);
      //   const blob = await response.blob();
      //   const file = new File([blob], "meal-plan.png", { type: blob.type });
      //   navigator.share({
      //     files: [file],
      //     title: "My Meal Plan",
      //     text: "Check out my meal plan from Nuti!",
      //   });
      // }
    } catch (err) {
      alert("Failed to export image.");
    }
  };

  return (
    <div
      style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}
      className="min-h-screen"
    >
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="pt-20 relative transition-all duration-300 ease-in-out">
        <Sidebar open={sidebarOpen} />
        <main
          className={`transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'ml-64' : 'ml-0'
          } pt-8 pb-6 px-6`}
        >
          <h1 className="text-3xl font-bold mb-6">🍽️ {type}</h1>
          
          {meals.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  style={{ backgroundColor: 'var(--card-bg)' }}
                  className="rounded shadow p-4 hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold mb-1">{meal.name}</h3>
                  <p className="text-sm opacity-80 mb-1">
                    <strong>Culture:</strong> {meal.culture}
                  </p>
                  {meal.Calories && (
                    <p className="text-sm opacity-80 mb-1">
                      <strong>Calories(per typical serving):</strong> {meal.Calories}
                    </p>
                  )}
                  {meal.vegetarian !== undefined && (
                    <p className="text-sm opacity-80 mb-1">
                      <strong>Vegetarian:</strong> {meal.vegetarian}
                    </p>
                  )}
                  {meal.halal !== undefined && (
                    <p className="text-sm opacity-80">
                      <strong>Halal:</strong> {meal.halal}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No meals found for this type.</p>
          )}
          <div ref={mealPlanRef}>
            {/* Meal plan content here */}
          </div>
          <button onClick={() => handleExport(mealPlanRef)}>Share as Image</button>
        </main>
      </div>
    </div>
  );
} 