export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return new Response(
      JSON.stringify({ error: 'Google Maps API key is not configured' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }

  // Use location-based search if coordinates are provided
  const apiUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=5000&keyword=${encodeURIComponent(query)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;

  try {
    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
      return new Response(
        JSON.stringify({ error: `Google Places API error: ${data.status}` }),
        {
          headers: { 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    const results = data.results.map((place) => {
      // Calculate distance in kilometers
      const distance = calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        place.geometry.location.lat,
        place.geometry.location.lng
      );

      return {
        name: place.name,
        address: place.vicinity || place.formatted_address,
        open_now: place.opening_hours?.open_now ?? undefined,
        place_id: place.place_id,
        location: place.geometry?.location,
        distance: distance
      };
    });

    // Sort results by distance
    results.sort((a, b) => a.distance - b.distance);

    return new Response(JSON.stringify({ results }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (err) {
    console.error('Google Maps API error:', err);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch nearby places' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
}

// Calculate distance between two points using the Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
} 