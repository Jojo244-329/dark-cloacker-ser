const express = require('express');
const router = express.Router();
const Domain = require('../models/Domain');
const { auth, isAdmin } = require('../middlewares/auth.middleware');

// Função auxiliar pra normalizar URLs
function normalizeUrl(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }
  return url.replace(/\/+$/, ''); // remove barras no final
}

// Criar domínio (user)
router.post('/', auth, async (req, res) => {
  try {
    let { slug, url, baseUrl, fallbackUrl } = req.body;

    if (!slug || !url || !baseUrl) {
      return res.status(400).json({ erro: 'slug, url e baseUrl são obrigatórios' });
    }

    // Normaliza URLs
    url = normalizeUrl(url);
    baseUrl = normalizeUrl(baseUrl);
    fallbackUrl = fallbackUrl ? normalizeUrl(fallbackUrl) : 'https://google.com';

    // Verifica se slug já existe
    const existe = await Domain.findOne({ slug });
    if (existe) {
      return res.status(400).json({ erro: 'Slug já registrado' });
    }

    const domain = await Domain.create({
      slug,
      url,
      baseUrl,
      fallbackUrl,
      userId: req.user.id
    });

    res.status(201).json(domain);
  } catch (err) {
    console.error("❌ Erro ao criar domínio:", err.message);
    res.status(500).json({ erro: 'Falha ao criar domínio' });
  }
});

// Listar domínios do usuário logado
router.get('/', auth, async (req, res) => {
  try {
    const domains = await Domain.find({ userId: req.user.id });
    res.json(domains);
  } catch (err) {
    console.error("❌ Erro ao listar domínios do usuário:", err.message);
    res.status(500).json({ erro: 'Falha ao listar domínios' });
  }
});

// ADMIN: listar todos os domínios
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const all = await Domain.find().populate('userId', 'email');
    res.json(all);
  } catch (err) {
    console.error("❌ Erro ao listar todos os domínios:", err.message);
    res.status(500).json({ erro: 'Falha ao listar domínios' });
  }
});

// ADMIN: deletar domínio
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    await Domain.findByIdAndDelete(req.params.id);
    res.json({ message: 'Domínio deletado' });
  } catch (err) {
    console.error("❌ Erro ao deletar domínio:", err.message);
    res.status(500).json({ erro: 'Falha ao deletar domínio' });
  }
});

// 🛠️ PUT: Atualizar domínio do próprio usuário
router.put('/:id', auth, async (req, res) => {
  try {
    const updates = req.body;

    const updated = await Domain.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      updates,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ erro: 'Domínio não encontrado ou não pertence a você' });
    }

    res.json(updated);
  } catch (err) {
    console.error("❌ Erro ao atualizar domínio:", err.message);
    res.status(500).json({ erro: 'Falha ao atualizar domínio' });
  }
});

// 💀 DELETE: Domínio do próprio usuário
router.delete('/me/:id', auth, async (req, res) => {
  try {
    const deleted = await Domain.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ erro: 'Domínio não encontrado ou não autorizado' });
    }

    res.json({ message: 'Domínio deletado com sucesso' });
  } catch (err) {
    console.error("❌ Erro ao deletar domínio do usuário:", err.message);
    res.status(500).json({ erro: 'Falha ao deletar domínio' });
  }
});

module.exports = router;
