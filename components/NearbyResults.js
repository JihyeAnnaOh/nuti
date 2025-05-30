'use client';

import { useEffect, useState } from 'react';

export default function NearbyResults({ keyword }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!keyword) return;

    const fetchNearby = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/nearby?query=${encodeURIComponent(keyword)}&location=Sydney`
        );
        const data = await response.json();
        setResults(data.results || []);
      } catch (err) {
        console.error('Failed to fetch nearby results:', err);
        setResults([]);
      }
      setLoading(false);
    };

    fetchNearby();
  }, [keyword]);

  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-3">📍 Nearby Places for "{keyword}"</h3>
      {loading ? (
        <p className="text-gray-500">Searching nearby places...</p>
      ) : results.length > 0 ? (
        <ul className="space-y-3">
          {results.map((place, idx) => (
            <li key={idx} className="p-3 border rounded shadow-sm bg-white">
              <p className="font-bold">{place.name}</p>
              <p className="text-sm text-gray-600">{place.address}</p>
              {place.open_now !== undefined && (
                <p className="text-sm text-gray-500">
                  {place.open_now ? 'Open Now' : 'Closed'}
                </p>
              )}
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
