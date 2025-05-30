'use client';

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import UploadBox from "../../components/UploadBox";
import FoodResultCard from "../../components/FoodResultCard";
import NearbyResults from "../../components/NearbyResults";

export default function Home() {
  const [meals, setMeals] = useState([]);
  const [result, setResult] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const querySnapshot = await getDocs(collection(db, "test"));
      const mealList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }));
      setMeals(mealList);
    }
    fetchData();
  }, []);

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
          } ${result ? 'p-6' : 'flex items-center justify-center min-h-[calc(100vh-5rem)]'}`}
        >
          <div className={`${result ? '' : 'max-w-md w-full text-center space-y-6'}`}>
            <UploadBox onResult={setResult} />
            <FoodResultCard result={result} />
            {result?.name && <NearbyResults keyword={result.name} />}
          </div>

          {result && (
            <>
              <h2 className="text-2xl font-bold mb-4 mt-10">🔥 Recommended Meals</h2>
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
                <p className="text-gray-500">Loading meals...</p>
              )}
            </>
          )}
        </main>

      </div>
    </div>
  );
}
