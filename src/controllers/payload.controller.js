const express = require("express");
const router = express.Router();

const fingerprint = require("../middlewares/fingerprint.middleware");
const botDetection = require("../utils/botDetection");
const Domain = require("../models/Domain");

// Função auxiliar → página em branco default
const blankPage = `
<!DOCTYPE html>
<html>
  <head>
    <title>Bem-vindo</title>
    <meta charset="utf-8">
  </head>
  <body>
    <h1>Site em manutenção</h1>
    <p>Volte mais tarde.</p>
  </body>
</html>
`;

// 🎯 Função controller - serve payload real
const serveRealPayload = async (req, res) => {
  const { slug } = req.params;
  const domain = await Domain.findOne({ slug });
  if (!domain || !domain.baseUrl) return res.send(blankPage);
  return res.redirect(domain.baseUrl); // página oficial do cliente
};

// 🧪 Função controller - serve payload fake
const serveFakePayload = async (req, res) => {
  const { slug } = req.params;
  const domain = await Domain.findOne({ slug });
  if (!domain || !domain.fallbackUrl) return res.send(blankPage);
  return res.redirect(domain.fallbackUrl);
};

// 🚀 Rota principal de payload (cloaking)
router.get("/api/cloak/payload/:slug", fingerprint, async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).send("Slug é obrigatório");

    const domain = await Domain.findOne({ slug });
    if (!domain) return res.status(404).send("Domínio não encontrado");

    const userAgent = req.headers["user-agent"] || "";
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const isBot = botDetection.isBotAdvanced(userAgent, ip);

    if (isBot) {
      return serveFakePayload(req, res);
    }

    return serveRealPayload(req, res);
  } catch (err) {
    console.error("❌ Erro em /api/cloak/payload:", err.message);
    return res.status(500).send("Erro interno ao processar payload");
  }
});

// Opcional: expor handlers para outras rotas
module.exports = {
  router,
  serveFakePayload,
  serveRealPayload,
};
