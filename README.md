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
│   ├── views/              # Interfaz web
│   └── server.js           # Servidor Express y rutas de la API
├── package.json            # Dependencias y comandos del proyecto
└── README.md               # Descripción e información general del proyecto
```

---

## Ejecución Local

Requiere Node.js 18 o superior.

```bash
npm install
npm start
```

Después abre <http://localhost:3000>. Las habitaciones y reservas son datos de ejemplo en memoria: no representan tarifas reales y se reinician con cada ejecución.
