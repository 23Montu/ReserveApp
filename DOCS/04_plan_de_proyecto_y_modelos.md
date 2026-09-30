# Plan de Proyecto y Modelos de Proceso - Proyecto ReserveApp

## 1. Selección y Justificación del Modelo de Proceso

Para el desarrollo y despliegue de la plataforma **ReserveApp** se ha seleccionado el modelo de proceso **Scrum (Marco Ágil)**. La justificación técnica y comercial de esta elección radica en la necesidad de validar de manera prioritaria el ciclo operativo crítico del hotel —autenticación de usuarios, búsqueda de disponibilidad en tiempo real, confirmación y pago seguro de la reserva, check-in/check-out y control físico del estado de las habitaciones— antes de invertir recursos en funcionalidades complementarias como la facturación de consumos adicionales, la gestión de incidencias, el historial de huéspedes o los reportes analíticos.

El enfoque iterativo e incremental de Scrum permite entregar un **Producto Mínimo Viable (MVP)** funcional en pocas semanas, posibilitando pruebas operativas reales con el personal de recepción y limpieza, y recibir retroalimentación antes de construir el resto del backlog. Además, la flexibilidad de Scrum facilita gestionar la complejidad técnica concentrada en la integración de la pasarela de pago (HU03, la historia de mayor riesgo del proyecto) sin detener el avance de los demás módulos.

## 2. Parámetros de Planificación

* **Equipo:** 1 Product Owner (Luisa Maria Basanta Cordoba), 1 Líder Técnico (Miguel Angel Narvaez Montufar), 2 Desarrolladoras/es (Juan David Ordoñez Bolaños y Daniel Alejandro Benavides).
* **Velocidad del Equipo (V):** 12 SP / Sprint (para un equipo de desarrollo con capacidad de 2 semanas por iteración).
* **Duración por Sprint:** 2 Semanas (80 horas hábiles por desarrollador).
* **Total SP del MVP (Historias Must Have):** 25 SP (`HU01`: 5 SP, `HU02`: 3 SP, `HU03`: 13 SP, `HU04`: 2 SP, `HU05`: 2 SP).
* **Total SP del Backlog Completo:** 48 SP (ver `03_estimacion_y_costos.md`).
* **Número de Sprints Calculados para el MVP:** nSprints = 25 / 12 = 2.08 ⟶ **3 Sprints**.
* **Número de Sprints Calculados para el Backlog Completo:** nSprints = 48 / 12 = 4 ⟶ **5 Sprints** (la última historia, de solo 2 SP, deja un sprint final parcial).
* **Duración Total del MVP en Semanas:** 6 Semanas.
* **Duración Total del Proyecto Completo en Semanas:** 10 Semanas.


## 3. Planificación Detallada de Sprints

**Sprint 1 (Semanas 1 y 2) · Capacidad: 12 SP**
* [#1]: `HU01 - Registro e Inicio de Sesión de Usuario` (5 SP - $1.800.000 COP)
* [#2]: `HU02 - Búsqueda de Habitaciones Disponibles` (3 SP - $1.080.000 COP)
* [#4]: `HU04 - Gestión de Check-in y Check-out` (2 SP - $720.000 COP)
* [#5]: `HU05 - Control del Estado Operativo de Habitaciones` (2 SP - $720.000 COP)
* **Carga Total del Sprint 1:** 12 SP | Esfuerzo: 96 Horas | Costo Sprint 1: $4.320.000 COP

**Sprint 2 (Semanas 3 y 4) · Capacidad: 12 SP**
* [#3]: `HU03 - Confirmación y Pago de Reserva (Parte 1: Integración base con pasarela de pago)` (12 SP de los 13 SP totales - $4.320.000 COP)
* **Carga Total del Sprint 2:** 12 SP | Esfuerzo: 96 Horas | Costo Sprint 2: $4.320.000 COP

**Sprint 3 (Semanas 5 y 6 - Cierre del MVP) · Capacidad: 12 SP**
* [#3]: `HU03 - Confirmación y Pago de Reserva (Parte 2: Validación de transacciones seguras)` (1 SP restante para completar los 13 SP - $360.000 COP)
* [#6]: `HU06 - Cancelación de Reservas por Parte del Cliente` (5 SP - $1.800.000 COP)
* [#7]: `HU07 - Registro de Consumos Adicionales y Facturación` (5 SP - $1.800.000 COP)
* **Carga Total del Sprint 3:** 11 SP | Esfuerzo: 88 Horas | Costo Sprint 3: $3.960.000 COP
* **➜ Con el cierre de HU03 en este sprint, el MVP queda funcionalmente completo.**

**Sprint 4 (Semanas 7 y 8 - Extensión Proyecto Completo) · Capacidad: 12 SP**
* [#10]: `HU10 - Generación de Reportes y Métricas de Ocupación` (8 SP - $2.880.000 COP)
* [#8]: `HU08 - Gestión de Incidencias y Mantenimiento` (3 SP - $1.080.000 COP)
* **Carga Total del Sprint 4:** 11 SP | Esfuerzo: 88 Horas | Costo Sprint 4: $3.960.000 COP

**Sprint 5 (Semanas 9 y 10 - Cierre del Backlog) · Capacidad: 12 SP**
* [#9]: `HU09 - Perfil e Historial del Huésped` (2 SP - $720.000 COP)
* **Carga Total del Sprint 5:** 2 SP | Esfuerzo: 16 Horas | Costo Sprint 5: $720.000 COP

## 4. Resumen Comercial de la Propuesta (Línea Base Final)

* **Tiempo de Entrega del MVP:** 6 Semanas (3 Sprints).
* **Esfuerzo Total del MVP:** 200 Horas/Hombre.
* **MVP de Inversión Financiera:** $9.000.000 COP.
* **Tiempo de Entrega Proyecto Completo:** 10 Semanas (5 Sprints).
* **Esfuerzo Total Proyecto Completo:** 384 Horas/Hombre.
* **Inversión Financiera Proyecto Completo:** $17.280.000 COP.
