const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');
const prisma = require('../utils/prisma');

// Inicializar cliente de Mercado Pago
const getMercadoPagoClient = () => {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken || accessToken.includes('xxxxxxxx')) {
    return null;
  }
  return new MercadoPagoConfig({ accessToken });
};

// Crear preferencia de pago para un Turno específico
const crearPreferenciaTurno = async (req, res) => {
  const { turnoId } = req.params;

  try {
    const turno = await prisma.turno.findUnique({
      where: { id: parseInt(turnoId) },
      include: {
        cliente: true,
        servicio: true,
        empresa: true,
        pagos: true
      }
    });

    if (!turno) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }

    if (turno.estadoPago === 'PAGADO') {
      return res.status(400).json({ mensaje: 'Este turno ya fue pagado' });
    }

    const client = getMercadoPagoClient();
    if (!client) {
      console.warn('⚠️ MP_ACCESS_TOKEN no configurado en backend/.env');
      return res.status(400).json({
        mensaje: 'Falta configurar MP_ACCESS_TOKEN en las variables de entorno del servidor.',
        configError: true
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const backendUrl = process.env.BACKEND_URL;
    const isHttps = frontendUrl.startsWith('https://');

    const preferenceBody = {
      items: [
        {
          id: String(turno.servicio.id),
          title: `${turno.empresa.nombre} - ${turno.servicio.nombre}`,
          description: `Turno para ${turno.cliente.nombre} ${turno.cliente.apellido}`,
          quantity: 1,
          unit_price: Number(turno.servicio.precio),
          currency_id: 'ARS'
        }
      ],
      payer: {
        name: turno.cliente.nombre,
        surname: turno.cliente.apellido,
        email: turno.cliente.email || 'cliente@barberia.com',
        phone: {
          number: turno.cliente.telefono ? String(turno.cliente.telefono) : undefined
        }
      },
      external_reference: String(turno.id),
      back_urls: {
        success: `${frontendUrl}/pago/resultado?turnoId=${turno.id}&status=success`,
        failure: `${frontendUrl}/pago/resultado?turnoId=${turno.id}&status=failure`,
        pending: `${frontendUrl}/pago/resultado?turnoId=${turno.id}&status=pending`
      },
      ...(isHttps ? { auto_return: 'approved' } : {}),
      notification_url: backendUrl && !backendUrl.includes('localhost') && !backendUrl.includes('tu-dominio')
        ? `${backendUrl}/api/pagos/webhook`
        : undefined
    };

    const preference = new Preference(client);
    const result = await preference.create({ body: preferenceBody });

    // Guardar o actualizar registro de pago
    const pagoExistente = await prisma.pago.findFirst({
      where: { turnoId: turno.id }
    });

    if (pagoExistente) {
      await prisma.pago.update({
        where: { id: pagoExistente.id },
        data: {
          monto: turno.servicio.precio,
          mpPreferenceId: result.id,
          metodoPago: 'MERCADOPAGO',
          estado: 'PENDIENTE'
        }
      });
    } else {
      await prisma.pago.create({
        data: {
          turnoId: turno.id,
          empresaId: turno.empresaId,
          monto: turno.servicio.precio,
          mpPreferenceId: result.id,
          metodoPago: 'MERCADOPAGO',
          estado: 'PENDIENTE'
        }
      });
    }

    res.json({
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point || result.init_point,
      monto: turno.servicio.precio,
      turnoId: turno.id
    });
  } catch (error) {
    console.error('❌ Error al crear preferencia de Mercado Pago:', error);
    res.status(500).json({
      mensaje: 'Error al comunicarse con Mercado Pago',
      error: error.message || error
    });
  }
};

// Obtener detalle de pago de un Turno (para la pantalla de Resumen)
const obtenerDetallePagoTurno = async (req, res) => {
  const { turnoId } = req.params;

  try {
    const turno = await prisma.turno.findUnique({
      where: { id: parseInt(turnoId) },
      include: {
        cliente: true,
        servicio: true,
        empresa: true,
        pagos: {
          orderBy: { creadoEn: 'desc' },
          take: 1
        }
      }
    });

    if (!turno) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }

    res.json({
      turno: {
        id: turno.id,
        fecha: turno.fecha,
        estado: turno.estado,
        estadoPago: turno.estadoPago,
        cliente: turno.cliente,
        servicio: turno.servicio,
        empresa: turno.empresa,
        ultimoPago: turno.pagos.length > 0 ? turno.pagos[0] : null
      }
    });
  } catch (error) {
    console.error('❌ Error al obtener detalle del pago:', error);
    res.status(500).json({ mensaje: 'Error al obtener detalle del pago', error: error.message });
  }
};

// Webhook de Mercado Pago para procesar notificaciones automáticas
const recibirWebhook = async (req, res) => {
  try {
    const { type, topic, 'data.id': dataIdQuery } = req.query;
    const body = req.body || {};

    const eventType = type || topic || body.type || body.topic;
    const paymentId = req.query['data.id'] || req.query.id || (body.data && body.data.id) || body.id;

    console.log(`🔔 Webhook recibido - Tipo: ${eventType}, Payment ID: ${paymentId}`);

    if (eventType === 'payment' && paymentId) {
      const client = getMercadoPagoClient();
      if (!client) {
        console.error('❌ MP_ACCESS_TOKEN no disponible para procesar webhook');
        return res.status(200).send('OK');
      }

      const payment = new Payment(client);
      const paymentInfo = await payment.get({ id: paymentId });

      console.log(`💳 Estado del pago ${paymentId}: ${paymentInfo.status}, Reference: ${paymentInfo.external_reference}`);

      const turnoId = paymentInfo.external_reference ? parseInt(paymentInfo.external_reference) : null;

      if (turnoId && !isNaN(turnoId)) {
        const esAprobado = paymentInfo.status === 'approved';

        if (esAprobado) {
          // Actualizar estado del turno
          await prisma.turno.update({
            where: { id: turnoId },
            data: { estadoPago: 'PAGADO' }
          });

          // Actualizar o crear registro en Pago
          const pago = await prisma.pago.findFirst({
            where: { turnoId }
          });

          if (pago) {
            await prisma.pago.update({
              where: { id: pago.id },
              data: {
                estado: 'APROBADO',
                mpPaymentId: String(paymentId),
                metodoPago: paymentInfo.payment_method_id || 'MERCADOPAGO',
                monto: paymentInfo.transaction_amount || pago.monto
              }
            });
          } else {
            const turno = await prisma.turno.findUnique({ where: { id: turnoId } });
            if (turno) {
              await prisma.pago.create({
                data: {
                  turnoId: turno.id,
                  empresaId: turno.empresaId,
                  monto: paymentInfo.transaction_amount || 0,
                  estado: 'APROBADO',
                  mpPaymentId: String(paymentId),
                  metodoPago: paymentInfo.payment_method_id || 'MERCADOPAGO'
                }
              });
            }
          }

          console.log(`✅ Turno #${turnoId} marcado como PAGADO automáticamente.`);
        }
      }
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Error procesando webhook de Mercado Pago:', error);
    // Devolvemos 200 para que Mercado Pago no reintente indefinidamente si fue error de negocio
    res.status(200).send('OK');
  }
};

// Marcar pago manual (ej: Efectivo, Transferencia en el local) por parte del dueño
const marcarPagoManual = async (req, res) => {
  const { turnoId } = req.params;
  const { metodoPago = 'EFECTIVO', monto } = req.body;

  try {
    const turno = await prisma.turno.findUnique({
      where: { id: parseInt(turnoId) },
      include: { servicio: true }
    });

    if (!turno) {
      return res.status(404).json({ mensaje: 'Turno no encontrado' });
    }

    const montoFinal = monto !== undefined ? Number(monto) : Number(turno.servicio.precio);

    // Actualizar turno a PAGADO
    const turnoActualizado = await prisma.turno.update({
      where: { id: turno.id },
      data: { estadoPago: 'PAGADO' },
      include: {
        cliente: true,
        servicio: true,
        empresa: true
      }
    });

    // Registrar o actualizar el Pago
    const pagoExistente = await prisma.pago.findFirst({
      where: { turnoId: turno.id }
    });

    if (pagoExistente) {
      await prisma.pago.update({
        where: { id: pagoExistente.id },
        data: {
          estado: 'APROBADO',
          metodoPago: metodoPago.toUpperCase(),
          monto: montoFinal
        }
      });
    } else {
      await prisma.pago.create({
        data: {
          turnoId: turno.id,
          empresaId: turno.empresaId,
          monto: montoFinal,
          estado: 'APROBADO',
          metodoPago: metodoPago.toUpperCase()
        }
      });
    }

    res.json({
      mensaje: 'Pago registrado exitosamente',
      turno: turnoActualizado
    });
  } catch (error) {
    console.error('❌ Error al registrar pago manual:', error);
    res.status(500).json({ mensaje: 'Error al registrar el pago manual', error: error.message });
  }
};

module.exports = {
  crearPreferenciaTurno,
  obtenerDetallePagoTurno,
  recibirWebhook,
  marcarPagoManual
};
