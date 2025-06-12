'use client';

import { useState, useEffect, useRef } from 'react';

export default function LocationSearch({ onLocationSelect }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [error, setError] = useState(null);
  const searchBoxRef = useRef(null);

  useEffect(() => {
    // Close predictions when clicking outside
    const handleClickOutside = (event) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setShowPredictions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setError(null);
    
    if (!query.trim()) {
      setPredictions([]);
      return;
    }

    try {
      const response = await fetch(`/api/places/autocomplete?input=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
        setPredictions([]);
      } else if (data.predictions) {
        setPredictions(data.predictions);
        setShowPredictions(true);
      }
    } catch (error) {
      console.error('Error fetching predictions:', error);
      setError('Failed to fetch location suggestions');
      setPredictions([]);
    }
  };

  const handleSelectPlace = async (placeId) => {
    try {
      const response = await fetch(`/api/places/details?placeId=${placeId}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (data.result?.geometry?.location) {
        const { lat, lng } = data.result.geometry.location;
        onLocationSelect({ lat, lng });
        setSearchQuery('');
        setPredictions([]);
        setShowPredictions(false);
      }
    } catch (error) {
      console.error('Error fetching place details:', error);
      setError('Failed to fetch place details');
    }
  };

  return (
    <div className="relative" ref={searchBoxRef}>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for a location..."
          className="flex-1 p-2 border rounded shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={() => {
            if ("geolocation" in navigator) {
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  onLocationSelect({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                  });
                },
                (error) => {
                  console.error("Error getting location:", error);
                  setError('Failed to get current location');
                }
              );
            } else {
              setError('Geolocation is not supported by your browser');
            }
          }}
          className="p-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          title="Use current location"
        >
          📍
        </button>
      </div>

      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}

      {showPredictions && predictions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {predictions.map((prediction) => (
            <div
              key={prediction.place_id}
              onClick={() => handleSelectPlace(prediction.place_id)}
              className="p-2 hover:bg-gray-100 cursor-pointer"
            >
              {prediction.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 