const path = require('path');
const express = require('express');
const HabitacionController = require('./controllers/HabitacionController');

const PUERTO = process.env.PORT || 3000;

const app = express();
const habitacionController = new HabitacionController();

app.use(express.static(path.join(__dirname, 'views')));

app.get('/api/habitaciones/tipos', (req, res) => {
  res.json({ tipos: habitacionController.listarTipos() });
});

app.get('/api/habitaciones/disponibles', (req, res) => {
  const resultado = habitacionController.buscarDisponibles(req.query);
  res.status(resultado.error ? 400 : 200).json(resultado);
});

app.listen(PUERTO, '127.0.0.1', () => {
  console.log(`ReserveApp disponible en http://localhost:${PUERTO}`);
});
