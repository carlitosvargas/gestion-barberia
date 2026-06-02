const express = require('express');
const router = express.Router();
const { login, registro, solicitarRecuperacionPassword, restablecerPassword } = require('../controllers/authController');

router.post('/login', login);
router.post('/registro', registro);
router.post('/recuperar-password', solicitarRecuperacionPassword);
router.post('/reset-password/:id/:token', restablecerPassword);

module.exports = router;
