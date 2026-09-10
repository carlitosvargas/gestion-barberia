require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

const allowedOrigins = [
  'https://gestioncv.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    // Permitir solicitudes sin origen (como apps móviles, Postman o Webhooks de Mercado Pago)
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      callback(null, true);
    } else {
      callback(null, true); // Permite acceso para testing fluido
    }
  },
  credentials: true
}));

app.use(express.json());

// Archivos estáticos
//app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/empresas', require('./routes/empresaRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/servicios', require('./routes/servicioRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/turnos', require('./routes/turnoRoutes'));
app.use('/api/notificaciones', require('./routes/notificacionRoutes'));
app.use('/api/pagos', require('./routes/pagoRoutes'));

app.get('/', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'API Barbería funcionando'
  });
});

const PORT = process.env.PORT || 3001;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor de Barbería corriendo en puerto ${PORT}`);
  });
}


module.exports = app;