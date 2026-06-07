const express    = require('express');
const router     = express.Router();
const upload     = require('../config/upload');
const { verificarToken } = require('../middlewares/auth');
const {
  registrarEntrada,
  registrarSalida,
  iniciarBreak,
  finalizarBreak,
  registrarNovedad,
  obtenerHistorial
} = require('../controllers/turnosController');

// Todas las rutas requieren token JWT
// verificarToken actúa como guardia antes de cada endpoint

router.post('/entrada',       verificarToken, upload.single('foto'), registrarEntrada);
router.post('/salida',        verificarToken, upload.single('foto'), registrarSalida);
router.post('/break/inicio',  verificarToken, iniciarBreak);
router.post('/break/fin',     verificarToken, finalizarBreak);
router.post('/novedad',       verificarToken, upload.single('foto'), registrarNovedad);
router.get('/historial',      verificarToken, obtenerHistorial);

module.exports = router;