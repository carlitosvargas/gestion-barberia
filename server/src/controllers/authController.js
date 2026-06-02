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

const { enviarEmailBienvenida } = require('../utils/mailer');

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
    
    // Enviar el correo de verificación / bienvenida
    await enviarEmailBienvenida(usuario.email, usuario.nombre);

    res.status(201).json({ 
      mensaje: 'Usuario creado con éxito. Se ha enviado un correo de verificación.', 
      usuario: { id: usuario.id, email: usuario.email, nombre: usuario.nombre } 
    });
  } catch (error) {
    if (error.name === 'ZodError') {
      return res.status(400).json({ mensaje: 'Error de validación', errores: error.errors });
    }
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
  }
};

const { enviarEmailRecuperacionPassword } = require('../utils/mailer');

const solicitarRecuperacionPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ mensaje: 'El email es requerido' });

    const usuario = await prisma.usuario.findUnique({ where: { email } });
    if (!usuario) {
      return res.status(404).json({ mensaje: 'No existe una cuenta con este correo' });
    }

    // El secreto combina la clave secreta general con la contraseña actual.
    // Si la contraseña cambia, el token se invalida automáticamente.
    const secret = process.env.JWT_SECRET + usuario.password;
    const payload = {
      email: usuario.email,
      id: usuario.id
    };
    // Usa el origen de la petición (ej: http://localhost:5173 o https://tu-dominio.vercel.app)
    const frontendUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
    const link = `${frontendUrl}/reset-password/${usuario.id}/${token}`;

    await enviarEmailRecuperacionPassword(usuario.email, usuario.nombre, link);

    res.json({ mensaje: 'Se ha enviado el enlace de recuperación a tu correo.' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al solicitar recuperación', error: error.message });
  }
};

const restablecerPassword = async (req, res) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    if (!password) return res.status(400).json({ mensaje: 'La nueva contraseña es requerida' });

    const usuarioIdInt = parseInt(id);
    const usuario = await prisma.usuario.findUnique({ where: { id: usuarioIdInt } });
    
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no válido' });
    }

    const secret = process.env.JWT_SECRET + usuario.password;
    try {
      jwt.verify(token, secret);
    } catch (error) {
      return res.status(400).json({ mensaje: 'El enlace es inválido o ha expirado' });
    }

    const passwordHasheada = await bcrypt.hash(password, 10);
    
    await prisma.usuario.update({
      where: { id: usuarioIdInt },
      data: { password: passwordHasheada }
    });

    res.json({ mensaje: 'Contraseña actualizada con éxito' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al restablecer contraseña', error: error.message });
  }
};

module.exports = { login, registro, solicitarRecuperacionPassword, restablecerPassword };
