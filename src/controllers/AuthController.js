const { randomBytes, randomUUID } = require('node:crypto');
const UsuarioDAO = require('../dao/UsuarioDAO');
const { Usuario, ROLES } = require('../models/Usuario');
const { hashearContrasena, verificarContrasena } = require('../seguridad/contrasenas');
const { esContrasenaComun } = require('../seguridad/contrasenasComunes');
const { crearToken, verificarToken } = require('../seguridad/jwt');

const DURACION_SESION_SEGUNDOS = 60 * 60;
const LONGITUD_MAXIMA_CORREO = 254;
const FORMATO_CORREO = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

/**
 * Política de contraseñas acordada para HU01 (ver DOCS/01_requisitos.md): entre 15 y 128
 * puntos de código, sin reglas de composición y fuera de la lista de contraseñas comunes.
 * Lo que excede el máximo se rechaza en lugar de truncarse.
 */
const LONGITUD_MINIMA_CONTRASENA = 15;
const LONGITUD_MAXIMA_CONTRASENA = 128;

/**
 * @typedef {Object} ResultadoAuth
 * @property {number} estado Código HTTP de la respuesta.
 * @property {{correo: string, rol: string}} [usuario] Datos públicos del usuario.
 * @property {string} [mensaje] Confirmación para mostrar al usuario.
 * @property {string} [error] Mensaje para mostrar cuando la operación falla.
 * @property {string} [token] JWT de la sesión; el servidor lo envía solo en una cookie.
 */

/**
 * Normaliza un correo para que mayúsculas o espacios no creen cuentas distintas.
 * @param {unknown} correo Valor recibido.
 * @returns {string} Correo normalizado, o texto vacío si no es un texto.
 */
function normalizarCorreo(correo) {
  return typeof correo === 'string' ? correo.trim().toLowerCase() : '';
}

/**
 * Comprueba el formato básico de un correo.
 * @param {string} correo Correo normalizado.
 * @returns {boolean} `true` si el formato es válido.
 */
function esCorreoValido(correo) {
  return correo.length <= LONGITUD_MAXIMA_CORREO && FORMATO_CORREO.test(correo);
}

/**
 * Extrae los únicos datos del usuario que pueden salir del servidor.
 * @param {Usuario} usuario Usuario guardado.
 * @returns {{correo: string, rol: string}} Datos públicos, sin el hash.
 */
function datosPublicos({ correo, rol }) {
  return { correo, rol };
}

/**
 * Fachada del registro e inicio de sesión (HU01, Issue #1).
 * Concentra las reglas de autenticación y consume el DAO sin saber dónde están los datos.
 */
class AuthController {
  /**
   * @param {string} secretoJwt Secreto con el que se firman los tokens de sesión.
   */
  constructor(secretoJwt) {
    this.secretoJwt = secretoJwt;
    this.usuarioDAO = new UsuarioDAO();
    // Se verifica contra este hash cuando el correo no existe, para que el tiempo de
    // respuesta no delate qué correos están registrados.
    this.hashFicticio = hashearContrasena(randomBytes(32).toString('hex'));
  }

  /**
   * Registra un huésped. El rol no se lee de la solicitud: el registro público
   * siempre crea cuentas HUESPED, aunque se envíe otro rol en el cuerpo.
   * @param {{correo?: unknown, contrasena?: unknown}} datos Datos del formulario.
   * @returns {Promise<ResultadoAuth>} Usuario creado o mensaje de error.
   */
  async registrar({ correo, contrasena }) {
    const correoNormalizado = normalizarCorreo(correo);
    if (!esCorreoValido(correoNormalizado)) {
      return { estado: 400, error: 'Ingresa un correo electrónico válido.' };
    }
    if (typeof contrasena !== 'string') {
      return { estado: 400, error: 'Ingresa una contraseña.' };
    }

    // Se cuentan caracteres Unicode completos, no unidades UTF-16.
    const longitud = [...contrasena].length;
    if (longitud < LONGITUD_MINIMA_CONTRASENA) {
      return {
        estado: 400,
        error: `La contraseña debe tener al menos ${LONGITUD_MINIMA_CONTRASENA} caracteres.`,
      };
    }
    if (longitud > LONGITUD_MAXIMA_CONTRASENA) {
      return {
        estado: 400,
        error: `La contraseña no puede superar los ${LONGITUD_MAXIMA_CONTRASENA} caracteres.`,
      };
    }
    if (esContrasenaComun(contrasena)) {
      return {
        estado: 400,
        error: 'Esa contraseña es muy común o fácil de adivinar. Elige una contraseña menos común.',
      };
    }

    const usuario = new Usuario(
      randomUUID(),
      correoNormalizado,
      await hashearContrasena(contrasena),
      ROLES.HUESPED,
    );
    if (!this.usuarioDAO.agregar(usuario)) {
      return { estado: 409, error: 'No se pudo crear la cuenta: ese correo ya está registrado.' };
    }

    return {
      estado: 201,
      mensaje: 'Tu cuenta se creó correctamente. Ya puedes iniciar sesión.',
      usuario: datosPublicos(usuario),
    };
  }

  /**
   * Valida las credenciales y crea el token de sesión. El mensaje de error es el
   * mismo si el correo no existe o si la contraseña es incorrecta.
   * @param {{correo?: unknown, contrasena?: unknown}} datos Datos del formulario.
   * @returns {Promise<ResultadoAuth>} Usuario y token, o mensaje de error.
   */
  async iniciarSesion({ correo, contrasena }) {
    const correoNormalizado = normalizarCorreo(correo);
    if (!correoNormalizado || typeof contrasena !== 'string' || !contrasena) {
      return { estado: 400, error: 'Ingresa tu correo y tu contraseña.' };
    }

    const usuario = this.usuarioDAO.buscarPorCorreo(correoNormalizado);
    const hash = usuario ? usuario.hashContrasena : await this.hashFicticio;
    const coincide = await verificarContrasena(contrasena, hash);
    if (!usuario || !coincide) {
      return { estado: 401, error: 'Correo o contraseña incorrectos.' };
    }

    return {
      estado: 200,
      usuario: datosPublicos(usuario),
      token: crearToken(
        { sub: usuario.id, rol: usuario.rol },
        this.secretoJwt,
        DURACION_SESION_SEGUNDOS,
      ),
    };
  }

  /**
   * Obtiene el usuario de una sesión activa.
   * @param {unknown} token Token recibido en la cookie de sesión.
   * @returns {{correo: string, rol: string}|null} Usuario, o `null` si no hay sesión válida.
   */
  obtenerSesion(token) {
    const datos = verificarToken(token, this.secretoJwt);
    const usuario = datos && this.usuarioDAO.buscarPorId(datos.sub);
    return usuario ? datosPublicos(usuario) : null;
  }
}

module.exports = { AuthController, DURACION_SESION_SEGUNDOS };
