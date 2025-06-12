'use client';

import { useEffect, useState } from 'react';
import { use } from 'react';
import { db } from '../../../../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Header from '../../../../components/Header';
import Sidebar from '../../../../components/Sidebar';

export default function FoodTypePage({ params }) {
  const [meals, setMeals] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const type = use(params).type;

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
        </main>
      </div>
    </div>
  );
} 