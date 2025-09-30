// 🔥 ROTA DE PAYLOAD DINÂMICO COM PROTEÇÃO TOTAL
const express = require('express');
const router = express.Router();
const Whitelist = require('../models/Whitelist');
const Token = require('../models/Token');
const Domain = require('../models/Domain');
const fetch = require('node-fetch');
const fingerprint = require("../middlewares/fingerprint.middleware");

// 🔧 Corrigido aqui: serveRealPayload diretamente inline
router.get("/real/:slug", fingerprint, async (req, res) => {
  try {
    const { slug } = req.params;
    const domain = await Domain.findOne({ slug });
    if (!domain || !domain.baseUrl) {
      return res.status(404).send('Domínio inválido');
    }

    await renderPayload(domain.baseUrl, res);
  } catch (err) {
    console.error("❌ Erro em /real/:slug:", err);
    res.status(500).send("Falha ao redirecionar para o payload real");
  }
});

// 🧠 GET /api/cloak/payload/:slug
router.get('/api/cloak/payload/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { fp, token } = req.query;

    const domain = await Domain.findOne({ slug });
    if (!domain) return res.status(404).send('Not Found');

    // 🛡️ Headers anti-clonagem
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Content-Security-Policy', "frame-ancestors 'none'");
    res.setHeader('Permissions-Policy', 'fullscreen=(), geolocation=()');

    // 🔐 Token compartilhável
    if (token) {
      const validToken = await Token.findOne({ token, slug });
      if (validToken) {
        return renderPayload(domain.baseUrl, res);
      }
    }

    // 🔐 Verifica FP whitelist
    const validFP = await Whitelist.findOne({ fp, slug });
    if (validFP) {
      return renderPayload(domain.baseUrl, res);
    }

    return res.status(403).send('Cloaked');
  } catch (err) {
    console.error("❌ Erro em /api/cloak/payload/:slug:", err);
    return res.status(500).send("Erro interno no payload");
  }
});

// 💉 Render HTML externo do site do cliente
async function renderPayload(url, res) {
  try {
    const response = await fetch(url);
    let html = await response.text();

    // 💉 Ofuscar opcionalmente
    const encoded = Buffer.from(html).toString('base64');
    res.send(`<!DOCTYPE html><html><body><script>
      document.write(atob('${encoded}'))
    </script></body></html>`);
  } catch (err) {
    console.error('Erro ao buscar payload:', err);
    res.status(500).send('Erro ao carregar conteúdo');
  }
}

module.exports = router;
