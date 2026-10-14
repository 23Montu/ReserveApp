### 3. Demostración Paso a Paso con el Caso ReserveApp

#### 3.0. Descomposición de HU03 (auditoría 2026-10-13)

La historia original HU03 ("Confirmación y pago de reserva", 13 SP) agrupaba tres capacidades distintas y verificables por separado, ya presentes en sus propios Criterios de Aceptación. Dividir 13 SP en bloques de "12 en el Sprint 2 y 1 restante en el Sprint 3" no identificaba una unidad de trabajo entregable de forma independiente — era un corte aritmético, no una descomposición funcional. Se reemplazó por tres historias atómicas, cada una completa dentro de un único Sprint:

| Sub-historia | Alcance (criterio de aceptación original de HU03) | Comparación contra la pivote (HU05 = 2 SP) | SP |
| :--- | :--- | :--- | :--- |
| **HU03a** (`#3`) | "Presenta un resumen detallado con el desglose de precios y total a pagar" | Más que la pivote: requiere cálculo de desglose de precios y un formulario de selección de método de pago. | 3 |
| **HU03b** (`#11`) | "Genera un código único de reserva tras procesar la transacción" | Mucho más que la pivote: integración con una pasarela de pago externa, manejo de errores/rechazos sin duplicar cobros — la única historia del backlog con dependencia de un servicio de terceros. | 8 |
| **HU03c** (`#12`) | "Envía un comprobante de confirmación por correo electrónico" | Igual de simple que la pivote: solo dispara un correo transaccional con plantilla. | 2 |

**Validación cruzada:** 3 + 8 + 2 = **13 SP**, exactamente la estimación original. La descomposición no cambia el esfuerzo ni el costo total del alcance — los hace verificables y planificables de forma independiente, eliminando la necesidad de fraccionar una historia dentro de un Sprint.

#### 3.1. Parámetros del Proyecto

* **Equipo:** 1 Product Owner (Luisa Maria Basanta Cordoba), 1 Líder Técnico (Miguel Angel Narvaez Montufar), 2 Desarrolladoras/es (Juan David Ordoñez Bolaños y Daniel Alejandro Benavides).
* **Base de pivote Historia:** HU05 - Control del Estado Operativo de Habitaciones = 2 SP.
* **Factor de Conversión (F_c):** 8 Horas / SP.
* **Tarifa Profesional (T_h):** $45.000 COP / Hora.

#### 3.2. Desglose Matemático Detallado Historia por Historia

**Historia #1: HU01 - Registro e Inicio de Sesión de Usuario**
* Votación Planning Poker: 5 SP (Complejidad media: implementación de autenticación JWT y control de accesos por rol —Huésped, Recepcionista, Limpieza—).
* Cálculo de Esfuerzo (E_1): E_1 = 5 SP × 8 Horas/SP = 40 Horas
* Cálculo de Costo (C_1): C_1 = 40 Horas × 45.000 COP/Hora = 1.800.000 COP

**Historia #2: HU02 - Búsqueda de Habitaciones Disponibles**
* Votación Planning Poker: 3 SP (Complejidad baja-media: en comparación con la pivote de 2 SP, requiere filtros de búsqueda por fecha y tipo de habitación sobre disponibilidad en tiempo real).
* Cálculo de Esfuerzo (E_2): E_2 = 3 SP × 8 Horas/SP = 24 Horas
* Cálculo de Costo (C_2): C_2 = 24 Horas × 45.000 COP/Hora = 1.080.000 COP

**Historia #3: HU03a - Resumen de Reserva y Selección de Pago**
* Votación Planning Poker: 3 SP (Complejidad baja-media: cálculo de desglose de precios y formulario de selección de método de pago).
* Cálculo de Esfuerzo (E_3a): E_3a = 3 SP × 8 Horas/SP = 24 Horas
* Cálculo de Costo (C_3a): C_3a = 24 Horas × 45.000 COP/Hora = 1.080.000 COP

**Historia #11: HU03b - Procesamiento de Pago y Generación de Código de Reserva**
* Votación Planning Poker: 8 SP (Complejidad alta: integración con pasarela de pago externa, generación de código único y manejo de transacciones fallidas sin duplicar cobros).
* Cálculo de Esfuerzo (E_3b): E_3b = 8 SP × 8 Horas/SP = 64 Horas
* Cálculo de Costo (C_3b): C_3b = 64 Horas × 45.000 COP/Hora = 2.880.000 COP

**Historia #12: HU03c - Comprobante de Confirmación por Correo**
* Votación Planning Poker: 2 SP ([Complejidad = pivote]: envío de correo transaccional con plantilla, sin lógica de negocio adicional).
* Cálculo de Esfuerzo (E_3c): E_3c = 2 SP × 8 Horas/SP = 16 Horas
* Cálculo de Costo (C_3c): C_3c = 16 Horas × 45.000 COP/Hora = 720.000 COP

**Historia #4: HU04 - Gestión de Check-in y Check-out**
* Votación Planning Poker: 2 SP (Complejidad baja: CRUD estándar y actualización de estados de la reserva).
* Cálculo de Esfuerzo (E_4): E_4 = 2 SP × 8 Horas/SP = 16 Horas
* Cálculo de Costo (C_4): C_4 = 16 Horas × 45.000 COP/Hora = 720.000 COP

**Historia #5: HU05 - Control del Estado Operativo de Habitaciones**
* Votación Planning Poker: 2 SP ([Historia Pivote Base]: interfaz ágil de actualización de estados —Limpia, Sucia, En Mantenimiento—).
* Cálculo de Esfuerzo (E_5): E_5 = 2 SP × 8 Horas/SP = 16 Horas
* Cálculo de Costo (C_5): C_5 = 16 Horas × 45.000 COP/Hora = 720.000 COP

**Historia #6: HU06 - Cancelación de Reservas por Parte del Cliente**
* Votación Planning Poker: 5 SP (Complejidad media: lógica de negocio para cálculo de fechas límite y aplicación automática de políticas de penalización o cobro por *no-show*).
* Cálculo de Esfuerzo (E_6): E_6 = 5 SP × 8 Horas/SP = 40 Horas
* Cálculo de Costo (C_6): C_6 = 40 Horas × 45.000 COP/Hora = 1.800.000 COP

**Historia #7: HU07 - Registro de Consumos Adicionales y Facturación**
* Votación Planning Poker: 5 SP (Complejidad media: consolidación de consumos —*room service*, minibar— en una sola cuenta y generación de factura electrónica en PDF/XML).
* Cálculo de Esfuerzo (E_7): E_7 = 5 SP × 8 Horas/SP = 40 Horas
* Cálculo de Costo (C_7): C_7 = 40 Horas × 45.000 COP/Hora = 1.800.000 COP

**Historia #8: HU08 - Gestión de Incidencias y Mantenimiento**
* Votación Planning Poker: 3 SP (Complejidad baja-media: sistema de notificaciones internas para reportar averías al personal de mantenimiento).
* Cálculo de Esfuerzo (E_8): E_8 = 3 SP × 8 Horas/SP = 24 Horas
* Cálculo de Costo (C_8): C_8 = 24 Horas × 45.000 COP/Hora = 1.080.000 COP

**Historia #9: HU09 - Perfil e Historial del Huésped**
* Votación Planning Poker: 2 SP (Complejidad baja: consulta histórica de estancias, consumos y preferencias en base de datos).
* Cálculo de Esfuerzo (E_9): E_9 = 2 SP × 8 Horas/SP = 16 Horas
* Cálculo de Costo (C_9): C_9 = 16 Horas × 45.000 COP/Hora = 720.000 COP

**Historia #10: HU10 - Generación de Reportes y Métricas de Ocupación**
* Votación Planning Poker: 8 SP (Complejidad media-alta: procesamiento analítico y consultas de agregación para reportes de ocupación e ingresos —RevPAR—).
* Cálculo de Esfuerzo (E_10): E_10 = 8 SP × 8 Horas/SP = 64 Horas
* Cálculo de Costo (C_10): C_10 = 64 Horas × 45.000 COP/Hora = 2.880.000 COP

#### 3.3. Cálculo de Sumatorias Totales

Total SP = 5 + 3 + 3 + 8 + 2 + 2 + 2 + 5 + 5 + 3 + 2 + 8 = **48 SP**

E_total = 40 + 24 + 24 + 64 + 16 + 16 + 16 + 40 + 40 + 24 + 16 + 64 = **384 Horas**

C_total = $1.800.000 + $1.080.000 + $1.080.000 + $2.880.000 + $720.000 + $720.000 + $720.000 + $1.800.000 + $1.800.000 + $1.080.000 + $720.000 + $2.880.000 = **$17.280.000 COP**

> Los totales del backlog (48 SP, 384 horas, $17.280.000 COP) **no cambiaron** respecto a la estimación previa a la descomposición de HU03 — la división solo redistribuyó los mismos 13 SP en tres unidades verificables, sin alterar el alcance ni el presupuesto.

#### 3.4. Justificación Formal de la Velocidad del Equipo (V)

La presentación venía usando V = 12 SP/Sprint sin una fórmula explícita. Se formaliza así, declarando cada supuesto:

**Fórmula:**

V = (N_dev × H_sprint × FE) / F_c

**Variables:**

| Variable | Significado | Valor | Fuente |
| :--- | :--- | :--- | :--- |
| N_dev | Número de desarrolladores | 2 | Equipo real (Juan y Daniel) |
| H_sprint | Capacidad por desarrollador cada Sprint (2 semanas) | 80 horas | Supuesto de dedicación de tiempo completo (40 h/semana), ya documentado en el proyecto |
| FE | Factor de Enfoque — proporción del tiempo bruto dedicada efectivamente a tareas de desarrollo del Sprint (descuenta carga académica paralela, reuniones, revisiones de código, imprevistos) | 0.60 (60%) | **Supuesto inicial del equipo — DATO A VALIDAR, no una medición histórica** |
| F_c | Factor de conversión | 8 horas/SP | Ya documentado en 3.1 |

**Sustitución numérica:**

V = (2 × 80 × 0.60) / 8 = 96 / 8 = **12 SP/Sprint**

> **DATO A VALIDAR:** el proyecto no tiene Sprints históricos completados, por lo que no existe una velocidad medida. El Factor de Enfoque de 0.60 es una hipótesis de planificación razonable para un equipo estudiantil con carga académica simultánea, **no una velocidad demostrada por experiencia**. Debe recalibrarse con la velocidad real observada al cierre del Sprint 1 (Inspección + Adaptación, pilares de Scrum).

#### Matriz Resumen Consolidada ReserveApp

| ID Issue | Historia de Usuario | Categoría MoSCoW | Puntos de Historia (PH) | Factor (F_c) | Esfuerzo (E_i) | Tarifa (T_h) | Costo Financiero (C_i) | Justificación Técnica / Juicio de Expertos |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **#1** | HU01 - Registro e Inicio de Sesión | Must Have | 5 SP | 8 horas/SP | 40 horas | $45.000 COP | $1.800.000 COP | Autenticación JWT y control de accesos por rol. |
| **#2** | HU02 - Búsqueda de Habitaciones | Must Have | 3 SP | 8 horas/SP | 24 horas | $45.000 COP | $1.080.000 COP | Filtros de disponibilidad por fecha y tipo. |
| **#3** | HU03a - Resumen de Reserva y Selección de Pago | Must Have | 3 SP | 8 horas/SP | 24 horas | $45.000 COP | $1.080.000 COP | Desglose de precios y selección de método de pago. |
| **#11** | HU03b - Procesamiento de Pago y Código de Reserva | Must Have | 8 SP | 8 horas/SP | 64 horas | $45.000 COP | $2.880.000 COP | Integración con pasarela de pago externa. Mayor riesgo técnico del proyecto. |
| **#12** | HU03c - Comprobante de Confirmación por Correo | Must Have | 2 SP | 8 horas/SP | 16 horas | $45.000 COP | $720.000 COP | Envío de correo transaccional con código de reserva. |
| **#4** | HU04 - Check-in y Check-out | Must Have | 2 SP | 8 horas/SP | 16 horas | $45.000 COP | $720.000 COP | CRUD estándar de estados de reserva. |
| **#5** | HU05 - Estado Operativo de Habitaciones | Must Have | 2 SP | 8 horas/SP | 16 horas | $45.000 COP | $720.000 COP | [Base Pivote] Interfaz ágil de actualización de estados. |
| **#6** | HU06 - Cancelación de Reservas | Should Have | 5 SP | 8 horas/SP | 40 horas | $45.000 COP | $1.800.000 COP | Lógica de negocio y cálculo de fechas límite/penalización. |
| **#7** | HU07 - Consumos Adicionales y Facturación | Should Have | 5 SP | 8 horas/SP | 40 horas | $45.000 COP | $1.800.000 COP | Consolidación de cobros y generación de factura PDF/XML. |
| **#8** | HU08 - Incidencias y Mantenimiento | Could Have | 3 SP | 8 horas/SP | 24 horas | $45.000 COP | $1.080.000 COP | Sistema de notificaciones internas. |
| **#9** | HU09 - Perfil e Historial del Huésped | Could Have | 2 SP | 8 horas/SP | 16 horas | $45.000 COP | $720.000 COP | Consulta histórica simple en base de datos. |
| **#10** | HU10 - Reportes y Métricas de Ocupación | Should Have | 8 SP | 8 horas/SP | 64 horas | $45.000 COP | $2.880.000 COP | Procesamiento analítico y consultas de agregación (RevPAR). |
| **TOTAL** | Backlog Completo (12 historias) | -- | **48 SP** | -- | **384 horas** | -- | **$17.280.000 COP** | Proyecto Completo Estimado |

> **Nota metodológica:** los puntajes fueron derivados de la complejidad cualitativa documentada en `02_priorización.md`, tomando **HU05 como historia pivote (2 SP)**. Se recomienda que el equipo (PO, Líder Técnico y ambos desarrolladores) valide o ajuste estos valores en una sesión real de consenso antes de tomarlos como definitivos para la planificación de sprints.
