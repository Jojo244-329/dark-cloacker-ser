// 📁 /src/routes/script.routes.js
const express = require('express');
const router = express.Router();
const Domain = require('../models/Domain');

router.get('/cloak/script/:slug.js', async (req, res) => {
  try{

  
  const { slug } = req.params;
  const domain = await Domain.findOne({ slug });
  if (!domain) return res.status(404).send('// domínio não registrado');

  res.setHeader('Content-Type', 'application/javascript');

  res.send(`
(function () {
  const fp = btoa(navigator.userAgent + navigator.language + Intl.DateTimeFormat().resolvedOptions().timeZone);
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token') || '';
  const origin = window.location.hostname;

  // 🧿 Verificação de domínio original
  if (origin !== '${domain.baseUrl.replace('https://', '').replace('http://', '')}') {
    console.warn('Domínio inválido para uso do script');
    window.location.href = '${domain.fallbackUrl}';
    return;
  }

  // 🔐 Proteção DevTools - F12, Ctrl+Shift+I
  document.onkeydown = function (e) {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      e.preventDefault();
      window.location.href = '${domain.fallbackUrl}';
    }
  };

  const devtoolsCheck = setInterval(() => {
    const widthThreshold = window.outerWidth - window.innerWidth > 160;
    const heightThreshold = window.outerHeight - window.innerHeight > 160;
    if (widthThreshold || heightThreshold) {
      clearInterval(devtoolsCheck);
      window.location.href = '${domain.fallbackUrl}';
    }
  }, 500);

  // 🎯 Request dinâmico de payload com FP + Token
  fetch("${domain.baseUrl}/api/cloak/payload/${slug}?fp=" + fp + "&token=" + token)
    .then(r => r.text())
    .then(html => {
      document.open();
      document.write(html);
      document.close();
    })
    .catch(() => {
      window.location.href = "${domain.fallbackUrl}";
    });
})();
  `);
  } catch (err) {
    res.setHeader("Content-Type", "application/javascript");
    res.send(`console.error("❌ Erro interno no cloaker: ${err.message}");`);
  }
});



module.exports = router;
