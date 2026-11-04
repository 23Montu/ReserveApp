/**
 * Modelo mínimo de una reserva (HU02, Issue #2).
 * Incluye solo lo necesario para saber qué habitación está ocupada y en qué fechas.
 */
class Reserva {
  /**
   * @param {number} id Identificador único de la reserva.
   * @param {number} habitacionId Identificador de la habitación reservada.
   * @param {string} fechaEntrada Fecha de check-in en formato AAAA-MM-DD.
   * @param {string} fechaSalida Fecha de check-out en formato AAAA-MM-DD.
   */
  constructor(id, habitacionId, fechaEntrada, fechaSalida) {
    this.id = id;
    this.habitacionId = habitacionId;
    this.fechaEntrada = fechaEntrada;
    this.fechaSalida = fechaSalida;
  }
}

module.exports = Reserva;
