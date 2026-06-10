const express = require('express');
const router = express.Router();
const { verificarNotificaciones, ejecutarCronRecordatorios } = require('../controllers/notificacionController');
const { verificarToken } = require('../middlewares/authMiddleware');

// Endpoint privado (dueño) que hace polling
router.get('/turnos-proximos', verificarToken, verificarNotificaciones);

// Endpoint público para que cron-job.org haga ping cada minuto
router.get('/cron', ejecutarCronRecordatorios);

module.exports = router;
