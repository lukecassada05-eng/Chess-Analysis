// Cloudflare Worker — chess analysis API proxy
// Deploy at: https://dash.cloudflare.com → Workers & Pages → Create Worker
// Add secret: wrangler secret put ANTHROPIC_API_KEY
// (or set it in the dashboard under Settings → Variables → Secret Variables)

export default {
  async fetch(request, env) {
    // Allow your GitHub Pages origin (and localhost for testing)
    const allowedOrigins = [
      'https://lukecassada05-eng.github.io',
      'http://localhost',
      'http://127.0.0.1',
    ];

    const origin = request.headers.get('Origin') || '';
    const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];

    const corsHeaders = {
      'Access-Control-Allow-Origin': corsOrigin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    try {
      const body = await request.json();

      const apiResp = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify(body),
      });

      const data = await apiResp.json();

      return new Response(JSON.stringify(data), {
        status: apiResp.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: { message: err.message } }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  },
};
