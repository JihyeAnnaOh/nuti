"use client";
/**
 * Meal Planner flow powered by TheMealDB API.
 *
 * - Loads cuisines list and picks one (or uses `?cuisine=` query)
 * - For the chosen cuisine, selects random dishes per meal type
 * - Lets the user select one dish per meal and export/share
 * - Can find nearby restaurants for the selected dish via internal API
 */
import { useState, useEffect, useRef, Suspense } from "react";
import Header from "../../../components/Header";
import Sidebar from "../../../components/Sidebar";
import Image from 'next/image';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import LocationSearch from '../../../components/LocationSearch';
import { toPng } from 'html-to-image';
import { useSearchParams } from 'next/navigation';

const MEAL_TYPES = ["breakfast", "lunch", "dinner", "snack"];

const SOCIAL_ICONS = {
  whatsapp: '/images/social/whatsup.png',
  x: '/images/social/X.png',
  facebook: '/images/social/Facebook.png',
  threads: '/images/social/threads.svg',
  wechat: '/images/social/WeChat.svg',
  instagram: '/images/social/Instagram.png',
  kakao: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/KakaoTalk_logo.svg',
};

// Helper: pick N random items without caring about uniqueness across runs
function getRandomItems(arr, n) {
  const shuffled = arr.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

function MealPlannerPage() {
  const searchParams = useSearchParams();
  const [cuisines, setCuisines] = useState([]);
  const [cuisine, setCuisine] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDishes, setSelectedDishes] = useState({ breakfast: null, lunch: null, dinner: null, snack: null });
  const [optionsModal, setOptionsModal] = useState({ open: false, mealType: null, dish: null });
  const [searchLocation, setSearchLocation] = useState(null);
  const [nearbyResults, setNearbyResults] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [nearbyError, setNearbyError] = useState(null);
  const modalRef = useRef();
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const exportCardRef = useRef();

  // Fetch available cuisines from TheMealDB
  useEffect(() => {
    async function fetchCuisines() {
      const res = await fetch("https://www.themealdb.com/api/json/v1/1/list.php?a=list");
      const data = await res.json();
      if (data.meals) {
        setCuisines(data.meals.map(m => m.strArea));
        // Check for cuisine query param
        const cuisineParam = searchParams.get('cuisine');
        if (cuisineParam && data.meals.some(m => m.strArea === cuisineParam)) {
          setCuisine(cuisineParam);
        } else {
          setCuisine(data.meals[0]?.strArea || "");
        }
      }
    }
    fetchCuisines();
  }, [searchParams]);

  // Fetch 2 random dishes per meal type from TheMealDB (proxy for breakfast/lunch/dinner/snack)
  const fetchMealPlan = async (selectedCuisine) => {
    setLoading(true);
    setError(null);
    const area = selectedCuisine;
    const plan = {};
    let foundAny = false;
    for (const mealType of MEAL_TYPES) {
      // TheMealDB does not have meal type, so we filter by area and pick random
      const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${area}`);
      const data = await res.json();
      console.log(`[MealDB] ${area} - ${mealType}:`, data);
      if (data.meals && data.meals.length > 0) {
        plan[mealType] = getRandomItems(data.meals, 2); // 2 dishes per meal
        foundAny = true;
      } else {
        plan[mealType] = [];
      }
    }
    setMealPlan(plan);
    setLoading(false);
    if (!foundAny) {
      setError('No meals found for this cuisine. Please try another.');
    }
    setSelectedDishes({ breakfast: null, lunch: null, dinner: null, snack: null });
  };

  useEffect(() => {
    if (cuisine) fetchMealPlan(cuisine);
  }, [cuisine]);

  // Refresh choices for each meal type
  const regeneratePlan = () => {
    fetchMealPlan(cuisine);
  };

  // Replace a single dish within a meal type with a new random choice
  const swapMeal = async (mealType, idx) => {
    const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?a=${cuisine}`);
    const data = await res.json();
    if (data.meals) {
      const currentIds = mealPlan[mealType].map(m => m.idMeal);
      const available = data.meals.filter(m => !currentIds.includes(m.idMeal));
      if (available.length > 0) {
        const newDish = getRandomItems(available, 1)[0];
        setMealPlan(prev => ({
          ...prev,
          [mealType]: prev[mealType].map((m, i) => (i === idx ? newDish : m)),
        }));
      }
    }
  };

  // Choose a dish for the given meal type to include in the export/share card
  const handleSelectDish = (mealType, dish) => {
    setSelectedDishes(prev => ({ ...prev, [mealType]: dish }));
  };

  // Social media share handlers
  const getShareText = () => {
    let text = `${cuisine} Selected Meal Plan from NUTI:\n\n`;
    for (const mealType of MEAL_TYPES) {
      const dish = selectedDishes[mealType];
      text += `${mealType.charAt(0).toUpperCase() + mealType.slice(1)}: ${dish ? dish.strMeal : "-"}\n`;
    }
    text += '\nGenerated with NUTI!';
    return text;
  };

  const shareToWhatsApp = () => {
    const text = getShareText();
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const shareToX = () => {
    const text = getShareText();
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
  };

  const shareToFacebook = () => {
    const text = getShareText();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=&quote=${encodeURIComponent(text)}`);
  };

  const shareToThreads = () => {
    const text = getShareText();
    window.open(`https://www.threads.net/intent/post?text=${encodeURIComponent(text)}`);
  };

  const shareToKakao = () => {
    alert('KakaoTalk sharing is not supported directly via URL. Please use the Kakao SDK for full integration.');
  };

  const shareToWeChat = () => {
    alert('WeChat sharing is not supported directly via URL. Please use the WeChat SDK or share manually.');
  };

  const shareToInstagram = () => {
    alert('Instagram sharing is not supported directly via web. Please screenshot and share manually.');
  };

  // Fetch nearby restaurants for a dish and location (via internal API proxy)
  const fetchNearby = async (dishName, location) => {
    setNearbyLoading(true);
    setNearbyError(null);
    setNearbyResults([]);
    try {
      const response = await fetch(
        `/api/nearby?query=${encodeURIComponent(dishName)}&lat=${location.lat}&lng=${location.lng}`
      );
      const data = await response.json();
      if (data.error) {
        setNearbyError(data.error);
        setNearbyResults([]);
      } else {
        setNearbyResults(data.results || []);
      }
    } catch (err) {
      setNearbyError('Failed to fetch nearby places');
      setNearbyResults([]);
    }
    setNearbyLoading(false);
  };

  // Close modal on outside click
  useEffect(() => {
    if (!optionsModal.open) return;
    function handleClick(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setOptionsModal({ open: false, mealType: null, dish: null });
        setSearchLocation(null);
        setNearbyResults([]);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [optionsModal.open]);

  // Export the curated plan section as an image users can share
  const handleDownloadImage = async () => {
    if (!exportCardRef.current) return;
    try {
      const dataUrl = await toPng(exportCardRef.current, { cacheBust: true });
      const link = document.createElement('a');
      link.download = 'meal-plan.png';
      link.href = dataUrl;
      link.click();
      setShowDownloadModal(true);
    } catch (err) {
      alert('Failed to export image.');
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }} className="min-h-screen bg-[#F8F4F2]">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="pt-40 relative transition-all duration-300 ease-in-out">
        <Sidebar open={sidebarOpen} />
        <main className={`transition-all duration-300 ease-in-out flex flex-col items-center justify-center min-h-[calc(100vh-5rem)]`}>
          <div className="container mx-auto mt-10 p-6 sm:p-8 md:p-12 bg-white/80 rounded-3xl shadow-lg w-full max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold italic tracking-widest uppercase text-center text-[#B48C8C] mb-8 drop-shadow-lg font-sans" style={{ WebkitTextStroke: '2px #fff', textShadow: '0 2px 16px #fff, 0 1px 0 #EECFD4' }}>
              Meal Planner
            </h1>
            <p className="text-md text-gray-500 text-center mb-8 opacity-70 italic">Not sure what to eat today? Generate a daily meal plan based on your cultural and dietary preferences.</p>
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <label className="block mb-1 font-medium">Cultural Preference</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={cuisine}
                  onChange={e => setCuisine(e.target.value)}
                >
                  {cuisines.map(area => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </select>
              </div>
            </div>
            {error && (
              <div className="text-center text-red-500 font-semibold mb-4">{error}</div>
            )}
            {loading ? (
              <div className="text-center text-gray-400">Loading meal plan...</div>
            ) : mealPlan ? (
              <div className="bg-white rounded-2xl shadow p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Your Daily Plan</h2>
                  <button
                    className="px-5 py-2 rounded-full bg-[var(--primary)] text-white font-bold text-base shadow hover:bg-[var(--accent)] hover:text-[var(--primary)] ml-4 transition-all duration-200 tracking-wide"
                    onClick={regeneratePlan}
                    type="button"
                  >
                    Regenerate Plan
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {MEAL_TYPES.map(mealType => (
                    <div key={mealType} className="flex flex-col gap-2 border rounded-xl p-4 bg-gray-50 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold capitalize">{mealType}</span>
                      </div>
                      {mealPlan[mealType]?.map((dish, idx) => (
                        <div
                          key={dish.idMeal}
                          className={`flex flex-col items-center gap-2 mb-2 p-2 rounded cursor-pointer transition border-2 min-w-0 ${selectedDishes[mealType]?.idMeal === dish.idMeal ? 'border-[var(--primary)] bg-[var(--primary-light)]' : 'border-transparent hover:bg-gray-100'}`}
                          onClick={() => handleSelectDish(mealType, dish)}
                        >
                          <Image src={dish.strMealThumb} alt={dish.strMeal} width={96} height={96} className="w-24 h-24 object-cover rounded-2xl shadow-lg flex-shrink-0" />
                          <span className="font-semibold text-[var(--primary)] truncate block text-base md:text-lg text-center w-full">{dish.strMeal}</span>
                          <div className="flex gap-2 mt-2 w-full justify-center">
                            <button
                              className="text-xs px-4 py-2 rounded-full bg-gray-200 text-[var(--primary)] font-bold hover:bg-gray-300 transition-all duration-200 tracking-wide"
                              onClick={e => { e.stopPropagation(); swapMeal(mealType, idx); }}
                              type="button"
                            >
                              Swap
                            </button>
                            <button
                              className="text-xs px-4 py-2 rounded-full bg-blue-500 text-white font-bold hover:bg-blue-600 transition-all duration-200 tracking-wide"
                              onClick={e => {
                                e.stopPropagation();
                                setOptionsModal({ open: true, mealType, dish });
                                setSearchLocation(null);
                                setNearbyResults([]);
                              }}
                              type="button"
                            >
                              Ready to Eat?
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {/* Selected Plan Summary */}
                <div id="selected-plan-summary" className="w-full mt-8 p-6 rounded-2xl bg-gradient-to-br from-[var(--primary-light)]/30 to-white border shadow-md">
                  <h3 className="font-bold text-lg mb-4 text-center tracking-wide">🍽️ Selected Plan</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {MEAL_TYPES.map(mealType => {
                      const dish = selectedDishes[mealType];
                      return (
                        <div key={mealType} className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                          <span className="font-semibold capitalize text-[var(--primary)] text-base mb-2">{mealType}</span>
                          {dish ? (
                            <>
                              <Image src={dish.strMealThumb} alt={dish.strMeal} width={112} height={112} className="w-28 h-28 object-cover rounded-2xl shadow-lg mb-2 border border-gray-200" />
                              <span className="font-semibold text-center text-gray-800">{dish.strMeal}</span>
                            </>
                          ) : (
                            <span className="text-gray-400">(None selected)</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    <span className="text-xs text-gray-400">Generated with</span>
                    <Image src="/images/logo.png" alt="NUTI Logo" width={80} height={32} className="object-contain" />
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4 mt-6">
                  <div className="w-full flex flex-col items-center">
                  <span className="text-sm text-gray-500 font-medium mt-1">Show off your meal plan to the world!</span>

                    <div className="flex flex-row justify-center items-center gap-4 md:gap-6 lg:gap-8 mt-5 flex-wrap">
                      {/* Download as Image button first */}
                      <button
                        className="w-40 md:w-48 lg:w-52 h-12 md:h-14 lg:h-16 flex items-center justify-center rounded-full bg-[var(--primary)] !text-white font-bold text-sm md:text-base lg:text-lg shadow-lg hover:bg-[var(--accent)] hover:!text-[var(--text-light)] transition whitespace-nowrap"
                        onClick={handleDownloadImage}
                        type="button"
                        title="Download as Image"
                      >
                        Download as Image
                      </button>
                      {/* Social media icons */}
                      <button
                        className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-full bg-neutral-900 hover:scale-110 transition shadow-lg"
                        onClick={shareToWhatsApp}
                        type="button"
                        title="Share on WhatsApp"
                      >
                        <Image src={SOCIAL_ICONS.whatsapp} alt="WhatsApp" width={40} height={40} className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />
                      </button>
                      <button
                        className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-full bg-neutral-900 hover:scale-110 transition shadow-lg"
                        onClick={shareToX}
                        type="button"
                        title="Share on X"
                      >
                        <Image src={SOCIAL_ICONS.x} alt="X" width={40} height={40} className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />
                      </button>
                      <button
                        className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-full bg-neutral-900 hover:scale-110 transition shadow-lg"
                        onClick={shareToFacebook}
                        type="button"
                        title="Share on Facebook"
                      >
                        <Image src={SOCIAL_ICONS.facebook} alt="Facebook" width={40} height={40} className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />
                      </button>
                      <button
                        className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-full bg-neutral-900 hover:scale-110 transition shadow-lg"
                        onClick={shareToThreads}
                        type="button"
                        title="Share on Threads"
                      >
                        <Image src={SOCIAL_ICONS.threads} alt="Threads" width={40} height={40} className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">Loading meal plan...</div>
            )}
          </div>
        </main>
      </div>
      {/* Options Modal */}
      {optionsModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div ref={modalRef} className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => { setOptionsModal({ open: false, mealType: null, dish: null }); setSearchLocation(null); setNearbyResults([]); }}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-lg font-bold mb-4 text-center">Home Chef or Restaurant?</h3>
            <div className="flex flex-col gap-3 mb-4">
              <a
                href={`https://www.themealdb.com/meal/${optionsModal.dish.idMeal}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-4 py-2 rounded bg-green-100 text-green-800 font-semibold text-center hover:bg-green-200 transition"
              >
                🍳 Made at Home (View Recipe)
              </a>
              <button
                className="block w-full px-4 py-2 rounded bg-blue-100 text-blue-800 font-semibold text-center hover:bg-blue-200 transition"
                onClick={() => {
                  setSearchLocation(null);
                  setNearbyResults([]);
                }}
              >
                🍽️ Find Restaurant
              </button>
            </div>
            {/* Show location search and results if Find Restaurant is clicked */}
            {searchLocation === null ? (
              <div className="mt-2">
                <LocationSearch onLocationSelect={loc => { setSearchLocation(loc); fetchNearby(optionsModal.dish.strMeal, loc); }} />
              </div>
            ) : (
              <div className="mt-4">
                <h4 className="font-semibold mb-2 text-center">Nearby Restaurants for &quot;{optionsModal.dish.strMeal}&quot;</h4>
                {nearbyLoading ? (
                  <p className="text-gray-500 text-center">Searching nearby places...</p>
                ) : nearbyError ? (
                  <p className="text-red-500 text-center">{nearbyError}</p>
                ) : nearbyResults.length > 0 ? (
                  <ul className="space-y-3 max-h-60 overflow-auto">
                    {nearbyResults.map((place, idx) => (
                      <li key={idx} className="p-3 border rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition-all duration-200">
                        <div className="flex flex-col gap-1">
                          <div className="flex-1">
                            <span className="font-bold text-gray-800">{place.name}</span>
                            <span className="block text-xs text-gray-600">{place.address}</span>
                          </div>
                          <button
                            onClick={() => window.open(`https://www.google.com/maps/place/?q=place_id:${place.place_id}`, '_blank')}
                            className="mt-1 px-2 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 text-xs font-medium"
                          >
                            View Map
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-center">No nearby places found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Hidden export card for image generation */}
      <div style={{ position: 'absolute', left: -9999, top: 0 }}>
        <div
          ref={exportCardRef}
          style={{
            width: 420,
            padding: 32,
            background: '#fff',
            color: '#3B3B3B',
            fontFamily: 'Helvetica Neue, Arial, sans-serif',
            borderRadius: 18,
            boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
            textAlign: 'center',
            position: 'relative',
            border: '1.5px solid #EECFD4',
          }}
        >
          {/* Big Logo on Top */}
          <Image
            src="/images/logo.png"
            alt="NUTI Logo"
            width={110}
            height={40}
            style={{ width: 110, height: 'auto', margin: '0 auto 0.5px auto', display: 'block' }}
          />
          {/* Title */}
          <div style={{ fontWeight: 'bold', fontSize: 22, marginBottom: 16, letterSpacing: 0.5, color: '#3B3B3B' }}>
            {cuisine} Selected Meal Plan
          </div>
          {/* Divider */}
          <div style={{ height: 1, background: '#EECFD4', margin: '0 0 18px 0', borderRadius: 1 }} />
          {/* Meals */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 24 }}>
            {MEAL_TYPES.map((mealType) => {
              const dish = selectedDishes[mealType];
              return (
                <div key={mealType} style={{ marginBottom: 0 }}>
                  <div style={{ fontWeight: 800, color: '#DDB7AB', fontSize: 20, marginBottom: 8, textTransform: 'capitalize', letterSpacing: 0.2 }}>{mealType}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18, minHeight: 64 }}>
                    {dish && (
                      <Image
                        src={dish.strMealThumb}
                        alt={dish.strMeal}
                        width={64}
                        height={64}
                        style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #eee', background: '#faf7f6' }}
                      />
                    )}
                    <span style={{ color: '#3B3B3B', fontWeight: 400, fontSize: 15 }}>{dish ? dish.strMeal : '-'}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Footer */}
          <div style={{
            marginTop: 6,
            padding: '10px 0 0 0',
            fontSize: 15,
            color: '#fff',
            background: '#EECFD4',
            borderRadius: '0 0 12px 12px',
            fontWeight: 600,
            letterSpacing: 0.5,
          }}>
            Generated with NUTI!
          </div>
        </div>
      </div>
      {/* Download instructions modal */}
      {showDownloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl"
              onClick={() => setShowDownloadModal(false)}
              aria-label="Close"
            >
              ×
            </button>
            <h3 className="text-lg font-bold mb-4 text-center">How to Share</h3>
            <p className="mb-2 text-gray-700 text-center">
              To share on KakaoTalk, WeChat, or Instagram:&quot;<br />
              1. Download the image.<br />
              2. Open the app and upload the image from your gallery.&quot;
            </p>
            <button
              className="block w-full mt-4 px-4 py-2 rounded bg-green-600 text-white font-semibold text-center hover:bg-green-700 transition"
              onClick={() => setShowDownloadModal(false)}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PageWrapper(props) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MealPlannerPage {...props} />
    </Suspense>
  );
} 