const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(403).json({ mensaje: 'Token no proporcionado' });
  }

  try {
    const decodificado = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decodificado;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido o expirado' });
  }
};

const esAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'SUPER_ADMIN') {
    return res.status(403).json({ mensaje: 'Acceso denegado: Se requiere rol de Super Administrador' });
  }
  next();
};

const esDueño = (req, res, next) => {
  if (req.usuario.rol !== 'DUENO_EMPRESA' && req.usuario.rol !== 'SUPER_ADMIN') {
    return res.status(403).json({ mensaje: 'Acceso denegado: Se requiere rol de Dueño o Administrador' });
  }
  next();
};

module.exports = { verificarToken, esAdmin, esDueño };
