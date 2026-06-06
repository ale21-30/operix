const jwt = require('jsonwebtoken');

// Función que verifica el token en cada petición protegida
const verificarToken = (req, res, next) => {

  // Busca el token en el header "Authorization"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  // Si no hay token, rechaza la petición
  if (!token) {
    return res.status(401).json({ error: 'Acceso denegado' });
  }

  // Verifica que el token sea válido
  try {
    const usuario = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = usuario; // Guarda los datos del usuario en la petición
    next();               // Continúa al siguiente paso
  } catch (err) {
    res.status(403).json({ error: 'Token inválido' });
  }
};

module.exports = { verificarToken };