const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const pool   = require('../config/db');

// LOGIN — recibe email y password, devuelve un token
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Busca el usuario en la BD por email
const [rows] = await pool.query(
  'SELECT * FROM usuarios WHERE email = ? AND activo = true',
  [email]
);

    // Si no existe el usuario
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const usuario = rows[0];

    // Compara el password con el hash guardado en la BD
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Crea el token JWT con los datos del usuario
    const token = jwt.sign(
      { id: usuario.id, rol: usuario.rol, nombre: usuario.nombre },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }   // El token dura 12 horas (un turno)
    );

    // Responde con el token y datos básicos del usuario
  res.json({
  token,
  usuario: {
    id:           usuario.id,
    nombre:       usuario.nombre,
    rol:          usuario.rol,
    primer_login: usuario.primer_login  // ← agrega esto
  }
});

  } catch (err) {
    res.status(500).json({ error: 'Error del servidor' });
  }
};

const cambiarPassword = async (req, res) => {
  try {
    const { password_nueva } = req.body;
    const usuario_id = req.usuario.id;

    if (!password_nueva || password_nueva.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    const hash = await bcrypt.hash(password_nueva, 10);

    await pool.query(
      `UPDATE usuarios 
       SET password = ?, primer_login = FALSE 
       WHERE id = ?`,
      [hash, usuario_id]
    );

    res.json({ mensaje: 'Contraseña actualizada correctamente' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
};

module.exports = { login, cambiarPassword };