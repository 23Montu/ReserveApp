const fs = require('node:fs');
const path = require('node:path');

/**
 * Lista local de contraseñas comunes (HU01, Issue #1). Se lee una sola vez al iniciar;
 * si falta el archivo, el servidor no arranca en lugar de registrar sin comprobarla.
 * La comparación ocurre solo en este proceso: las contraseñas no salen a servicios externos.
 */
const RUTA_LISTA = path.join(__dirname, 'contrasenas-comunes.txt');

/**
 * Unifica mayúsculas y representaciones Unicode para que esas variantes de un mismo
 * valor no eludan la lista. Solo se usa para comparar: no altera lo que se guarda.
 * @param {string} texto Contraseña o entrada de la lista.
 * @returns {string} Texto normalizado.
 */
function normalizarParaComparar(texto) {
  return texto.normalize('NFKC').toLowerCase();
}

/**
 * Convierte el contenido del archivo en un conjunto de entradas normalizadas.
 * Ignora las líneas vacías y los comentarios que empiezan con #.
 * @param {string} contenido Texto del archivo.
 * @returns {Set<string>} Entradas de la lista.
 */
function analizarLista(contenido) {
  const entradas = contenido
    .split(/\r?\n/)
    .map((linea) => linea.trim())
    .filter((linea) => linea && !linea.startsWith('#'))
    .map((linea) => normalizarParaComparar(linea));
  return new Set(entradas);
}

const CONTRASENAS_COMUNES = analizarLista(fs.readFileSync(RUTA_LISTA, 'utf8'));

/**
 * Indica si una contraseña completa coincide con una entrada de la lista.
 * Contener un valor de la lista no basta: la frase completa debe ser igual.
 * @param {string} contrasena Contraseña recibida.
 * @returns {boolean} `true` si la contraseña está en la lista.
 */
function esContrasenaComun(contrasena) {
  return CONTRASENAS_COMUNES.has(normalizarParaComparar(contrasena));
}

module.exports = { RUTA_LISTA, analizarLista, esContrasenaComun };
