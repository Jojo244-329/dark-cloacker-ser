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

    // 🔍 Buscar domínio via referer
    const slugMatch = origin.match(/\/([^\.\/]+)(?=\.|\/$)/);
    const slug = slugMatch ? slugMatch[1] : null;
    const domain = await Domain.findOne({ slug });

    if (!domain) return res.status(400).json({ cloaked: true });

    // 🔐 TOKEN COMPARTILHÁVEL
    if (token) {
      const validToken = await Token.findOne({ token, slug });
      if (validToken) {
        await AccessLog.create({ fp, ip, ua, slug, viaToken: true, result: 'real' });
        return res.json({ cloaked: false });
      }
    }

    // ✅ WHITELIST DE FP
    const fpValid = await Whitelist.findOne({ fp, slug });
    if (fpValid) {
      await AccessLog.create({ fp, ip, ua, slug, viaToken: false, result: 'real' });
      return res.json({ cloaked: false });
    }

    // ❌ BOT DETECTADO OU SEM VALIDAÇÃO
    const isBot =
      ua.includes('bot') || ua.includes('crawler') || ua.includes('spider') || req.headers['sec-ch-ua']?.includes('Google');
    const isHeadless = ua.includes('Headless') || req.headers['x-headless'];

    if (isBot || isHeadless) {
      await AccessLog.create({ fp, ip, ua, slug, viaToken: false, result: 'cloaked' });
      return res.json({ cloaked: true });
    }

    // ✅ PRIMEIRO ACESSO HUMANO → salvar FP
    await Whitelist.create({ fp, slug });
    await AccessLog.create({ fp, ip, ua, slug, viaToken: false, result: 'real' });
    return res.json({ cloaked: false });

  } catch (err) {
    console.error("❌ Erro em pingCloak:", err.message);
    return res.status(500).json({ cloaked: true, erro: "Falha interna no cloaker" });
  }
}

module.exports = { pingCloak };
