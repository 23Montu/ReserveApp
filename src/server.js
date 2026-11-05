const path = require('path');
const express = require('express');
const HabitacionController = require('./controllers/HabitacionController');
const { AuthController, DURACION_SESION_SEGUNDOS } = require('./controllers/AuthController');

const PUERTO = process.env.PORT || 3000;
const SECRETO_JWT = process.env.JWT_SECRET;
const LONGITUD_MINIMA_SECRETO = 32;
const COOKIE_SESION = 'reserveapp_sesion';
const OPCIONES_COOKIE = {
  httpOnly: true,
  sameSite: 'strict',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

if (!SECRETO_JWT || Buffer.byteLength(SECRETO_JWT) < LONGITUD_MINIMA_SECRETO) {
  console.error(
    `Define la variable de entorno JWT_SECRET con al menos ${LONGITUD_MINIMA_SECRETO} bytes. `
    + 'Consulta "Ejecución Local" en el README.',
  );
  process.exit(1);
}

const app = express();
const habitacionController = new HabitacionController();
const authController = new AuthController(SECRETO_JWT);
const leerJson = express.json({ limit: '10kb' });

/**
 * Lee el valor de una cookie de la solicitud.
 * @param {import('express').Request} req Solicitud recibida.
 * @param {string} nombre Nombre de la cookie.
 * @returns {string|undefined} Valor de la cookie, si existe.
 */
function leerCookie(req, nombre) {
  for (const cookie of (req.headers.cookie ?? '').split(';')) {
    const [clave, valor] = cookie.trim().split('=');
    if (clave === nombre) {
      return valor;
    }
  }
  return undefined;
}

app.use(express.static(path.join(__dirname, 'views')));

app.get('/api/habitaciones/tipos', (req, res) => {
  res.json({ tipos: habitacionController.listarTipos() });
});

app.get('/api/habitaciones/disponibles', (req, res) => {
  const resultado = habitacionController.buscarDisponibles(req.query);
  res.status(resultado.error ? 400 : 200).json(resultado);
});

app.post('/api/auth/registro', leerJson, async (req, res) => {
  const { estado, ...cuerpo } = await authController.registrar(req.body ?? {});
  res.status(estado).json(cuerpo);
});

app.post('/api/auth/login', leerJson, async (req, res) => {
  const { estado, token, ...cuerpo } = await authController.iniciarSesion(req.body ?? {});
  if (token) {
    // La cookie HttpOnly evita que el JavaScript de la página pueda leer el token.
    res.cookie(COOKIE_SESION, token, {
      ...OPCIONES_COOKIE,
      maxAge: DURACION_SESION_SEGUNDOS * 1000,
    });
  }
  res.status(estado).json(cuerpo);
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(COOKIE_SESION, OPCIONES_COOKIE);
  res.status(204).end();
});

app.get('/api/auth/sesion', (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ usuario: authController.obtenerSesion(leerCookie(req, COOKIE_SESION)) });
});

// Responde en JSON para que un cuerpo inválido no devuelva el HTML de error de Express.
app.use((error, req, res, next) => {
  if (error.status >= 400 && error.status < 500) {
    res.status(error.status).json({ error: 'La solicitud no es válida.' });
    return;
  }
  console.error(error);
  res.status(500).json({ error: 'Ocurrió un error interno. Intenta de nuevo.' });
});

app.listen(PUERTO, '127.0.0.1', () => {
  console.log(`ReserveApp disponible en http://localhost:${PUERTO}`);
});
