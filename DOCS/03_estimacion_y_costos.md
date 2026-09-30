### 3. Demostración Paso a Paso con el Caso ReserveApp

#### 3.1. Parámetros del Proyecto

* **Equipo:** 1 Product Owner, 1 Líder Técnico, 2 Desarrolladoras/es.
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

**Historia #3: HU03 - Confirmación y Pago de Reserva**
* Votación Planning Poker: 13 SP (Complejidad muy alta por integración con una pasarela de pago externa y manejo seguro de transacciones financieras).
* Cálculo de Esfuerzo (E_3): E_3 = 13 SP × 8 Horas/SP = 104 Horas
* Cálculo de Costo (C_3): C_3 = 104 Horas × 45.000 COP/Hora = 4.680.000 COP

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

Total SP = 5 + 3 + 13 + 2 + 2 + 5 + 5 + 3 + 2 + 8 = **48 SP**

E_total = 40 + 24 + 104 + 16 + 16 + 40 + 40 + 24 + 16 + 64 = **384 Horas**

C_total = $1.800.000 + $1.080.000 + $4.680.000 + $720.000 + $720.000 + $1.800.000 + $1.800.000 + $1.080.000 + $720.000 + $2.880.000 = **$17.280.000 COP**

#### Matriz Resumen Consolidada ReserveApp

| ID Issue | Historia de Usuario | Categoría MoSCoW | Puntos de Historia (PH) | Factor (F_c) | Esfuerzo (E_i) | Tarifa (T_h) | Costo Financiero (C_i) | Justificación Técnica / Juicio de Expertos |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **#1** | HU01 - Registro e Inicio de Sesión | Must Have | 5 SP | 8 horas/SP | 40 horas | $45.000 COP | $1.800.000 COP | Autenticación JWT y control de accesos por rol. |
| **#2** | HU02 - Búsqueda de Habitaciones | Must Have | 3 SP | 8 horas/SP | 24 horas | $45.000 COP | $1.080.000 COP | Filtros de disponibilidad por fecha y tipo. |
| **#3** | HU03 - Confirmación y Pago | Must Have | 13 SP | 8 horas/SP | 104 horas | $45.000 COP | $4.680.000 COP | Integración con pasarela de pago y transacciones seguras. |
| **#4** | HU04 - Check-in y Check-out | Must Have | 2 SP | 8 horas/SP | 16 horas | $45.000 COP | $720.000 COP | CRUD estándar de estados de reserva. |
| **#5** | HU05 - Estado Operativo de Habitaciones | Must Have | 2 SP | 8 horas/SP | 16 horas | $45.000 COP | $720.000 COP | [Base Pivote] Interfaz ágil de actualización de estados. |
| **#6** | HU06 - Cancelación de Reservas | Should Have | 5 SP | 8 horas/SP | 40 horas | $45.000 COP | $1.800.000 COP | Lógica de negocio y cálculo de fechas límite/penalización. |
| **#7** | HU07 - Consumos Adicionales y Facturación | Should Have | 5 SP | 8 horas/SP | 40 horas | $45.000 COP | $1.800.000 COP | Consolidación de cobros y generación de factura PDF/XML. |
| **#8** | HU08 - Incidencias y Mantenimiento | Should Have | 3 SP | 8 horas/SP | 24 horas | $45.000 COP | $1.080.000 COP | Sistema de notificaciones internas. |
| **#9** | HU09 - Perfil e Historial del Huésped | Could Have | 2 SP | 8 horas/SP | 16 horas | $45.000 COP | $720.000 COP | Consulta histórica simple en base de datos. |
| **#10** | HU10 - Reportes y Métricas de Ocupación | Should Have | 8 SP | 8 horas/SP | 64 horas | $45.000 COP | $2.880.000 COP | Procesamiento analítico y consultas de agregación (RevPAR). |
| **TOTAL** | Backlog Completo | -- | **48 SP** | -- | **384 horas** | -- | **$17.280.000 COP** | Proyecto Completo Estimado |

> **Nota metodológica:** los puntajes de esta votación de Planning Poker fueron derivados de la complejidad cualitativa ya documentada en `02_priorización.md`, tomando **HU05 como historia pivote (2 SP)**. Se recomienda que el equipo (PO, Líder Técnico y ambos desarrolladores) valide o ajuste estos valores en una sesión real de consenso antes de tomarlos como definitivos para la planificación de sprints.
