const express = require('express');
const router = express.Router();
const { crearEmpresa, obtenerEmpresas, obtenerEmpresaPorId } = require('../controllers/empresaController');
const { verificarToken, esAdmin } = require('../middlewares/authMiddleware');

router.post('/', verificarToken, esAdmin, crearEmpresa);
router.get('/', obtenerEmpresas); 
router.get('/:id', obtenerEmpresaPorId);

module.exports = router;
