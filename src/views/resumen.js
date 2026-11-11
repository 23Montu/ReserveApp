/**
 * Vista del resumen de reserva (HU03a, Issue #3).
 * Pide el resumen a la API, muestra el desglose del precio y deja elegir el método de pago.
 * Los cálculos y las validaciones viven en ResumenReservaController, no aquí.
 */
const mensajeResumen = document.getElementById('mensaje-resumen');
const detalleResumen = document.getElementById('detalle-resumen');
const avisoPendientes = document.getElementById('aviso-pendientes');
const listaPendientes = document.getElementById('lista-pendientes');
const formularioPago = document.getElementById('formulario-pago');
const opcionesPago = document.getElementById('opciones-pago');
const sinMetodos = document.getElementById('sin-metodos');
const botonContinuar = document.getElementById('boton-continuar');
const mensajePago = document.getElementById('mensaje-pago');

const CAMPOS_ESTADIA = ['habitacionId', 'fechaEntrada', 'fechaSalida', 'huespedes'];

const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});
const formatoFecha = new Intl.DateTimeFormat('es-CO', { dateStyle: 'full', timeZone: 'UTC' });

/** Estadía elegida en la búsqueda, tomada de la dirección de la página. */
const parametrosPagina = new URLSearchParams(window.location.search);
const estadia = new URLSearchParams(CAMPOS_ESTADIA.map((campo) => [campo, parametrosPagina.get(campo) ?? '']));

/**
 * Muestra un texto de estado en un área de mensajes.
 * @param {HTMLElement} elemento Área donde se muestra el texto.
 * @param {string} texto Texto para mostrar.
 * @param {boolean} [esError=false] Indica si debe mostrarse como error.
 */
function mostrarMensaje(elemento, texto, esError = false) {
  elemento.textContent = texto;
  elemento.classList.toggle('mensaje-error', esError);
}

/**
 * Escribe un texto en el elemento indicado.
 * @param {string} id Identificador del elemento.
 * @param {string} texto Texto para mostrar.
 */
function escribir(id, texto) {
  document.getElementById(id).textContent = texto;
}

/**
 * Convierte una fecha AAAA-MM-DD en un texto legible, sin desfases por zona horaria.
 * @param {string} fecha Fecha en formato AAAA-MM-DD.
 * @returns {string} Fecha en palabras.
 */
function formatearFecha(fecha) {
  return formatoFecha.format(new Date(`${fecha}T00:00:00Z`));
}

/**
 * Muestra los datos de la estadía, el desglose del precio y lo que falta definir.
 * @param {object} resumen Resumen recibido de la API.
 */
function mostrarResumen(resumen) {
  const { habitacion, impuesto } = resumen;
  const sufijoImpuesto = impuesto.provisional ? ', provisional' : '';

  escribir('dato-habitacion', `${habitacion.nombre} (${habitacion.tipo})`);
  escribir('dato-entrada', formatearFecha(resumen.fechaEntrada));
  escribir('dato-salida', formatearFecha(resumen.fechaSalida));
  escribir('dato-huespedes', String(resumen.huespedes));
  escribir('etiqueta-tarifa', `Tarifa por noche (${impuesto.nombre} incluido)`);
  escribir('dato-tarifa', formatoCOP.format(resumen.tarifaPorNoche));
  escribir('dato-noches', String(resumen.noches));
  escribir('etiqueta-sin-impuesto', `Valor sin ${impuesto.nombre}`);
  escribir('dato-sin-impuesto', formatoCOP.format(resumen.valorSinImpuesto));
  escribir('etiqueta-impuesto', `${impuesto.nombre} incluido (${impuesto.porcentaje} %${sufijoImpuesto})`);
  escribir('dato-impuesto', formatoCOP.format(impuesto.valor));
  escribir('dato-total', formatoCOP.format(resumen.total));

  listaPendientes.replaceChildren(...resumen.pendientes.map((texto) => {
    const elemento = document.createElement('li');
    elemento.textContent = texto;
    return elemento;
  }));
  avisoPendientes.hidden = resumen.pendientes.length === 0;
  detalleResumen.hidden = false;
}

/**
 * Crea la opción de un método de pago.
 * @param {{id: string, nombre: string}} metodo Método de pago recibido de la API.
 * @returns {HTMLLabelElement} Opción lista para insertar.
 */
function crearOpcion({ id, nombre }) {
  const opcion = document.createElement('label');
  const control = document.createElement('input');
  opcion.className = 'opcion-pago';
  control.type = 'radio';
  control.name = 'metodoPago';
  control.value = id;
  opcion.append(control, nombre);
  return opcion;
}

/**
 * Muestra los métodos de pago disponibles. Sin métodos, no se puede continuar.
 * @param {Array<{id: string, nombre: string}>} metodos Métodos recibidos de la API.
 */
function mostrarMetodosPago(metodos) {
  opcionesPago.replaceChildren(...metodos.map(crearOpcion));
  sinMetodos.hidden = metodos.length > 0;
  botonContinuar.disabled = true;
  formularioPago.hidden = false;
}

/**
 * Pide a la API el resumen de la estadía y, si se indica, valida el método de pago.
 * @param {string} [metodoPago] Identificador del método elegido.
 * @returns {Promise<{ok: boolean, cuerpo: object}>} Resultado de la consulta.
 */
async function consultarResumen(metodoPago) {
  const consulta = new URLSearchParams(estadia);
  if (metodoPago !== undefined) {
    consulta.set('metodoPago', metodoPago);
  }
  const respuesta = await fetch(`/api/reservas/resumen?${consulta}`);
  return { ok: respuesta.ok, cuerpo: await respuesta.json() };
}

/**
 * Carga el resumen al abrir la página.
 * @returns {Promise<void>}
 */
async function cargarResumen() {
  try {
    const { ok, cuerpo } = await consultarResumen();
    if (!ok) {
      mostrarMensaje(mensajeResumen, cuerpo.error, true);
      return;
    }
    mostrarMensaje(mensajeResumen, 'Revisa el detalle antes de continuar al pago.');
    mostrarResumen(cuerpo.resumen);
    mostrarMetodosPago(cuerpo.metodosPago);
  } catch {
    mostrarMensaje(mensajeResumen, 'No se pudo cargar el resumen. Intenta de nuevo.', true);
  }
}

/**
 * Confirma con la API el método de pago elegido antes de continuar.
 * @param {SubmitEvent} evento Envío del formulario de pago.
 * @returns {Promise<void>}
 */
async function continuarAlPago(evento) {
  evento.preventDefault();
  const metodoPago = new FormData(formularioPago).get('metodoPago');
  if (!metodoPago) {
    mostrarMensaje(mensajePago, 'Selecciona un método de pago.', true);
    return;
  }

  botonContinuar.disabled = true;
  try {
    const { ok, cuerpo } = await consultarResumen(metodoPago);
    if (!ok) {
      mostrarMensaje(mensajePago, cuerpo.error, true);
      return;
    }
    mostrarMensaje(
      mensajePago,
      `Elegiste ${cuerpo.metodoPago.nombre}. El procesamiento del pago todavía no está disponible.`,
    );
  } catch {
    mostrarMensaje(mensajePago, 'No se pudo confirmar el método de pago. Intenta de nuevo.', true);
  } finally {
    botonContinuar.disabled = false;
  }
}

formularioPago.addEventListener('change', () => {
  botonContinuar.disabled = false;
  mostrarMensaje(mensajePago, '');
});
formularioPago.addEventListener('submit', continuarAlPago);
cargarResumen();
