const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');

const {
  createDomain,
  getUserDomains,
  deleteDomain,
  updateDomain
} = require('../controllers/domain.controller.js');

// Criar domínio
router.post('/', autenticar, createDomain);

// Listar domínios do user
router.get('/', autenticar, getUserDomains);

// Editar domínio do próprio usuário
router.put('/:id', autenticar, updateDomain);

// Deletar domínio do próprio usuário
router.delete('/:id', autenticar, deleteDomain);

module.exports = router;
