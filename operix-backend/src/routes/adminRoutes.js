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

router.get('/resumen',    verificarToken, soloAdmin, getResumen);
router.get('/turnos',     verificarToken, soloAdmin, getTurnos);
router.get('/empleados',  verificarToken, soloAdmin, getEmpleados);
router.post('/empleados', verificarToken, soloAdmin, crearEmpleado);
router.get('/sedes',      verificarToken, soloAdmin, getSedes);
router.post('/sedes',     verificarToken, soloAdmin, crearSede);

module.exports = router;