'use client';

import { useTranslation } from '../contexts/TranslationContext';
import Header from '../../../components/Header';

export default function TestTranslations() {
  const { t, currentLanguage, changeLanguage } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="pt-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Translation Test Page</h1>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Current Language: {currentLanguage}</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-4 py-2 rounded ${currentLanguage === 'en' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                English
              </button>
              <button
                onClick={() => changeLanguage('ko')}
                className={`px-4 py-2 rounded ${currentLanguage === 'ko' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
              >
                한국어
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Common Phrases</h3>
              <div className="space-y-2">
                <p><strong>Language:</strong> {t('common.language')}</p>
                <p><strong>Home:</strong> {t('common.home')}</p>
                <p><strong>Loading:</strong> {t('common.loading')}</p>
                <p><strong>Error:</strong> {t('common.error')}</p>
                <p><strong>Search:</strong> {t('common.search')}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Navigation</h3>
              <div className="space-y-2">
                <p><strong>Home:</strong> {t('navigation.home')}</p>
                <p><strong>Meal Planner:</strong> {t('navigation.mealPlanner')}</p>
                <p><strong>Calorie Finder:</strong> {t('navigation.calorieFinder')}</p>
                <p><strong>Recipe Discovery:</strong> {t('navigation.recipeDiscovery')}</p>
                <p><strong>Food Recognition:</strong> {t('navigation.foodRecognition')}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Home Page</h3>
              <div className="space-y-2">
                <p><strong>Title:</strong> {t('home.title')}</p>
                <p><strong>Subtitle:</strong> {t('home.subtitle')}</p>
                <p><strong>Camera Feature:</strong> {t('home.features.camera')}</p>
                <p><strong>AI Recognition:</strong> {t('home.features.ai')}</p>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Meal Planner</h3>
              <div className="space-y-2">
                <p><strong>Title:</strong> {t('mealPlanner.title')}</p>
                <p><strong>Select Cuisine:</strong> {t('mealPlanner.selectCuisine')}</p>
                <p><strong>Breakfast:</strong> {t('mealPlanner.meals.breakfast')}</p>
                <p><strong>Lunch:</strong> {t('mealPlanner.meals.lunch')}</p>
                <p><strong>Dinner:</strong> {t('mealPlanner.meals.dinner')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 