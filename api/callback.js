const CMS_ORIGIN = "https://index-kg.c6t.ru";
const RELAY_PATH = "/admin/oauth-relay.html";

function baseUrl(req) {
  if (process.env.OAUTH_URL) return process.env.OAUTH_URL.replace(/\/$/, "");
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return `${proto}://${host}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function relayUrl(provider, type, payload) {
  const message =
    type === "success"
      ? `authorization:${provider}:success:${JSON.stringify(payload)}`
      : `authorization:${provider}:error:${payload}`;
  return `${CMS_ORIGIN}${RELAY_PATH}#${encodeURIComponent(message)}`;
}

function resultPage(title, bodyHtml) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 30rem; margin: 3rem auto; padding: 0 1rem; color: #1a1a1a; background: #f7f7f7; }
    .card { background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 1.25rem; }
    h1 { font-size: 1.15rem; margin: 0 0 0.75rem; }
    p { line-height: 1.5; color: #444; word-break: break-word; }
    .err { color: #b00020; font-weight: 600; }
    a { color: #0969da; }
    code { background: #f0f0f0; padding: 0.1em 0.35em; border-radius: 4px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>${escapeHtml(title)}</h1>
    ${bodyHtml}
  </div>
</body>
</html>`;
}

async function exchangeCode(code, redirectUri) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("На Vercel не заданы GITHUB_CLIENT_ID или GITHUB_CLIENT_SECRET");
  }

  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    }),
  });

  const data = await tokenRes.json();

  if (!tokenRes.ok || data.error) {
    throw new Error(data.error_description || data.error || "HTTP " + tokenRes.status);
  }

  return data;
}

module.exports = async (req, res) => {
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  const provider = "github";
  const code = req.query.code;
  const redirectUri = `${baseUrl(req)}/api/callback`;

  if (!code) {
    const err = req.query.error_description || req.query.error || "GitHub не вернул код авторизации";
    res.writeHead(302, { Location: relayUrl(provider, "error", err) });
    res.end();
    return;
  }

  try {
    const token = await exchangeCode(code, redirectUri);
    res.writeHead(302, {
      Location: relayUrl(provider, "success", {
        token: token.access_token,
        provider,
      }),
    });
    res.end();
  } catch (err) {
    const msg = String(err.message || err);
    res.status(500).send(
      resultPage(
        "Ошибка авторизации",
        `<p class="err">${escapeHtml(msg)}</p>
         <p>Callback URL в GitHub OAuth App:</p>
         <p><code>${escapeHtml(redirectUri)}</code></p>
         <p><a href="${CMS_ORIGIN}/admin/">Вернуться в админку</a></p>`
      )
    );
  }
};
