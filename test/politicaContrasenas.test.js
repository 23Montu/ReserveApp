const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { describe, test } = require('node:test');
const { AuthController } = require('../src/controllers/AuthController');
const {
  RUTA_LISTA,
  analizarLista,
  esContrasenaComun,
} = require('../src/seguridad/contrasenasComunes');

/** Todos los datos de este archivo son ficticios y solo existen durante la prueba. */
const SECRETO_FICTICIO = 'secreto-ficticio-solo-para-pruebas-automatizadas';
const LONGITUD_MINIMA = 15;
const LONGITUD_MAXIMA = 128;
const LLAVE = '\u{1F511}'; // Un punto de código que ocupa dos unidades UTF-16.

const controlador = new AuthController(SECRETO_FICTICIO);
let contadorCorreos = 0;

/**
 * Crea un correo sin usar para que cada caso registre su propia cuenta.
 * @returns {string} Correo ficticio.
 */
function correoNuevo() {
  contadorCorreos += 1;
  return `prueba${contadorCorreos}@example.com`;
}

/**
 * Registra una cuenta nueva con la contraseña indicada.
 * @param {string} contrasena Contraseña para registrar.
 * @param {string} [correo] Correo de la cuenta; por defecto, uno sin usar.
 * @returns {Promise<import('../src/controllers/AuthController').ResultadoAuth>} Resultado.
 */
function registrar(contrasena, correo = correoNuevo()) {
  return controlador.registrar({ correo, contrasena });
}

describe('longitud de la contraseña', () => {
  const casos = [
    { nombre: '14 caracteres', contrasena: 'k'.repeat(14), estado: 400, error: /al menos 15/ },
    { nombre: '15 caracteres', contrasena: 'k'.repeat(15), estado: 201 },
    { nombre: '128 caracteres', contrasena: 'k'.repeat(128), estado: 201 },
    { nombre: '129 caracteres', contrasena: 'k'.repeat(129), estado: 400, error: /superar los 128/ },
    // Los emojis prueban que se cuentan puntos de código y no unidades UTF-16.
    { nombre: '14 emojis (28 UTF-16)', contrasena: LLAVE.repeat(14), estado: 400, error: /al menos 15/ },
    { nombre: '15 emojis (30 UTF-16)', contrasena: LLAVE.repeat(15), estado: 201 },
    { nombre: '128 emojis (256 UTF-16)', contrasena: LLAVE.repeat(128), estado: 201 },
    { nombre: '129 emojis (258 UTF-16)', contrasena: LLAVE.repeat(129), estado: 400, error: /superar los 128/ },
  ];

  for (const { nombre, contrasena, estado, error } of casos) {
    test(`${nombre}: responde ${estado}`, async () => {
      const resultado = await registrar(contrasena);
      assert.equal(resultado.estado, estado);
      if (error) {
        assert.match(resultado.error, error);
      }
    });
  }
});

describe('composición de la contraseña', () => {
  const aceptadas = {
    'frase con espacios y solo minúsculas': 'el cafe de pasto sabe mejor',
    'solo mayúsculas': 'ELCAFEDEPASTOSABEMEJOR',
    'solo dígitos fuera de la lista': '739201846527193',
    'solo símbolos': '!#$%&/()=?¡*+-_.:,;',
    'letras acentuadas y emojis': `añoranza de páramo ${LLAVE}`,
  };

  for (const [nombre, contrasena] of Object.entries(aceptadas)) {
    test(`acepta ${nombre}`, async () => {
      assert.equal((await registrar(contrasena)).estado, 201);
    });
  }

  test('conserva los espacios del inicio y del final', async () => {
    const correo = correoNuevo();
    const contrasena = '  frase con espacios externos  ';
    assert.equal((await registrar(contrasena, correo)).estado, 201);

    const sinEspacios = contrasena.trim();
    assert.equal((await controlador.iniciarSesion({ correo, contrasena })).estado, 200);
    assert.equal((await controlador.iniciarSesion({ correo, contrasena: sinEspacios })).estado, 401);
  });
});

describe('sin truncar', () => {
  test('una contraseña de 128 caracteres se verifica completa', async () => {
    const correo = correoNuevo();
    const contrasena = `${'k'.repeat(127)}a`;
    assert.equal((await registrar(contrasena, correo)).estado, 201);

    const intentos = [
      { contrasena, estado: 200 },
      { contrasena: contrasena.slice(0, 127), estado: 401 },
      { contrasena: `${'k'.repeat(127)}b`, estado: 401 },
    ];
    for (const intento of intentos) {
      const resultado = await controlador.iniciarSesion({ correo, contrasena: intento.contrasena });
      assert.equal(resultado.estado, intento.estado);
    }
  });

  test('el formulario no limita la longitud con un atributo que corte lo pegado', () => {
    const vista = path.join(__dirname, '..', 'src', 'views', 'cuenta.html');
    assert.doesNotMatch(fs.readFileSync(vista, 'utf8'), /maxlength\s*=/i);
  });
});

describe('lista de contraseñas comunes', () => {
  const incluidas = [
    '123456789012345',
    'aaaaaaaaaaaaaaa',
    'qwertyuiopasdfgh',
    'passwordpassword',
    'password password',
    'contraseña123456',
    'reserveapp12345',
  ];

  for (const contrasena of incluidas) {
    test(`rechaza "${contrasena}" y pide una menos común`, async () => {
      const resultado = await registrar(contrasena);
      assert.equal(resultado.estado, 400);
      assert.match(resultado.error, /menos común/);
    });
  }

  const variantes = {
    'en mayúsculas': 'PASSWORDPASSWORD',
    'con mayúsculas mezcladas': 'PassWordPassWord',
    'en dígitos de ancho completo': '１２３４５６７８９０１２３４５',
  };

  for (const [nombre, contrasena] of Object.entries(variantes)) {
    test(`rechaza un valor de la lista ${nombre}`, async () => {
      assert.equal((await registrar(contrasena)).estado, 400);
    });
  }

  // No hay una prohibición general de secuencias o repeticiones: solo lo que está en la lista.
  const noIncluidas = {
    'una repetición no listada': 'kkkkkkkkkkkkkkk',
    'una secuencia no listada': '345678901234567',
    'una frase que contiene un valor de la lista': 'passwordpassword mas texto propio',
    'un valor de la lista con un carácter de más': '123456789012345x',
  };

  for (const [nombre, contrasena] of Object.entries(noIncluidas)) {
    test(`acepta ${nombre}`, async () => {
      assert.equal(esContrasenaComun(contrasena), false);
      assert.equal((await registrar(contrasena)).estado, 201);
    });
  }

  test('una contraseña rechazada no crea la cuenta', async () => {
    const correo = correoNuevo();
    const comun = 'passwordpassword';
    assert.equal((await registrar(comun, correo)).estado, 400);
    assert.equal((await controlador.iniciarSesion({ correo, contrasena: comun })).estado, 401);
    assert.equal((await registrar('el cafe de pasto sabe mejor', correo)).estado, 201);
  });

  test('no escribe contraseñas en los logs ni las devuelve', async (t) => {
    const metodos = ['log', 'info', 'warn', 'error', 'debug'];
    const espias = metodos.map((metodo) => t.mock.method(console, metodo, () => {}));
    const contrasenas = ['passwordpassword', 'k'.repeat(14), 'el cafe de pasto sabe mejor'];

    for (const contrasena of contrasenas) {
      const resultado = await registrar(contrasena);
      assert.equal(JSON.stringify(resultado).includes(contrasena), false);
    }

    for (const espia of espias) {
      assert.equal(espia.mock.callCount(), 0);
    }
  });
});

describe('archivo de la lista', () => {
  const contenido = fs.readFileSync(RUTA_LISTA, 'utf8');
  const entradas = analizarLista(contenido);

  test('tiene entradas', () => {
    assert.ok(entradas.size > 0);
  });

  test('cada entrada puede coincidir con una contraseña de longitud válida', () => {
    for (const entrada of entradas) {
      const longitud = [...entrada].length;
      assert.ok(
        longitud >= LONGITUD_MINIMA && longitud <= LONGITUD_MAXIMA,
        `"${entrada}" tiene ${longitud} caracteres`,
      );
    }
  });

  test('no repite entradas', () => {
    const lineas = contenido
      .split(/\r?\n/)
      .map((linea) => linea.trim())
      .filter((linea) => linea && !linea.startsWith('#'));
    assert.equal(lineas.length, entradas.size);
  });

  test('admite saltos de línea de Windows, comentarios y líneas vacías', () => {
    const lista = analizarLista('# comentario\r\n\r\n  ValorDeEjemplo  \r\nOtro valor\n');
    assert.deepEqual([...lista], ['valordeejemplo', 'otro valor']);
  });
});
