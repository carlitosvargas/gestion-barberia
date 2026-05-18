const prisma = require('../utils/prisma');

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
    }

    // 3. Crear el turno
    const nuevoTurno = await prisma.turno.create({
      data: {
        empresaId: parseInt(empresaId),
        servicioId: parseInt(servicioId),
        clienteId: cliente.id,
        fecha: new Date(fecha),
        estado: 'PENDIENTE'
      },
      include: {
        cliente: true,
        servicio: true
      }
    });

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
        servicio: true
      }
    });
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

module.exports = {
  obtenerTurnosEmpresa,
  crearTurno,
  actualizarEstadoTurno,
  obtenerTurnosEmpresaPublico
};
