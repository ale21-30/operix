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
  obtenerHistorial,
  estadoBreak
} = require('../controllers/turnosController');

router.post('/entrada',       verificarToken, upload.single('foto'), registrarEntrada);
router.post('/salida',        verificarToken, upload.single('foto'), registrarSalida);
router.post('/break/inicio',  verificarToken, iniciarBreak);
router.post('/break/fin',     verificarToken, finalizarBreak);
router.post('/novedad',       verificarToken, upload.single('foto'), registrarNovedad);
router.get('/historial',      verificarToken, obtenerHistorial);
router.get('/break/estado',   verificarToken, estadoBreak);

module.exports = router;