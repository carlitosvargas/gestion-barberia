require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3001;

const path = require('path');

// Middlewares
app.use(cors());
app.use(express.json());

// Servir la carpeta uploads de forma estática
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rutas
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/empresas', require('./routes/empresaRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/servicios', require('./routes/servicioRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/turnos', require('./routes/turnoRoutes'));

app.get('/', (req, res) => {
  res.json({ mensaje: 'API de Gestión de Barberías está funcionando' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
