# Gestor de Reservas de Hotel - ReserveApp

Sistema integral para la gestión y administración de reservas hoteleras, diseñado para optimizar el flujo de check-in/check-out, control de disponibilidad en tiempo real y estado operativo del establecimiento.

---

## Descripción del Proyecto

**ReserveApp** Desarrollar un sistema de gestión de reservas para un hotel que permita a los clientes consultar la disponibilidad de habitaciones, realizar reservas y administrar sus solicitudes de manera rápida y organizada, igualmente, el personal del hotel podrá gestionar habitaciones, clientes, reservas, fechas de ingreso y salida y disponibilidad.

En algunos hoteles, la gestión de reservas puede realizarse mediante llamadas telefónicas, mensajes, redes sociales o registros manuales, estos métodos pueden generar dificultades como reservas duplicadas, errores en las fechas de entrada y salida, pérdida de información, problemas para conocer la disponibilidad de las habitaciones y demoras en la atención al cliente.

Por esta razón, se propone desarrollar ReserveApp, un sistema que centralice la información relacionada con las habitaciones y reservas. De esta manera, los clientes podrán consultar la disponibilidad y realizar sus reservas, mientras que el personal del hotel podrá administrar de forma organizada las habitaciones, clientes y reservas.


---

##  Actores del Sistema

* **Huésped / Cliente:** Usuario final que consulta disponibilidad, realiza y gestiona sus reservas de estancia.
* **Recepcionista / Administrador:** Personal encargado de la atención al cliente, control de check-in/check-out e historial de ocupación.
* **Personal de Limpieza / Mantenimiento:** Personal operativo encargado de actualizar la disponibilidad física y estado de las habitaciones (*Limpia*, *Sucia*, *En Mantenimiento*).

---

## Estructura del Repositorio

```text
ReserveApp/
├── DOCS/
│   ├── 01_requisitos.md    # Documento de requisitos, actores y matriz de problemas
│   ├── 02_priorización.md  # Documento de priorización
│   ├── 03_estimacion_y_costos.md          # Estimación, costos y velocidad del equipo
│   └── 04_plan_de_proyecto_y_modelos.md   # Modelo de proceso y plan de Sprints
├── src/
│   ├── controllers/        # Fachada y reglas de negocio
│   ├── dao/                # Acceso a datos (en memoria por ahora)
│   ├── models/             # Entidades del dominio
│   ├── seguridad/          # Hash de contraseñas, tokens JWT y lista de contraseñas comunes
│   ├── views/              # Interfaz web
│   └── server.js           # Servidor Express y rutas de la API
├── test/                   # Pruebas automatizadas
├── package.json            # Dependencias y comandos del proyecto
└── README.md               # Descripción e información general del proyecto
```

---

## Ejecución Local

Requiere Node.js 18 o superior. El servidor no inicia sin la variable de entorno `JWT_SECRET`, de al menos 32 bytes, que firma los tokens de sesión. No la guardes en Git.

En PowerShell:

```powershell
npm install
$env:JWT_SECRET = node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
npm start
```

En Bash:

```bash
npm install
export JWT_SECRET="$(node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))")"
npm start
```

Después abre <http://localhost:3000>. Las habitaciones y reservas son datos de ejemplo en memoria: no representan tarifas reales y se reinician con cada ejecución.

## Pruebas

```bash
npm test
```

Usa el ejecutor de pruebas incluido en Node, por lo que no requiere dependencias adicionales ni `JWT_SECRET`.

## Registro e Inicio de Sesión

Entra a <http://localhost:3000/cuenta.html> o usa el enlace **Mi cuenta** de la página principal.

* Las cuentas se guardan en memoria y se pierden al reiniciar el servidor.
* El registro público siempre crea cuentas con rol `HUESPED`. Todavía no hay una forma de crear cuentas de personal.
* La contraseña debe tener entre 15 y 128 caracteres Unicode, sin reglas de composición y sin truncarse. El criterio completo está en `DOCS/01_requisitos.md`.
* El registro rechaza las contraseñas que coinciden por completo con `src/seguridad/contrasenas-comunes.txt`, sin distinguir mayúsculas y unificando variantes Unicode (NFKC). La comparación es local: las contraseñas no se envían a servicios externos ni se registran en logs.
* **Alcance de la lista:** es una selección manual de valores previsibles; no cubre todas las contraseñas filtradas y no se comparó con ninguna base de datos de filtraciones.
* **Mantenimiento de la lista:** agrega una contraseña por línea en ese archivo y ejecuta `npm test`, que falla si una entrada está repetida o no tiene entre 15 y 128 caracteres.
* Las contraseñas se guardan como hash con Argon2id, o con scrypt si la versión de Node no incluye `crypto.argon2`.
* La sesión es un JWT que dura 1 hora y viaja en una cookie `HttpOnly`.
* La confirmación del registro se muestra en la interfaz; no se envían correos.
