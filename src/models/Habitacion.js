/**
 * Modelo de una habitación del hotel (HU02, Issue #2).
 * Solo describe la entidad: no contiene reglas de negocio ni acceso a datos.
 */
class Habitacion {
  /**
   * @param {number} id Identificador único de la habitación.
   * @param {string} nombre Nombre visible, por ejemplo "Habitación 101".
   * @param {string} tipo Categoría usada como filtro, por ejemplo "Doble".
   * @param {number} capacidad Cantidad máxima de huéspedes.
   * @param {number} precioPorNoche Tarifa por noche en pesos colombianos (COP).
   */
  constructor(id, nombre, tipo, capacidad, precioPorNoche) {
    this.id = id;
    this.nombre = nombre;
    this.tipo = tipo;
    this.capacidad = capacidad;
    this.precioPorNoche = precioPorNoche;
  }
}

module.exports = Habitacion;
