export default async function handler(req, res) {
  const { code } = req.query;

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    }),
  });

  const { access_token, error } = await tokenRes.json();

  const content = error
    ? `authorization:github:error:${error}`
    : `authorization:github:success:${JSON.stringify({ token: access_token, provider: 'github' })}`;

  res.setHeader('Content-Type', 'text/html');
  res.send(`<!DOCTYPE html>
<html>
<body>
  <p style="font-family:sans-serif;text-align:center;margin-top:40px;color:#888;">Autenticando...</p>
  <script>
    (function() {
      var msg = ${JSON.stringify(content)};
      if (window.opener) {
        window.opener.postMessage(msg, '*');
        setTimeout(function() { window.close(); }, 500);
      } else {
        // Fallback: no popup, redirect to admin
        window.location = '/admin/';
      }
    })();
  </script>
</body>
</html>`);
}
