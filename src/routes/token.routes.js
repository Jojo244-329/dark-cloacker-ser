// 📁 /src/routes/token.routes.js
const express = require('express');
const router = express.Router();
const Token = require('../models/Token');
const { v4: uuidv4 } = require('uuid');
const Domain = require('../models/Domain');

// 🔐 Middleware de autenticação
const authMiddleware = require('../middlewares/auth.middleware');

// 🧠 POST /api/token/:slug → gerar token para link compartilhável
router.post('/api/token/:slug', authMiddleware, async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ erro: 'Slug é obrigatório' });
    }

    const domain = await Domain.findOne({ slug, userId: req.user.id });
    if (!domain) {
      return res.status(404).json({ erro: 'Domínio não encontrado ou não pertence a este usuário' });
    }

    // Limite opcional: um token por slug por user (ajusta conforme sua regra)
    const existing = await Token.findOne({ slug });
    if (existing) {
      return res.json({ token: existing.token });
    }

    // Gera novo token
    const token = uuidv4();
    const newToken = new Token({ token, slug });
    await newToken.save();

    return res.status(201).json({ token });
  } catch (err) {
    console.error("❌ Erro em /api/token/:slug:", err.message);
    return res.status(500).json({ erro: 'Falha ao gerar token' });
  }
});

module.exports = router;
