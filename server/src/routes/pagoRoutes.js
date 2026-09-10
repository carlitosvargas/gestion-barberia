const express = require('express');
const router = express.Router();
const {
  crearPreferenciaTurno,
  obtenerDetallePagoTurno,
  recibirWebhook,
  marcarPagoManual
} = require('../controllers/pagoController');
const { verificarToken, esDueño } = require('../middlewares/authMiddleware');

// Obtener detalle de pago del turno (público para clientes con enlace y dueños)
router.get('/turno/:turnoId', obtenerDetallePagoTurno);

// Crear preferencia de pago en Mercado Pago para un turno
router.post('/crear-preferencia/:turnoId', crearPreferenciaTurno);

// Webhook para Mercado Pago (soporta POST y GET según cómo notifique MP)
router.post('/webhook', recibirWebhook);
router.get('/webhook', recibirWebhook);

// Marcar turno como pagado de forma manual (efectivo, transferencia) - Requiere dueño autenticado
router.post('/marcar-manual/:turnoId', verificarToken, esDueño, marcarPagoManual);

module.exports = router;
