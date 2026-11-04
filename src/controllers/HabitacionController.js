const HabitacionDAO = require('../dao/HabitacionDAO');
const ReservaDAO = require('../dao/ReservaDAO');

const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const ENTERO_POSITIVO = /^[1-9]\d*$/;

/**
 * @typedef {Object} CriteriosBusqueda
 * @property {string} fechaEntrada Fecha de check-in en formato AAAA-MM-DD.
 * @property {string} fechaSalida Fecha de check-out en formato AAAA-MM-DD.
 * @property {string|number} huespedes Número de huéspedes (entero mayor que 0).
 * @property {string} [tipo] Tipo de habitación; si se omite, incluye todos.
 */

/**
 * Resultado de una búsqueda: trae `habitaciones` si fue válida o `error` si no.
 * @typedef {Object} ResultadoBusqueda
 * @property {import('../models/Habitacion')[]} [habitaciones] Habitaciones disponibles.
 * @property {string} [error] Mensaje para mostrar cuando los criterios no son válidos.
 */

/**
 * Comprueba que un valor sea una fecha real en formato AAAA-MM-DD.
 * La conversión de ida y vuelta descarta fechas inexistentes como 2026-02-31.
 * @param {unknown} valor Valor recibido.
 * @returns {boolean} `true` si es una fecha válida.
 */
function esFechaValida(valor) {
  if (typeof valor !== 'string' || !FORMATO_FECHA.test(valor)) {
    return false;
  }
  const fecha = new Date(`${valor}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === valor;
}

/**
 * Indica si dos estancias comparten al menos una noche.
 * La fecha de salida no cuenta como noche ocupada, así que una estancia puede
 * empezar el mismo día en que termina otra. Las fechas AAAA-MM-DD se pueden
 * comparar como texto porque ese orden coincide con el cronológico.
 * @param {string} entradaA Check-in de la primera estancia.
 * @param {string} salidaA Check-out de la primera estancia.
 * @param {string} entradaB Check-in de la segunda estancia.
 * @param {string} salidaB Check-out de la segunda estancia.
 * @returns {boolean} `true` si las estancias se solapan.
 */
function seSolapan(entradaA, salidaA, entradaB, salidaB) {
  return entradaA < salidaB && entradaB < salidaA;
}

/**
 * Fachada de la búsqueda de habitaciones (HU02, Issue #2).
 * Concentra las reglas de la búsqueda y consume los DAO sin saber dónde están los datos.
 */
class HabitacionController {
  constructor() {
    this.habitacionDAO = new HabitacionDAO();
    this.reservaDAO = new ReservaDAO();
  }

  /**
   * Retorna los tipos de habitación existentes, sin repetir.
   * @returns {string[]} Tipos en el orden en que aparecen en los datos.
   */
  listarTipos() {
    const tipos = this.habitacionDAO.obtenerTodas().map((habitacion) => habitacion.tipo);
    return [...new Set(tipos)];
  }

  /**
   * Busca las habitaciones con capacidad suficiente que no estén reservadas en el
   * rango de fechas indicado y, si se pide, que sean del tipo seleccionado.
   * @param {CriteriosBusqueda} criterios Filtros de la búsqueda.
   * @returns {ResultadoBusqueda} Habitaciones disponibles o mensaje de error.
   */
  buscarDisponibles({ fechaEntrada, fechaSalida, huespedes, tipo }) {
    if (!esFechaValida(fechaEntrada) || !esFechaValida(fechaSalida)) {
      return { error: 'Selecciona fechas de check-in y check-out válidas.' };
    }
    if (fechaSalida <= fechaEntrada) {
      return { error: 'La fecha de check-out debe ser posterior a la de check-in.' };
    }
    if (!ENTERO_POSITIVO.test(huespedes)) {
      return { error: 'Indica un número de huéspedes válido (1 o más).' };
    }

    const cantidadHuespedes = Number(huespedes);
    const idsReservadas = new Set(
      this.reservaDAO
        .obtenerTodas()
        .filter((reserva) =>
          seSolapan(fechaEntrada, fechaSalida, reserva.fechaEntrada, reserva.fechaSalida))
        .map((reserva) => reserva.habitacionId),
    );

    const habitaciones = this.habitacionDAO.obtenerTodas().filter((habitacion) =>
      habitacion.capacidad >= cantidadHuespedes
      && !idsReservadas.has(habitacion.id)
      && (!tipo || habitacion.tipo === tipo));

    return { habitaciones };
  }
}

module.exports = HabitacionController;
