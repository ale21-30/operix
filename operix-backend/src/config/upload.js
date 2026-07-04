const multer  = require('multer');

// Guarda en memoria temporalmente antes de subir a Cloudinary
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
  fileFilter: (req, file, cb) => {
    const tipos = /jpeg|jpg|png/;
    const esValido = tipos.test(file.mimetype);
    if (esValido) cb(null, true);
    else cb(new Error('Solo imágenes JPG o PNG'));
  }
});

module.exports = upload;