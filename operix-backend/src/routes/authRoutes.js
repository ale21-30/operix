const express    = require('express');
const router     = express.Router();
const { login, cambiarPassword } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/auth');

// POST /api/auth/login
router.post('/login',            login);
router.post('/cambiar-password', verificarToken, cambiarPassword);

module.exports = router;