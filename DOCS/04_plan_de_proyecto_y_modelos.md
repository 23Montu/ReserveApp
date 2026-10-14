# Plan de Proyecto y Modelos de Proceso - Proyecto ReserveApp

## 1. Selección y Justificación del Modelo de Proceso

Para el desarrollo y despliegue de la plataforma **ReserveApp** se ha seleccionado el modelo de proceso **Scrum (Marco Ágil)**. La justificación técnica y comercial de esta elección radica en la necesidad de validar de manera prioritaria el ciclo operativo crítico del hotel —autenticación de usuarios, búsqueda de disponibilidad en tiempo real, confirmación y pago seguro de la reserva, check-in/check-out y control físico del estado de las habitaciones— antes de invertir recursos en funcionalidades complementarias como la facturación de consumos adicionales, la gestión de incidencias, el historial de huéspedes o los reportes analíticos.

El enfoque iterativo e incremental de Scrum permite entregar un **Producto Mínimo Viable (MVP)** funcional en pocas semanas, posibilitando pruebas operativas reales con el personal de recepción y limpieza, y recibir retroalimentación antes de construir el resto del backlog. Además, la flexibilidad de Scrum facilita gestionar la complejidad técnica concentrada en la integración de la pasarela de pago (HU03b, la historia de mayor riesgo del proyecto) sin detener el avance de los demás módulos.

## 2. Parámetros de Planificación

* **Equipo:** 1 Product Owner (Luisa Maria Basanta Cordoba), 1 Líder Técnico (Miguel Angel Narvaez Montufar), 2 Desarrolladoras/es (Juan David Ordoñez Bolaños y Daniel Alejandro Benavides).
* **Velocidad del Equipo (V):** 12 SP / Sprint — justificada formalmente en `03_estimacion_y_costos.md`, sección 3.4: V = (N_dev × H_sprint × FE) / F_c = (2 × 80 × 0.60) / 8 = 12 SP/Sprint. Es una hipótesis de planificación (Factor de Enfoque = 60%), no una velocidad medida.
* **Duración por Sprint:** 2 Semanas (80 horas hábiles por desarrollador).
* **Total SP del MVP (Historias Must Have):** 25 SP (`HU01`: 5 SP, `HU02`: 3 SP, `HU03a`: 3 SP, `HU03b`: 8 SP, `HU03c`: 2 SP, `HU04`: 2 SP, `HU05`: 2 SP).
* **Total SP del Backlog Completo:** 48 SP (ver `03_estimacion_y_costos.md`).
* **Número de Sprints Calculados para el MVP:** nSprints = 25 / 12 = 2.08 ⟶ **3 Sprints**.
* **Número de Sprints Calculados para el Backlog Completo:** nSprints = 48 / 12 = 4 ⟶ **5 Sprints** (la última historia, de solo 2 SP, deja un sprint final parcial).
* **Duración Total del MVP en Semanas:** 6 Semanas.
* **Duración Total del Proyecto Completo en Semanas:** 10 Semanas.

## 3. Planificación Detallada de Sprints

> **Corrección de auditoría (2026-10-13):** la versión anterior de este plan asignaba HU03 (13 SP) partida en "12 SP en el Sprint 2 + 1 SP restante en el Sprint 3", sin que esa partición correspondiera a una unidad de trabajo verificable de forma independiente. HU03 se descompuso en tres historias atómicas (HU03a, HU03b, HU03c — ver `03_estimacion_y_costos.md` §3.0). El plan de Sprints siguiente **ya no divide ninguna historia entre dos Sprints**.

**Sprint 1 (Semanas 1 y 2) · Capacidad: 12 SP**
* [#1]: `HU01 - Registro e Inicio de Sesión de Usuario` (5 SP - $1.800.000 COP)
* [#2]: `HU02 - Búsqueda de Habitaciones Disponibles` (3 SP - $1.080.000 COP)
* [#4]: `HU04 - Gestión de Check-in y Check-out` (2 SP - $720.000 COP)
* [#5]: `HU05 - Control del Estado Operativo de Habitaciones` (2 SP - $720.000 COP)
* **Carga Total del Sprint 1:** 12 SP | Esfuerzo: 96 Horas | Costo Sprint 1: $4.320.000 COP

**Sprint 2 (Semanas 3 y 4) · Capacidad: 12 SP**
* [#3]: `HU03a - Resumen de Reserva y Selección de Pago` (3 SP - $1.080.000 COP)
* [#11]: `HU03b - Procesamiento de Pago y Generación de Código de Reserva` (8 SP - $2.880.000 COP)
* **Carga Total del Sprint 2:** 11 SP | Esfuerzo: 88 Horas | Costo Sprint 2: $3.960.000 COP

**Sprint 3 (Semanas 5 y 6 - Cierre del MVP) · Capacidad: 12 SP**
* [#12]: `HU03c - Comprobante de Confirmación por Correo` (2 SP - $720.000 COP)
* [#6]: `HU06 - Cancelación de Reservas por Parte del Cliente` (5 SP - $1.800.000 COP)
* [#7]: `HU07 - Registro de Consumos Adicionales y Facturación` (5 SP - $1.800.000 COP)
* **Carga Total del Sprint 3:** 12 SP | Esfuerzo: 96 Horas | Costo Sprint 3: $4.320.000 COP
* **➜ Con el cierre de HU03c en este sprint, las 7 historias Must Have quedan completas y el MVP funcionalmente terminado.** HU06 y HU07 (Should Have) se incluyen en el mismo Sprint porque sobra capacidad tras completar el Must Have del Sprint — **no forman parte del MVP**, son trabajo del backlog adicional adelantado.

**Sprint 4 (Semanas 7 y 8 - Extensión Proyecto Completo) · Capacidad: 12 SP**
* [#10]: `HU10 - Generación de Reportes y Métricas de Ocupación` (8 SP - $2.880.000 COP)
* [#8]: `HU08 - Gestión de Incidencias y Mantenimiento` (3 SP - $1.080.000 COP)
* **Carga Total del Sprint 4:** 11 SP | Esfuerzo: 88 Horas | Costo Sprint 4: $3.960.000 COP

**Sprint 5 (Semanas 9 y 10 - Cierre del Backlog) · Capacidad: 12 SP**
* [#9]: `HU09 - Perfil e Historial del Huésped` (2 SP - $720.000 COP)
* **Carga Total del Sprint 5:** 2 SP | Esfuerzo: 16 Horas | Costo Sprint 5: $720.000 COP

**Verificación de totales:** 12 + 11 + 12 + 11 + 2 = **48 SP** ✓ · 96 + 88 + 96 + 88 + 16 = **384 horas** ✓ · $4.320.000 + $3.960.000 + $4.320.000 + $3.960.000 + $720.000 = **$17.280.000 COP** ✓. Ningún Sprint supera la capacidad V = 12 SP.

## 4. Resumen Comercial de la Propuesta (Línea Base Final)

* **Tiempo de Entrega del MVP:** 6 Semanas (3 Sprints) — el MVP queda completo al finalizar HU03c dentro del Sprint 3.
* **Esfuerzo Total del MVP:** 200 Horas/Hombre (25 SP × 8 h/SP).
* **MVP de Inversión Financiera:** $9.000.000 COP.
* **Tiempo de Entrega Proyecto Completo:** 10 Semanas (5 Sprints).
* **Esfuerzo Total Proyecto Completo:** 384 Horas/Hombre.
* **Inversión Financiera Proyecto Completo:** $17.280.000 COP.
