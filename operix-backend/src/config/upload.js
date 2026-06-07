const multer = require('multer');
const path   = require('path');

// Define dónde y cómo guardar las fotos
const storage = multer.diskStorage({

  // Carpeta de destino
  destination: (req, file, cb) => {
    cb(null, 'src/uploads/');
  },

  // Nombre del archivo: timestamp + nombre original
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `foto_${timestamp}${ext}`);
  }
});

// Filtra que solo se suban imágenes
const fileFilter = (req, file, cb) => {
  const tiposPermitidos = /jpeg|jpg|png/;
  const esValido = tiposPermitidos.test(
    path.extname(file.originalname).toLowerCase()
  );
  if (esValido) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes JPG o PNG'));
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // máximo 5MB
});

module.exports = upload;