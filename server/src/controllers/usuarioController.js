const prisma = require('../utils/prisma');

const obtenerUsuariosSinEmpresa = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      where: {
        rol: 'DUENO_EMPRESA',
        empresaId: null
      },
      select: { id: true, nombre: true, apellido: true, email: true }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener usuarios', error: error.message });
  }
};

const asignarEmpresa = async (req, res) => {
  const { usuarioId, empresaId } = req.body;

  try {
    // 1. Verificar si el usuario ya tiene una empresa asignada
    const usuarioActual = await prisma.usuario.findUnique({
      where: { id: parseInt(usuarioId) }
    });

    if (usuarioActual.empresaId) {
      return res.status(400).json({ mensaje: 'Este usuario ya es dueño de otra barbería.' });
    }

    // 2. Realizar la asignación
    const usuarioActualizado = await prisma.usuario.update({
      where: { id: parseInt(usuarioId) },
      data: { empresaId: parseInt(empresaId) }
    });
    
    res.json({ mensaje: 'Empresa asignada con éxito', usuario: usuarioActualizado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al asignar empresa', error: error.message });
  }
};

module.exports = { obtenerUsuariosSinEmpresa, asignarEmpresa };
