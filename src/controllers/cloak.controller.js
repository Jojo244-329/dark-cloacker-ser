// 🔥 CONTROLLER: /api/cloak/ping
const Whitelist = require('../models/Whitelist');
const AccessLog = require('../models/AccessLog');
const Domain = require('../models/Domain');
const Token = require('../models/Token');

// Util
function getIP(req) {
  return req.headers['x-forwarded-for'] || req.connection.remoteAddress || '';
}

async function pingCloak(req, res) {
  try {
    const { fp, token } = req.body;
    const origin = req.headers.origin || req.headers.referer || '';
    const ip = getIP(req);
    const ua = req.headers['user-agent'] || '';

    // 🔍 Buscar domínio via slug
    const slugMatch = origin.match(/\/([^\.\/]+)(?=\.|\/$)/);
    const slug = slugMatch ? slugMatch[1] : null;
    const domain = await Domain.findOne({ slug });

    // ❌ Domínio não encontrado → fallback
    if (!domain) {
      return res.redirect("https://google.com");
    }

    // 🔐 TOKEN COMPARTILHÁVEL
    if (token) {
      const validToken = await Token.findOne({ token, slug });
      if (validToken) {
        await AccessLog.create({ fp, ip, ua, slug, viaToken: true, result: 'real' });
        return res.redirect(domain.realUrl);
      }
    }

    // ✅ WHITELIST DE FP
    const fpValid = await Whitelist.findOne({ fp, slug });
    if (fpValid) {
      await AccessLog.create({ fp, ip, ua, slug, viaToken: false, result: 'real' });
      return res.redirect(domain.realUrl);
    }

    // ❌ BOT DETECTADO OU HEADLESS
    const isBot =
      ua.includes('bot') || ua.includes('crawler') || ua.includes('spider') || req.headers['sec-ch-ua']?.includes('Google');
    const isHeadless = ua.includes('Headless') || req.headers['x-headless'];

    if (isBot || isHeadless) {
      await AccessLog.create({ fp, ip, ua, slug, viaToken: false, result: 'cloaked-bot' });
      return res.redirect(domain.baseUrl || domain.fallbackUrl || "https://google.com");
    }

    // 🚫 HUMANO SEM TOKEN/FP → manda pra whitepage (baseUrl)
    await AccessLog.create({ fp, ip, ua, slug, viaToken: false, result: 'white' });
    return res.redirect(domain.baseUrl || domain.fallbackUrl || "https://google.com");

  } catch (err) {
    console.error("❌ Erro em pingCloak:", err.message);
    // Erro interno → fallback
    return res.redirect("https://google.com");
  }
}

module.exports = { pingCloak };
