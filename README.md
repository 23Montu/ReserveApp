
# Gestor de Reservas de Hotel - ReserveApp

Sistema integral para la gestión y administración de reservas hoteleras, diseñado para optimizar el flujo de check-in/check-out, el control de disponibilidad y el estado operativo del establecimiento.

---

## Descripción del Proyecto

**ReserveApp** es un sistema de gestión de reservas para un hotel que permite a los clientes consultar la disponibilidad de habitaciones, realizar reservas y administrar sus solicitudes de manera rápida y organizada. Igualmente, el personal del hotel podrá gestionar habitaciones, clientes, reservas, fechas de ingreso y salida y disponibilidad.

En algunos hoteles, la gestión de reservas puede realizarse mediante llamadas telefónicas, mensajes, redes sociales o registros manuales. Estos métodos pueden generar dificultades como reservas duplicadas, errores en las fechas de entrada y salida, pérdida de información, problemas para conocer la disponibilidad de las habitaciones y demoras en la atención al cliente.

Por esta razón, se propone desarrollar ReserveApp, un sistema que centralice la información relacionada con las habitaciones y reservas. De esta manera, los clientes podrán consultar la disponibilidad y realizar sus reservas, mientras que el personal del hotel podrá administrar de forma organizada las habitaciones, clientes y reservas.

---

## Actores del Sistema

- **Huésped / Cliente:** Usuario final que consulta disponibilidad, realiza y gestiona sus reservas de estancia.
- **Recepcionista / Administrador:** Personal encargado de la atención al cliente, control de check-in/check-out e historial de ocupación.
- **Personal de Limpieza / Mantenimiento:** Personal operativo encargado de actualizar la disponibilidad física y estado de las habitaciones (Limpia, Sucia, En Mantenimiento).

---

## Estructura del Repositorio

```text
ReserveApp/
├── .github/
│   └── workflows/
│       └── pruebas.yml
├── DOCS/
│   ├── 01_requisitos.md
│   ├── 02_priorización.md
│   ├── 03_estimacion_y_costos.md
│   ├── 04_plan_de_proyecto_y_modelos.md
│   ├── 05_informe_sprint_1.md
│   ├── 06_decisiones_pendientes_po.md
│   └── 07_propuesta_sprint_2.md
├── src/
│   ├── config/
│   │   └── resumenReserva.js
│   ├── controllers/
│   │   ├── AuthController.js
│   │   ├── HabitacionController.js
│   │   └── ResumenReservaController.js
│   ├── dao/
│   ├── models/
│   ├── seguridad/
│   ├── views/
│   │   ├── index.html
│   │   ├── resumen.html
│   │   └── estilos.css
│   └── server.js
├── test/
├── package.json
├── package-lock.json
└── README.md
```

---

## Ejecución Local

Requiere Node.js 18 o superior. El servidor no inicia sin la variable de entorno `JWT_SECRET`, de al menos 32 bytes, que firma los tokens de sesión. No la guardes en Git.

En PowerShell:

```powershell
npm install
$env:JWT_SECRET = (node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))")
npm start
```

En Bash:

```bash
npm install
export JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))")"
npm start
```

Después abre [http://localhost:3000](http://localhost:3000).

Las habitaciones y reservas son datos de ejemplo en memoria: no representan tarifas reales y se reinician con cada ejecución.

---

## Pruebas

Para ejecutar las pruebas automatizadas:

```bash
npm test
```

Se utiliza el ejecutor de pruebas incluido en Node.js, por lo que no requiere dependencias adicionales ni la variable `JWT_SECRET`.

---

## Registro e Inicio de Sesión

Entra a [http://localhost:3000/cuenta.html](http://localhost:3000/cuenta.html) o usa el enlace **Mi cuenta** de la página principal.

- Las cuentas se guardan en memoria y se pierden al reiniciar el servidor.
- El registro público siempre crea cuentas con rol `HUESPED`. Todavía no hay una forma de crear cuentas de personal.
- La contraseña debe tener entre 15 y 128 caracteres Unicode, contados como puntos de código después de normalizarla con NFKC, sin reglas de composición y sin truncarse. El criterio completo está en `DOCS/01_requisitos.md`.
- Las formas Unicode equivalentes según NFKC se consideran la misma contraseña; por ejemplo, «é» compuesta o descompuesta, o letras de ancho completo y sus equivalentes ASCII. Las mayúsculas y minúsculas se distinguen.
- El registro rechaza las contraseñas que coinciden por completo con `src/seguridad/contrasenas-comunes.txt`. La comparación no distingue mayúsculas y unifica variantes Unicode (NFKC); este criterio de comparación está **pendiente de aprobación** (ver `DOCS/01_requisitos.md`). La comparación es local: las contraseñas no se envían a servicios externos ni se registran en logs.
- **Alcance de la lista:** es una selección manual de valores previsibles; no cubre todas las contraseñas filtradas y no se comparó con ninguna base de datos de filtraciones.
- **Mantenimiento de la lista:** agrega una contraseña por línea en ese archivo y ejecuta `npm test`, que falla si una entrada está repetida o no tiene entre 15 y 128 caracteres.
- Las contraseñas se normalizan con NFKC y se guardan como hash con Argon2id, o con scrypt si la versión de Node no incluye `crypto.argon2`. Al iniciar sesión se aplica la misma normalización antes de verificarlas.
- La sesión es un JWT que dura 1 hora y viaja en una cookie `HttpOnly`.
- La confirmación del registro se muestra en la interfaz; no se envían correos.

---

## Resumen de Reserva (HU03a)

En la búsqueda, cada habitación disponible tiene el enlace **Ver resumen de la reserva**. El resumen muestra la habitación, las fechas, los huéspedes y el desglose del precio: tarifa por noche, noches, valor sin IVA, IVA incluido y total a pagar. Antes de continuar al pago, el huésped debe elegir un método de pago.

- El servidor arma el resumen con sus propios datos y vuelve a comprobar la disponibilidad con las reglas de la búsqueda: el navegador solo envía la habitación, las fechas y los huéspedes.
- **Supuesto provisional:** el impuesto configurado es un IVA del 19 % (`src/config/resumenReserva.js`). Está pendiente de aprobación del Product Owner y no es una regla fiscal definitiva.
- La tarifa por noche ya incluye el IVA, según indicó el equipo el 2026-11-10. El total a pagar es tarifa por noche × noches; el resumen calcula cuánto IVA contiene ese total, redondeado al peso, y el valor sin IVA es la diferencia.
- Los métodos de pago son tarjeta de crédito, tarjeta débito y PSE. Ningún Issue ni documento los define: los eligió el equipo el 2026-11-10 y están en `src/config/resumenReserva.js`. El servidor solo acepta un método de esa lista.
- El procesamiento del pago corresponde a HU03b (Issue #11) y todavía no está implementado: **Continuar al pago** solo confirma el método elegido.
