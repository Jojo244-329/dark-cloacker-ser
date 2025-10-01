const express = require('express');
const router = express.Router();
const { auth, isAdmin } = require('../middlewares/auth.middleware');
const domainCtrl = require('../controllers/domain.controller');

// Criar domínio (usuário autenticado)
router.post('/', auth, domainCtrl.createDomain);

// Listar domínios do usuário logado
router.get('/', auth, domainCtrl.getUserDomains);

// ADMIN: listar todos os domínios com os emails
router.get('/admin/all', auth, isAdmin, async (req, res) => {
  try {
    const all = await require('../models/Domain').find().populate('userId', 'email');
    res.json(all);
  } catch (err) {
    console.error("❌ Erro ao listar todos os domínios:", err.message);
    res.status(500).json({ erro: 'Falha ao listar domínios' });
  }
});

// Atualizar domínio (usuário)
router.put('/:id', auth, domainCtrl.updateDomain);

// Deletar domínio do próprio user
router.delete('/me/:id', auth, domainCtrl.deleteDomain);

// Deletar domínio como ADMIN
router.delete('/:id', auth, isAdmin, async (req, res) => {
  try {
    await require('../models/Domain').findByIdAndDelete(req.params.id);
    res.json({ message: 'Domínio deletado' });
  } catch (err) {
    console.error("❌ Erro ao deletar domínio:", err.message);
    res.status(500).json({ erro: 'Falha ao deletar domínio' });
  }
});

module.exports = router;
