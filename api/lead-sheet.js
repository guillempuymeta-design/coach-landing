export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const url = process.env.SHEET_WEBHOOK_URL;
  const secret = process.env.SHEET_WEBHOOK_SECRET;
  if (!url || !secret) {
    res.status(500).json({ error: 'Missing SHEET_WEBHOOK_URL or SHEET_WEBHOOK_SECRET' });
    return;
  }

  const body = req.body || {};
  const payload = {
    secret,
    nombre: body.nombre || '',
    email: body.email || '',
    tel: body.tel || '',
    motivations: body.motivations || [],
    otro_motivo: body.otro_motivo || '',
    punto: body.punto || '',
    necesidades: body.necesidades || [],
    source_url: body.source_url || ''
  };

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      redirect: 'follow'
    });
    const text = await r.text();
    let parsed; try { parsed = JSON.parse(text); } catch { parsed = { raw: text }; }
    if (!r.ok || parsed.ok === false) {
      res.status(502).json({ error: 'Sheet webhook error', details: parsed });
      return;
    }
    res.status(200).json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Sheet webhook request failed', message: err.message });
  }
}
