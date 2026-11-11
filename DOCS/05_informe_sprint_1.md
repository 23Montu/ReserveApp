# Informe del Sprint 1 — ReserveApp

> **BORRADOR PARA REVISIÓN.** Estado verificado contra GitHub el 2026-11-10. El Sprint 1 **no se declara cerrado**: no hay fecha de cierre documentada y 9 de los 12 SP comprometidos no cumplen la Definición de Terminado.
>
> **Antes de publicar:** existe otro borrador en la rama local `docs/informe-sprint-1` (commit `0987922`), que no está en GitHub. Hay que comparar ambos y conservar uno solo, para no duplicar el informe.

## 1. Datos del Sprint

| Campo | Valor | Fuente |
|---|---|---|
| Duración planificada | 2 semanas | `DOCS/04`, §2 |
| Fecha de inicio | **No determinada** | No figura en `DOCS/04`, en el Project ni en milestones |
| Fecha de cierre | **No determinada** | Ídem |
| Capacidad planificada | 12 SP (V = 12 SP/Sprint, hipótesis con FE = 0,60) | `DOCS/03`, §3.4 |
| Objetivo del Sprint | **No documentado** | `DOCS/04` lista historias, pero no un objetivo de Sprint |

> *Propuesta de redacción del objetivo, pendiente de aprobación del equipo:* «Permitir que un huésped se registre, inicie sesión y busque habitaciones disponibles, y que el personal registre check-in/check-out y el estado operativo de las habitaciones.»

## 2. Definición de Terminado aplicada

Una historia cuenta como terminada solo si **su PR está fusionado en `main` y su Issue está cerrado**. Un PR abierto, una rama local o una tarjeta en «In Progress» no cuentan.

## 3. Historias comprometidas

| Historia | Issue | SP | PR | Estado del PR | Issue | Project | Integrada en `main` | ¿Cuenta? |
|---|---|---:|---|---|---|---|---|---|
| HU01 Registro e inicio de sesión | #1 | 5 | #14 | Abierto desde 2026-11-04, 0 revisiones, sin revisor asignado, `MERGEABLE` | Abierto | Todo | No | **No** |
| HU02 Búsqueda de habitaciones | #2 | 3 | #13 | Fusionado 2026-11-04 16:00 UTC, aprobado por 23Montu | Cerrado 2026-11-04 | Done | Sí (`f3e5b7a`) | **Sí** |
| HU04 Check-in y check-out | #4 | 2 | — | Sin PR ni rama remota | Abierto | Todo | No | **No** |
| HU05 Estado operativo de habitaciones | #5 | 2 | — | Sin PR ni rama remota | Abierto | Todo | No | **No** |

### Clasificación

- **Terminadas e integradas:** HU02 (3 SP).
- **Parcialmente realizadas, con PR abierto:** HU01 (5 SP). El código y las pruebas existen en la rama del PR #14, pero falta la revisión y hay decisiones de alcance pendientes del PO (roles, confirmación por correo, política de seguridad). El PR usa `Refs #1`, a propósito, para no cerrar el Issue.
- **Pendientes, sin evidencia en GitHub:** HU04 y HU05 (4 SP). Se informó que existen implementaciones locales, pero no hay rama ni PR publicados, así que su avance es **no determinado**.
- **Bloqueadas:**
  - HU04 depende de las decisiones P1, P2 y P8. Además, si la búsqueda se hace por código de reserva, depende de HU03b (Sprint 2).
  - HU05 depende de las decisiones P1, P2 y P9.

## 4. Story Points

| Métrica | Valor |
|---|---:|
| SP comprometidos | 12 |
| SP completados según la Definición de Terminado | **3** |
| SP con PR abierto, sin contar | 5 |
| SP sin evidencia en GitHub | 4 |
| **Cumplimiento real** | **25 %** (3/12) |

Este es el estado a la fecha de verificación, no el cierre definitivo del Sprint.

## 5. Trabajo adelantado del Sprint 2 (fuera del compromiso)

| Historia | Issue | SP | PR | Estado |
|---|---|---:|---|---|
| HU03a Resumen de reserva y selección de pago | #3 | 3 | #15 (Juan-Ord, creado 2026-11-10) | Abierto, 0 revisiones, `MERGEABLE`. Project: In Progress. |

- **No suma al cumplimiento del Sprint 1**, porque no formaba parte del compromiso. Si se fusiona y su Issue se cierra, se contabiliza en el Sprint en que eso ocurra.
- **Cierre automático del Issue.** El PR #15 usa `Closes #3`, así que fusionarlo cerraría el Issue #3. Sin embargo, el propio PR declara pendientes de aprobación del PO el IVA del 19 %, la tarifa con IVA incluido y los métodos de pago.
- **Sin pruebas automatizadas.** El PR #15 no tiene pruebas y su rama no define `npm test`.
- **Conflictos previstos.** Combinarlo con el PR #14 produce conflictos en `README.md` y `src/server.js`, comprobado con `git merge-tree`.

## 6. Pruebas

Ejecutadas localmente el 2026-11-10, con el comando `npm test` (`node --test`).

| Código probado | Node | Algoritmo de contraseñas | Total | Pasan | Fallan | Omitidas | Duración |
|---|---|---|---:|---:|---:|---:|---:|
| `ci/pruebas-pr` + PR #14 (`a0e1b2c`) | 22.14.0 | scrypt (respaldo) | 130 | 128 | 0 | 2 | ~42 s |
| `ci/pruebas-pr` + PR #14 (`a0e1b2c`) | 24.22.2 | Argon2id | 130 | 128 | 0 | 2 | ~3,4 s |
| `ci/pruebas-pr` + PR #15 (`16d1ae3`) | 22.14.0 y 24.22.2 | — | 0 | 0 | 0 | 0 | — |
| `main` (`f3e5b7a`) | — | — | Sin pruebas ni script `test` | | | | |

- **Las 2 omitidas** son `POST /api/reservas/busqueda` (HU04) y `PATCH /api/habitaciones/1/estado` (HU05), porque esas rutas no están en la rama.
- **HU02, la única historia integrada, no tiene pruebas automatizadas en `main`.**
- **Comprobaciones manuales:** las declaran los PR #14 y #15, pero no se verificaron de forma independiente.

## 7. Integración continua

| Elemento | Estado |
|---|---|
| Workflow | `.github/workflows/pruebas.yml` en el PR #16 (`ci/pruebas-pr`, `294a3ef`), **no fusionado** |
| Disparador | `pull_request` hacia `main` |
| Matriz | Node 22.x y 24.x |
| Pasos | `npm ci` → `npm test` |
| Seguridad | `permissions: contents: read`, `persist-credentials: false`, acciones fijadas por SHA (checkout v7.0.1, setup-node v7.1.0), límite de 10 min |
| Resultado en el PR #16 | Node 22.x pass · Node 24.x pass (0 pruebas, porque `main` aún no tiene) |
| Protección de `main` | No configurada (0 rulesets) y sin cambios |

Mientras el PR #16 no esté en `main`, los PR #14 y #15 no ejecutan CI. Una vez fusionado, cada PR lo ejecutará en su siguiente actualización.

## 8. Problemas técnicos encontrados

| ID | Problema | Estado |
|---|---|---|
| D1 | La longitud de la contraseña se mide antes de la normalización NFKC, pero el hash se calcula después. Una entrada de 16 puntos de código puede guardarse con 8. | Abierto. Depende de P4. |
| T1 | La prueba de JSON mal formado decide si omitirse según exista un archivo, no según exista la ruta. | Abierto. Se corrige desde `main` cuando el PR #14 esté integrado. |
| T2 | Proteger las rutas de HU04 y HU05 cambiará su respuesta anónima de 400 a 401 y romperá esa prueba tal como está escrita. | Depende de P1 y P2. |
| T3 | No había CI. | PR #16 abierto. |
| T4–T7 | Faltan cabeceras de seguridad; hay una promesa sin `catch`; el README no aclara que Argon2id requiere Node ≥ 24.7; `server.js` no se puede importar. | Propuestos, no implementados. |
| S1 | scrypt reserva 128 MiB por hash y no hay límite de intentos, lo que expone a un agotamiento de memoria. | Depende de P6. |
| G1 | El Project no tiene campos Sprint, Iteración ni SP, y su Status no coincide con el estado real (HU01 figura en Todo con el PR abierto). | Depende de P10 y P11. |
| G2 | El trabajo de HU04, HU05 y del borrador del informe no está publicado, así que no se puede verificar. | Acción del equipo. |

## 9. Decisiones pendientes del PO

Las 11 decisiones (P1–P11) están en `DOCS/06_decisiones_pendientes_po.md`, junto con 3 decisiones adicionales que declara el PR #15. **Ninguna está aprobada.**

## 10. Desviaciones y causas

| Desviación | Evidencia | Causa |
|---|---|---|
| HU01 no integrada | PR #14 abierto desde 2026-11-04, sin revisiones ni revisor asignado. El PR declara que el alcance de roles está sin resolver. | **No determinada.** Hay evidencia de un alcance sin resolver, pero no de que esa sea la causa del retraso. |
| HU04 y HU05 sin evidencia | No hay ramas ni PR | **No determinada** |
| Se empezó trabajo del Sprint 2 con el Sprint 1 abierto | PR #15 creado el 2026-11-10 | **No determinada** |

## 11. Lecciones aprendidas (basadas en hechos verificados)

1. **Sin CI ni revisor asignado, los PR pueden quedar abiertos varios días sin revisión.** El PR #14 lleva 6 días sin revisión ni revisor asignado. *Recomendación:* asignar un revisor al abrir cada PR y fusionar el PR #16.
2. **Una ambigüedad de alcance bloquea el cierre.** Los criterios del Issue 1 no coinciden con `DOCS/02` y `DOCS/03`. *Recomendación:* resolver las decisiones del PO en el Sprint Planning, antes de comprometer las historias.
3. **El trabajo no publicado no se puede verificar ni contabilizar.** *Recomendación:* subir las ramas a GitHub cada día, aunque el trabajo esté incompleto, como borrador.
4. **El tablero no reflejaba el estado real.** *Recomendación:* añadir «In review» y un campo de SP (P11).
5. **La velocidad de 12 SP era una hipótesis.** `DOCS/03` §3.4 pide recalibrarla con la velocidad observada. Con los datos actuales, la velocidad observada es de 3 SP. Hay que recalcularla al cierre real del Sprint.
6. **Las historias integradas sin pruebas automatizadas (HU02) no tienen protección contra regresiones.** *Recomendación:* exigir pruebas en la Definición de Terminado.

## 12. Evidencias por incorporar

- [ ] Captura del GitHub Project (vista del tablero) en la fecha de cierre.
- [ ] Gráfica burn-up. Datos verificados hasta ahora: un solo incremento, +3 SP el 2026-11-04 (HU02). Faltan las fechas de inicio y cierre para trazar el eje.
- [ ] Captura de los checks de CI del PR #16 y, tras el merge, del PR #14.
- [ ] Salida de `npm test` con Node 22 y Node 24 (la tabla del §6).
- [ ] Estado de los PR #13, #14, #15 y #16 en la fecha de cierre.
- [ ] Causas de las desviaciones confirmadas por el equipo en la Retrospectiva.
