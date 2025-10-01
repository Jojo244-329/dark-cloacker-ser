const express = require('express');
const router = express.Router();
const { autenticar } = require('../middlewares/auth.middleware');

const {
  createDomain,
  getUserDomains,
  deleteDomain,
  updateDomain,
  getDomainBySlug // novo, útil se quiser buscar por slug
} = require('../controllers/domain.controller.js');

// Criar domínio
router.post('/', autenticar, createDomain);

// Listar domínios do usuário
router.get('/', autenticar, getUserDomains);

// Buscar domínio específico por slug (opcional, mas útil)
router.get('/:slug', autenticar, getDomainBySlug);

// Editar domínio do próprio usuário
router.put('/:id', autenticar, updateDomain);

// Deletar domínio do próprio usuário
router.delete('/:id', autenticar, deleteDomain);

module.exports = router;
