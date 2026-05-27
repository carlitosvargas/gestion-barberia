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

const obtenerTodosUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany({
      select: { id: true, nombre: true, apellido: true, email: true, rol: true, empresaId: true, creadoEn: true }
    });
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener todos los usuarios', error: error.message });
  }
};

const eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    const usuarioIdInt = parseInt(id);
    
    // Evitar eliminar al SUPER_ADMIN principal (ej: el que tenga ID 1 o rol SUPER_ADMIN)
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioIdInt } });
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    
    if (usuario.rol === 'SUPER_ADMIN') {
      return res.status(403).json({ mensaje: 'No puedes eliminar a un administrador principal.' });
    }

    await prisma.usuario.delete({
      where: { id: usuarioIdInt }
    });
    
    res.json({ mensaje: 'Usuario eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar usuario', error: error.message });
  }
};

module.exports = { obtenerUsuariosSinEmpresa, asignarEmpresa, obtenerTodosUsuarios, eliminarUsuario };
