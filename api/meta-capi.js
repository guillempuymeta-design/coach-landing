import crypto from 'crypto';

const PIXEL_ID = '1000558072424026';
const API_VERSION = 'v18.0';

const sha256 = (v) => crypto.createHash('sha256').update(String(v).trim().toLowerCase()).digest('hex');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const token = process.env.META_CAPI_TOKEN;
  if (!token) {
    res.status(500).json({ error: 'Missing META_CAPI_TOKEN' });
    return;
  }

  const body = req.body || {};
  const { event_name, event_id, event_source_url, custom_data = {}, user_data = {} } = body;
  if (!event_name) {
    res.status(400).json({ error: 'event_name required' });
    return;
  }

  const ip = (req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket?.remoteAddress;
  const ua = req.headers['user-agent'];

  const hashedUser = { client_ip_address: ip, client_user_agent: ua };
  if (user_data.fbp) hashedUser.fbp = user_data.fbp;
  if (user_data.fbc) hashedUser.fbc = user_data.fbc;
  if (user_data.em) hashedUser.em = sha256(user_data.em);
  if (user_data.ph) hashedUser.ph = sha256(user_data.ph);
  if (user_data.fn) hashedUser.fn = sha256(user_data.fn);
  if (user_data.ln) hashedUser.ln = sha256(user_data.ln);

  const payload = {
    data: [{
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      event_id,
      event_source_url,
      action_source: 'website',
      user_data: hashedUser,
      custom_data
    }]
  };

  try {
    const r = await fetch(`https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${token}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const json = await r.json();
    if (!r.ok) {
      res.status(502).json({ error: 'Meta CAPI error', details: json });
      return;
    }
    res.status(200).json({ ok: true, meta: json });
  } catch (err) {
    res.status(500).json({ error: 'CAPI request failed', message: err.message });
  }
}
