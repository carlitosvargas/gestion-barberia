const express = require('express');
const router = express.Router();
const { obtenerUsuariosSinEmpresa, asignarEmpresa, obtenerTodosUsuarios, eliminarUsuario } = require('../controllers/usuarioController');
const { verificarToken, esAdmin } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, esAdmin, obtenerTodosUsuarios);
router.get('/sin-empresa', verificarToken, esAdmin, obtenerUsuariosSinEmpresa);
router.post('/asignar', verificarToken, esAdmin, asignarEmpresa);
router.delete('/:id', verificarToken, esAdmin, eliminarUsuario);

module.exports = router;
