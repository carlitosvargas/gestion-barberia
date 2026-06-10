const prisma = require('../utils/prisma');
const { esquemaEmpresa } = require('../utils/validaciones');

const crearEmpresa = async (req, res) => {
  try {
    const datosValidados = esquemaEmpresa.parse(req.body);
    const { nombre, direccion, telefono, logo, dias, horarios } = datosValidados;

    const empresa = await prisma.empresa.create({
      data: { nombre, direccion, telefono, logo, dias, horarios }
    });
    res.status(201).json(empresa);
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ mensaje: 'Error de validación', errores: error.errors });
    }
    res.status(500).json({ mensaje: 'Error al crear empresa', error: error.message });
  }
};

const obtenerEmpresas = async (req, res) => {
  try {
    const empresas = await prisma.empresa.findMany({
      where: { activa: true }
    });
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener empresas', error: error.message });
  }
};

const obtenerEmpresasAdmin = async (req, res) => {
  try {
    const empresas = await prisma.empresa.findMany();
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener empresas para admin', error: error.message });
  }
};

const toggleEstadoEmpresa = async (req, res) => {
  const { id } = req.params;
  try {
    const empresaIdInt = parseInt(id);
    const empresaActual = await prisma.empresa.findUnique({
      where: { id: empresaIdInt }
    });

    if (!empresaActual) {
      return res.status(404).json({ mensaje: 'Empresa no encontrada' });
    }

    const empresaActualizada = await prisma.empresa.update({
      where: { id: empresaIdInt },
      data: { activa: !empresaActual.activa }
    });

    res.json(empresaActualizada);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al cambiar estado de la empresa', error: error.message });
  }
};

const obtenerEmpresaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id: parseInt(id) },
      include: { servicios: true }
    });
    if (!empresa) return res.status(404).json({ mensaje: 'Empresa no encontrada' });
    res.json(empresa);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener empresa', error: error.message });
  }
};

const actualizarEmpresa = async (req, res) => {
  const { id } = req.params;
  const { nombre, direccion, telefono, logo, dias, horarios } = req.body;
  
  try {
    const empresaIdInt = parseInt(id);

    // 1. Obtener la empresa actual para comparar el horario
    const empresaActual = await prisma.empresa.findUnique({
      where: { id: empresaIdInt }
    });

    if (!empresaActual) {
      return res.status(404).json({ mensaje: 'Empresa no encontrada' });
    }

    // 2. Si el horario cambia, verificar si hay turnos activos futuros o para hoy
    if (horarios !== undefined && horarios !== empresaActual.horarios) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const turnoActivoFuturo = await prisma.turno.findFirst({
        where: {
          empresaId: empresaIdInt,
          fecha: { gte: hoy },
          estado: { in: ['PENDIENTE', 'CONFIRMADO'] }
        }
      });

      if (turnoActivoFuturo) {
        return res.status(400).json({
          mensaje: 'No puedes modificar el horario de atención porque tienes turnos programados (pendientes o confirmados) a partir de hoy. Debes atenderlos, completarlos o cancelarlos todos antes de realizar el cambio.'
        });
      }
    }

    // 3. Proceder a actualizar la empresa
    const empresa = await prisma.empresa.update({
      where: { id: empresaIdInt },
      data: { nombre, direccion, telefono, logo, dias, horarios }
    });
    res.json(empresa);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar empresa', error: error.message });
  }
};
const eliminarEmpresa = async (req, res) => {
  const { id } = req.params;
  try {
    const empresaIdInt = parseInt(id);

    const empresa = await prisma.empresa.findUnique({
      where: { id: empresaIdInt }
    });

    if (!empresa) {
      return res.status(404).json({ mensaje: 'Empresa no encontrada' });
    }

    // Transacción para borrar los registros dependientes y luego la empresa
    await prisma.$transaction([
      prisma.turno.deleteMany({ where: { empresaId: empresaIdInt } }),
      prisma.servicio.deleteMany({ where: { empresaId: empresaIdInt } }),
      prisma.usuario.deleteMany({ where: { empresaId: empresaIdInt } }),
      prisma.empresa.delete({ where: { id: empresaIdInt } })
    ]);

    res.json({ mensaje: 'Empresa eliminada exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar empresa', error: error.message });
  }
};

module.exports = { crearEmpresa, obtenerEmpresas, obtenerEmpresasAdmin, obtenerEmpresaPorId, actualizarEmpresa, eliminarEmpresa, toggleEstadoEmpresa };
