/**
 * Roles documentados en DOCS/02_priorización.md.
 * El registro público solo asigna HUESPED; los demás quedan reservados para el personal.
 */
const ROLES = Object.freeze({
  HUESPED: 'HUESPED',
  RECEPCIONISTA: 'RECEPCIONISTA',
  LIMPIEZA: 'LIMPIEZA',
});

/**
 * Modelo de un usuario del sistema (HU01, Issue #1).
 * Solo describe la entidad: no contiene reglas de negocio ni acceso a datos.
 */
class Usuario {
  /**
   * @param {string} id Identificador único del usuario.
   * @param {string} correo Correo normalizado, usado para iniciar sesión.
   * @param {string} hashContrasena Hash de la contraseña; nunca la contraseña original.
   * @param {string} rol Uno de los valores de `ROLES`.
   */
  constructor(id, correo, hashContrasena, rol) {
    this.id = id;
    this.correo = correo;
    this.hashContrasena = hashContrasena;
    this.rol = rol;
  }
}

module.exports = { Usuario, ROLES };
