export default async function handler(req, res) {
  const { code, error } = req.query;

  if (error || !code) {
    return res.redirect('/admin/?error=' + encodeURIComponent(error || 'no_code'));
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const data = await tokenRes.json();

    if (data.error || !data.access_token) {
      return res.redirect('/admin/?error=' + encodeURIComponent(data.error || 'token_failed'));
    }

    const safeToken = JSON.stringify(data.access_token);

    res.setHeader('Content-Type', 'text/html');
    res.send(`<!DOCTYPE html>
<html><head><title>Autenticando...</title></head>
<body>
<script>
  localStorage.setItem('gh_admin_token', ${safeToken});
  window.location.href = '/admin/';
</script>
</body></html>`);

  } catch (err) {
    res.redirect('/admin/?error=server_error');
  }
}
