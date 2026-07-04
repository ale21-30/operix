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
router.get('/sedes/lista', verificarToken, async (req, res) => {
  try {
    const pool = require('../config/db');
    const [sedes] = await pool.query(
      'SELECT id, nombre, direccion FROM sedes WHERE activa = 1 ORDER BY nombre'
    );
    res.json({ sedes });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});
router.get('/activo', verificarToken, async (req, res) => {
  try {
    const pool = require('../config/db');
    const [turnos] = await pool.query(
      `SELECT t.id, t.entrada_hora, s.nombre AS sede
       FROM turnos t
       JOIN sedes s ON t.sede_id = s.id
       WHERE t.usuario_id = ? AND t.estado = 'activo'
       LIMIT 1`,
      [req.usuario.id]
    );
    res.json({ turno: turnos[0] || null });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});
module.exports = router;