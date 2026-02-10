"use client";
/**
 * Recipe Discovery page backed by Spoonacular.
 *
 * - Users enter available ingredients and optional filters
 * - Calls `getRecipesByIngredients` to fetch candidate recipes
 * - Shows missing ingredients with handy Google Maps links
 * - Offers print and PDF download for a selected recipe
 */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from '../../../components/Header';
import Sidebar from '../../../components/Sidebar';
import IngredientInput from '../../../components/IngredientInput';
import RecipeFilters from '../../../components/RecipeFilters';
import RecipeResultCard from '../../../components/RecipeResultCard';
import { getRecipesByIngredients } from '../../../lib/recipesApi';
import { getMapsSearchUrl } from '../../../lib/mapsApi';
import { jsPDF } from 'jspdf';
import Image from 'next/image';
import { auth } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export default function WhatCanICookPage() {
  const [ingredients, setIngredients] = useState([]);
  const [filters, setFilters] = useState({ cuisine: 'Any', diet: 'Any', time: '', maxIngredients: '' });
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [added, setAdded] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showRecipeModal, setShowRecipeModal] = useState(false);
  const [user, setUser] = useState(null);
  const [usageRemaining, setUsageRemaining] = useState(null);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const loadUsage = async () => {
      setUsageRemaining(null);
      setPlan(null);
      if (!user) return;
      try {
        const idToken = await user.getIdToken();
        const res = await fetch('/api/usage', {
          headers: { Authorization: `Bearer ${idToken}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUsageRemaining(typeof data.remaining === 'number' ? data.remaining : null);
          setPlan(data.plan || null);
        }
      } catch {
        // ignore
      }
    };
    loadUsage();
  }, [user]);

  // Query Spoonacular with current ingredients and filters
  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getRecipesByIngredients(ingredients, filters);
      setRecipes(res);
    } catch (e) {
      if (e && e.code === 429) {
        setError('Daily search limit reached. Sign in for unlimited searches.');
      } else if (e && e.code === 401) {
        setError('Sign in required to continue.');
      } else {
        setError('Something went wrong — please try again.');
      }
    }
    setLoading(false);
  };

  // Open modal with full recipe details
  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setShowRecipeModal(true);
  };

  // Print a simplified recipe view in a new window
  const handlePrintRecipe = () => {
    if (selectedRecipe) {
      const printWindow = window.open('', '_blank');
      printWindow.document.write(`
        <html>
          <head>
            <title>${selectedRecipe.title}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; }
              h2 { color: #666; margin-top: 20px; }
              img { max-width: 300px; height: auto; }
              ul { margin-left: 20px; }
              .instructions { white-space: pre-line; }
            </style>
          </head>
          <body>
            <h1>${selectedRecipe.title}</h1>
            <img src="${selectedRecipe.image}" alt="${selectedRecipe.title}" />
            <h2>Ingredients:</h2>
            <ul>
              ${selectedRecipe.ingredients ? selectedRecipe.ingredients.map(ing => `<li>${ing}</li>`).join('') : '<li>Ingredients not available</li>'}
            </ul>
            <h2>Instructions:</h2>
            <div class="instructions">${selectedRecipe.instructions || 'Instructions not available'}</div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Generate a lightweight PDF containing ingredients and instructions
  const handleDownloadRecipe = () => {
    if (selectedRecipe) {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(selectedRecipe.title, 20, 30);
      
      // Ingredients section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Ingredients:', 20, 50);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      let yPosition = 60;
      
      if (selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0) {
        selectedRecipe.ingredients.forEach((ingredient, index) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(`• ${ingredient}`, 25, yPosition);
          yPosition += 8;
        });
      } else {
        doc.text('Ingredients not available', 25, yPosition);
      }
      
      // Instructions section
      yPosition += 15;
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Instructions:', 20, yPosition);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      yPosition += 10;
      
      if (selectedRecipe.instructions) {
        const instructions = selectedRecipe.instructions;
        const splitInstructions = doc.splitTextToSize(instructions, 170);
        
        splitInstructions.forEach((line) => {
          if (yPosition > 250) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += 8;
        });
      } else {
        doc.text('Instructions not available', 20, yPosition);
      }
      
      // Footer
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.text('Recipe from Nuti App', 20, doc.internal.pageSize.height - 20);
      
      // Download the PDF
      const filename = `${selectedRecipe.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_recipe.pdf`;
      doc.save(filename);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }} className="min-h-screen bg-[#F8F4F2]">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="pt-40 relative transition-all duration-300e-in-out">
        <Sidebar open={sidebarOpen} />
        <main className={`transition-all duration-300e-in-out flex flex-col items-center justify-center min-h-calc(100h-5rem)]`}>
          <div className="container mx-auto mt-10 p-6 sm:p-8 md:p-12 bg-white/80 rounded-3xl shadow-lg w-full max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold italic tracking-widest uppercase text-center text-[#B48C8C] mb-4 drop-shadow-lg font-sans" style={{ WebkitTextStroke: '2px #fff', textShadow: '0 2px 16px #fff, 0 1px 0 #EECFD4' }}>
              Recipe Discovery
            </h1>
            <p className="text-md text-gray-500 text-center mb-8 opacity-70 italic">Staring at your fridge, unsure what to cook? Find recipes you can make with the ingredients you have at home.</p>
            <div className="bg-white/90 rounded-2xl shadow p-6 mb-6">
              <IngredientInput ingredients={ingredients} setIngredients={setIngredients} />
              <RecipeFilters filters={filters} setFilters={setFilters} />
              <button
                onClick={handleSearch}
                className="mt-4 px-4 py-2 rounded-full bg-[var(--primary)] text-white font-bold text-xs uppercase tracking-wide shadow hover:bg-[var(--accent)] transition-all duration-200 w-full"
                disabled={loading || ingredients.length === 0 || (error.includes('Daily search limit') ? true : false)}
              >
                {loading ? 'Searching...' : 'Find Recipes'}
              </button>
              {/* Usage/plan indicator */}
              <div className="mt-2 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {plan === 'member' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-200">Member · Unlimited</span>
                  ) : user ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">Free · {usageRemaining == null ? '2/day' : `${usageRemaining}/2 left today`}</span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 border border-gray-200">Guest · 2/day</span>
                  )}
                </div>
              </div>
              {error && (
                <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200">
                  <p className="text-red-700 text-sm font-semibold">{error}</p>
                  {(error.includes('Sign in') || error.includes('unlimited')) && (
                    <div className="mt-2">
                      <Link
                        href="/my"
                        className="inline-block px-3 py-1 rounded-full bg-[var(--primary)] text-white text-xs font-semibold hover:bg-[var(--accent)] transition"
                      >
                        Go to My Page
                      </Link>
                    </div>
                  )}
                  {!error.includes('Sign in') && (
                    <div className="mt-2">
                      <button
                        onClick={handleSearch}
                        className="inline-block px-3 py-1 rounded-full bg-white text-[var(--primary)] text-xs font-semibold border border-[var(--primary)] hover:bg-[var(--primary-light)] transition"
                        disabled={loading}
                      >
                        Retry
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="mt-8">
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white/90 rounded-2xl shadow-lg p-4 border border-[#EECFD4] animate-pulse">
                      <div className="h-32 w-full bg-gray-200 rounded-xl mb-4"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="mt-4 h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              )}
              {recipes.length === 0 && !loading && (
                <div className="text-center text-gray-400">
                  <p className="text-lg">No recipes yet. Add ingredients and search!</p>
                </div>
              )}
              {recipes.map(recipe => (
                <div key={recipe.id} className="mb-6">
                  <RecipeResultCard recipe={recipe} onViewRecipe={handleViewRecipe} cardClassName="bg-white/90 rounded-2xl shadow-lg p-6 border border-[#EECFD4] hover:shadow-xl transition-shadow" btnClassName="mt-4 px-4 py-2 rounded-full bg-blue-500 text-white font-bold text-xs uppercase tracking-wide shadow hover:bg-blue-600 transition-all duration-200 w-full" />
                  {recipe.missingIngredients && recipe.missingIngredients.length > 0 && (
                    <div className="ml-4 p-4 bg-white/90 rounded-2xl shadow-lg border border-[#EECFD4] hover:shadow-xl transition-shadow">
                      <span className="text-ml font-semibold text-[#B48C8C] block mb-3">🔍 Find missing ingredients nearby:</span>
                      <ul className="list-disc list-inside space-y-2">
                        {recipe.missingIngredients.map(ing => (
                          <li key={ing}>
                            <a href={getMapsSearchUrl(ing)} target="_blank" rel="noopener noreferrer" className="text-[#3B3B3B] hover:text-[#B48C8C] underline transition-colors font-medium">{ing}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
      
      {/* Recipe Modal */}
      {showRecipeModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-lg">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedRecipe.title}</h2>
                <button 
                  onClick={() => setShowRecipeModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <Image src={selectedRecipe.image} alt={selectedRecipe.title} width={600} height={192} className="w-full h-48 object-cover rounded-lg mb-4" />
              
              <div className="flex gap-2 mb-4">
                <button
                  onClick={handlePrintRecipe}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold"
                >
                  🖨️ Print Recipe
                </button>
                <button
                  onClick={handleDownloadRecipe}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition font-semibold"
                >
                  📥 Download Recipe
                </button>
              </div>
              
              <div className="mb-4">
                <h3 className="font-bold text-lg mb-2">Ingredients:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 ? (
                    selectedRecipe.ingredients.map((ingredient, index) => (
                      <li key={index} className="text-gray-700">{ingredient}</li>
                    ))
                  ) : (
                    <li className="text-gray-500">Ingredients not available</li>
                  )}
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-2">Instructions:</h3>
                <div className="text-gray-700 whitespace-pre-line">
                  {selectedRecipe.instructions || 'Instructions not available'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 