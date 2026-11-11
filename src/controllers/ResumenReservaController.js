const { IMPUESTO, METODOS_PAGO } = require('../config/resumenReserva');

const ENTERO_POSITIVO = /^[1-9]\d*$/;
const MILISEGUNDOS_POR_DIA = 24 * 60 * 60 * 1000;
const PENDIENTE_METODOS = 'Falta definir qué métodos de pago se ofrecen.';

/**
 * Datos de la estadía elegida en la búsqueda (HU02) y, al continuar, el método de pago.
 * @typedef {Object} SolicitudResumen
 * @property {string|number} habitacionId Identificador de la habitación elegida.
 * @property {string} fechaEntrada Fecha de check-in en formato AAAA-MM-DD.
 * @property {string} fechaSalida Fecha de check-out en formato AAAA-MM-DD.
 * @property {string|number} huespedes Número de huéspedes (entero mayor que 0).
 * @property {string} [metodoPago] Identificador del método elegido; solo se envía al continuar.
 */

/**
 * Método de pago que se ofrece al huésped.
 * @typedef {Object} MetodoPago
 * @property {string} id Identificador del método.
 * @property {string} nombre Nombre visible del método.
 */

/**
 * Resumen de la estadía con el desglose del precio. Los valores están en COP y el
 * impuesto ya viene incluido en la tarifa: `valorSinImpuesto` + `impuesto.valor` = `total`.
 * @typedef {Object} ResumenReserva
 * @property {{id: number, nombre: string, tipo: string}} habitacion Habitación elegida.
 * @property {string} fechaEntrada Fecha de check-in en formato AAAA-MM-DD.
 * @property {string} fechaSalida Fecha de check-out en formato AAAA-MM-DD.
 * @property {number} huespedes Número de huéspedes.
 * @property {number} noches Noches de la estadía; la fecha de salida no cuenta como noche.
 * @property {number} tarifaPorNoche Tarifa por noche, con el impuesto incluido.
 * @property {number} valorSinImpuesto Parte del total que no corresponde al impuesto.
 * @property {{nombre: string, porcentaje: number, provisional: boolean, valor: number}} impuesto
 *   Impuesto configurado y cuánto de él contiene el total.
 * @property {number} total Total a pagar: tarifa por noche × noches.
 * @property {string[]} pendientes Decisiones que faltan para completar el resumen.
 */

/**
 * Resultado de pedir un resumen: trae `resumen` si la solicitud es válida o `error` si no.
 * @typedef {Object} ResultadoResumen
 * @property {number} estado Código HTTP de la respuesta.
 * @property {ResumenReserva} [resumen] Resumen de la estadía.
 * @property {MetodoPago[]} [metodosPago] Métodos que el huésped puede elegir.
 * @property {MetodoPago} [metodoPago] Método elegido, cuando se envió uno válido.
 * @property {string} [error] Mensaje para mostrar cuando la solicitud no es válida.
 */

/**
 * Cuenta las noches entre dos fechas ya validadas. Como en la búsqueda de HU02, la fecha
 * de salida no cuenta como noche ocupada.
 * @param {string} fechaEntrada Fecha de check-in en formato AAAA-MM-DD.
 * @param {string} fechaSalida Fecha de check-out en formato AAAA-MM-DD.
 * @returns {number} Cantidad de noches.
 */
function contarNoches(fechaEntrada, fechaSalida) {
  const diferencia = Date.parse(`${fechaSalida}T00:00:00Z`) - Date.parse(`${fechaEntrada}T00:00:00Z`);
  return Math.round(diferencia / MILISEGUNDOS_POR_DIA);
}

/**
 * Calcula cuánto impuesto contiene un valor que ya lo incluye, redondeado al peso.
 * Con un 19 %, por ejemplo, $119 contienen $19 de impuesto y $100 de valor sin impuesto.
 * @param {number} valorConImpuesto Valor en COP que ya incluye el impuesto.
 * @param {number} porcentaje Porcentaje del impuesto, por ejemplo 19.
 * @returns {number} Impuesto incluido, en pesos enteros.
 */
function calcularImpuestoIncluido(valorConImpuesto, porcentaje) {
  return Math.round((valorConImpuesto * porcentaje) / (100 + porcentaje));
}

/**
 * Arma el resumen de la estadía con el desglose del precio.
 * El impuesto se calcula una sola vez sobre el total, y el valor sin impuesto es la
 * diferencia: así las dos partes suman exactamente el total, sin errores de redondeo.
 * @param {import('../models/Habitacion')} habitacion Habitación disponible elegida.
 * @param {string} fechaEntrada Fecha de check-in validada.
 * @param {string} fechaSalida Fecha de check-out validada.
 * @param {string|number} huespedes Número de huéspedes validado.
 * @returns {ResumenReserva} Resumen de la estadía.
 */
function armarResumen(habitacion, fechaEntrada, fechaSalida, huespedes) {
  const noches = contarNoches(fechaEntrada, fechaSalida);
  const total = habitacion.precioPorNoche * noches;
  const valorImpuesto = calcularImpuestoIncluido(total, IMPUESTO.porcentaje);

  return {
    habitacion: { id: habitacion.id, nombre: habitacion.nombre, tipo: habitacion.tipo },
    fechaEntrada,
    fechaSalida,
    huespedes: Number(huespedes),
    noches,
    tarifaPorNoche: habitacion.precioPorNoche,
    valorSinImpuesto: total - valorImpuesto,
    impuesto: { ...IMPUESTO, valor: valorImpuesto },
    total,
    pendientes: METODOS_PAGO.length === 0 ? [PENDIENTE_METODOS] : [],
  };
}

/**
 * Fachada del resumen de reserva y la selección del método de pago (HU03a, Issue #3).
 * Reutiliza la búsqueda de HU02 para validar fechas, huéspedes y disponibilidad con las
 * mismas reglas, y toma la tarifa de los datos del servidor, nunca del navegador.
 */
class ResumenReservaController {
  /**
   * @param {import('./HabitacionController')} habitacionController Fachada de la búsqueda (HU02).
   */
  constructor(habitacionController) {
    this.habitacionController = habitacionController;
  }

  /**
   * Retorna los métodos de pago configurados.
   * @returns {MetodoPago[]} Copia de los métodos que el huésped puede elegir.
   */
  listarMetodosPago() {
    return METODOS_PAGO.map(({ id, nombre }) => ({ id, nombre }));
  }

  /**
   * Arma el resumen de la estadía elegida y, si se envía, valida el método de pago.
   * @param {SolicitudResumen} solicitud Estadía elegida y método de pago opcional.
   * @returns {ResultadoResumen} Resumen y métodos de pago, o mensaje de error.
   */
  generarResumen({ habitacionId, fechaEntrada, fechaSalida, huespedes, metodoPago }) {
    if (!ENTERO_POSITIVO.test(habitacionId)) {
      return { estado: 400, error: 'Elige una habitación desde la búsqueda para ver su resumen.' };
    }

    const busqueda = this.habitacionController.buscarDisponibles({ fechaEntrada, fechaSalida, huespedes });
    if (busqueda.error) {
      return { estado: 400, error: busqueda.error };
    }

    const habitacion = busqueda.habitaciones.find(({ id }) => id === Number(habitacionId));
    if (!habitacion) {
      return {
        estado: 409,
        error: 'Esa habitación no está disponible para las fechas y huéspedes elegidos. Vuelve a la búsqueda.',
      };
    }

    const resumen = armarResumen(habitacion, fechaEntrada, fechaSalida, huespedes);
    const metodosPago = this.listarMetodosPago();
    if (metodoPago === undefined) {
      return { estado: 200, resumen, metodosPago };
    }

    const metodoElegido = metodosPago.find(({ id }) => id === metodoPago);
    if (!metodoElegido) {
      const error = metodosPago.length === 0
        ? 'Todavía no hay métodos de pago disponibles.'
        : 'Selecciona un método de pago de la lista.';
      return { estado: 400, error };
    }
    return { estado: 200, resumen, metodosPago, metodoPago: metodoElegido };
  }
}

module.exports = ResumenReservaController;
