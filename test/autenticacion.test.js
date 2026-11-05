const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const { once } = require('node:events');
const net = require('node:net');
const path = require('node:path');
const { after, before, describe, test } = require('node:test');
const { setTimeout: esperar } = require('node:timers/promises');

/**
 * Prueba HU01 (Issue #1) contra el servidor real, porque la cookie y el cuerpo de las
 * respuestas se definen en server.js, no en el controlador. Los datos son ficticios.
 *
 * No fija decisiones pendientes de DOCS/01_requisitos.md: ni cómo responde un registro con
 * un correo ya usado, ni si el token sigue vigente tras cerrar sesión, ni cómo se normalizan
 * las contraseñas.
 */
const RAIZ = path.join(__dirname, '..');
const SECRETO_FICTICIO = 'secreto-ficticio-solo-para-pruebas-automatizadas';
const COOKIE_SESION = 'reserveapp_sesion';
const CONTRASENA = 'frase ficticia para estas pruebas';
const OTRA_CONTRASENA = 'otra frase ficticia para estas pruebas';
const ERROR_CORREO = 'Ingresa un correo electrónico válido.';
const ERROR_CONTRASENA = 'Ingresa una contraseña.';
const ERROR_LOGIN_INCOMPLETO = 'Ingresa tu correo y tu contraseña.';
const ERROR_SOLICITUD = 'La solicitud no es válida.';
const HASH_DE_CONTRASENA = /\$(argon2id|scrypt)\$/;

let servidor;
let urlBase;
let registros = '';
let contadorCorreos = 0;

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

/**
 * Crea un correo sin usar para que cada caso registre su propia cuenta.
 * @returns {string} Correo ficticio.
 */
function correoNuevo() {
  contadorCorreos += 1;
  return `persona${contadorCorreos}@example.com`;
}

/**
 * Envía una solicitud al servidor de prueba.
 * @param {string} metodo Método HTTP.
 * @param {string} ruta Ruta de la API.
 * @param {{cuerpo?: object, cookie?: string}} [opciones] Cuerpo JSON y valor de la cookie de sesión.
 * @returns {Promise<{estado: number, encabezados: Headers, texto: string, datos: any}>} Respuesta.
 */
async function solicitar(metodo, ruta, { cuerpo, cookie } = {}) {
  const respuesta = await fetch(`${urlBase}${ruta}`, {
    method: metodo,
    headers: {
      ...(cuerpo === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(cookie === undefined ? {} : { Cookie: `${COOKIE_SESION}=${cookie}` }),
    },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  const texto = await respuesta.text();
  return {
    estado: respuesta.status,
    encabezados: respuesta.headers,
    texto,
    datos: texto ? JSON.parse(texto) : undefined,
  };
}

/**
 * Envía el formulario de registro.
 * @param {object} cuerpo Datos del formulario.
 * @returns {ReturnType<typeof solicitar>} Respuesta.
 */
function registrar(cuerpo) {
  return solicitar('POST', '/api/auth/registro', { cuerpo });
}

/**
 * Envía el formulario de inicio de sesión.
 * @param {object} cuerpo Datos del formulario.
 * @returns {ReturnType<typeof solicitar>} Respuesta.
 */
function iniciarSesion(cuerpo) {
  return solicitar('POST', '/api/auth/login', { cuerpo });
}

/**
 * Consulta la sesión actual.
 * @param {string} [cookie] Valor de la cookie de sesión.
 * @returns {ReturnType<typeof solicitar>} Respuesta.
 */
function consultarSesion(cookie) {
  return solicitar('GET', '/api/auth/sesion', { cookie });
}

/**
 * Lee la cookie que una respuesta pide guardar.
 * @param {{encabezados: Headers}} respuesta Respuesta recibida.
 * @returns {{nombre: string, valor: string, atributos: Map<string, string>}|null} Cookie, si existe.
 */
function leerCookie({ encabezados }) {
  const encabezado = encabezados.get('set-cookie');
  if (!encabezado) {
    return null;
  }
  const [par, ...atributos] = encabezado.split(';').map((parte) => parte.trim());
  const [nombre, valor] = par.split('=');
  return {
    nombre,
    valor,
    atributos: new Map(atributos.map((atributo) => {
      const [clave, contenido = ''] = atributo.split('=');
      return [clave.toLowerCase(), contenido];
    })),
  };
}

/**
 * Registra una cuenta nueva e inicia sesión con ella.
 * @returns {Promise<{correo: string, login: object, cookie: object}>} Cuenta, respuesta y cookie.
 */
async function crearSesion() {
  const correo = correoNuevo();
  assert.equal((await registrar({ correo, contrasena: CONTRASENA })).estado, 201);
  const login = await iniciarSesion({ correo, contrasena: CONTRASENA });
  assert.equal(login.estado, 200);
  return { correo, login, cookie: leerCookie(login) };
}

describe('registro e inicio de sesión con el servidor real', () => {
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

  describe('formato del correo', () => {
    const invalidos = {
      'sin arroba': 'sin-arroba',
      'sin dominio': 'persona@',
      'sin nombre': '@example.com',
      'sin punto en el dominio': 'persona@example',
      'con dos arrobas': 'persona@@example.com',
      'con un espacio interno': 'per sona@example.com',
      'con un dominio que empieza en punto': 'persona@.example.com',
      'con puntos seguidos en el dominio': 'persona@example..com',
      'con un dominio que termina en punto': 'persona@example.com.',
      'de 255 caracteres': `${'a'.repeat(243)}@example.com`,
    };

    for (const [nombre, correo] of Object.entries(invalidos)) {
      test(`rechaza un correo ${nombre}`, async () => {
        const resultado = await registrar({ correo, contrasena: CONTRASENA });
        assert.equal(resultado.estado, 400);
        assert.deepEqual(resultado.datos, { error: ERROR_CORREO });
      });
    }

    const validos = {
      'con subdominio y etiqueta': 'nombre.apellido+etiqueta@correo.example.com',
      'de 254 caracteres': `${'b'.repeat(242)}@example.com`,
    };

    for (const [nombre, correo] of Object.entries(validos)) {
      test(`acepta un correo ${nombre}`, async () => {
        const resultado = await registrar({ correo, contrasena: CONTRASENA });
        assert.equal(resultado.estado, 201);
        assert.equal(resultado.datos.usuario.correo, correo);
      });
    }
  });

  describe('normalización del correo', () => {
    test('guarda el correo en minúsculas y sin espacios externos', async () => {
      const resultado = await registrar({ correo: '  Persona.A@Example.COM ', contrasena: CONTRASENA });
      assert.equal(resultado.estado, 201);
      assert.equal(resultado.datos.usuario.correo, 'persona.a@example.com');
    });

    test('inicia sesión sin importar las mayúsculas ni los espacios externos', async () => {
      const correo = 'persona.b@example.com';
      assert.equal((await registrar({ correo, contrasena: CONTRASENA })).estado, 201);

      for (const variante of ['PERSONA.B@EXAMPLE.COM', ' persona.b@example.com ', 'Persona.B@example.com']) {
        const resultado = await iniciarSesion({ correo: variante, contrasena: CONTRASENA });
        assert.equal(resultado.estado, 200);
        assert.equal(resultado.datos.usuario.correo, correo);
      }
    });
  });

  // No fija cómo responde el segundo registro: revelar si un correo existe sigue pendiente.
  describe('correo duplicado', () => {
    const variantes = {
      'con el mismo correo': (correo) => correo,
      'con el correo en mayúsculas': (correo) => correo.toUpperCase(),
      'con espacios externos en el correo': (correo) => `  ${correo} `,
    };

    for (const [nombre, variar] of Object.entries(variantes)) {
      test(`un registro ${nombre} no reemplaza la cuenta original`, async () => {
        const correo = correoNuevo();
        const variante = variar(correo);
        assert.equal((await registrar({ correo, contrasena: CONTRASENA })).estado, 201);

        await registrar({ correo: variante, contrasena: OTRA_CONTRASENA });

        assert.equal((await iniciarSesion({ correo, contrasena: CONTRASENA })).estado, 200);
        for (const intento of [correo, variante]) {
          assert.equal((await iniciarSesion({ correo: intento, contrasena: OTRA_CONTRASENA })).estado, 401);
        }
      });
    }
  });

  describe('rol de las cuentas registradas', () => {
    for (const rol of ['RECEPCIONISTA', 'LIMPIEZA', 'ADMINISTRADOR']) {
      test(`ignora el rol ${rol} enviado por el cliente`, async () => {
        const correo = correoNuevo();
        const registro = await registrar({ correo, contrasena: CONTRASENA, rol });
        assert.equal(registro.estado, 201);
        assert.equal(registro.datos.usuario.rol, 'HUESPED');

        const login = await iniciarSesion({ correo, contrasena: CONTRASENA, rol });
        assert.equal(login.datos.usuario.rol, 'HUESPED');

        const sesion = await consultarSesion(leerCookie(login).valor);
        assert.equal(sesion.datos.usuario.rol, 'HUESPED');
      });
    }
  });

  describe('cookie de sesión', () => {
    test('el inicio de sesión guarda el token en una cookie HttpOnly', async () => {
      const { cookie } = await crearSesion();

      assert.equal(cookie.nombre, COOKIE_SESION);
      assert.equal(cookie.valor.split('.').length, 3);
      assert.equal(cookie.atributos.has('httponly'), true);
      assert.equal(cookie.atributos.get('samesite'), 'Strict');
      assert.equal(cookie.atributos.get('path'), '/');
      assert.equal(cookie.atributos.get('max-age'), '3600');
    });

    test('la cookie identifica la sesión', async () => {
      const { correo, cookie } = await crearSesion();
      const sesion = await consultarSesion(cookie.valor);
      assert.deepEqual(sesion.datos, { usuario: { correo, rol: 'HUESPED' } });
    });

    test('un inicio de sesión fallido no crea la cookie', async () => {
      const correo = correoNuevo();
      assert.equal((await registrar({ correo, contrasena: CONTRASENA })).estado, 201);

      const errada = await iniciarSesion({ correo, contrasena: OTRA_CONTRASENA });
      const inexistente = await iniciarSesion({ correo: correoNuevo(), contrasena: CONTRASENA });
      for (const resultado of [errada, inexistente]) {
        assert.equal(resultado.estado, 401);
        assert.equal(leerCookie(resultado), null);
      }
    });

    test('registrarse no inicia sesión', async () => {
      const resultado = await registrar({ correo: correoNuevo(), contrasena: CONTRASENA });
      assert.equal(resultado.estado, 201);
      assert.equal(leerCookie(resultado), null);
    });
  });

  describe('token fuera del cuerpo JSON', () => {
    test('la respuesta del inicio de sesión solo trae los datos públicos', async () => {
      const { correo, login, cookie } = await crearSesion();
      assert.deepEqual(login.datos, { usuario: { correo, rol: 'HUESPED' } });
      assert.equal(login.texto.includes(cookie.valor), false);
    });

    test('la consulta de la sesión no devuelve el token ni se guarda en caché', async () => {
      const { correo, cookie } = await crearSesion();
      const sesion = await consultarSesion(cookie.valor);

      assert.deepEqual(sesion.datos, { usuario: { correo, rol: 'HUESPED' } });
      assert.equal(sesion.texto.includes(cookie.valor), false);
      assert.equal(sesion.encabezados.get('cache-control'), 'no-store');
    });

    test('la respuesta del registro no trae token, hash ni contraseña', async () => {
      const correo = correoNuevo();
      const resultado = await registrar({ correo, contrasena: CONTRASENA });

      assert.deepEqual(resultado.datos.usuario, { correo, rol: 'HUESPED' });
      assert.equal('token' in resultado.datos, false);
      assert.doesNotMatch(resultado.texto, HASH_DE_CONTRASENA);
      assert.equal(resultado.texto.includes(CONTRASENA), false);
    });
  });

  // No comprueba si el token anterior sigue vigente: esa decisión sigue pendiente.
  describe('cierre de sesión', () => {
    test('borra la cookie con los mismos atributos con que se creó', async () => {
      const { cookie } = await crearSesion();
      const resultado = await solicitar('POST', '/api/auth/logout', { cookie: cookie.valor });

      assert.equal(resultado.estado, 204);
      assert.equal(resultado.texto, '');

      const borrada = leerCookie(resultado);
      assert.equal(borrada.nombre, COOKIE_SESION);
      assert.equal(borrada.valor, '');
      assert.equal(borrada.atributos.has('httponly'), true);
      assert.equal(borrada.atributos.get('samesite'), 'Strict');
      assert.equal(borrada.atributos.get('path'), '/');
      assert.ok(Date.parse(borrada.atributos.get('expires')) < Date.now());
    });

    test('un navegador sin la cookie ya no tiene sesión', async () => {
      const sesion = await consultarSesion();
      assert.equal(sesion.estado, 200);
      assert.deepEqual(sesion.datos, { usuario: null });
    });

    test('responde igual si no había sesión', async () => {
      const resultado = await solicitar('POST', '/api/auth/logout');
      assert.equal(resultado.estado, 204);
    });
  });

  describe('solicitudes sin credenciales', () => {
    const registrosIncompletos = {
      'sin datos': { cuerpo: {}, error: ERROR_CORREO },
      'solo con contraseña': { cuerpo: { contrasena: CONTRASENA }, error: ERROR_CORREO },
      'solo con correo': { cuerpo: { correo: 'incompleto@example.com' }, error: ERROR_CONTRASENA },
      'con un correo que no es texto': { cuerpo: { correo: 123, contrasena: CONTRASENA }, error: ERROR_CORREO },
      'con una contraseña que no es texto': {
        cuerpo: { correo: 'incompleto@example.com', contrasena: 123456789012345 },
        error: ERROR_CONTRASENA,
      },
    };

    for (const [nombre, { cuerpo, error }] of Object.entries(registrosIncompletos)) {
      test(`rechaza un registro ${nombre}`, async () => {
        const resultado = await registrar(cuerpo);
        assert.equal(resultado.estado, 400);
        assert.deepEqual(resultado.datos, { error });
      });
    }

    const loginsIncompletos = {
      'sin datos': {},
      'solo con correo': { correo: 'incompleto@example.com' },
      'solo con contraseña': { contrasena: CONTRASENA },
      'con la contraseña vacía': { correo: 'incompleto@example.com', contrasena: '' },
      'con una contraseña que no es texto': { correo: 'incompleto@example.com', contrasena: 123456789012345 },
    };

    for (const [nombre, cuerpo] of Object.entries(loginsIncompletos)) {
      test(`rechaza un inicio de sesión ${nombre}`, async () => {
        const resultado = await iniciarSesion(cuerpo);
        assert.equal(resultado.estado, 400);
        assert.deepEqual(resultado.datos, { error: ERROR_LOGIN_INCOMPLETO });
        assert.equal(leerCookie(resultado), null);
      });
    }
  });

  describe('registros del servidor', () => {
    test('no contienen contraseñas, correos, tokens ni hashes', async () => {
      const inicio = registros.length;
      const correo = correoNuevo();
      const contrasena = 'contrasena-marcadora-que-no-debe-aparecer';

      await registrar({ correo, contrasena });
      await registrar({ correo, contrasena });
      await registrar({ correo: 'sin-arroba', contrasena });
      await iniciarSesion({ correo, contrasena: `${contrasena}-errada` });

      const login = await iniciarSesion({ correo, contrasena });
      const { valor: token } = leerCookie(login);
      await consultarSesion(token);
      await solicitar('POST', '/api/auth/logout', { cookie: token });

      // Un cuerpo que supera el límite de 10 KB pasa por el manejador de errores.
      const excedido = await registrar({ correo, contrasena: contrasena.repeat(400) });
      assert.equal(excedido.estado, 413);
      assert.deepEqual(excedido.datos, { error: ERROR_SOLICITUD });

      await esperar(100);
      const salida = registros.slice(inicio);
      for (const dato of [contrasena, correo, token]) {
        assert.equal(salida.includes(dato), false);
      }
      assert.doesNotMatch(salida, HASH_DE_CONTRASENA);
    });
  });
});
