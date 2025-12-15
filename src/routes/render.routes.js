const express = require('express');
const router = express.Router();
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
    if (!domain) return res.redirect('https://google.com'); // fallback se slug inválido

    const userAgent = req.headers['user-agent'] || '';
    const ref = req.get('referer') || '';
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const { fp, token } = req.query;

    // 🔍 Checagens básicas
    const isBot = /(bot|crawl|spider|facebookexternalhit|facebot|googlebot|bingbot)/i.test(userAgent);
    const fromAd = /(google|facebook|tiktok|kwai|bing|ads|utm)/i.test(ref);
    const headless = isHeadless(userAgent);
    const proxy = isProxyDetected(userAgent, ip);
    const geoOk = await isGeoAllowed(ip);
    const timeOk = isAccessTimeValid();

    // 🔐 Busca FP no Mongo
    const exists = await Fingerprint.findOne({ fp, ip, userAgent });
    const trusted = exists || (token === 'chave-compartilhamento-segura');

    // 🚫 Bloqueio
    const blocked = isBot || !fromAd || headless || proxy || !geoOk || !timeOk;
    
    if (blocked && !trusted) {
      console.warn("🚫 Visitante bloqueado:", { ip, ua: userAgent, ref });
       return res.redirect(domain.baseUrl);
    }

    // ✅ Se for humano válido → salvar/atualizar FP
    if (!exists && fp) {
      await Fingerprint.create({ fp, ip, userAgent, validado: true, dataValidado: new Date() });
    } else if (exists && !exists.validado) {
      exists.validado = true;
      exists.dataValidado = new Date();
      await exists.save();
    }

   return res.redirect(domain.realUrl); // Página real liberada
  } catch (err) {
    console.error("❌ Erro em render.routes:", err.message);
    return res.redirect(domain?.baseUrl);
  }
});

module.exports = router;
