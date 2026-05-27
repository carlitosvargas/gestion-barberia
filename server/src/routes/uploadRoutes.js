const express = require('express');
const router = express.Router();

const upload = require('../middlewares/uploadMiddleware');
const { verificarToken } = require('../middlewares/authMiddleware');

router.post(
  '/',
  verificarToken,
  upload.single('imagen'),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          mensaje: 'No se ha subido ningún archivo'
        });
      }

      res.json({
        mensaje: 'Imagen subida correctamente',
        url: req.file.path
      });

    } catch (error) {
      res.status(500).json({
        mensaje: 'Error al subir la imagen',
        error: error.message
      });
    }
  }
);

module.exports = router;