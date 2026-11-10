# Propuesta de planificación del Sprint 2 — ReserveApp

> **BORRADOR — propuesta, no planificación oficial.** La referencia vigente sigue siendo `DOCS/04`. Esta propuesta no cambia asignaciones de Sprint o Iteración, estimaciones ni fechas. Debe decidirse en el Sprint Planning, con el PO.

## 1. Punto de partida verificado (2026-11-10)

- **Sprint 1:** 3 de 12 SP terminados (HU02). Quedan 9 SP sin terminar: HU01 (5), HU04 (2) y HU05 (2).
- **Plan vigente del Sprint 2** (`DOCS/04`): HU03a (3) + HU03b (8) = **11 SP**.
- **Trabajo adelantado:** HU03a tiene el PR #15 abierto. Sigue en revisión y no está terminada.
- **Velocidad:** la planificada es de 12 SP/Sprint, una hipótesis con FE = 0,60. La observada en el Sprint 1 es de **3 SP**, provisional hasta el cierre real. `DOCS/03` §3.4 pide recalibrar la velocidad al cierre del Sprint 1.

## 2. Carga si se suma todo

| Bloque | Historias | SP |
|---|---|---:|
| Arrastre del Sprint 1 | HU01, HU04, HU05 | 9 |
| Plan del Sprint 2 | HU03a, HU03b | 11 |
| Historia de roles (si P1 = B) | Nueva | **Sin estimar** |
| **Total** | | **20 + roles** |

20 SP superan la capacidad planificada (12) y la observada (3). En Scrum, lo que no se termina vuelve al Product Backlog y **el PO decide** qué entra en el siguiente Sprint. Por eso se presentan escenarios, no una asignación.

## 3. Escenarios (propuesta)

| Escenario | Contenido | SP | Ventajas | Riesgos |
|---|---|---:|---|---|
| **A. Completar el Sprint 1 primero** | HU01, HU04, HU05, HU03a | 12 (+ roles) | Termina la base de autenticación y la operación de recepción y limpieza. Aprovecha que HU03a ya está avanzada. | Retrasa HU03b, la historia de mayor riesgo, al Sprint 3. Desplaza el cierre del MVP. |
| **B. Seguir `DOCS/04`** | HU03a, HU03b + arrastre | 20 (+ roles) | Respeta el plan vigente. | Sobrecarga evidente. Alta probabilidad de volver a arrastrar historias. |
| **C. Atacar primero el riesgo** | HU01, HU03a, HU03b | 16 | Adelanta la integración de pagos. | HU04 y HU05 siguen sin terminar. Supera la capacidad. |

**Recomendación técnica, no aprobada:** escenario **A**. HU01 desbloquea la autorización que necesitan HU04 y HU05, y HU03a solo necesita revisión y las decisiones A1–A3. La consecuencia en el calendario de `DOCS/04` (MVP en 3 sprints) debe evaluarla el PO.

## 4. Historias candidatas

| Historia | Issue | SP | Estado | Dependencias | Criterios o decisiones pendientes |
|---|---|---:|---|---|---|
| HU01 Registro e inicio de sesión | #1 | 5 | PR #14 abierto, 130/128/0/2 en Node 22 y 24 | — | P1, P3, P4, P5, P6, P7 |
| Roles y autorización (si P1 = B) | — | Sin estimar | No existe Issue | HU01 | P1, P2 |
| HU04 Check-in y check-out | #4 | 2 | Sin código en GitHub | HU01/roles. HU03b, si se busca por código. HU05, si el check-out cambia el estado. | P8. Contradicción entre «código de reserva» y «número de documento». |
| HU05 Estado operativo | #5 | 2 | Sin código en GitHub | HU01/roles. Afecta a HU02 y HU04 («asignación»). | P9 |
| HU03a Resumen y método de pago | #3 | 3 | PR #15 abierto, sin pruebas automatizadas | HU02 (integrada) | A1–A3. `Closes #3`. Conflicto con el PR #14 en `README.md` y `server.js`. |
| HU03b Pago y código de reserva | #11 | 8 | Sin código | HU03a. Pasarela externa no definida. | Proveedor de la pasarela, credenciales de prueba, manejo de rechazos sin duplicar cobros |
| HU03c Comprobante por correo | #12 | 2 | Sin código | HU03b. Servicio de correo no definido. | Proveedor de correo. Relación con P3 y P7. |

## 5. Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación propuesta |
|---|---|---|---|
| Volver a arrastrar historias por decisiones sin resolver | Alta (ya ocurrió con HU01) | Alto | Resolver P1–P11 y A1–A3 **antes** del Sprint Planning |
| Conflicto de merge entre los PR #14 y #15 | Seguro (comprobado) | Medio | Fusionar primero el PR #14 y rebasar el PR #15 sobre `main` |
| HU03b depende de un servicio externo sin definir | Alta | Alto | Decidir el proveedor y obtener su sandbox antes de comprometer HU03b |
| Velocidad sobrestimada | Alta | Alto | Recalibrar V con datos reales al cierre del Sprint 1 |
| Trabajo local no publicado | Media | Medio | Publicar las ramas cada día, en PR de borrador |
| Historias sin pruebas automatizadas (HU02, HU03a) | Ocurriendo | Medio | Incluir pruebas en la Definición de Terminado. CI con el PR #16. |
| Agotamiento de memoria por scrypt sin límite de intentos | Media | Medio | Resolver P6 |

## 6. Cómo contabilizar el trabajo adelantado

- HU03a **no suma** al Sprint 1, porque no estaba comprometida.
- Se contabiliza en el Sprint en que su PR se fusiona **y** su Issue se cierra.
- Si se fusiona antes del Sprint Planning del Sprint 2, se registra como «trabajo adicional terminado» del periodo en curso, separado del porcentaje de cumplimiento del compromiso.

## 7. Preparación necesaria antes del Sprint Planning

- [ ] El PO resuelve P1–P11 y A1–A3, o declara explícitamente cuáles se posponen.
- [ ] El equipo publica las ramas de HU04, HU05 y `docs/informe-sprint-1`.
- [ ] Un integrante revisa los PR #16, #14 y #15. **El orden sugerido de merge es #16 → #14 → #15.**
- [ ] Se estima la historia de roles, si P1 = B.
- [ ] Se recalcula la velocidad con el cierre real del Sprint 1.
- [ ] El PO confirma la fecha de inicio y el tipo de campo de iteración (P10).
