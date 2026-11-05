/**
 * Vista de registro e inicio de sesión (HU01, Issue #1).
 * Envía los formularios a la API y muestra la respuesta.
 * Las reglas de autenticación viven en AuthController, no aquí.
 */
const panelesAcceso = document.getElementById('paneles-acceso');
const formularioRegistro = document.getElementById('formulario-registro');
const formularioLogin = document.getElementById('formulario-login');
const mensajeRegistro = document.getElementById('mensaje-registro');
const mensajeLogin = document.getElementById('mensaje-login');
const panelSesion = document.getElementById('panel-sesion');
const datosSesion = document.getElementById('datos-sesion');
const botonSalir = document.getElementById('boton-salir');
const mensajeSesion = document.getElementById('mensaje-sesion');

const ERROR_CONEXION = 'No se pudo conectar con el servidor. Intenta de nuevo.';
const NOMBRES_ROL = {
  HUESPED: 'Huésped',
  RECEPCIONISTA: 'Recepcionista',
  LIMPIEZA: 'Limpieza',
};

/**
 * Muestra un texto en un área de mensajes.
 * @param {HTMLElement} elemento Área donde se muestra el texto.
 * @param {string} texto Texto para mostrar.
 * @param {boolean} [esError=false] Indica si debe mostrarse como error.
 */
function mostrarMensaje(elemento, texto, esError = false) {
  elemento.textContent = texto;
  elemento.classList.toggle('mensaje-error', esError);
  elemento.classList.toggle('mensaje-exito', Boolean(texto) && !esError);
}

/**
 * Alterna entre los formularios de acceso y el panel de la sesión.
 * @param {{correo: string, rol: string}|null} usuario Usuario con sesión, o `null`.
 */
function mostrarSesion(usuario) {
  panelesAcceso.hidden = Boolean(usuario);
  panelSesion.hidden = !usuario;
  if (usuario) {
    datosSesion.textContent = `${usuario.correo} · ${NOMBRES_ROL[usuario.rol] ?? usuario.rol}`;
  }
}

/**
 * Envía un formulario a la API como JSON, con el botón deshabilitado mientras responde.
 * @param {HTMLFormElement} formulario Formulario para enviar.
 * @param {string} url Ruta de la API.
 * @returns {Promise<{ok: boolean, cuerpo: object}>} Resultado de la solicitud.
 */
async function enviarFormulario(formulario, url) {
  const boton = formulario.querySelector('button');
  boton.disabled = true;
  try {
    const respuesta = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(formulario))),
    });
    return { ok: respuesta.ok, cuerpo: await respuesta.json() };
  } finally {
    boton.disabled = false;
  }
}

/**
 * Registra la cuenta, muestra la confirmación y deja listo el inicio de sesión.
 * @param {SubmitEvent} evento Envío del formulario.
 * @returns {Promise<void>}
 */
async function registrarCuenta(evento) {
  evento.preventDefault();
  try {
    const { ok, cuerpo } = await enviarFormulario(formularioRegistro, '/api/auth/registro');
    if (!ok) {
      mostrarMensaje(mensajeRegistro, cuerpo.error, true);
      return;
    }
    formularioRegistro.reset();
    formularioLogin.elements.correo.value = cuerpo.usuario.correo;
    mostrarMensaje(mensajeRegistro, cuerpo.mensaje);
  } catch {
    mostrarMensaje(mensajeRegistro, ERROR_CONEXION, true);
  }
}

/**
 * Inicia sesión y muestra el panel del usuario, o el error de credenciales.
 * @param {SubmitEvent} evento Envío del formulario.
 * @returns {Promise<void>}
 */
async function iniciarSesion(evento) {
  evento.preventDefault();
  try {
    const { ok, cuerpo } = await enviarFormulario(formularioLogin, '/api/auth/login');
    formularioLogin.elements.contrasena.value = '';
    if (!ok) {
      mostrarMensaje(mensajeLogin, cuerpo.error, true);
      return;
    }
    mostrarMensaje(mensajeLogin, '');
    mostrarMensaje(mensajeRegistro, '');
    mostrarMensaje(mensajeSesion, '');
    mostrarSesion(cuerpo.usuario);
  } catch {
    mostrarMensaje(mensajeLogin, ERROR_CONEXION, true);
  }
}

/**
 * Cierra la sesión actual y vuelve a los formularios de acceso.
 * @returns {Promise<void>}
 */
async function cerrarSesion() {
  botonSalir.disabled = true;
  try {
    const respuesta = await fetch('/api/auth/logout', { method: 'POST' });
    if (!respuesta.ok) {
      throw new Error('No se pudo cerrar la sesión.');
    }
    mostrarSesion(null);
    mostrarMensaje(mensajeLogin, 'Cerraste sesión correctamente.');
  } catch {
    mostrarMensaje(mensajeSesion, ERROR_CONEXION, true);
  } finally {
    botonSalir.disabled = false;
  }
}

/**
 * Consulta si ya hay una sesión activa al abrir la página.
 * Si la consulta falla, se muestran los formularios de acceso.
 * @returns {Promise<void>}
 */
async function cargarSesion() {
  try {
    const respuesta = await fetch('/api/auth/sesion');
    const { usuario } = await respuesta.json();
    mostrarSesion(usuario);
  } catch {
    console.error('No se pudo consultar la sesión.');
  }
}

formularioRegistro.addEventListener('submit', registrarCuenta);
formularioLogin.addEventListener('submit', iniciarSesion);
botonSalir.addEventListener('click', cerrarSesion);
cargarSesion();
