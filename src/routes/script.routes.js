// 📁 /src/routes/script.routes.js
const express = require('express');
const router = express.Router();
const Domain = require('../models/Domain');

router.get('/cloak/script/:slug.js', async (req, res) => {
  try {
    const { slug } = req.params;
    const domain = await Domain.findOne({ slug });
    if (!domain) return res.status(404).send('// domínio não registrado');

    res.setHeader('Content-Type', 'application/javascript');

    res.send(`(function () {
      const fp = btoa(
        navigator.userAgent +
        navigator.language +
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );
      const params = new URLSearchParams(window.location.search);
      const token = params.get('token') || '';
      const origin = window.location.hostname;

      // 🧿 BOT DETECTION
      const botRegex = /(bot|crawl|spider|facebookexternalhit|facebot|googlebot|bingbot|yahoo! slurp)/i;
      const isBot = botRegex.test(navigator.userAgent.toLowerCase());
      const webdriver = navigator.webdriver;

      // 🔐 Proteção DevTools - teclas
      document.onkeydown = function (e) {
  if (
    e.key === 'F12' || 
    (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) || 
    (e.ctrlKey && e.key === 'U')
  ) {
    e.preventDefault();
    window.location.href = '${domain.fallbackUrl}';
  }
};

        document.addEventListener('contextmenu', e => { e.preventDefault(); });
        document.addEventListener('selectstart', e => { e.preventDefault(); });
        document.addEventListener('copy', e => {
        e.preventDefault();
        window.location.href = '${domain.fallbackUrl}';
      });

     

      // 🔐 Proteção DevTools - tamanho da janela
      const devtoolsCheck = setInterval(() => {
        const widthThreshold = window.outerWidth - window.innerWidth > 160;
        const heightThreshold = window.outerHeight - window.innerHeight > 160;
        if (widthThreshold || heightThreshold) {
          clearInterval(devtoolsCheck);
          window.location.href = '${domain.fallbackUrl}';
        }
      }, 500);

      // 🚨 BOT = manda pro baseUrl
      if (isBot || webdriver) {
        window.location.href = '${domain.baseUrl}';
        return;
      }

      // ✅ Validação: aceita rodar tanto no url quanto no baseUrl
      const allowedHosts = [
        '${domain.baseUrl.replace('https://', '').replace('http://', '')}',
        '${domain.url.replace('https://', '').replace('http://', '')}'
      ];

      if (!allowedHosts.includes(origin)) {
        console.warn('Domínio inválido para uso do script');
        window.location.href = '${domain.fallbackUrl}';
        return;
      }

      // 🎯 Fetch do payload
      fetch("${domain.url}/api/cloak/payload/${slug}?fp=" + fp + "&token=" + token)
        .then(r => r.text())
        .then(html => {
          document.open();
          document.write(html);
          document.close();
        })
        .catch(() => {
          window.location.href = "${domain.fallbackUrl}";
        });
    })();`);
  } catch (err) {
    res.setHeader("Content-Type", "application/javascript");
    res.send(`console.error("❌ Erro interno no cloaker: ${err.message}");`);
  }
});

module.exports = router;
