// Librerías necesarias
const express = require('express');
const cors    = require('cors');
require('dotenv').config();

// APP Express
const app = express();

// Middlewares globales
app.use(cors());           // Permite conexiones desde la app y el panel web
app.use(express.json()); // Permite leer JSON en el body de las peticiones


// Importa las rutas
const authRoutes = require('./src/routes/authRoutes');

// Registra las rutas con el prefijo /api
app.use('/api/auth', authRoutes);


// Ruta de prueba — para verificar que el servidor funciona
app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor Operix funcionando ✓' });
});

// Inicia el servidor en el puerto definido en .env
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});