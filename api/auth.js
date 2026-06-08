const SCOPES = ["repo", "user"];

function baseUrl(req) {
  if (process.env.OAUTH_URL) return process.env.OAUTH_URL.replace(/\/$/, "");
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

module.exports = (req, res) => {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    res.status(500).json({ error: "GITHUB_CLIENT_ID is not configured on Vercel" });
    return;
  }

  const redirectUri = `${baseUrl(req)}/api/callback`;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPES.join(" "),
    state: req.query.provider || "github",
  });

  res.writeHead(302, { Location: `https://github.com/login/oauth/authorize?${params}` });
  res.end();
};
