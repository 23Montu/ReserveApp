const Habitacion = require('../models/Habitacion');

/**
 * Acceso a los datos de habitaciones (HU02, Issue #2).
 * Usa datos de ejemplo en memoria porque el proyecto aún no tiene persistencia;
 * los valores son de demostración y no representan tarifas reales del hotel.
 */
class HabitacionDAO {
  constructor() {
    this.habitaciones = [
      new Habitacion(1, 'Habitación 101', 'Sencilla', 1, 120000),
      new Habitacion(2, 'Habitación 102', 'Doble', 2, 180000),
      new Habitacion(3, 'Habitación 201', 'Doble', 2, 195000),
      new Habitacion(4, 'Habitación 202', 'Familiar', 4, 290000),
      new Habitacion(5, 'Habitación 301', 'Suite', 2, 350000),
      new Habitacion(6, 'Habitación 302', 'Familiar', 6, 420000),
    ];
  }

  /**
   * Retorna todas las habitaciones registradas.
   * @returns {Habitacion[]} Lista completa de habitaciones.
   */
  obtenerTodas() {
    return this.habitaciones;
  }
}

module.exports = HabitacionDAO;
