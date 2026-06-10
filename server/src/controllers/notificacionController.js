const prisma = require('../utils/prisma');
const { enviarEmailRecordatorio } = require('../utils/mailer');

// Endpoint que se llamará desde el frontend cada 30 segundos
const verificarNotificaciones = async (req, res) => {
  try {
    const { empresaId } = req.usuario; // Obtenido del token

    const ahora = new Date();
    // 6 minutos hacia adelante para asegurarnos de capturar los de "en 5 minutos"
    const limiteSuper = new Date(ahora.getTime() + 6 * 60000); 

    // Buscar turnos próximos que aún no hayan sido notificados o recordados
    const turnosProximos = await prisma.turno.findMany({
      where: {
        empresaId,
        estado: 'CONFIRMADO',
        fecha: {
          gte: ahora,
          lte: limiteSuper
        },
        OR: [
          { notificacionEnviada: false },
          { recordatorioEnviado: false }
        ]
      },
      include: {
        cliente: true,
        servicio: true,
        empresa: true
      }
    });

    const notificacionesDashboard = [];

    // Procesar cada turno encontrado
    for (const turno of turnosProximos) {
      const actualizarDatos = {};

      // 1. Notificación para el panel del dueño
      if (!turno.notificacionEnviada) {
        notificacionesDashboard.push(turno);
        actualizarDatos.notificacionEnviada = true;
      }

      // 2. Correo de recordatorio para el cliente (solo si tiene email)
      if (!turno.recordatorioEnviado) {
        if (turno.cliente.email) {
          const datosRecordatorio = {
            clienteNombre: turno.cliente.nombre,
            barberia: turno.empresa.nombre,
            servicioNombre: turno.servicio.nombre,
            fecha: turno.fecha,
            barberiaDireccion: turno.empresa.direccion,
            barberiaTelefono: turno.empresa.telefono
          };
          // Se envía el correo de forma asíncrona pero sin frenar el flujo
          enviarEmailRecordatorio(turno.cliente.email, datosRecordatorio).catch(console.error);
        }
        actualizarDatos.recordatorioEnviado = true;
      }

      // Actualizar en base de datos para no volver a notificar
      if (Object.keys(actualizarDatos).length > 0) {
        await prisma.turno.update({
          where: { id: turno.id },
          data: actualizarDatos
        });
      }
    }

    res.json({ nuevasNotificaciones: notificacionesDashboard });
  } catch (error) {
    console.error('Error al verificar notificaciones:', error);
    res.status(500).json({ mensaje: 'Error al verificar notificaciones', error: error.message });
  }
};

// Endpoint independiente para cron-job.org (opcional para asegurar correos si el panel está cerrado)
const ejecutarCronRecordatorios = async (req, res) => {
  try {
    const ahora = new Date();
    const limiteSuper = new Date(ahora.getTime() + 6 * 60000); 

    const turnosProximos = await prisma.turno.findMany({
      where: {
        estado: 'CONFIRMADO',
        fecha: { gte: ahora, lte: limiteSuper },
        recordatorioEnviado: false
      },
      include: { cliente: true, servicio: true, empresa: true }
    });

    for (const turno of turnosProximos) {
      if (turno.cliente.email) {
        const datosRecordatorio = {
          clienteNombre: turno.cliente.nombre,
          barberia: turno.empresa.nombre,
          servicioNombre: turno.servicio.nombre,
          fecha: turno.fecha,
          barberiaDireccion: turno.empresa.direccion,
          barberiaTelefono: turno.empresa.telefono
        };
        await enviarEmailRecordatorio(turno.cliente.email, datosRecordatorio);
      }
      await prisma.turno.update({
        where: { id: turno.id },
        data: { recordatorioEnviado: true }
      });
    }

    res.json({ procesados: turnosProximos.length, mensaje: 'Cron ejecutado con éxito' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error en cron', error: error.message });
  }
};

module.exports = {
  verificarNotificaciones,
  ejecutarCronRecordatorios
};
