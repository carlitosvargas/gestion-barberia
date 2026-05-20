const express = require('express');
const router = express.Router();
const { obtenerTurnosEmpresa, crearTurno, actualizarEstadoTurno, obtenerTurnosEmpresaPublico, verificarCliente } = require('../controllers/turnoController');
const { verificarToken, esDueño } = require('../middlewares/authMiddleware');

// Ruta para que el dueño de la empresa consulte todos sus turnos (Privada)
router.get('/empresa/:id', verificarToken, esDueño, obtenerTurnosEmpresa);

// Ruta pública para verificar si un cliente existe y tiene turnos en esta empresa
router.get('/verificar-cliente', verificarCliente);

// Ruta pública para consultar la ocupación de turnos (para deshabilitar slots en el frontend)
router.get('/empresa/:id/publico', obtenerTurnosEmpresaPublico);

// Ruta pública para que los clientes (o el dueño de forma manual) puedan reservar un turno
router.post('/', crearTurno);

// Ruta privada para que el dueño actualice el estado de un turno
router.put('/:id/estado', verificarToken, esDueño, actualizarEstadoTurno);

module.exports = router;
