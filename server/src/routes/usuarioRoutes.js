const express = require('express');
const router = express.Router();
const { obtenerUsuariosSinEmpresa, asignarEmpresa } = require('../controllers/usuarioController');
const { verificarToken, esAdmin } = require('../middlewares/authMiddleware');

router.get('/sin-empresa', verificarToken, esAdmin, obtenerUsuariosSinEmpresa);
router.post('/asignar', verificarToken, esAdmin, asignarEmpresa);

module.exports = router;
