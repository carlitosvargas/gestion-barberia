const express = require('express');
const router = express.Router();
const { crearEmpresa, obtenerEmpresas, obtenerEmpresasAdmin, obtenerEmpresaPorId, actualizarEmpresa, eliminarEmpresa, toggleEstadoEmpresa } = require('../controllers/empresaController');
const { verificarToken, esAdmin, esDueño } = require('../middlewares/authMiddleware');

router.post('/', verificarToken, esAdmin, crearEmpresa);
router.get('/', obtenerEmpresas); 
router.get('/admin/todas', verificarToken, esAdmin, obtenerEmpresasAdmin);
router.get('/:id', obtenerEmpresaPorId);
router.put('/:id', verificarToken, esDueño, actualizarEmpresa);
router.put('/:id/estado', verificarToken, esAdmin, toggleEstadoEmpresa);
router.delete('/:id', verificarToken, esAdmin, eliminarEmpresa);

module.exports = router;
