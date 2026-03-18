export default function handler(req, res) {
  const redirectUri = 'https://coach-landing-delta.vercel.app/api/callback';

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'repo,user',
    state: req.query.state || '',
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
