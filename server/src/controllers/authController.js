const prisma = require('../utils/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { esquemaRegistro, esquemaLogin } = require('../utils/validaciones');

const login = async (req, res) => {
  try {
    const datosValidados = esquemaLogin.parse(req.body);
    const { email, password } = datosValidados;

    const usuario = await prisma.usuario.findUnique({
      where: { email },
      include: { empresa: true }
    });

    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    const token = jwt.sign(
      { usuarioId: usuario.id, rol: usuario.rol, empresaId: usuario.empresaId },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        rol: usuario.rol,
        empresaId: usuario.empresaId, // Campo explícito
        empresa: usuario.empresa
      }
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ mensaje: 'Error de validación', errores: error.errors });
    }
    res.status(500).json({ mensaje: 'Error en el servidor', error: error.message });
  }
};

const registro = async (req, res) => {
  try {
    const datosValidados = esquemaRegistro.parse(req.body);
    const { nombre, apellido, telefono, email, password, rol, empresaId } = datosValidados;

    const usuarioExistente = await prisma.usuario.findUnique({ where: { email } });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El usuario ya existe' });
    }

    const passwordHasheada = await bcrypt.hash(password, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        telefono,
        email,
        password: passwordHasheada,
        rol: rol || 'DUENO_EMPRESA',
        empresaId: empresaId || null
      }
    });

    res.status(201).json({ 
      mensaje: 'Usuario creado con éxito', 
      usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre } 
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ mensaje: 'Error de validación', errores: error.errors });
    }
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
  }
};

module.exports = { login, registro };
