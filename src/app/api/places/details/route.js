export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get('placeId');

  const apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Google Maps API key is not configured' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=geometry&key=${apiKey}`
    );
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Places API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch place details' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
} 