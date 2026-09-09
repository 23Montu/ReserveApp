# Documento de Requisitos: Gestor de Reservas de Hotel

## Actores Principales del Sistema
* **Huésped / Cliente:** Usuario final que busca, reserva y gestiona sus estancias en el hotel.
* **Recepcionista / Administrador:** Personal del hotel encargado de gestionar reservas, realizar check-in/check-out y administrar la disponibilidad de habitaciones.
* **Personal de Limpieza / Mantenimiento:** Personal operativo que consulta y actualiza el estado de limpieza y disponibilidad física de las habitaciones.

## Matriz de Problemas, Necesidades y Requisitos Funcionales

| Problema Identificado | Necesidad de Software | Requisito Funcional |
| :--- | :--- | :--- |
| **Overbooking:** Doble reserva involuntaria de la misma habitación en las mismas fechas. | Control automatizado y en tiempo real de la disponibilidad por tipo de habitación. | **RF01:** El sistema debe actualizar el inventario de habitaciones en tiempo real e impedir la confirmación de reservas en fechas ocupadas. |
| **Largas esperas en recepción:** Demoras en el registro manual de entrada y salida de clientes. | Flujo ágil para verificar reservas y registrar datos del huésped rápidamente. | **RF02:** El sistema debe permitir al recepcionista buscar reservas por nombre/DNI y realizar el check-in/check-out en menos de tres clics. |
| **Falta de visibilidad operativa:** Desconocimiento de qué habitaciones están listas para ser ocupadas tras el check-out. | Módulo de seguimiento del estado de limpieza de habitaciones en tiempo real. | **RF03:** El sistema debe permitir actualizar y consultar los estados de la habitación (*Limpia*, *Sucia*, *En Mantenimiento*). |
