const { createHmac, timingSafeEqual } = require('node:crypto');

/**
 * Tokens JWT firmados con HS256 usando solo node:crypto, porque el proyecto no tiene
 * una librería de JWT. Se acepta únicamente este encabezado exacto: así un token no
 * puede elegir otro algoritmo, como `none`.
 */
const ENCABEZADO = codificar({ alg: 'HS256', typ: 'JWT' });

/**
 * Codifica un objeto como JSON en Base64URL.
 * @param {object} datos Objeto para codificar.
 * @returns {string} Texto codificado.
 */
function codificar(datos) {
  return Buffer.from(JSON.stringify(datos)).toString('base64url');
}

/**
 * Calcula la firma HS256 de un contenido.
 * @param {string} contenido Encabezado y carga del token.
 * @param {string} secreto Secreto de firma.
 * @returns {string} Firma en Base64URL.
 */
function firmar(contenido, secreto) {
  return createHmac('sha256', secreto).update(contenido).digest('base64url');
}

/**
 * Crea un token firmado con fecha de emisión y de expiración.
 * @param {object} datos Datos del token, por ejemplo `sub` y `rol`.
 * @param {string} secreto Secreto de firma.
 * @param {number} duracionSegundos Segundos de validez del token.
 * @returns {string} Token JWT.
 */
function crearToken(datos, secreto, duracionSegundos) {
  const ahora = Math.floor(Date.now() / 1000);
  const carga = codificar({ ...datos, iat: ahora, exp: ahora + duracionSegundos });
  const contenido = `${ENCABEZADO}.${carga}`;
  return `${contenido}.${firmar(contenido, secreto)}`;
}

/**
 * Verifica el encabezado, la firma y la expiración de un token.
 * @param {unknown} token Token recibido.
 * @param {string} secreto Secreto de firma.
 * @returns {object|null} Datos del token, o `null` si no es válido o ya expiró.
 */
function verificarToken(token, secreto) {
  if (typeof token !== 'string') {
    return null;
  }
  const [encabezado, carga, firma, ...sobrantes] = token.split('.');
  if (encabezado !== ENCABEZADO || !carga || !firma || sobrantes.length > 0) {
    return null;
  }

  const esperada = Buffer.from(firmar(`${encabezado}.${carga}`, secreto));
  const recibida = Buffer.from(firma);
  if (recibida.length !== esperada.length || !timingSafeEqual(recibida, esperada)) {
    return null;
  }

  // La firma ya es válida, por lo que la carga la generó este mismo servidor.
  const datos = JSON.parse(Buffer.from(carga, 'base64url').toString());
  return datos.exp > Date.now() / 1000 ? datos : null;
}

module.exports = { crearToken, verificarToken };
