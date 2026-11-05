const assert = require('node:assert/strict');
const { createHmac } = require('node:crypto');
const { describe, test } = require('node:test');
const { crearToken, verificarToken } = require('../src/seguridad/jwt');

/**
 * Prueba directamente los tokens de sesión de HU01 (Issue #1), porque jwt.js es código de
 * seguridad escrito a mano. Los secretos y los datos son ficticios.
 */
const SECRETO = 'secreto-ficticio-solo-para-pruebas-automatizadas';
const OTRO_SECRETO = 'otro-secreto-ficticio-solo-para-pruebas-automatizadas';
const DATOS = { sub: 'usuario-ficticio', rol: 'HUESPED' };
const UNA_HORA = 60 * 60;
const ENCABEZADO_VALIDO = { alg: 'HS256', typ: 'JWT' };

/**
 * Codifica un objeto como JSON en Base64URL.
 * @param {object} datos Objeto para codificar.
 * @returns {string} Texto codificado.
 */
function aBase64Url(datos) {
  return Buffer.from(JSON.stringify(datos)).toString('base64url');
}

/**
 * Lee una parte codificada de un token.
 * @param {string} parte Encabezado o carga en Base64URL.
 * @returns {object} Datos de esa parte.
 */
function leerParte(parte) {
  return JSON.parse(Buffer.from(parte, 'base64url').toString());
}

/**
 * Indica la hora actual en segundos, como los campos `iat` y `exp`.
 * @returns {number} Segundos desde la época Unix.
 */
function ahoraEnSegundos() {
  return Math.floor(Date.now() / 1000);
}

/**
 * Arma un token con partes elegidas, firmado de forma correcta salvo que se indique otro secreto.
 * Permite comprobar que un token bien firmado se rechaza por el motivo que se prueba.
 * @param {object} encabezado Encabezado del token.
 * @param {object} carga Carga del token.
 * @param {string} [secreto] Secreto de firma.
 * @returns {string} Token armado.
 */
function armarToken(encabezado, carga, secreto = SECRETO) {
  const contenido = `${aBase64Url(encabezado)}.${aBase64Url(carga)}`;
  const firma = createHmac('sha256', secreto).update(contenido).digest('base64url');
  return `${contenido}.${firma}`;
}

/**
 * Crea una carga que todavía no vence.
 * @returns {object} Carga vigente.
 */
function cargaVigente() {
  return { ...DATOS, exp: ahoraEnSegundos() + UNA_HORA };
}

describe('token válido', () => {
  test('devuelve los datos con los que se creó', () => {
    const datos = verificarToken(crearToken(DATOS, SECRETO, UNA_HORA), SECRETO);
    assert.equal(datos.sub, DATOS.sub);
    assert.equal(datos.rol, DATOS.rol);
  });

  test('vence cuando termina la duración indicada', () => {
    const { iat, exp } = verificarToken(crearToken(DATOS, SECRETO, UNA_HORA), SECRETO);
    assert.equal(exp - iat, UNA_HORA);
    assert.ok(iat <= ahoraEnSegundos());
  });

  test('usa el encabezado HS256', () => {
    const [encabezado] = crearToken(DATOS, SECRETO, UNA_HORA).split('.');
    assert.deepEqual(leerParte(encabezado), ENCABEZADO_VALIDO);
  });

  // Control de las demás pruebas: lo que arma esta prueba es válido si nada se altera.
  test('acepta un token armado con el encabezado, la firma y el vencimiento correctos', () => {
    const datos = verificarToken(armarToken(ENCABEZADO_VALIDO, cargaVigente()), SECRETO);
    assert.equal(datos.sub, DATOS.sub);
  });
});

describe('firma del token', () => {
  for (const [nombre, posicion] of [['primer', 0], ['último', -1]]) {
    test(`rechaza un token con el ${nombre} carácter de la firma cambiado`, () => {
      const [encabezado, carga, firma] = crearToken(DATOS, SECRETO, UNA_HORA).split('.');
      const caracteres = [...firma];
      const indice = posicion < 0 ? caracteres.length + posicion : posicion;
      caracteres[indice] = caracteres[indice] === 'A' ? 'B' : 'A';
      assert.equal(verificarToken(`${encabezado}.${carga}.${caracteres.join('')}`, SECRETO), null);
    });
  }

  test('rechaza un token firmado con otro secreto', () => {
    assert.equal(verificarToken(crearToken(DATOS, OTRO_SECRETO, UNA_HORA), SECRETO), null);
    assert.equal(verificarToken(armarToken(ENCABEZADO_VALIDO, cargaVigente(), OTRO_SECRETO), SECRETO), null);
  });

  const cambiosDeCarga = {
    'el rol': { rol: 'RECEPCIONISTA' },
    'el usuario': { sub: 'otro-usuario-ficticio' },
    'el vencimiento': { exp: ahoraEnSegundos() + 10 * UNA_HORA },
  };

  for (const [nombre, cambio] of Object.entries(cambiosDeCarga)) {
    test(`rechaza un token al que le cambiaron ${nombre} sin volver a firmarlo`, () => {
      const [encabezado, carga, firma] = crearToken(DATOS, SECRETO, UNA_HORA).split('.');
      const alterada = aBase64Url({ ...leerParte(carga), ...cambio });
      assert.equal(verificarToken(`${encabezado}.${alterada}.${firma}`, SECRETO), null);
    });
  }

  test('rechaza una firma vacía', () => {
    const [encabezado, carga] = crearToken(DATOS, SECRETO, UNA_HORA).split('.');
    assert.equal(verificarToken(`${encabezado}.${carga}.`, SECRETO), null);
    assert.equal(verificarToken(`${encabezado}.${carga}`, SECRETO), null);
  });

  // Una firma HS256 ocupa 43 bytes: la primera firma falsa tiene esa misma longitud.
  for (const [nombre, firmaFalsa] of [['de igual longitud', `${'ñ'.repeat(21)}a`], ['de otra longitud', 'ñ']]) {
    test(`rechaza sin errores una firma no ASCII ${nombre}`, () => {
      const [encabezado, carga] = crearToken(DATOS, SECRETO, UNA_HORA).split('.');
      assert.equal(verificarToken(`${encabezado}.${carga}.${firmaFalsa}`, SECRETO), null);
    });
  }
});

describe('encabezado del token', () => {
  // Estos tokens sí están bien firmados: solo los rechaza el encabezado.
  const encabezados = {
    'alg none': { alg: 'none', typ: 'JWT' },
    'alg None': { alg: 'None', typ: 'JWT' },
    'alg NONE': { alg: 'NONE', typ: 'JWT' },
    'otro algoritmo': { alg: 'HS512', typ: 'JWT' },
    'los campos en otro orden': { typ: 'JWT', alg: 'HS256' },
    'un campo de más': { ...ENCABEZADO_VALIDO, kid: 'clave-ficticia' },
    'sin alg': { typ: 'JWT' },
  };

  for (const [nombre, encabezado] of Object.entries(encabezados)) {
    test(`rechaza un token bien firmado con ${nombre}`, () => {
      assert.equal(verificarToken(armarToken(encabezado, cargaVigente()), SECRETO), null);
    });
  }

  test('rechaza un token con alg none y sin firma', () => {
    const encabezado = aBase64Url({ alg: 'none', typ: 'JWT' });
    const carga = aBase64Url(cargaVigente());
    assert.equal(verificarToken(`${encabezado}.${carga}.`, SECRETO), null);
    assert.equal(verificarToken(`${encabezado}.${carga}`, SECRETO), null);
  });
});

describe('vencimiento del token', () => {
  test('rechaza un token creado con una duración negativa', () => {
    assert.equal(verificarToken(crearToken(DATOS, SECRETO, -1), SECRETO), null);
  });

  test('rechaza un token al llegar su hora de vencimiento', () => {
    assert.equal(verificarToken(crearToken(DATOS, SECRETO, 0), SECRETO), null);
  });

  test('rechaza un token bien firmado que venció hace un segundo', () => {
    const carga = { ...DATOS, exp: ahoraEnSegundos() - 1 };
    assert.equal(verificarToken(armarToken(ENCABEZADO_VALIDO, carga), SECRETO), null);
  });

  test('acepta un token al que le falta un minuto para vencer', () => {
    const carga = { ...DATOS, exp: ahoraEnSegundos() + 60 };
    assert.equal(verificarToken(armarToken(ENCABEZADO_VALIDO, carga), SECRETO).sub, DATOS.sub);
  });

  const vencimientosNoValidos = {
    'sin vencimiento': {},
    'con un vencimiento que no es un número': { exp: 'nunca' },
    'con un vencimiento nulo': { exp: null },
  };

  for (const [nombre, vencimiento] of Object.entries(vencimientosNoValidos)) {
    test(`rechaza un token bien firmado ${nombre}`, () => {
      const carga = { ...DATOS, ...vencimiento };
      assert.equal(verificarToken(armarToken(ENCABEZADO_VALIDO, carga), SECRETO), null);
    });
  }
});

describe('formato del token', () => {
  const noTextos = {
    'indefinido': undefined,
    'nulo': null,
    'un número': 123,
    'un booleano': true,
    'un objeto': {},
    'una lista': [],
  };

  for (const [nombre, valor] of Object.entries(noTextos)) {
    test(`rechaza ${nombre}`, () => {
      assert.equal(verificarToken(valor, SECRETO), null);
    });
  }

  const textos = {
    'un texto vacío': '',
    'un texto sin puntos': 'texto-ficticio',
    'dos partes': 'parte.ficticia',
    'tres partes que no son un token': 'parte.ficticia.otra',
    'solo puntos': '..',
  };

  for (const [nombre, valor] of Object.entries(textos)) {
    test(`rechaza ${nombre}`, () => {
      assert.equal(verificarToken(valor, SECRETO), null);
    });
  }

  test('rechaza un token válido con una parte de más', () => {
    const token = crearToken(DATOS, SECRETO, UNA_HORA);
    assert.equal(verificarToken(`${token}.parte-ficticia`, SECRETO), null);
  });

  test('rechaza un token sin carga', () => {
    const [encabezado, , firma] = crearToken(DATOS, SECRETO, UNA_HORA).split('.');
    assert.equal(verificarToken(`${encabezado}..${firma}`, SECRETO), null);
  });
});
