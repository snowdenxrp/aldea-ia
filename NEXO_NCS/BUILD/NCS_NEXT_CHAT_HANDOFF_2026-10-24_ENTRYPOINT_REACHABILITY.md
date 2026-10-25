# NCS — HANDOFF PARA EL SIGUIENTE CHAT
Fecha: 2026-10-24
Tipo: checkpoint de continuidad; inspección estática solamente

## Entrada obligatoria
1. Leer `NEXO_NCS/STATUS.md`.
2. Seguir la ruta del proyecto: `MASTER/CORE → BUILD → trabajo actual`.
3. Leer primero el checkpoint más reciente de STATUS y el informe `NEXO_NCS/BUILD/NCS_M0_REPAIR_AND_PROTECTED_TRANSITION_REACHABILITY_2026-10-24.md`; después leer `NCS_M0_RECONCILIATION_CRASH_RECOVERY_MAP_2026-10-24.md`.
4. No repetir inventarios anteriores salvo que haya cambio de fuente o una contradicción concreta.

## Fuente fijada para la investigación actual
- Repositorio: `snowdenxrp/aldea-ia`
- Rama de trabajo: `ncs-clean-architecture`
- Snapshot inspeccionado: commit `50b40b1ca9029bceb7bf65dbb1b5c3d81d57889a`
- Tree: `1f63ffd83682f490482a09b974f6455605ed0767`
- Los informes de esta línea de investigación son documentación estática referida a ese snapshot; no confundir con el HEAD actual si la rama avanzó después.

## Último estado confirmado
- Se documentó la existencia real de `owner.reconcilePrepared()`; no volver a afirmar que la reconciliación no existe.
- Acciones genéricas: exigen contexto canónico y verifier registrado; sin verifier, bloquean. UNKNOWN/evidencia inválida mantiene PREPARED abierto.
- Reparaciones: la reconciliación genérica las rechaza y exige contrato de settlement específico. `dispatchPreparedRepair()` vincula la operación a revisión capturada y usa lectura estricta/persistencia con revisión esperada. `settlePreparedRepairFromPersistedState()` observa el estado persistido, requiere invariante demostrado y registra `settled_observed` con causalidad `not_claimed`. Replay recupera el settlement sin redispatch.
- El contrato de settlement declara expresamente que no hay atomicidad entre el archivo de estado de Lúmina y el archivo de Continuity de Nexo.
- Las pruebas contienen escenarios de crash cuts, replay, UNKNOWN, verifier ausente y reconstrucción tras reinicio, pero fueron leídas, no ejecutadas.
- La ruta conocida `assistants --nexo-repair-once` está bloqueada por Option A en el wrapper `runNexoRuntimeRepairSession()`. Esto no prueba inalcanzabilidad global de APIs inferiores ni de todos los importadores.
- `executeProtectedTransition()` usa un `authorityGate` inyectado y luego `conditionalCommit.commit`; `effectBoundary.prepare` existe como puerto en la arquitectura inspeccionada, pero no aparece invocado en el cuerpo inspeccionado antes del commit. No se ha demostrado una ruta conectada desde startup hasta raíz legítima y efecto protegido.
- Separación Nexo/Lúmina: pruebas existentes expresan que el estado canónico Lúmina no serializa `nexoMemory`; Continuity Nexo es store independiente. La migración importa registros legacy solo cuando falta el store canónico y falla cerrado ante corrupción/estado desconocido. No etiquetar esta separación intencional como bug.
- La persistencia en stores separados no muestra transacción multi-store atómica. No inventar transacciones, colas, tombstones, IDs, reintentos ni wrappers nuevos.

## Trabajo inmediatamente pendiente
Completar un mapa estático, limitado y verificable de entrypoints/wrappers y reachability de la cadena PREPARED → dispatch → settlement, sin repetir los informes ya escritos:
- Leer en el snapshot fijado los entrypoints exactos relevantes: `scripts/assistants.mjs`, `scripts/simulate.mjs`, `scripts/nexo.mjs`, `scripts/nexo-runtime-session.mjs`, los módulos de repair dispatch/settlement/session y `src/nexo/core/protected-transition.mjs`/owner.
- Identificar por referencias concretas: imports, llamadas, exports/re-exports, procesos hijo (`spawnSync`), flags CLI y wrappers bloqueados.
- Clasificar cada conclusión por separado: (1) API existe, (2) alcanzable desde entrypoint identificado, (3) autoridad legítima demostrada, (4) efecto real ejecutado. No inferir los niveles superiores de los inferiores.
- Revisar solo la evidencia que resuelva esos enlaces. Si la evidencia está incompleta, etiquetar UNKNOWN/PENDING, no “inaccesible globalmente” ni “vulnerabilidad”.
- Si hay resultado sustantivo, crear un informe conciso en `NEXO_NCS/BUILD/`, actualizar `NEXO_NCS/STATUS.md`, y releer ambos para verificar contenido/blob/commit.

## Restricciones de ejecución y escritura
- Inspección estática/documentación únicamente.
- No ejecutar scripts, pruebas, npm test, workflows ni CI.
- No modificar runtime, tests, workflows ni estado Lúmina. D1-IMPLEMENTATION no está autorizado.
- Los cambios documentales en GitHub son aceptables; tras cada escritura, releer y verificar. Si la escritura remota falla, declararlo y no fingir que quedó guardado.
- No declarar trabajo completado por inferencia ni presentar tests leídos como tests ejecutados.

## Principios y gates canónicos
- Nexo independiente de modelo, OS, dispositivo y Lúmina: Modelo ≠ Nexo; OS ≠ Nexo; Dispositivo ≠ Nexo; Lúmina ≠ Nexo.
- Sin commissioning ni efectos protegidos hasta evidenciar autoridad legítima y frontera real de ejecución.
- UNKNOWN es estado válido y debe detener el flujo (UNKNOWN-STOP).
- No crear un monolito GenesisRoot ni introducir mecanismos no aprobados.
- M0 `INCOMPLETO`; D0 `OPEN`; D1-DESIGN `OPEN`; D1-IMPLEMENTATION no autorizada; D2/D3 `OPEN`; autorización `NOT_EVALUATED`; raíz legítima `PENDING/UNKNOWN`; efectos protegidos `STOP`.
- “Continúa sin límites” autoriza continuidad autónoma, no anula la prohibición de cambios de implementación.
- Objetivo del usuario: cerrar M0/NCS con una línea de meta y criterios de aceptación explícitos; no quedarse ciclando en STEP 7 ni repetir auditorías cerradas.
- Palabra de arranque para chats Nexo: exactamente `NCS`. La puerta de entrada es STATUS, no investigación histórica antigua.

## Informes previos clave
- `NEXO_NCS/BUILD/NCS_M0_REPAIR_AND_PROTECTED_TRANSITION_REACHABILITY_2026-10-24.md` — commit `03b929e76e32018620b0c6a98c7bc467891bad1b`, blob leído `05db78a2df51947a5287c20f31f9e687bdc0e485`.
- `NEXO_NCS/BUILD/NCS_M0_RECONCILIATION_CRASH_RECOVERY_MAP_2026-10-24.md` — commit `59453bf5c454eb28e2d09026bf1082f9819ba5b6`, blob leído `45924c184848269272ce04947741512b0aaaa867`.
- `NEXO_NCS/BUILD/NCS_M0_CONTINUITY_MIGRATION_AND_STORE_SEPARATION_2026-10-24.md` — commit `55138df2a6f115e7409350926d0430e1450043fc`, blob leído `2110fb3b5968f6ebe0e5869505043634f770eda3`.
- `NEXO_NCS/BUILD/NCS_M0_D1_REPAIR_CALLER_GRAPH_PARTIAL_2026-10-24.md` — commit `852153dbee659f81a782af7c97443589dbca3efb`, blob leído `354b01357f11252da8dc1f38f04de9d0b782c79e`.
- `NEXO_NCS/BUILD/NCS_M0_D1_REPAIR_TEST_CONSUMERS_AND_SRC_SCAN_2026-10-24.md` — commit `fce3dce5703e609f0b992faa21b0b0816c0ef335`, blob leído `0b5f791ad1d7cdfcdb814eb1cac3436139002790`.
- `NEXO_NCS/BUILD/NCS_M0_D1_GLOBAL_CALLER_AND_WORKFLOW_SCAN_PARTIAL_2026-10-24.md` — commit `62aaac222bce20363a676bbef29bd367280551b0`, blob leído `72d1f4b3c09f32a032394e887eb26d059ec09ce6`.

## Cierre de este handoff
Este archivo registra el estado y la siguiente acción; no declara M0 terminado, no aporta evidencia nueva de runtime y no cambia ningún gate.
