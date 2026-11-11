/**
 * Configuración del resumen de reserva (HU03a, Issue #3).
 * Reúne en un solo lugar los valores que el Product Owner todavía debe aprobar, para que
 * cambiarlos no obligue a tocar la lógica del controlador ni la vista.
 */

/**
 * Impuesto que se muestra en el desglose del precio.
 *
 * SUPUESTO PROVISIONAL: IVA del 19 %, pendiente de aprobación del Product Owner. No es una
 * regla fiscal definitiva.
 *
 * `precioPorNoche` ya incluye este impuesto (lo indicó el equipo el 2026-11-10): el resumen
 * no lo suma al total, sino que muestra cuánto contiene.
 * @type {Readonly<{nombre: string, porcentaje: number, provisional: boolean}>}
 */
const IMPUESTO = Object.freeze({
  nombre: 'IVA',
  porcentaje: 19,
  provisional: true,
});

/**
 * Métodos de pago que el huésped puede elegir antes de continuar al pago (HU03b, Issue #11).
 *
 * Ningún Issue ni documento los define: estos tres los eligió el equipo el 2026-11-10.
 * Para cambiarlos basta con editar esta lista; cada método lleva un `id` sin espacios,
 * que es el valor que envía el formulario, y un `nombre` visible.
 * @type {ReadonlyArray<Readonly<{id: string, nombre: string}>>}
 */
const METODOS_PAGO = Object.freeze([
  Object.freeze({ id: 'tarjeta-credito', nombre: 'Tarjeta de crédito' }),
  Object.freeze({ id: 'tarjeta-debito', nombre: 'Tarjeta débito' }),
  Object.freeze({ id: 'pse', nombre: 'PSE' }),
]);

module.exports = { IMPUESTO, METODOS_PAGO };
