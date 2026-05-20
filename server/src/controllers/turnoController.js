const prisma = require('../utils/prisma');
const { enviarEmailConfirmacion, enviarEmailCancelacion } = require('../utils/mailer');

// Obtener todos los turnos de una empresa específica
const obtenerTurnosEmpresa = async (req, res) => {
  const { id: empresaId } = req.params; // ID de la empresa
  try {
    const turnos = await prisma.turno.findMany({
      where: { empresaId: parseInt(empresaId) },
      include: {
        cliente: true,
        servicio: true
      },
      orderBy: {
        fecha: 'asc'
      }
    });
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener turnos', error: error.message });
  }
};

// Crear un nuevo turno (tanto para cliente web como para agendamiento manual del dueño)
const crearTurno = async (req, res) => {
  const { empresaId, servicioId, fecha, clienteNombre, clienteApellido, clienteTelefono, clienteEmail } = req.body;

  try {
    // 1. Validar campos necesarios
    if (!empresaId || !servicioId || !fecha || !clienteNombre || !clienteApellido || !clienteTelefono) {
      return res.status(400).json({ mensaje: 'Faltan datos obligatorios para crear el turno' });
    }

    // Validar que la fecha del turno no sea anterior al día de hoy
    const fechaTurno = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaTurno < hoy) {
      return res.status(400).json({ mensaje: 'No se pueden agendar turnos para fechas anteriores al día de hoy' });
    }

    // 2. Buscar si el cliente ya existe por su teléfono en la base de datos
    let cliente = await prisma.cliente.findFirst({
      where: { telefono: clienteTelefono }
    });

    // Si no existe, lo creamos
    if (!cliente) {
      cliente = await prisma.cliente.create({
        data: {
          nombre: clienteNombre,
          apellido: clienteApellido,
          telefono: clienteTelefono,
          email: clienteEmail || null
        }
      });
    } else if (clienteEmail && cliente.email !== clienteEmail) {
      // Si ya existe pero ingresó un correo nuevo o diferente, lo actualizamos
      cliente = await prisma.cliente.update({
        where: { id: cliente.id },
        data: { email: clienteEmail }
      });
    }

    // 3. Obtener datos de la empresa y servicio para el correo
    const empresa = await prisma.empresa.findUnique({
      where: { id: parseInt(empresaId) }
    });

    const servicio = await prisma.servicio.findUnique({
      where: { id: parseInt(servicioId) }
    });

    // 4. Crear el turno (Modo Automático: CONFIRMADO)
    const nuevoTurno = await prisma.turno.create({
      data: {
        empresaId: parseInt(empresaId),
        servicioId: parseInt(servicioId),
        clienteId: cliente.id,
        fecha: new Date(fecha),
        estado: 'CONFIRMADO'
      },
      include: {
        cliente: true,
        servicio: true
      }
    });

    // Enviar correo de confirmación si hay un email destinatario (de manera asíncrona)
    const emailDestinatario = clienteEmail || cliente.email;
    if (emailDestinatario) {
      enviarEmailConfirmacion(emailDestinatario, {
        clienteNombre: `${cliente.nombre} ${cliente.apellido}`,
        barberia: empresa?.nombre || 'Barbería',
        barberiaDireccion: empresa?.direccion || '',
        barberiaTelefono: empresa?.telefono || '',
        servicioNombre: servicio?.nombre || 'Servicio',
        servicioPrecio: servicio?.precio || 0,
        fecha: nuevoTurno.fecha
      }).catch(err => console.error('Error al enviar correo confirmación:', err));
    }

    res.status(201).json(nuevoTurno);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el turno', error: error.message });
  }
};

// Actualizar el estado de un turno (CONFIRMADO, CANCELADO, COMPLETADO)
const actualizarEstadoTurno = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; // PENDIENTE, CONFIRMADO, CANCELADO, COMPLETADO

  try {
    const turnoActualizado = await prisma.turno.update({
      where: { id: parseInt(id) },
      data: { estado },
      include: {
        cliente: true,
        servicio: true,
        empresa: true
      }
    });

    // Si el turno se canceló y el cliente tiene email, enviamos correo de cancelación (asíncronamente)
    if (estado === 'CANCELADO' && turnoActualizado.cliente?.email) {
      enviarEmailCancelacion(turnoActualizado.cliente.email, {
        clienteNombre: `${turnoActualizado.cliente.nombre} ${turnoActualizado.cliente.apellido}`,
        barberia: turnoActualizado.empresa?.nombre || 'Barbería',
        barberiaTelefono: turnoActualizado.empresa?.telefono || '',
        servicioNombre: turnoActualizado.servicio?.nombre || 'Servicio',
        fecha: turnoActualizado.fecha
      }).catch(err => console.error('Error al enviar correo cancelación:', err));
    }

    res.json(turnoActualizado);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el estado del turno', error: error.message });
  }
};

// Obtener ocupación de turnos pública (solo devuelve las fechas de turnos reservados de forma segura)
const obtenerTurnosEmpresaPublico = async (req, res) => {
  const { id: empresaId } = req.params;
  try {
    const turnos = await prisma.turno.findMany({
      where: {
        empresaId: parseInt(empresaId),
        estado: { in: ['PENDIENTE', 'CONFIRMADO', 'COMPLETADO'] }
      },
      select: {
        fecha: true
      }
    });
    res.json(turnos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener ocupación de turnos', error: error.message });
  }
};

// Verificar si un cliente existe por su teléfono y tiene turnos en la empresa especificada
const verificarCliente = async (req, res) => {
  const { telefono, empresaId } = req.query;

  if (!telefono || !empresaId) {
    return res.status(400).json({ mensaje: 'Teléfono y empresaId son requeridos' });
  }

  try {
    const cliente = await prisma.cliente.findFirst({
      where: {
        telefono: telefono.trim(),
        turnos: {
          some: {
            empresaId: parseInt(empresaId)
          }
        }
      }
    });

    if (cliente) {
      return res.json({
        existe: true,
        nombre: cliente.nombre,
        apellido: cliente.apellido,
        email: cliente.email || ''
      });
    }

    res.json({ existe: false });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al verificar el cliente', error: error.message });
  }
};

module.exports = {
  obtenerTurnosEmpresa,
  crearTurno,
  actualizarEstadoTurno,
  obtenerTurnosEmpresaPublico,
  verificarCliente
};
