// POST /api/upload
// Expects multipart/form-data with fields: file, key
// Requires an R2 bucket binding named R2_BUCKET (Pages Settings → Functions → R2 bucket bindings)
// Requires an environment variable R2_PUBLIC_URL (Pages Settings → Environment variables)
//   e.g. https://pub-xxxxxxxx.r2.dev   (no trailing slash)

export async function onRequestPost({ request, env }) {
  try {
    if (!env.R2_BUCKET) {
      return json({ error: 'R2_BUCKET binding is not configured on this Pages project.' }, 500);
    }
    if (!env.R2_PUBLIC_URL) {
      return json({ error: 'R2_PUBLIC_URL environment variable is not configured.' }, 500);
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const key  = formData.get('key');

    if (!file || typeof file === 'string') {
      return json({ error: 'Missing file' }, 400);
    }
    if (!key || typeof key !== 'string') {
      return json({ error: 'Missing key' }, 400);
    }

    await env.R2_BUCKET.put(key, file.stream(), {
      httpMetadata: { contentType: file.type || 'application/octet-stream' },
    });

    const publicBase = env.R2_PUBLIC_URL.replace(/\/+$/, '');
    const url = `${publicBase}/${key}`;

    return json({ url, key });
  } catch (err) {
    return json({ error: err.message || 'Upload failed' }, 500);
  }
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
