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
const https = require('https');

router.get('/ml/resumen', verificarToken, soloAdmin, async (req, res) => {
  try {
    const url = 'https://modelo-python-production.up.railway.app/resumen-ml';
    https.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          res.json(JSON.parse(data));
        } catch (e) {
          res.status(500).json({ error: 'Error parseando respuesta ML' });
        }
      });
    }).on('error', (err) => {
      res.status(500).json({ error: 'No se puede conectar al servidor ML' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/ml/entrenar', verificarToken, soloAdmin, async (req, res) => {
  try {
    const url = 'https://modelo-python-production.up.railway.app/entrenar';
    https.get(url, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          res.json(JSON.parse(data));
        } catch (e) {
          res.status(500).json({ error: 'Error parseando respuesta ML' });
        }
      });
    }).on('error', (err) => {
      res.status(500).json({ error: 'No se puede conectar al servidor ML' });
    });
  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Obtener horarios de todos los empleados
router.get('/horarios', verificarToken, soloAdmin, async (req, res) => {
  try {
    const pool = require('../config/db');
    const [horarios] = await pool.query(`
      SELECT 
        h.id, u.id AS usuario_id, u.nombre AS empleado,
        u.email, s.id AS sede_id, s.nombre AS sede,
        h.hora_entrada, h.hora_salida, h.dias, h.activo
      FROM horarios h
      JOIN usuarios u ON h.usuario_id = u.id
      JOIN sedes s ON h.sede_id = s.id
      ORDER BY u.nombre, s.nombre
    `);
    res.json({ horarios });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Crear horario
router.post('/horarios', verificarToken, soloAdmin, async (req, res) => {
  try {
    const pool = require('../config/db');
    const { usuario_id, sede_id, hora_entrada, hora_salida, dias } = req.body;
    if (!usuario_id || !sede_id || !hora_entrada || !hora_salida || !dias) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }
    await pool.query(
      `INSERT INTO horarios (usuario_id, sede_id, hora_entrada, hora_salida, dias)
       VALUES (?, ?, ?, ?, ?)`,
      [usuario_id, sede_id, hora_entrada, hora_salida, dias]
    );
    res.json({ mensaje: 'Horario creado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Actualizar horario
router.put('/horarios/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const pool = require('../config/db');
    const { id } = req.params;
    const { hora_entrada, hora_salida, dias, activo } = req.body;
    await pool.query(
      `UPDATE horarios 
       SET hora_entrada = ?, hora_salida = ?, dias = ?, activo = ?
       WHERE id = ?`,
      [hora_entrada, hora_salida, dias, activo, id]
    );
    res.json({ mensaje: 'Horario actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// Eliminar horario
router.delete('/horarios/:id', verificarToken, soloAdmin, async (req, res) => {
  try {
    const pool = require('../config/db');
    await pool.query('DELETE FROM horarios WHERE id = ?', [req.params.id]);
    res.json({ mensaje: 'Horario eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

router.get('/turnos/:id/detalle', verificarToken, soloAdmin, async (req, res) => {
  try {
    const pool = require('../config/db');
    const { id } = req.params;

    const [turnos] = await pool.query(`
      SELECT t.*, u.nombre AS empleado, s.nombre AS sede,
             ROUND(TIMESTAMPDIFF(MINUTE, t.entrada_hora,
               COALESCE(t.salida_hora, NOW())) / 60, 2) AS horas_trabajadas
      FROM turnos t
      JOIN usuarios u ON t.usuario_id = u.id
      JOIN sedes s ON t.sede_id = s.id
      WHERE t.id = ?
    `, [id]);

    if (turnos.length === 0) {
      return res.status(404).json({ error: 'Turno no encontrado' });
    }

    const [novedades] = await pool.query(
      'SELECT * FROM novedades WHERE turno_id = ? ORDER BY creado_en ASC',
      [id]
    );

    res.json({ turno: turnos[0], novedades });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

module.exports = router;