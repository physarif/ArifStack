// POST /api/delete
// Expects JSON body: { "key": "..." }
// Requires an R2 bucket binding named R2_BUCKET (Pages Settings → Functions → R2 bucket bindings)

export async function onRequestPost({ request, env }) {
  try {
    if (!env.R2_BUCKET) {
      return json({ error: 'R2_BUCKET binding is not configured on this Pages project.' }, 500);
    }

    const body = await request.json().catch(() => null);
    const key = body?.key;

    if (!key || typeof key !== 'string') {
      return json({ error: 'Missing key' }, 400);
    }

    await env.R2_BUCKET.delete(key);

    return json({ success: true });
  } catch (err) {
    return json({ error: err.message || 'Delete failed' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
