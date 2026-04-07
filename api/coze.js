// Vercel Edge Function — Coze API proxy with SSE streaming support
export const config = { runtime: 'edge' };

const COZE_API = 'https://api.coze.cn/open_api/v2/chat';
const COZE_PAT = 'pat_PfD2wtUlUTG2cq5wXtC5RgyiOSraRZARKEQYRoJ5MoMO8AyosbLlFi2ZdpMHHWTb';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default async function handler(req) {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.text();
    const payload = JSON.parse(body);
    const isStream = payload.stream === true;

    const cozeRes = await fetch(COZE_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${COZE_PAT}`,
      },
      body,
    });

    if (!cozeRes.ok) {
      const errText = await cozeRes.text();
      return new Response(errText, {
        status: cozeRes.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (isStream) {
      // Pipe SSE stream through
      return new Response(cozeRes.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    } else {
      const data = await cozeRes.text();
      return new Response(data, {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
