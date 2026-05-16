const express = require('express');
const router = express.Router();
const { obtenerServicios, crearServicio, eliminarServicio, actualizarServicio } = require('../controllers/servicioController');
const { verificarToken, esDueño } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, esDueño, obtenerServicios);
router.post('/', verificarToken, esDueño, crearServicio);
router.put('/:id', verificarToken, esDueño, actualizarServicio);
router.delete('/:id', verificarToken, esDueño, eliminarServicio);

module.exports = router;
