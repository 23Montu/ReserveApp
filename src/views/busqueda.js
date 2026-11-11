/**
 * Vista de la búsqueda de habitaciones (HU02, Issue #2).
 * Captura los filtros, consulta la API y muestra la respuesta.
 * Las reglas de la búsqueda viven en HabitacionController, no aquí.
 */
const formulario = document.getElementById('formulario-busqueda');
const botonBuscar = document.getElementById('boton-buscar');
const selectorTipo = document.getElementById('tipo');
const mensaje = document.getElementById('mensaje');
const resultados = document.getElementById('resultados');
const plantilla = document.getElementById('plantilla-habitacion');

const formatoCOP = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
});

/**
 * Muestra un texto de estado al usuario.
 * @param {string} texto Texto para mostrar.
 * @param {boolean} [esError=false] Indica si debe mostrarse como error.
 */
function mostrarMensaje(texto, esError = false) {
  mensaje.textContent = texto;
  mensaje.classList.toggle('mensaje-error', esError);
}

/**
 * Estadía con la que se hizo la búsqueda; el resumen de reserva (HU03a) la reutiliza.
 * @typedef {Object} EstadiaBuscada
 * @property {string} fechaEntrada Fecha de check-in en formato AAAA-MM-DD.
 * @property {string} fechaSalida Fecha de check-out en formato AAAA-MM-DD.
 * @property {string} huespedes Número de huéspedes.
 */

/**
 * Construye la tarjeta de una habitación a partir de la plantilla HTML.
 * @param {{id: number, nombre: string, tipo: string, capacidad: number, precioPorNoche: number}} habitacion
 *   Habitación recibida de la API.
 * @param {EstadiaBuscada} estadia Estadía buscada, para el enlace al resumen de reserva.
 * @returns {DocumentFragment} Tarjeta lista para insertar en la lista.
 */
function crearTarjeta(habitacion, estadia) {
  const tarjeta = plantilla.content.cloneNode(true);
  const unidad = habitacion.capacidad === 1 ? 'huésped' : 'huéspedes';
  const consultaResumen = new URLSearchParams({ habitacionId: habitacion.id, ...estadia });

  tarjeta.querySelector('.habitacion-tipo').textContent = habitacion.tipo;
  tarjeta.querySelector('.habitacion-nombre').textContent = habitacion.nombre;
  tarjeta.querySelector('.habitacion-capacidad').textContent =
    `Capacidad máxima: ${habitacion.capacidad} ${unidad}`;
  tarjeta.querySelector('.habitacion-precio strong').textContent =
    formatoCOP.format(habitacion.precioPorNoche);
  tarjeta.querySelector('.habitacion-accion').href = `resumen.html?${consultaResumen}`;

  return tarjeta;
}

/**
 * Muestra las habitaciones encontradas y un resumen de cuántas son.
 * @param {Array<object>} habitaciones Habitaciones disponibles.
 * @param {EstadiaBuscada} estadia Estadía con la que se buscaron.
 */
function mostrarHabitaciones(habitaciones, estadia) {
  resultados.replaceChildren(...habitaciones.map((habitacion) => crearTarjeta(habitacion, estadia)));

  if (habitaciones.length === 0) {
    mostrarMensaje('No hay habitaciones disponibles con esos criterios.');
  } else if (habitaciones.length === 1) {
    mostrarMensaje('Hay 1 habitación disponible.');
  } else {
    mostrarMensaje(`Hay ${habitaciones.length} habitaciones disponibles.`);
  }
}

/**
 * Consulta la disponibilidad con los filtros del formulario y muestra el resultado.
 * @param {SubmitEvent} evento Envío del formulario.
 * @returns {Promise<void>}
 */
async function buscarHabitaciones(evento) {
  evento.preventDefault();
  botonBuscar.disabled = true;

  try {
    const datos = new FormData(formulario);
    const parametros = new URLSearchParams(datos);
    const respuesta = await fetch(`/api/habitaciones/disponibles?${parametros}`);
    const resultado = await respuesta.json();

    if (resultado.error) {
      resultados.replaceChildren();
      mostrarMensaje(resultado.error, true);
    } else {
      // Se usan los datos con que se buscó, aunque luego cambie el formulario.
      mostrarHabitaciones(resultado.habitaciones, {
        fechaEntrada: datos.get('fechaEntrada'),
        fechaSalida: datos.get('fechaSalida'),
        huespedes: datos.get('huespedes'),
      });
    }
  } catch {
    resultados.replaceChildren();
    mostrarMensaje('No se pudo consultar la disponibilidad. Intenta de nuevo.', true);
  } finally {
    botonBuscar.disabled = false;
  }
}

/**
 * Llena el selector con los tipos de habitación existentes.
 * Si la consulta falla, se conserva la opción "Todos" y la búsqueda sigue funcionando.
 * @returns {Promise<void>}
 */
async function cargarTipos() {
  try {
    const respuesta = await fetch('/api/habitaciones/tipos');
    const { tipos } = await respuesta.json();
    selectorTipo.append(...tipos.map((tipo) => new Option(tipo, tipo)));
  } catch {
    console.error('No se pudieron cargar los tipos de habitación.');
  }
}

formulario.addEventListener('submit', buscarHabitaciones);
cargarTipos();
