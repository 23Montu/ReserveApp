/**
 * Acceso a los datos de usuarios (HU01, Issue #1).
 * Guarda los usuarios en memoria porque el proyecto aún no tiene persistencia:
 * las cuentas se pierden al reiniciar el servidor.
 */
class UsuarioDAO {
  constructor() {
    this.usuariosPorCorreo = new Map();
  }

  /**
   * Agrega un usuario si su correo no está registrado.
   * Comprobar y guardar ocurren en un solo paso síncrono, así que dos registros
   * simultáneos con el mismo correo no pueden crear dos cuentas.
   * @param {import('../models/Usuario').Usuario} usuario Usuario nuevo.
   * @returns {boolean} `true` si se agregó; `false` si el correo ya existía.
   */
  agregar(usuario) {
    if (this.usuariosPorCorreo.has(usuario.correo)) {
      return false;
    }
    this.usuariosPorCorreo.set(usuario.correo, usuario);
    return true;
  }

  /**
   * Busca un usuario por su correo normalizado.
   * @param {string} correo Correo normalizado.
   * @returns {import('../models/Usuario').Usuario|undefined} Usuario encontrado.
   */
  buscarPorCorreo(correo) {
    return this.usuariosPorCorreo.get(correo);
  }

  /**
   * Busca un usuario por su identificador.
   * @param {string} id Identificador del usuario.
   * @returns {import('../models/Usuario').Usuario|undefined} Usuario encontrado.
   */
  buscarPorId(id) {
    return [...this.usuariosPorCorreo.values()].find((usuario) => usuario.id === id);
  }
}

module.exports = UsuarioDAO;
