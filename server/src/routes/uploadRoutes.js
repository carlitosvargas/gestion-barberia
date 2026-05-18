const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { verificarToken } = require('../middlewares/authMiddleware');

router.post('/', verificarToken, upload.single('imagen'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ mensaje: 'No se ha subido ningún archivo' });
    }

    // Generar la URL pública del archivo subido
    const urlArchivo = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    
    res.json({
      mensaje: 'Imagen subida correctamente',
      url: urlArchivo
    });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al subir la imagen', error: error.message });
  }
});

module.exports = router;
