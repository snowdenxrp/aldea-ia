# NEXO AB105 G0 — revisión de huecos no detectados — 2026-10-03

## Objetivo
Revisar retrospectivamente por qué los diagnósticos PR #95/#96 y el witness de visibilidad no llegaron a evidencia runtime aceptable.

## Hallazgo 1 — Se confundió artefacto de investigación con ruta ejecutable
PR/branch/documento no equivalen a ejecución. En la revisión se encontró:
- PR #95: su workflow v2 declara `push.branches: nexo-ab105-g0-ordering-witness`, no `nexo-ab105-g0-visibility-sample-v3`.
- PR #96: su workflow reconstruye el harness desde el commit histórico `a3aaae3a...` y el propio comentario indica que allí no existe el prewarm reclamado.

Regla nueva: para aceptar un experimento deben existir, en orden, **workflow trigger compatible → run ID → job ID → pasos ejecutados → artifact/raw evidence → commit/pin concordante**.

## Hallazgo 2 — La prueba de visibilidad quedó atrapada en el control-plane de Actions
El workflow de visibility produjo runs con `jobs=[]`; el workflow de validation produjo un job real y SUCCESS. La reducción a un job estructural tampoco generó una ejecución aceptada. Por tanto no se debe seguir modificando Java/Kafka para resolver ese fallo.

## Hallazgo 3 — El witness de visibilidad todavía no tenía una ejecución emparejada control/experimento
El diseño de control quedó compilado, pero no existe un par runtime aceptado experimento-vs-control. Por ello no puede atribuirse ningún efecto observado a la instrumentación ni usarse el control como evidencia runtime.

## Hallazgo 4 — La lectura de identidad no basta por sí sola para declarar stale-read
El recorder registra la identidad del `aclCache` leído por AUTH y la identidad escrita en W1. Eso permite detectar una posible discrepancia, pero una discrepancia solo es interpretable si se establece la identidad/cache correspondiente al estado inmediatamente anterior y la relación exacta con el ciclo/D1. Un `cache identity != current W1 identity` no debe convertirse automáticamente en stale-read sin reconciliar updates concurrentes/anteriores.

## Hallazgo 5 — La pregunta JMM y la pregunta empírica deben permanecer separadas
Tenemos temporalmente W1 < ENQUEUE < DEQUEUE < AUTH en 10/10, pero no un HB demostrado W1→ENQUEUE. Tampoco un AUTH contra cache viejo observado. El experimento puede encontrar una manifestación; no puede convertir `nanoTime` en HB.

## Hallazgo 6 — El cuello de botella temporal está mal planteado para sensibilidad
El witness conservado suele tener decenas de ms entre W1 y ENQUEUE. Eso favorece que la ejecución observe el estado actualizado. El ciclo 10 fue más estrecho, pero siguió sin stale-read. La siguiente optimización debe reducir latencia de D1 sin esperar W1 y sin introducir sincronización derivada de W1.

## Hallazgo 7 — Los workflows deben auditarse como parte del experimento
El fallo repetido de trigger/branch/path no es infraestructura incidental: es parte de la validez experimental. Un experimento sin camino de ejecución demostrable debe permanecer PENDING/UNKNOWN.

## Estado después de la revisión
🟢 10-cycle real-broker ordering witness = ACCEPTED bounded evidence.
🟢 Exact pinned `aclCache` plain-write/read boundary = established.
🔵 W1→ENQUEUE JMM HB = UNKNOWN.
🔵 stale-read manifestation = UNKNOWN.
🔵 runtime visibility experiment = NOT_EXECUTED/NOT_ACCEPTED.
🔴 vulnerability = NOT_DECLARED.

AB105.116R = FROZEN
AB105.117R = NOT_CREATED
TLC = NOT_RERUN
PR #94 = UNMERGED

## DO-NOT-REPEAT
No contar branches/PRs/docs como ejecución.
No modificar Kafka/JMM para arreglar un workflow de Actions.
No declarar stale-read solo por identidad distinta.
No introducir W1-derived synchronization.
No crear AB105.117R.
No rerun TLC.
