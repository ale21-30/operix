const express    = require('express');
const router     = express.Router();
const { verificarToken } = require('../middlewares/auth');
const {
  getResumen, getTurnos, getEmpleados,
  crearEmpleado, getSedes, crearSede
} = require('../controllers/adminController');

// Middleware para verificar que sea admin
const soloAdmin = (req, res, next) => {
  if (req.usuario.rol !== 'admin') {
    return res.status(403).json({ error: 'Solo administradores' });
  }
  next();
};

// Cerrar turno manualmente desde el admin
router.put('/turnos/:id/cerrar', verificarToken, soloAdmin, async (req, res) => {
  try {
    const pool = require('../config/db');
    const { id } = req.params;

    const [turno] = await pool.query(
      `SELECT t.id, u.nombre AS empleado, s.nombre AS sede
       FROM turnos t
       JOIN usuarios u ON t.usuario_id = u.id
       JOIN sedes s ON t.sede_id = s.id
       WHERE t.id = ? AND t.estado = 'activo'`,
      [id]
    );

    if (turno.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado o ya cerrado' });
    }

    await pool.query(
      `UPDATE turnos 
       SET salida_hora = NOW(), estado = 'completado'
       WHERE id = ?`,
      [id]
    );

    res.json({ 
      mensaje: `Turno de ${turno[0].empleado} en ${turno[0].sede} cerrado correctamente` 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener turnos activos (para el admin)
router.get('/turnos/activos', verificarToken, soloAdmin, async (req, res) => {
  try {
    const pool = require('../config/db');
    const [turnos] = await pool.query(
      `SELECT t.id, u.nombre AS empleado, u.email,
              s.nombre AS sede, t.entrada_hora,
              ROUND(TIMESTAMPDIFF(MINUTE, t.entrada_hora, NOW()) / 60, 1) AS horas_activo
       FROM turnos t
       JOIN usuarios u ON t.usuario_id = u.id
       JOIN sedes s ON t.sede_id = s.id
       WHERE t.estado = 'activo'
       ORDER BY t.entrada_hora ASC`,
      []
    );
    res.json({ turnos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/resumen',    verificarToken, soloAdmin, getResumen);
router.get('/turnos',     verificarToken, soloAdmin, getTurnos);
router.get('/empleados',  verificarToken, soloAdmin, getEmpleados);
router.post('/empleados', verificarToken, soloAdmin, crearEmpleado);
router.get('/sedes',      verificarToken, soloAdmin, getSedes);
router.post('/sedes',     verificarToken, soloAdmin, crearSede);

router.put('/empleados/:id/estado', verificarToken, soloAdmin, async (req, res) => {
  try {
    const pool = require('../config/db');
    const { id } = req.params;
    const { activo } = req.body;
    await pool.query(
      'UPDATE usuarios SET activo = ? WHERE id = ?',
      [activo, id]
    );
    res.json({ mensaje: 'Estado actualizado' });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;