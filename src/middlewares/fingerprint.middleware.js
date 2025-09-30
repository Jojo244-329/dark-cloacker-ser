// src/middlewares/fingerprint.middleware.js
const crypto = require("crypto");
const redis = require("redis");
const client = redis.createClient();

client.connect().catch(err => {
  console.error("❌ Erro ao conectar no Redis:", err.message);
});

function getFingerprint(req) {
  const { "user-agent": ua } = req.headers;
  const lang = req.headers["accept-language"] || "";
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const tz = req.headers["timezone"] || "";
  const hash = crypto.createHash("sha256").update(ua + lang + ip + tz).digest("hex");
  return hash;
}

async function fingerprintMiddleware(req, res, next) {
  try {
    const fp = getFingerprint(req);
    const key = `fp:${fp}`;

    const exists = await client.get(key);
    if (exists) {
      return next(); // já validado antes
    }

    // primeira vez → salva no Redis com 15min TTL
    await client.set(key, "valid", { EX: 900 });
    return next();
  } catch (err) {
    console.error("⚠️ Erro no middleware de fingerprint:", err.message);
    // Continua mesmo sem Redis, pra não travar lead humano
    return next();
  }
}

module.exports = fingerprintMiddleware;
