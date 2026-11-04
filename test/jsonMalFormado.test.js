const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs');
const net = require('node:net');
const path = require('node:path');
const { after, before, describe, test } = require('node:test');
const { setTimeout: esperar } = require('node:timers/promises');

const RAIZ = path.join(__dirname, '..');
const SECRETO_FICTICIO = 'secreto-ficticio-solo-para-pruebas-automatizadas';
const MARCADOR = 'CUERPO-MAL-FORMADO-DE-PRUEBA';
const CUERPO_MAL_FORMADO = `{"dato":"${MARCADOR}"`;
const RASTROS_INTERNOS = /node_modules|[A-Za-z]:\\|\bat\s+\S+\s+\(|SyntaxError/;

/**
 * Rutas que leen JSON. Las de HU04 y HU05 se omiten hasta que esas historias estén en la
 * rama: al combinarlas, la prueba comprueba que el manejador de errores quedó registrado
 * después de sus rutas. Express solo lo aplica a lo que se registró antes de él.
 */
const RUTAS_JSON = [
  { historia: 'HU01', metodo: 'POST', ruta: '/api/auth/registro', archivo: 'src/controllers/AuthController.js' },
  { historia: 'HU01', metodo: 'POST', ruta: '/api/auth/login', archivo: 'src/controllers/AuthController.js' },
  { historia: 'HU04', metodo: 'POST', ruta: '/api/reservas/busqueda', archivo: 'src/controllers/ReservaController.js' },
  { historia: 'HU05', metodo: 'PATCH', ruta: '/api/habitaciones/1/estado', archivo: 'src/views/limpieza.js' },
];

let servidor;
let urlBase;
let registros = '';

/**
 * Pide al sistema un puerto libre de la máquina local.
 * @returns {Promise<number>} Puerto disponible.
 */
function obtenerPuertoLibre() {
  return new Promise((resolve, reject) => {
    const prueba = net.createServer();
    prueba.once('error', reject);
    prueba.listen(0, '127.0.0.1', () => {
      const { port } = prueba.address();
      prueba.close(() => resolve(port));
    });
  });
}

/**
 * Espera a que el servidor anuncie que está listo o a que termine con un error.
 * @returns {Promise<void>}
 */
function esperarServidorListo() {
  return new Promise((resolve, reject) => {
    const limite = setTimeout(() => reject(new Error(`El servidor no inició:\n${registros}`)), 10000);
    servidor.stdout.on('data', () => {
      if (registros.includes('ReserveApp disponible')) {
        clearTimeout(limite);
        resolve();
      }
    });
    servidor.once('exit', (codigo) => {
      clearTimeout(limite);
      reject(new Error(`El servidor terminó con código ${codigo}:\n${registros}`));
    });
  });
}

describe('cuerpo JSON mal formado con el servidor real', () => {
  before(async () => {
    const puerto = await obtenerPuertoLibre();
    urlBase = `http://127.0.0.1:${puerto}`;
    servidor = spawn(process.execPath, ['src/server.js'], {
      cwd: RAIZ,
      env: {
        ...process.env,
        JWT_SECRET: SECRETO_FICTICIO,
        NODE_ENV: 'development',
        PORT: String(puerto),
      },
    });
    servidor.stdout.on('data', (datos) => { registros += datos; });
    servidor.stderr.on('data', (datos) => { registros += datos; });
    await esperarServidorListo();
  });

  after(async () => {
    servidor.removeAllListeners('exit');
    if (servidor.exitCode === null) {
      const terminado = once(servidor, 'exit');
      servidor.kill();
      await terminado;
    }
  });

  for (const { historia, metodo, ruta, archivo } of RUTAS_JSON) {
    const presente = fs.existsSync(path.join(RAIZ, archivo));

    test(
      `${metodo} ${ruta} (${historia}) no expone rutas locales ni escribe en los logs`,
      { skip: presente ? false : `${historia} no está en esta rama` },
      async () => {
        const inicioRegistros = registros.length;

        const respuesta = await fetch(`${urlBase}${ruta}`, {
          method: metodo,
          headers: { 'Content-Type': 'application/json' },
          body: CUERPO_MAL_FORMADO,
        });
        const texto = await respuesta.text();
        await esperar(100);

        assert.equal(respuesta.status, 400);
        assert.match(respuesta.headers.get('content-type'), /application\/json/);
        assert.deepEqual(JSON.parse(texto), { error: 'La solicitud no es válida.' });
        assert.doesNotMatch(texto, RASTROS_INTERNOS);
        assert.equal(texto.includes(RAIZ), false);
        assert.equal(texto.includes(MARCADOR), false);
        assert.equal(registros.slice(inicioRegistros), '');
      },
    );
  }

  test('un cuerpo JSON válido sigue llegando al controlador', async () => {
    const respuesta = await fetch(`${urlBase}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });

    assert.equal(respuesta.status, 400);
    assert.deepEqual(await respuesta.json(), { error: 'Ingresa tu correo y tu contraseña.' });
  });
});
