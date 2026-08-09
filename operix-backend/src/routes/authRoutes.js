const express    = require('express');
const router     = express.Router();
const { login, cambiarPassword, guardarPushToken } = require('../controllers/authController');
const { verificarToken } = require('../middlewares/auth');

// POST /api/auth/login
router.post('/login',            login);
router.post('/cambiar-password', verificarToken, cambiarPassword);
router.post('/push-token',       verificarToken, guardarPushToken);

module.exports = router;