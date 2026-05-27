require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// Middlewares
app.use(cors({
  origin: 'https://gestioncv.vercel.app',
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

app.get('/', (req, res) => {
  res.json({
    ok: true,
    mensaje: 'API Barbería funcionando'
  });
});

module.exports = app;