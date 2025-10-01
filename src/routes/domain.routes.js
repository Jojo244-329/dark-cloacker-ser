const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth.middleware');

const {
  createDomain,
  getUserDomains,
  updateDomain,
  deleteDomain,
} = require('../controllers/domain.controller');

// Criar domínio
router.post('/', auth, createDomain);

// Listar domínios do user
router.get('/', auth, getUserDomains);

// Editar domínio do próprio usuário
router.put('/:id', auth, updateDomain);

// Deletar domínio do próprio usuário
router.delete('/:id', auth, deleteDomain);

module.exports = router;
