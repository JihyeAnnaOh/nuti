export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const input = searchParams.get('input');

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
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${apiKey}`
    );
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200
    });
  } catch (error) {
    console.error('Places API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch place predictions' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
} 