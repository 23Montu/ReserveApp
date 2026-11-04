const Reserva = require('../models/Reserva');

/**
 * Acceso a los datos de reservas (HU02, Issue #2).
 * Usa datos de ejemplo en memoria porque el proyecto aún no tiene persistencia.
 */
class ReservaDAO {
  constructor() {
    this.reservas = [
      new Reserva(1, 2, '2026-12-10', '2026-12-12'),
      new Reserva(2, 4, '2026-12-11', '2026-12-15'),
      new Reserva(3, 5, '2026-12-12', '2026-12-14'),
    ];
  }

  /**
   * Retorna todas las reservas registradas.
   * @returns {Reserva[]} Lista completa de reservas.
   */
  obtenerTodas() {
    return this.reservas;
  }
}

module.exports = ReservaDAO;
