# NEXO AB105 G0 — AUDITORÍA COMPLETA DE EVIDENCIA — 2026-10-03

## Alcance
Auditoría retrospectiva de PR #80–#96, workflows, runs/jobs/artifacts disponibles y diagnósticos JMM/propagación/ordering. Objetivo: detectar evidencia ejecutada omitida, resultados mal clasificados, experimentos duplicados y rutas de ejecución no verificables.

## Hallazgos críticos nuevos

### 1. PR #87 contenía un resultado llamativo que NO debe clasificarse como stale-read
Run `36960943385`, job `110694258388`, artifact `11207927096`, Kafka pin exacto.
Resultado runtime:
`ITERATIONS=100 READERS=4 OBSERVATIONS=2289453 STALE_ALLOWED_IN_POST_WINDOW=126692 DENIED_IN_POST_WINDOW=1259190 UNEXPECTED=0`.

La etiqueta `STALE_ALLOWED_IN_POST_WINDOW` es metodológicamente demasiado fuerte. El test clasifica la ventana desde `scheduledRemove` hasta `scheduledEnd`; el writer ejecuta `removeAcl(id)` DESPUÉS de `scheduledRemove` y solo después hace el `parkNanos`. No existe clasificación contra `writerObservation.exit`.

Por tanto las 126,692 observaciones pueden incluir autorizaciones concurrentes con `removeAcl()` todavía en ejecución. No son evidencia de ALLOWED después del retorno de `removeAcl()`.

Clasificación correcta:
`PR87_STALE_ALLOWED = INVALID_AS_STALE_EVIDENCE`
`PR87_CONCURRENT_OVERLAP = OBSERVED`
`PR87_RUNTIME_EXECUTION = VERIFIED`
`JMM_HB = UNKNOWN`

Este hallazgo explica por qué PR #88/#89 cambiaron la clasificación para usar el intervalo real de entrada/salida del writer.

### 2. PR #83 no logró demostrar el escenario que su título prometía
Run `36942939214`, job `110638412146`.
El resultado fue:
`TARGET_LOCAL_ACL_COUNT_BEFORE_D1=0`
`D1=DENIED`
`TARGET_LOCAL_ACL_COUNT_AFTER_D1=0`.

Aunque PR #83 se diseñó como “NEW D1 before target-local ACL revocation”, el target ya reportaba cero ACLs locales antes de D1. Por tanto no se observó el estado “D1 llega mientras WRITE sigue localmente presente”.

Clasificación:
`PR83_INTENDED_PRE_PROPAGATION_WINDOW = NOT_OBSERVED`
`D1_DENIED = OBSERVED`
`PROPAGATION_BYPASS = NOT_ESTABLISHED`

### 3. PR #93 sí es evidencia runtime válida y fue omitida del resumen activo
Run `37040412845`, job `110948860837`, artifact `11242611554`.
Resultado:
`ITERATIONS=100 READERS=4 OBSERVATIONS=5935698 POST_RETURN_ALLOWED=0 POST_RETURN_DENIED=5770322 OVERLAP_ALLOWED=53444 OVERLAP_DENIED=121 POST_RETURN_PRE_REMOVE_CACHE=0 POST_RETURN_POST_REMOVE_CACHE=5770322 POST_RETURN_UNKNOWN_CACHE=0 POST_RETURN_PRE_REMOVE_SNAPSHOT=0 POST_RETURN_POST_REMOVE_SNAPSHOT=5770322 POST_RETURN_UNKNOWN_SNAPSHOT=0 POST_RETURN_ALLOWED_WITH_PRE_REMOVE_CACHE=0 UNEXPECTED=0`.

Esto es evidencia conductual local fuerte de que no se observó autorización ALLOWED posterior al retorno del writer usando el cache pre-remove, ni snapshot pre-remove en el punto interno de authorize, bajo este diagnóstico.

No es prueba formal JMM ni equivalente al broker end-to-end.

### 4. PR #87/#89/#92/#93 son una progresión metodológica, no cuatro pruebas independientes del mismo hecho
- #87: race timing, pero ventana incorrectamente anclada a `scheduledRemove`.
- #88: intento intermedio; runtime failure.
- #89: clasificación por `writerObservation.enter/exit`; resultado sin stale ALLOWED.
- #92: añade identidad del `aclCache` observado; resultado sin pre-remove cache post-return.
- #93: añade el snapshot exacto usado dentro de `findAclRule`; resultado sin pre-remove snapshot post-return.

Por ello el peso probatorio debe asignarse a #89→#92→#93 como refinamientos, no sumar sus observaciones como muestras independientes.

### 5. PR #82/#86: evidencia real de broker; #86 es el witness más limpio de esa fase
#82: target local ACL count after D0 = 0, D1 DENIED, D2 SUCCESS.
#83: escenario pretendido pre-local-revocation no observado.
#85: runtime fallido.
#86: target local count at D1 = 1 (DESCRIBE permanecía), D1 DENIED, D2 SUCCESS después de D0 controller-side WRITE revocation.

#86 es el resultado aceptable de propagación de esa fase, pero no prueba stale-read porque WRITE ya no estaba localmente autorizado cuando se decidió D1.

### 6. PR #94 sigue siendo el witness end-to-end principal
Run `37081442555`, artifact `11259107051`: 10 ciclos reales.
Patrón aceptado:
`target W1 < D1 ENQUEUE < D1 DEQUEUE < AUTH_ENTER < AUTH_DECISION=DENIED` en 10/10.

Dos ciclos demuestran además `D0_RETURN < target W1`, por lo que D0_RETURN no es sustituto de W1.

No demuestra por sí solo JMM HB W1→ENQUEUE ni stale-read.

### 7. PR #95 y PR #96 quedan fuera como evidencia experimental nueva
#95: workflow declarado no incluía su branch en el trigger; los runs observados no producen job runtime válido para los 100 ciclos reclamados.
#96: el workflow sí ejecutó, pero reconstruye el harness desde el commit de control `a3aaae3a...` y declara explícitamente que allí no existe prewarm. Por tanto el artifact de #96 no demuestra el cambio de prewarm reclamado por el PR.

### 8. El fallo de visibility workflow es control-plane, no evidencia de Java/Kafka
Los runs de visibility tuvieron `jobs=[]`; el workflow de validation sí produjo job SUCCESS. La modificación estructural tampoco produjo una ejecución aceptada. No debe seguirse tocando el experimento Java para explicar ese fallo.

## Matriz resumida

| PR | Resultado | Clasificación |
|---|---|---|
| #80 | compile failure | NO EVIDENCE |
| #81 | bootstrap/runtime path failure | NO EVIDENCE |
| #82 | broker D1 denied, target ACL count 0 | BOUNDED EVIDENCE |
| #83 | intended pre-local-revocation state not observed | NOT EVIDENCE FOR INTENDED HYPOTHESIS |
| #84 | runtime path failed / D1 decision missing | NO EVIDENCE |
| #85 | metadata/auth runtime failure | NO EVIDENCE |
| #86 | real broker D1 denied with WRITE absent locally | BOUNDED EVIDENCE |
| #87 | runtime executed; 126,692 “stale” labels invalid due wrong window anchor | INVALID STALE CLASSIFICATION |
| #88 | failed runtime | NO EVIDENCE |
| #89 | corrected post-return timing diagnostic | BOUNDED LOCAL EVIDENCE |
| #90 | compile/runtime repair path | NO NEW EVIDENCE |
| #91 | compile/runtime API repair path | NO NEW EVIDENCE |
| #92 | cache identity post-return diagnostic | BOUNDED LOCAL EVIDENCE |
| #93 | exact authorize snapshot diagnostic | BOUNDED LOCAL EVIDENCE — RECOVERED |
| #94 | 10-cycle real broker ordering witness | ACCEPTED END-TO-END BOUNDED EVIDENCE |
| #95 | execution path unverified | NOT EVIDENCE |
| #96 | executed old harness, claimed prewarm absent | NOT EVIDENCE FOR PREWARM HYPOTHESIS |

## Evidencia canónica actual

🟢 Exact pinned source boundary: plain `aclCache` write/read identified.
🟢 PR93: no observed post-return pre-remove cache/snapshot in 5.9M observations.
🟢 PR94: W1 < ENQUEUE < DEQUEUE < AUTH in 10/10 real-broker cycles.
🟢 PR86: real broker D1 denied after controller WRITE revocation with only DESCRIBE remaining locally.
🔵 W1→ENQUEUE JMM happens-before: UNKNOWN.
🔵 stale-read manifestation in real broker: NOT OBSERVED.
🔵 production exploitability/generalization: UNKNOWN.
🔴 vulnerability: NOT DECLARED.

## Protecciones
AB105.116R = FROZEN.
AB105.117R = NOT_CREATED.
TLC = NOT_RERUN.
PR #94 = UNMERGED.

## DO-NOT-REPEAT
- No contar `STALE_ALLOWED_IN_POST_WINDOW` de PR87 como stale-read.
- No contar PR83 como prueba del escenario pre-local-revocation.
- No sumar PR89/#92/#93 como muestras independientes.
- No contar PR95/#96 como evidencia de sus cambios reclamados.
- No modificar Kafka para arreglar el control-plane de Actions.
- No crear AB105.117R.
- No rerun TLC.
