# Decisiones pendientes del Product Owner — ReserveApp

> **BORRADOR PARA REVISIÓN.** Preparado el 2026-11-10. **Ninguna de estas decisiones está aprobada.** Cada «Propuesta del equipo» es una recomendación técnica para discutir, no una decisión. Para registrar una decisión, completa el recuadro **Decisión del PO** con la opción elegida, la fecha y el responsable.

## Resumen

| ID | Tema | Historias afectadas | Bloquea |
|---|---|---|---|
| P1 | Roles dentro de HU01 o en una historia aparte | HU01, HU04, HU05 | Cierre de HU01, inicio de HU04 y HU05 |
| P2 | Catálogo de roles y alta de cuentas del personal | HU01/roles, HU04, HU05, HU08 | Autorización de rutas |
| P3 | Confirmación del registro: en pantalla o por correo | HU01, HU03c | Cierre de HU01 |
| P4 | Normalización NFKC y momento de medir la longitud | HU01 | Corrección del defecto D1 |
| P5 | Validez del token después de cerrar sesión | HU01 | — |
| P6 | Límite de intentos de autenticación | HU01 | Mitigación de agotamiento de memoria |
| P7 | Si el registro puede revelar que un correo existe | HU01, HU03c | — |
| P8 | Criterio de búsqueda y efectos del check-in/check-out | HU04, HU03b, HU05 | Diseño de HU04 |
| P9 | Piso, «asignación» y actualización del panel | HU05, HU02, HU04 | Diseño de HU05 |
| P10 | Calendario: fecha de inicio, tipo de campo y número de sprints | Todas | Configuración del Project y burn-up |
| P11 | Estado y campos del GitHub Project | Todas | Informe del Sprint 1 |

---

## P1 — Alcance de los roles en HU01

**Contexto.** El Issue #1 está escrito para el huésped y tiene tres criterios: validar correo y contraseña, mensaje de confirmación y error claro. No menciona roles. En cambio, `DOCS/02` y `DOCS/03` atribuyen a HU01 el control de acceso por rol. En el código, el registro asigna `HUESPED`, ninguna ruta exige un rol y no se pueden crear cuentas de personal.

| | A: roles dentro de HU01 | B: historia Must Have aparte |
|---|---|---|
| Ventajas | Coincide con `DOCS/02` y `DOCS/03`. No crea historias nuevas. | HU01 se verifica con sus 3 criterios actuales. El PR #14 puede fusionarse ya. La autorización se diseña una vez, con HU04 y HU05 como primeros casos. |
| Desventajas | Hay que cambiar los criterios del Issue #1. El PR #14 no se puede cerrar hasta implementar los roles. | Hay que crear y estimar una historia nueva. Se modifica el backlog. |
| Impacto técnico | Hay que ampliar el PR #14 con middleware y altas de personal. | Una rama nueva, con `src/seguridad/autorizacion.js`. |
| Impacto en SP | Los 5 SP de HU01 podrían quedarse cortos. | La historia nueva necesita estimación (Planning Poker). **No hay SP asignados.** |

**Dependencias.** Con cualquiera de las dos opciones, HU04 («como recepcionista») y HU05 («como personal de limpieza») necesitan autorización por rol antes de terminarse.

**Propuesta del equipo:** opción **B**. La historia de roles se planifica antes de HU04 y HU05, o en el mismo Sprint.

> **Decisión del PO:** ☐ A ☐ B ☐ Otra: ______ · Fecha: ______ · Responsable: ______

## P2 — Catálogo de roles y alta de cuentas del personal

**Contexto.** `ROLES` define `HUESPED`, `RECEPCIONISTA` y `LIMPIEZA`. `DOCS/01` agrupa «Recepcionista / Administrador» y «Limpieza / Mantenimiento». Los datos se guardan en memoria y se pierden al reiniciar, así que un script externo no puede crear cuentas en un servidor que ya está en ejecución.

| Pregunta | Alternativas | Consideraciones |
|---|---|---|
| ¿Cómo se crean las cuentas del personal? | (a) Un administrador inicial creado desde variables de entorno al arrancar, que da de alta al personal con `POST /api/usuarios`. (b) Cuentas semilla de demostración. (c) Esperar a tener persistencia. | (a) es seguro y funciona en memoria, pero exige definir el rol `ADMIN`. (b) es rápido, pero tiene credenciales fijas, aceptables solo para demostración. (c) bloquea HU04 y HU05. |
| ¿Recepcionista y administrador son roles distintos? | Uno solo o dos | Solo hace falta separarlos si alguien gestiona cuentas, como en la alternativa (a). |
| ¿Limpieza y mantenimiento son un mismo rol? | Uno solo o dos | HU05 menciona solo «personal de limpieza». HU08 (Could Have) podría justificar `MANTENIMIENTO` más adelante. |
| ¿Recepción puede cambiar el estado de una habitación? | Solo lectura, o lectura y escritura | El criterio de HU05 dice que recepción **ve** el estado. |
| ¿Qué rutas se protegen y con qué rol? | Matriz borrador en el Anexo A | — |

**Respuestas 401 y 403 (propuesta técnica, aplicable con cualquier opción):**
- **401:** no hay cookie, o el token es inválido, está vencido o pertenece a una cuenta que ya no existe.
- **403:** hay sesión válida, pero el rol no está permitido.
- **Formato:** `{ "error": "..." }`, como el resto de la API.
- **Origen del rol:** se lee del usuario guardado, no del token, para que los cambios apliquen enseguida.

**Propuesta del equipo:** `HUESPED`, `RECEPCIONISTA` y `LIMPIEZA`, más `ADMIN` solo si se elige la alternativa (a). Limpieza y mantenimiento como un solo rol hasta HU08. Recepción con solo lectura del estado.

> **Decisión del PO:** ______

## P3 — Confirmación del registro

**Contexto.** El criterio 2 del Issue #1 dice «Se **envía** un mensaje de confirmación». Hoy la confirmación solo se muestra en pantalla y no se envían correos. Sin un correo, tampoco se verifica que la persona sea dueña de la dirección.

| | Solo en pantalla | Correo de confirmación |
|---|---|---|
| Ventajas | Ya está implementada. Sin dependencias externas. | Cumple el texto literal y verifica la dirección. |
| Desventajas | Hay que reformular el criterio. Cualquiera puede registrarse con un correo ajeno. | Requiere un servicio de correo, cuya infraestructura llega con HU03c. Retrasa HU01. |

**Dependencias.** HU03c (Sprint 3) introduce el envío de correos.

**Propuesta del equipo:** confirmación en pantalla para HU01, aclarando el criterio. La verificación por correo se planifica junto con HU03c.

> **Decisión del PO:** ______

## P4 — NFKC y momento de medir la longitud

**Contexto.** La contraseña se normaliza con NFKC antes de calcular el hash, y la comparación con la lista de contraseñas comunes también usa NFKC y no distingue mayúsculas. **Defecto D1:** la longitud mínima (15) y la máxima (128) se miden **antes** de normalizar. Comprobado: `e` + acento combinante, repetido 8 veces, mide 16 puntos de código y se guarda como 8 caracteres. En sentido contrario, `ﷺ` se convierte en 18 caracteres.

| Alternativa | Ventajas | Desventajas |
|---|---|---|
| Aprobar NFKC y medir **después** de normalizar | La longitud se aplica a lo que realmente se guarda. Coherente con NIST SP 800-63B, que recomienda normalizar con NFKC o NFKD. | Algunas entradas que hoy se aceptan pasan a rechazarse. Ciertos caracteres cuentan como varios. |
| Aprobar NFKC y medir antes (situación actual) | Sin cambios | Se pueden guardar secretos con menos de 15 caracteres. |
| No normalizar | El comportamiento es más fácil de explicar. | La misma contraseña escrita desde otro teclado o sistema podría no coincidir. |

**Propuesta del equipo:** aprobar NFKC, medir después de normalizar y limitar también la longitud en el login.

> **Decisión del PO:** ______

## P5 — Validez del token después de cerrar sesión

**Contexto.** Al cerrar sesión se borra la cookie, pero el JWT sigue siendo válido hasta que vence, 1 hora después.

| Alternativa | Ventajas | Desventajas |
|---|---|---|
| (a) Lista de tokens revocados por `jti`, en memoria | Cierra solo esa sesión. | Hay que mantener la lista hasta que cada token venza. |
| (b) `versionToken` por usuario, que se incrementa al cerrar sesión | Simple. Cierra todas las sesiones del usuario. | Cierra también las sesiones de otros dispositivos. |
| (c) Sin cambios | Ninguna | Un token robado sirve hasta 1 hora. |

**Propuesta del equipo:** (b), por simplicidad.

> **Decisión del PO:** ______

## P6 — Límite de intentos de autenticación

**Contexto.** No hay ningún límite. En Node 22, cada hash con scrypt reserva 128 MiB. Sin un límite, unas pocas solicitudes simultáneas bastan para agotar la memoria.

| Alternativa | Ventajas | Desventajas |
|---|---|---|
| Limitador en memoria por IP y por correo, más un tope de hashes simultáneos | Sin dependencias nuevas. Mitiga los ataques de fuerza bruta y el agotamiento de memoria. | Se reinicia junto con el servidor. Puede bloquear a usuarios legítimos que comparten IP. |
| Usar una librería | Probada | Añade una dependencia. |
| Sin límite | Ninguna | Expuesto a fuerza bruta y a agotamiento de memoria. |

**El equipo no propone valores numéricos.** El número de intentos y la ventana de tiempo los decide el PO o el equipo.

> **Decisión del PO:** intentos ____ / ventana ____ / alcance (IP, correo o ambos) ____

## P7 — ¿El registro puede revelar que un correo existe?

**Contexto.** El registro responde 409 con el mensaje «ese correo ya está registrado». El login no lo revela.

| Alternativa | Ventajas | Desventajas |
|---|---|---|
| Mantener el mensaje explícito | Mejor experiencia de uso | Permite averiguar qué correos tienen cuenta |
| Respuesta genérica («si el correo es nuevo, te llegará un mensaje») | Evita la enumeración | **Requiere envío de correos** (P3 y HU03c) |
| Mantenerlo, mitigado con P6 | Sin depender del correo | La enumeración sigue siendo posible, pero más lenta |

**Propuesta del equipo:** mantenerlo, mitigado con P6, y revisarlo cuando exista el correo (HU03c).

> **Decisión del PO:** ______

## P8 — HU04: criterio de búsqueda y efectos

**Contexto.** La historia del Issue #4 dice «mediante su **código de reserva**», pero su criterio dice «mediante el **número de documento**». El modelo `Reserva` no tiene ninguno de los dos campos. El código de reserva lo genera HU03b (Sprint 2).

| Pregunta | Alternativas | Impacto |
|---|---|---|
| ¿Cómo se busca? | Por documento, por código o por ambos | Con el código, HU04 depende de HU03b y no puede terminarse en el Sprint 1. |
| ¿Qué significa «activa»? | Confirmada y sin check-out; o además con fecha de entrada igual a hoy | Define el filtro y las pruebas. |
| ¿El check-out marca la habitación como «Sucia»? | Sí o no | Si es sí, HU04 queda acoplada a HU05. |

**Propuesta del equipo:** buscar por **documento**, como dice el criterio, para no depender de HU03b. «Activa» = confirmada o en estancia, sin check-out. Que el check-out marque la habitación como «Sucia» si HU05 ya está integrada.

> **Decisión del PO:** ______

## P9 — HU05: piso, «asignación» y actualización del panel

**Contexto.** HU05 pide filtrar por piso, reflejar el estado «de forma inmediata en el panel del recepcionista» y «bloquear la asignación» de habitaciones en mantenimiento. No existen el campo piso, el panel de recepción ni ninguna operación de asignación.

| Pregunta | Alternativas |
|---|---|
| Piso | Un campo `piso` en `Habitacion`, o deducirlo del número (101 → piso 1) |
| «Asignación» | Excluir de la búsqueda de HU02, impedir el check-in de HU04, o ambas |
| «Inmediata» | Al recargar la página, consulta periódica o tiempo real (SSE) |

**Propuesta del equipo:** un campo `piso` explícito. Excluir las habitaciones en mantenimiento de la búsqueda y del check-in. Actualización por consulta periódica.

> **Decisión del PO:** ______

## P10 — Calendario y planificación

**Contexto.** `DOCS/04` planifica 5 sprints de 2 semanas, pero **no define una fecha de inicio**. Existe una propuesta de 6 sprints que no está ratificada. El Project no tiene campo Sprint ni Iteración.

| Pregunta | Alternativas | Consideraciones |
|---|---|---|
| Tipo de campo | Iteración (14 días) o Sprint de selección única | La Iteración permite vistas por fechas y burn-up. Ojo: las iteraciones con fecha pasada se marcan como completadas. |
| Fecha de inicio | **Debe indicarla el PO** | — |
| Esquema | 5 sprints (`DOCS/04`, vigente) o 6 | Con 6 sprints hay que actualizar `DOCS/04` con autorización. |

**Propuesta del equipo:** un campo Iteración de 14 días con 5 iteraciones, según `DOCS/04`, cuando el PO confirme la fecha de inicio.

> **Decisión del PO:** fecha ____ · tipo ____ · esquema ____

## P11 — Estado y campos del GitHub Project

**Contexto.** `Status` solo tiene `Todo`, `In Progress` y `Done`. HU01 figura en Todo aunque tiene el PR #14 abierto. No hay campo de Story Points.

**Propuesta del equipo:**
- Añadir la opción `In review` al Status.
- Añadir un campo numérico `Story Points`.
- Mover HU01 a `In review`.
- Mover HU04 y HU05 a `In Progress` solo cuando sus ramas estén publicadas.

> **Decisión del PO:** ______

---

## Decisiones adicionales declaradas en el PR #15 (HU03a)

Estas decisiones no forman parte de las 11 anteriores. El propio PR #15 las declara pendientes de aprobación del PO.

| ID | Tema | Lo que implementa el PR #15 | Nota |
|---|---|---|---|
| A1 | Impuesto | IVA del 19 %, marcado como «supuesto provisional» | La regla fiscal debe confirmarla el PO. |
| A2 | Tarifa con IVA incluido | Total = tarifa × noches. El IVA se calcula como la parte contenida en ese total. | Según el PR, lo indicó el equipo el 2026-11-10. |
| A3 | Métodos de pago | Tarjeta de crédito, tarjeta débito y PSE | Condiciona la pasarela de pago de HU03b. |

El PR #15 usa `Closes #3`: **si se fusiona antes de que se aprueben A1–A3, el Issue #3 se cerrará automáticamente.**

---

## Anexo A — Matriz borrador de rutas y permisos (sujeta a P1 y P2)

| Ruta | Acceso propuesto |
|---|---|
| `GET /api/habitaciones/tipos`, `GET /api/habitaciones/disponibles` | Público |
| `GET /api/reservas/resumen` (HU03a) | Público. ¿Debe exigir sesión de huésped? Lo decide el PO. |
| `POST /api/auth/registro`, `/login`, `/logout`, `GET /api/auth/sesion` | Público |
| `POST /api/reservas/busqueda`, `POST /api/reservas/:id/check-in`, `POST /api/reservas/:id/check-out` (HU04) | `RECEPCIONISTA` (y `ADMIN`, si existe) |
| `GET /api/habitaciones?piso=` (HU05) | `LIMPIEZA`, `RECEPCIONISTA` |
| `PATCH /api/habitaciones/:id/estado` (HU05) | `LIMPIEZA` (y `RECEPCIONISTA`, según P2) |
