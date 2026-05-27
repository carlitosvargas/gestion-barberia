const express = require('express');
const router = express.Router();
const { crearEmpresa, obtenerEmpresas, obtenerEmpresaPorId, actualizarEmpresa, eliminarEmpresa } = require('../controllers/empresaController');
const { verificarToken, esAdmin, esDueño } = require('../middlewares/authMiddleware');

router.post('/', verificarToken, esAdmin, crearEmpresa);
router.get('/', obtenerEmpresas); 
router.get('/:id', obtenerEmpresaPorId);
router.put('/:id', verificarToken, esDueño, actualizarEmpresa);
router.delete('/:id', verificarToken, esAdmin, eliminarEmpresa);

module.exports = router;
