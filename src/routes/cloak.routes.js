const express = require('express');
const router = express.Router();
const Fingerprint = require('../models/Fingerprint');
const { pingCloak } = require('../controllers/cloak.controller');
const {
  isGeoAllowed,
  isProxyDetected,
  isHeadless,
  isAccessTimeValid
} = require('../utils/securityChecks');

router.post('/ping', async (req, res) => {
  try {
    const userAgent = req.headers['user-agent'] || '';
    const ref = req.get('referer') || '';
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const { fp, token } = req.body;

    const isBot = /bot|crawl|spider|facebook|preview|google/i.test(userAgent);
    const fromAd = /google|facebook|tiktok|kwai|bing|ads|utm/i.test(ref);
    const headless = isHeadless(userAgent);
    const proxy = isProxyDetected(userAgent, ip);
    const geoOk = await isGeoAllowed(ip);
    const timeOk = isAccessTimeValid();

    const exists = await Fingerprint.findOne({ fp, ip, ua: userAgent });
    const trusted = exists || (token === 'chave-compartilhamento-segura');

    if (isBot || !fromAd || headless || proxy || !geoOk || !timeOk) {
      if (!trusted) {
        return res.status(403).json({
          cloaked: true,
          reason: 'bloqueado',
          redirect: 'https://google.com'
        });
      }
    }

    if (!exists && fp) {
      await Fingerprint.create({ fp, ip, ua: userAgent });
    }

    return res.json({ cloaked: false, message: 'liberado geral' });
  } catch (err) {
    console.error("❌ Erro em /ping:", err);
    return res.status(500).json({ cloaked: true, reason: 'erro interno' });
  }
});

// ⚡ Agora com middleware de fingerprint
router.post('/api/cloak/ping', require('../middlewares/fingerprint.middleware'), pingCloak);

module.exports = router;
