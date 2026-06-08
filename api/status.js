function baseUrl(req) {
  if (process.env.OAUTH_URL) return process.env.OAUTH_URL.replace(/\/$/, "");
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

module.exports = (req, res) => {
  const redirectUri = `${baseUrl(req)}/api/callback`;

  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.status(200).send(
    JSON.stringify(
      {
        ok: true,
        github_client_id: Boolean(process.env.GITHUB_CLIENT_ID),
        github_client_secret: Boolean(process.env.GITHUB_CLIENT_SECRET),
        oauth_url: process.env.OAUTH_URL || null,
        callback_url: redirectUri,
      },
      null,
      2
    )
  );
};
