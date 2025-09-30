const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/auth.controller');
const { autenticar } = require('../middlewares/auth.middleware');


router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', autenticar, me);


module.exports = router;