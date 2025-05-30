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
    <div className="min-h-screen bg-gray-50 text-black">
      <Header />
      <div className="pt-20 flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <UploadBox onResult={setResult} />
          <FoodResultCard result={result} />
          {result?.name && <NearbyResults keyword={result.name} />}
          <h2 className="text-2xl font-bold mb-4">🔥 Recommended Meals</h2>
          {meals.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {meals.map((meal) => (
                <div
                  key={meal.id}
                  className="bg-white rounded shadow p-4 hover:shadow-lg transition"
                >
                  <h3 className="text-lg font-semibold mb-1">{meal.name}</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Culture:</strong> {meal.culture}
                  </p>
                  {meal.Calories && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Calories(per typical serving):</strong> {meal.Calories}
                    </p>
                  )}
                  {meal.vegetarian !== undefined && (
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>Vegetarian:</strong> {meal.vegetarian}
                    </p>
                  )}
                  {meal.halal !== undefined && (
                    <p className="text-sm text-gray-600">
                      <strong>Halal:</strong> {meal.halal}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Loading meals...</p>
          )}
        </main>
      </div>
    </div>
  );
}
