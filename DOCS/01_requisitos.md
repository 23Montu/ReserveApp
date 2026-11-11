# Documento de Requisitos: Gestor de Reservas de Hotel

## Actores Principales del Sistema
* **Huésped / Cliente:** Usuario final que busca, reserva y gestiona sus estancias en el hotel.
* **Recepcionista / Administrador:** Personal del hotel encargado de gestionar reservas, realizar check-in/check-out y administrar la disponibilidad de habitaciones.
* **Personal de Limpieza / Mantenimiento:** Personal operativo que consulta y actualiza el estado de limpieza y disponibilidad física de las habitaciones.

## Matriz de Problemas, Necesidades y Requisitos Funcionales

| Problema Identificado | Necesidad de Software | Requisito Funcional |
| :--- | :--- | :--- |
| **1. Ineficiencia en la Gestión de Inventario y Overbooking:** Conflictos por reservas dobles en las mismas fechas y pérdidas de ingresos asociadas a cancelaciones no penalizadas o *no-shows*. | Control automatizado en tiempo real de la disponibilidad y aplicación sistemática de políticas de cancelación. | **RF01:** El sistema debe actualizar el inventario de habitaciones en tiempo real e impedir confirmaciones en fechas ocupadas.<br><br>**RF02:** El sistema debe gestionar políticas de cancelación y procesar cobros automáticos por *no-show* o cancelaciones tardías. |
| **2. Cuellos de Botella y Errores en la Atención Presencial:** Demoras operativas durante el registro de entrada/salida e inconsistencias en el cobro manual de consumos adicionales. | Flujo ágil de registro de huéspedes e integración centralizada de consumos en la cuenta de la habitación. | **RF03:** El sistema debe permitir al recepcionista buscar reservas por nombre/DNI y completar el check-in/check-out en tres clics o menos.<br><br>**RF04:** El sistema debe consolidar la estancia y consumos adicionales (*room service*, minibar) en una sola cuenta y generar facturas electrónicas. |
| **3. Desconexión Operativa y de Mantenimiento:** Desconocimiento sobre la disponibilidad física real de las habitaciones e ineficiencia en el reporte y atención de averías. | Módulo centralizado de seguimiento de estados operativos de habitaciones y gestión instantánea de incidencias. | **RF05:** El sistema debe permitir actualizar y consultar los estados de la habitación (*Limpia*, *Sucia*, *En Mantenimiento*) en tiempo real.<br><br>**RF06:** El sistema debe permitir registrar incidencias técnicas por habitación y enviar notificaciones automáticas al personal de mantenimiento. |
| **4. Ausencia de Trazabilidad y Fidelización del Cliente:** Imposibilidad de identificar huéspedes frecuentes y desconocimiento de sus preferencias para brindar un servicio personalizado. | Registro histórico centralizado de clientes y gestión de perfiles de usuario. | **RF07:** El sistema debe almacenar el historial de estancias, consumos y preferencias de los huéspedes para personalización del servicio. |
| **5. Opacidad en la Toma de Decisiones Estratégicas:** Inexistencia de analítica centralizada sobre el desempeño financiero y los niveles de ocupación del hotel. | Módulo de Inteligencia de Negocio y analítica avanzada con reportes consolidados. | **RF08:** El sistema debe generar reportes exportables de ocupación, ingresos promedio por habitación (RevPAR) y proyecciones de ventas. |

## Criterios Acordados para HU01 (Issue #1)

### Política de contraseñas

Detalla el criterio de aceptación "contraseña segura":

* La contraseña debe tener entre 15 y 128 caracteres Unicode, inclusive; cada punto de código cuenta una vez. La longitud se mide **después** de normalizar la contraseña con NFKC.
* Antes de guardar la contraseña y antes de verificarla al iniciar sesión, se normaliza con NFKC. Las formas Unicode que NFKC unifica se consideran la misma contraseña: por ejemplo, «é» escrita como un solo carácter o como «e» más el acento combinante, o las letras de ancho completo y sus equivalentes ASCII. Algunos caracteres se expanden al normalizarse y cuentan con su longitud normalizada. Las mayúsculas y minúsculas se siguen distinguiendo. *(Opción A, aprobada por el Product Owner el 2026-11-10.)*
* Acepta espacios y distintos tipos de caracteres. No se exigen combinaciones de mayúsculas, minúsculas, números o símbolos.
* La contraseña no se trunca.
* Se rechaza la contraseña completa si coincide con una lista mantenible de contraseñas comunes, esperadas o comprometidas (`src/seguridad/contrasenas-comunes.txt`). La lista incluye valores previsibles muy comunes, como algunas secuencias o repeticiones; no se prohíbe de forma general cualquier secuencia o repetición.
* Al rechazarla, el sistema muestra un mensaje claro que explica que se debe elegir una contraseña menos común.

### Comportamiento implementado, pendiente de aprobación

* **Comparación con la lista:** el comportamiento implementado compara sin distinguir mayúsculas y con normalización Unicode NFKC, para que variantes como `PASSWORDPASSWORD` o los mismos dígitos en ancho completo no eludan la lista. El criterio anterior no lo exige y **todavía no está aprobado**. Esta decisión es independiente de la normalización NFKC al guardar y verificar la contraseña, que sí está aprobada (ver «Política de contraseñas»). Ignorar las mayúsculas solo afecta a esta comparación: al guardar la contraseña e iniciar sesión, las mayúsculas sí se distinguen.

### Decisiones resueltas

* **Roles (resuelto en el Issue #5, 2026-11-10):** el control de acceso por roles se implementará en una historia Must Have independiente. HU01 conserva sus tres criterios; el registro asigna `HUESPED` y ninguna ruta exige un rol. `DOCS/02` y `DOCS/03` se actualizarán cuando se cree y estime esa historia.

### Discrepancias pendientes de decisión

* **Mensaje de confirmación:** el Issue dice "se envía". La confirmación se muestra en pantalla y no se envían correos.
* **Historial de reservas:** la historia lo menciona, pero no es un criterio de aceptación; lo cubre HU09 (Issue #9).

### Sin implementar por falta de criterios aprobados

* Invalidar el JWT al cerrar sesión: hoy se borra la cookie y el token sigue siendo válido hasta su expiración, de 1 hora.
* Limitar los intentos de registro e inicio de sesión.
* Ocultar si un correo ya está registrado: el mensaje de registro hoy lo revela.
