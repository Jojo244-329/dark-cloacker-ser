const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/auth.controller');
const { autenticar } = require('../middlewares/auth.middleware');


router.post('/register', register);
router.post('/login', login);
router.get('/me', autenticar, me);


module.exports = router;