const multer    = require('multer');
const cloudinary = require('./cloudinary');

// Guarda en memoria para enviar a Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const valido = /jpeg|jpg|png/.test(file.mimetype);
    cb(null, valido);
  }
});

module.exports = upload;