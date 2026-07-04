const cloudinary = require('./cloudinary');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'operix',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 1024, quality: 'auto' }],
  },
});

const upload = multer({ storage });
module.exports = upload;