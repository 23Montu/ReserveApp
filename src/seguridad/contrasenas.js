const crypto = require('node:crypto');
const { promisify } = require('node:util');

const LONGITUD_SAL = 16;
const LONGITUD_HASH = 32;

/** Parámetros mínimos recomendados por el OWASP Password Storage Cheat Sheet. */
const ARGON2ID = { m: 19456, t: 2, p: 1 };
const SCRYPT = { n: 2 ** 17, r: 8, p: 1 };

const scrypt = promisify(crypto.scrypt);
// crypto.argon2 solo existe en versiones recientes de Node; las anteriores usan scrypt.
const argon2 = crypto.argon2 ? promisify(crypto.argon2) : null;

/**
 * Funciones de derivación por algoritmo. Los parámetros se guardan junto al hash,
 * por lo que un hash se puede verificar aunque luego cambien los valores por defecto.
 */
const DERIVADORES = {
  argon2id: ({ m, t, p }, contrasena, sal, longitud) => argon2('argon2id', {
    message: contrasena,
    nonce: sal,
    memory: m,
    passes: t,
    parallelism: p,
    tagLength: longitud,
  }),
  scrypt: ({ n, r, p }, contrasena, sal, longitud) => scrypt(contrasena, sal, longitud, {
    N: n,
    r,
    p,
    // El valor por defecto de Node (32 MiB) no alcanza para los parámetros de OWASP.
    maxmem: 256 * n * r,
  }),
};

/**
 * Unifica las distintas representaciones Unicode de una misma contraseña con NFKC, para
 * que funcione igual sin importar el teclado o sistema operativo con que se escriba.
 * Es el único criterio de normalización para guardar, verificar y medir la longitud de
 * una contraseña: así la longitud validada es la del texto que realmente se protege.
 * No cambia mayúsculas ni minúsculas.
 * @param {string} contrasena Contraseña recibida.
 * @returns {string} Contraseña normalizada.
 */
function normalizarContrasena(contrasena) {
  return contrasena.normalize('NFKC');
}

/**
 * Codifica bytes en Base64 sin relleno, como exige el formato PHC.
 * @param {Buffer} bytes Bytes para codificar.
 * @returns {string} Texto codificado.
 */
function aBase64(bytes) {
  return bytes.toString('base64').replace(/=+$/, '');
}

/**
 * Calcula el hash de una contraseña con una sal aleatoria.
 * Usa Argon2id si Node lo incluye y scrypt en caso contrario.
 * @param {string} contrasena Contraseña en texto plano.
 * @returns {Promise<string>} Hash en formato PHC, con algoritmo, parámetros y sal.
 */
async function hashearContrasena(contrasena) {
  const sal = crypto.randomBytes(LONGITUD_SAL);
  const texto = normalizarContrasena(contrasena);

  if (argon2) {
    const hash = await DERIVADORES.argon2id(ARGON2ID, texto, sal, LONGITUD_HASH);
    const { m, t, p } = ARGON2ID;
    return `$argon2id$v=19$m=${m},t=${t},p=${p}$${aBase64(sal)}$${aBase64(hash)}`;
  }

  const hash = await DERIVADORES.scrypt(SCRYPT, texto, sal, LONGITUD_HASH);
  const { n, r, p } = SCRYPT;
  return `$scrypt$n=${n},r=${r},p=${p}$${aBase64(sal)}$${aBase64(hash)}`;
}

/**
 * Comprueba una contraseña contra un hash guardado, en tiempo constante.
 * @param {string} contrasena Contraseña en texto plano.
 * @param {string} hashGuardado Hash creado por `hashearContrasena`.
 * @returns {Promise<boolean>} `true` si la contraseña coincide.
 */
async function verificarContrasena(contrasena, hashGuardado) {
  const partes = hashGuardado.split('$');
  const algoritmo = partes[1];
  const parametros = Object.fromEntries(partes.at(-3).split(',').map((parametro) => {
    const [clave, valor] = parametro.split('=');
    return [clave, Number(valor)];
  }));
  const sal = Buffer.from(partes.at(-2), 'base64');
  const esperado = Buffer.from(partes.at(-1), 'base64');

  const calculado = await DERIVADORES[algoritmo](
    parametros,
    normalizarContrasena(contrasena),
    sal,
    esperado.length,
  );
  return crypto.timingSafeEqual(calculado, esperado);
}

module.exports = { hashearContrasena, normalizarContrasena, verificarContrasena };
