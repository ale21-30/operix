const pool = require('../config/db');
const cloudinary = require('../config/cloudinary');

// Función para subir foto a Cloudinary desde buffer
const subirFoto = async (file) => {
  if (!file) return null;
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'operix', transformation: [{ width: 1024, quality: 'auto' }] },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(file.buffer);
  });
};

// ─────────────────────────────────────────
// REGISTRAR ENTRADA
// ─────────────────────────────────────────
const registrarEntrada = async (req, res) => {
  try {
    const { sede_id, latitud, longitud } = req.body;
    const usuario_id = req.usuario.id; // viene del token JWT

    // Verifica que el empleado no tenga un turno activo ya
    const [turnoActivo] = await pool.query(
      `SELECT id FROM turnos 
       WHERE usuario_id = ? AND estado = 'activo'`,
      [usuario_id]
    );

    if (turnoActivo.length > 0) {
      return res.status(400).json({ 
        error: 'Ya tienes un turno activo' 
      });
    }

    // Obtiene los datos de la sede para validar GPS
    const [sede] = await pool.query(
      'SELECT * FROM sedes WHERE id = ? AND activa = true',
      [sede_id]
    );

    if (sede.length === 0) {
      return res.status(404).json({ error: 'Sede no encontrada' });
    }

    // Calcula la distancia entre el empleado y la sede
    const distancia = calcularDistancia(
      latitud, longitud,
      sede[0].latitud, sede[0].longitud
    );

    // Verifica que esté dentro del radio permitido
    if (distancia > sede[0].radio_metros) {
      return res.status(400).json({
        error: `Estás a ${Math.round(distancia)}m de la sede. Debes estar a menos de ${sede[0].radio_metros}m`,
        distancia: Math.round(distancia)
      });
    }

    // Maneja la foto si se subió
   const foto = await subirFoto(req.file);

    // Registra la entrada en la BD
    const [resultado] = await pool.query(
      `INSERT INTO turnos 
       (usuario_id, sede_id, entrada_hora, entrada_lat, entrada_lng, entrada_foto)
       VALUES (?, ?, NOW(), ?, ?, ?)`,
      [usuario_id, sede_id, latitud, longitud, foto]
    );

    res.json({
      mensaje: 'Entrada registrada correctamente',
      turno_id: resultado.insertId,
      hora: new Date().toLocaleTimeString('es-EC'),
      sede: sede[0].nombre,
      distancia: Math.round(distancia)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
  const registrarEntrada = async (req, res) => {
  try {
    console.log('📸 Archivo recibido:', req.file);
    console.log('📦 Body recibido:', req.body);
    
    const { sede_id, latitud, longitud } = req.body;
    // ... resto del código ...
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }

};


// ─────────────────────────────────────────
// REGISTRAR SALIDA
// ─────────────────────────────────────────
const registrarSalida = async (req, res) => {
  try {
    const { latitud, longitud } = req.body;
    const usuario_id = req.usuario.id;

    // Busca el turno activo del empleado
    const [turno] = await pool.query(
      `SELECT id FROM turnos 
       WHERE usuario_id = ? AND estado = 'activo'`,
      [usuario_id]
    );

    if (turno.length === 0) {
      return res.status(400).json({ 
        error: 'No tienes un turno activo' 
      });
    }

  const foto = await subirFoto(req.file);

    // Actualiza el turno con la salida
    await pool.query(
      `UPDATE turnos 
       SET salida_hora = NOW(), 
           salida_lat = ?, 
           salida_lng = ?, 
           salida_foto = ?,
           estado = 'completado'
       WHERE id = ?`,
      [latitud, longitud, foto, turno[0].id]
    );

    res.json({
      mensaje: 'Salida registrada correctamente',
      turno_id: turno[0].id,
      hora: new Date().toLocaleTimeString('es-EC')
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// ─────────────────────────────────────────
// INICIAR BREAK
// ─────────────────────────────────────────
const iniciarBreak = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    // Busca el turno activo
    const [turno] = await pool.query(
      `SELECT id FROM turnos 
       WHERE usuario_id = ? AND estado = 'activo'`,
      [usuario_id]
    );

    if (turno.length === 0) {
      return res.status(400).json({ error: 'No tienes un turno activo' });
    }

    // Verifica que no tenga un break abierto
    const [breakActivo] = await pool.query(
      `SELECT id FROM breaks 
       WHERE turno_id = ? AND fin IS NULL`,
      [turno[0].id]
    );

    if (breakActivo.length > 0) {
      return res.status(400).json({ error: 'Ya tienes un break activo' });
    }

    // Registra el inicio del break
    const [resultado] = await pool.query(
      'INSERT INTO breaks (turno_id, inicio) VALUES (?, NOW())',
      [turno[0].id]
    );

    res.json({
      mensaje: 'Break iniciado',
      break_id: resultado.insertId,
      hora_inicio: new Date().toLocaleTimeString('es-EC')
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// ─────────────────────────────────────────
// FINALIZAR BREAK
// ─────────────────────────────────────────
const finalizarBreak = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    // Busca el turno activo
    const [turno] = await pool.query(
      `SELECT id FROM turnos 
       WHERE usuario_id = ? AND estado = 'activo'`,
      [usuario_id]
    );

    if (turno.length === 0) {
      return res.status(400).json({ error: 'No tienes un turno activo' });
    }

    // Busca el break abierto
    const [breakActivo] = await pool.query(
      `SELECT id FROM breaks 
       WHERE turno_id = ? AND fin IS NULL`,
      [turno[0].id]
    );

    if (breakActivo.length === 0) {
      return res.status(400).json({ error: 'No tienes un break activo' });
    }

    // Cierra el break
    await pool.query(
      'UPDATE breaks SET fin = NOW() WHERE id = ?',
      [breakActivo[0].id]
    );

    res.json({
      mensaje: 'Break finalizado',
      hora_fin: new Date().toLocaleTimeString('es-EC')
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// ─────────────────────────────────────────
// REGISTRAR NOVEDAD
// ─────────────────────────────────────────
const registrarNovedad = async (req, res) => {
  try {
    const { descripcion } = req.body;
    const usuario_id = req.usuario.id;

    // Busca el turno activo
    const [turno] = await pool.query(
      `SELECT id FROM turnos 
       WHERE usuario_id = ? AND estado = 'activo'`,
      [usuario_id]
    );

    if (turno.length === 0) {
      return res.status(400).json({ error: 'No tienes un turno activo' });
    }

    const foto = await subirFoto(req.file);

    await pool.query(
      `INSERT INTO novedades (turno_id, descripcion, foto) 
       VALUES (?, ?, ?)`,
      [turno[0].id, descripcion, foto]
    );

    res.json({ mensaje: 'Novedad registrada correctamente' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// ─────────────────────────────────────────
// HISTORIAL DE TURNOS DEL EMPLEADO
// ─────────────────────────────────────────
const obtenerHistorial = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const [turnos] = await pool.query(
      `SELECT t.id, s.nombre AS sede, 
              t.entrada_hora, t.salida_hora,
              t.estado,
              ROUND(
                TIMESTAMPDIFF(MINUTE, t.entrada_hora, 
                  COALESCE(t.salida_hora, NOW())) / 60, 2
              ) AS horas_trabajadas
       FROM turnos t
       JOIN sedes s ON t.sede_id = s.id
       WHERE t.usuario_id = ?
       ORDER BY t.entrada_hora DESC
       LIMIT 30`,
      [usuario_id]
    );

    res.json({ turnos });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

// ─────────────────────────────────────────
// FUNCIÓN AUXILIAR: Cálculo de distancia GPS
// Fórmula de Haversine
// ─────────────────────────────────────────
function calcularDistancia(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; // distancia en metros
}

const estadoBreak = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    const [turno] = await pool.query(
      `SELECT id FROM turnos WHERE usuario_id = ? AND estado = 'activo'`,
      [usuario_id]
    );

    if (turno.length === 0) {
      return res.json({ breakActivo: false });
    }

    const [breakAbierto] = await pool.query(
      `SELECT id, inicio FROM breaks WHERE turno_id = ? AND fin IS NULL`,
      [turno[0].id]
    );

    if (breakAbierto.length === 0) {
      return res.json({ breakActivo: false });
    }

    res.json({
      breakActivo: true,
      horaInicio: new Date(breakAbierto[0].inicio).toLocaleTimeString('es-EC')
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

module.exports = {
  registrarEntrada,
  registrarSalida,
  iniciarBreak,
  finalizarBreak,
  registrarNovedad,
  obtenerHistorial,
  estadoBreak
};

}