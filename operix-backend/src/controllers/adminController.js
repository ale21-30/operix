const pool = require('../config/db');
const bcrypt = require('bcryptjs');

const getResumen = async (req, res) => {
  try {
    const hoy = new Date().toISOString().split('T')[0];

    const [[turnosHoy]]     = await pool.query(`SELECT COUNT(*) as total FROM turnos WHERE DATE(entrada_hora) = ?`, [hoy]);
    const [[turnosActivos]] = await pool.query(`SELECT COUNT(*) as total FROM turnos WHERE estado = 'activo'`);
    const [[totalEmpleados]]= await pool.query(`SELECT COUNT(*) as total FROM usuarios WHERE rol = 'empleado' AND activo = true`);
    const [[totalSedes]]    = await pool.query(`SELECT COUNT(*) as total FROM sedes WHERE activa = true`);

    res.json({
      turnos_hoy:      turnosHoy.total,
      turnos_activos:  turnosActivos.total,
      total_empleados: totalEmpleados.total,
      total_sedes:     totalSedes.total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const getTurnos = async (req, res) => {
  try {
    const { fecha, empleado_id, limite = 50 } = req.query;

    let query = `
      SELECT t.id, u.nombre AS empleado, s.nombre AS sede,
             t.entrada_hora, t.salida_hora, t.estado,
             t.entrada_foto, t.salida_foto,
             ROUND(TIMESTAMPDIFF(MINUTE, t.entrada_hora,
               COALESCE(t.salida_hora, NOW())) / 60, 2) AS horas_trabajadas
      FROM turnos t
      JOIN usuarios u ON t.usuario_id = u.id
      JOIN sedes    s ON t.sede_id    = s.id
      WHERE 1=1
    `;
    const params = [];

    if (fecha) {
      query += ` AND DATE(t.entrada_hora) = ?`;
      params.push(fecha);
    }
    if (empleado_id) {
      query += ` AND t.usuario_id = ?`;
      params.push(empleado_id);
    }

    query += ` ORDER BY t.entrada_hora DESC LIMIT ?`;
    params.push(parseInt(limite));

    const [turnos] = await pool.query(query, params);
    res.json({ turnos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const getEmpleados = async (req, res) => {
  try {
    const [empleados] = await pool.query(
      `SELECT id, nombre, email, rol, activo FROM usuarios ORDER BY nombre`
    );
    res.json({ empleados });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const crearEmpleado = async (req, res) => {
  try {
    const { nombre, email, password, rol = 'empleado' } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
    }

    const hash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, ?)`,
      [nombre, email, hash, rol]
    );

    res.json({ mensaje: 'Empleado creado correctamente' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Ya existe un usuario con ese email' });
    }
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const getSedes = async (req, res) => {
  try {
    const [sedes] = await pool.query(`SELECT * FROM sedes ORDER BY nombre`);
    res.json({ sedes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const crearSede = async (req, res) => {
  try {
    const { nombre, direccion, latitud, longitud, radio_metros = 100 } = req.body;

    if (!nombre || !latitud || !longitud) {
      return res.status(400).json({ error: 'Nombre, latitud y longitud son requeridos' });
    }

    await pool.query(
      `INSERT INTO sedes (nombre, direccion, latitud, longitud, radio_metros) VALUES (?, ?, ?, ?, ?)`,
      [nombre, direccion, latitud, longitud, radio_metros]
    );

    res.json({ mensaje: 'Sede creada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

module.exports = { getResumen, getTurnos, getEmpleados, crearEmpleado, getSedes, crearSede };