const prisma = require('../utils/prisma');
const { esquemaEmpresa } = require('../utils/validaciones');

const crearEmpresa = async (req, res) => {
  try {
    // Validar datos de entrada
    const datosValidados = esquemaEmpresa.parse(req.body);
    const { nombre, direccion, telefono, logo } = datosValidados;

    const empresa = await prisma.empresa.create({
      data: { nombre, direccion, telefono, logo }
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
    const empresas = await prisma.empresa.findMany();
    res.json(empresas);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener empresas', error: error.message });
  }
};

const obtenerEmpresaPorId = async (req, res) => {
  const { id } = req.params;
  try {
    const empresa = await prisma.empresa.findUnique({
      where: { id },
      include: { servicios: true }
    });
    if (!empresa) return res.status(404).json({ mensaje: 'Empresa no encontrada' });
    res.json(empresa);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener empresa', error: error.message });
  }
};

module.exports = { crearEmpresa, obtenerEmpresas, obtenerEmpresaPorId };
