/**
 * Optimiza y redimensiona una imagen en el frontend usando HTML5 Canvas antes de subirla.
 * @param {File} file - El archivo de imagen original seleccionado por el usuario.
 * @param {number} maxWidth - El ancho máximo deseado.
 * @param {number} maxHeight - El alto máximo deseado.
 * @returns {Promise<Blob>} - Una promesa que resuelve con el Blob de la imagen optimizada (WebP o JPEG).
 */
export const optimizarImagen = (file, maxWidth = 300, maxHeight = 300) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Mantener la relación de aspecto y redimensionar si supera los límites
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Para logos, preferimos un lienzo perfectamente cuadrado si es posible,
        // pero redimensionar la imagen manteniéndola centrada es ideal.
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir el canvas a un Blob de tipo JPEG o WebP con calidad optimizada
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Error al optimizar la imagen en el canvas'));
            }
          },
          'image/jpeg',
          0.85 // Calidad premium pero liviana (85%)
        );
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
