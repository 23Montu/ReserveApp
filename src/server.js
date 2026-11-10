const path = require('path');
const express = require('express');
const HabitacionController = require('./controllers/HabitacionController');
const ResumenReservaController = require('./controllers/ResumenReservaController');

const PUERTO = process.env.PORT || 3000;

const app = express();
const habitacionController = new HabitacionController();
const resumenReservaController = new ResumenReservaController(habitacionController);

app.use(express.static(path.join(__dirname, 'views')));

app.get('/api/habitaciones/tipos', (req, res) => {
  res.json({ tipos: habitacionController.listarTipos() });
});

app.get('/api/habitaciones/disponibles', (req, res) => {
  const resultado = habitacionController.buscarDisponibles(req.query);
  res.status(resultado.error ? 400 : 200).json(resultado);
});

// Solo consulta: el resumen no guarda nada. La tarifa sale de los datos del servidor.
app.get('/api/reservas/resumen', (req, res) => {
  const { estado, ...resultado } = resumenReservaController.generarResumen(req.query);
  res.status(estado).json(resultado);
});

app.listen(PUERTO, '127.0.0.1', () => {
  console.log(`ReserveApp disponible en http://localhost:${PUERTO}`);
});
