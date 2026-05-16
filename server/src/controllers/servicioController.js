const prisma = require('../utils/prisma');

const obtenerServicios = async (req, res) => {
  const { empresaId } = req.usuario; // Extraído del token
  try {
    const servicios = await prisma.servicio.findMany({
      where: { empresaId: parseInt(empresaId) }
    });
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener servicios', error: error.message });
  }
};

const crearServicio = async (req, res) => {
  const { empresaId } = req.usuario;
  const { nombre, precio, duracion } = req.body;
  try {
    const servicio = await prisma.servicio.create({
      data: {
        nombre,
        precio: parseFloat(precio),
        duracion: parseInt(duracion),
        empresaId: parseInt(empresaId)
      }
    });
    res.status(201).json(servicio);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear servicio', error: error.message });
  }
};

const eliminarServicio = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.servicio.delete({ where: { id: parseInt(id) } });
    res.json({ mensaje: 'Servicio eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar servicio', error: error.message });
  }
};

const actualizarServicio = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, duracion } = req.body;
  try {
    const servicio = await prisma.servicio.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        precio: parseFloat(precio),
        duracion: parseInt(duracion)
      }
    });
    res.json(servicio);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar servicio', error: error.message });
  }
};

module.exports = { obtenerServicios, crearServicio, eliminarServicio, actualizarServicio };
