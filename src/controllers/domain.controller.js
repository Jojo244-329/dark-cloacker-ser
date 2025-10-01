// src/controllers/domain.controller.js

const Domain = require('../models/Domain');

// 🔥 Criar novo domínio
const createDomain = async (req, res) => {
  try {
    const { slug, url, baseUrl, fallbackUrl } = req.body;

    // Checa se o slug já existe
    const existing = await Domain.findOne({ slug });
    if (existing) return res.status(400).json({ error: 'Slug já em uso' });

    const newDomain = await Domain.create({
      slug,
      url,
      baseUrl,
      fallbackUrl,
      userId: req.user.id,
    });

    return res.status(201).json(newDomain);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao criar domínio', details: err.message });
  }
};

// 🔍 Listar domínios do usuário autenticado
const getUserDomains = async (req, res) => {
  try {
    const domains = await Domain.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(domains);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao buscar domínios', details: err.message });
  }
};

// 🛠 Atualizar domínio (se for do próprio user)
const updateDomain = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const domain = await Domain.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updates,
      { new: true }
    );

    if (!domain) return res.status(404).json({ error: 'Domínio não encontrado' });

    return res.status(200).json(domain);
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao atualizar domínio', details: err.message });
  }
};

// 💀 Deletar domínio (só se for do user)
const deleteDomain = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Domain.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!deleted) return res.status(404).json({ error: 'Domínio não encontrado' });

    return res.status(200).json({ message: 'Domínio deletado com sucesso' });
  } catch (err) {
    return res.status(500).json({ error: 'Erro ao deletar domínio', details: err.message });
  }
};

// Exporta corretamente agora
module.exports = {
  createDomain,
  getUserDomains,
  updateDomain,
  deleteDomain,
};
