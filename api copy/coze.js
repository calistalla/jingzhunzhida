// Cloudflare Pages Function — Coze API proxy with SSE streaming
const COZE_API = 'https://api.coze.cn/open_api/v2/chat';
const COZE_PAT = 'pat_PfD2wtUlUTG2cq5wXtC5RgyiOSraRZARKEQYRoJ5MoMO8AyosbLlFi2ZdpMHHWTb';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Handle OPTIONS preflight
export async function onRequestOptions() {
  return new Response(null, { status: 200, headers: corsHeaders });
}

// Handle POST
export async function onRequestPost({ request }) {
  try {
    const body = await request.text();
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
      return new Response(cozeRes.body, {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
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
