'use client';

import { useEffect, useState } from 'react';
import LocationSearch from './LocationSearch';

export default function NearbyResults({ keyword }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // Get user's location when component mounts
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setError("Location access denied. Showing results for Sydney.");
          // Fallback to Sydney if user denies location access
          setUserLocation({ lat: -33.8688, lng: 151.2093 });
        }
      );
    } else {
      setError("Geolocation not supported. Showing results for Sydney.");
      // Fallback to Sydney if geolocation is not supported
      setUserLocation({ lat: -33.8688, lng: 151.2093 });
    }
  }, []);

  useEffect(() => {
    if (!keyword || !userLocation) return;

    const fetchNearby = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `/api/nearby?query=${encodeURIComponent(keyword)}&lat=${userLocation.lat}&lng=${userLocation.lng}`
        );
        const data = await response.json();
        if (data.error) {
          setError(data.error);
          setResults([]);
        } else {
        setResults(data.results || []);
        }
      } catch (err) {
        console.error('Failed to fetch nearby results:', err);
        setError('Failed to fetch nearby places');
        setResults([]);
      }
      setLoading(false);
    };

    fetchNearby();
  }, [keyword, userLocation]);

  const getGoogleMapsUrl = (place) => {
    if (place.place_id) {
      return `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
    }
    // Fallback to search query if place_id is not available
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}`;
  };

  const handleLocationSelect = (location) => {
    setUserLocation(location);
  };

  return (
    <div className="mt-8">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">📍 Search Location</h3>
        <LocationSearch onLocationSelect={handleLocationSelect} />
      </div>

      <h3 className="text-xl font-semibold mb-3">Nearby Places for &quot;{keyword}&quot;</h3>
      {loading ? (
        <p className="text-gray-500">Searching nearby places...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : results.length > 0 ? (
        <ul className="space-y-3">
          {results.map((place, idx) => (
            <li 
              key={idx} 
              className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-800">{place.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{place.address}</p>
                  </div>
                  <button
                    onClick={() => window.open(getGoogleMapsUrl(place), '_blank')}
                    className="ml-4 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293a1 1 0 00-1.414 0l-1 1A1 1 0 002 5v10a1 1 0 00.293.707l1 1a1 1 0 001.414 0l10-10a1 1 0 000-1.414l-1-1a1 1 0 00-.707-.293H3.707z" clipRule="evenodd" />
                    </svg>
                    View Map
                  </button>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
              {place.open_now !== undefined && (
                    <span className={`inline-flex items-center ${place.open_now ? 'text-green-600' : 'text-red-600'}`}>
                      <span className={`w-2 h-2 rounded-full mr-1.5 ${place.open_now ? 'bg-green-500' : 'bg-red-500'}`}></span>
                  {place.open_now ? 'Open Now' : 'Closed'}
                    </span>
                  )}
                  {place.distance && (
                    <span className="inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      {place.distance.toFixed(1)} km away
                    </span>
              )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No nearby places found.</p>
      )}
    </div>
  );
}

// pages/api/nearby.js (or app/api/nearby/route.js for App Router)

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const location = searchParams.get('location') || 'Sydney';

  const apiUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    query + ' in ' + location
  )}&key=${process.env.NEXT_PUBLIC_GCP_VISION_API_KEY}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();
    const results = data.results.map((place) => ({
      name: place.name,
      address: place.formatted_address,
      open_now: place.opening_hours?.open_now ?? undefined
    }));

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    console.error('Google Maps API error:', err);
    return new Response(JSON.stringify({ error: 'Failed to fetch nearby places' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500
    });
  }
}
