# NEXO AB104.213 — PROTOCOLOS DE EVIDENCIA NEGATIVA Y SEPARACION CLAIM DECISION EFFECT V1 — 2026-09-26

## Estado
INVESTIGACION / NO IMPLEMENTACION. Este documento no declara que Nexo ya posea estas garantías.

## 1. Hallazgo central
“NO FUE PROCESADO” solo puede convertirse en NOT_COMMITTED cuando existe una garantía del protocolo o del target que cubre exactamente la frontera relevante. Timeout, conexión cerrada, ausencia de receipt o ausencia de estado local no son equivalentes.

RFC 9110 establece que una solicitud no idempotente no debería reintentarse automáticamente salvo que exista semántica idempotente o un medio para detectar que la solicitud original nunca fue aplicada. RFC 9113 ofrece un ejemplo especialmente claro: HTTP/2 puede dar garantías explícitas mediante GOAWAY o REFUSED_STREAM; el servidor no puede indicar “no procesado” si no puede garantizarlo.

## 2. Clases de evidencia negativa
N0 — transporte incierto: timeout/reset/cierre sin garantía de procesamiento. => UNKNOWN.
N1 — rechazo antes de aceptación, con semántica explícita de no-aceptación. => candidato NOT_COMMITTED.
N2 — protocolo garantiza que la solicitud no pudo alcanzar procesamiento, por ejemplo una garantía equivalente a REFUSED_STREAM/GOAWAY aplicable al request. => NOT_COMMITTED para esa frontera.
N3 — target authoritative registry confirma ausencia y garantiza cobertura completa del horizonte. => NOT_COMMITTED.
N4 — intermediario afirma ausencia pero su autoridad/cobertura no está demostrada. => supporting evidence, no NOT_COMMITTED.
N5 — estado actual ausente después de restore/rollback. => UNKNOWN si no existe continuidad histórica.
N6 — target confirma aceptación pero receipt perdido. => COMMITTED/RECONCILING según evidencia; nunca NOT_COMMITTED por ausencia local.

Regla: la fuerza de una afirmación negativa no puede exceder la garantía de la fuente que la emitió.

## 3. Claim Contract
El Claim Contract describe qué afirma una evidencia y qué condiciones hacen válida esa afirmación.

Campos conceptuales:
- claim_id
- subject: operation/effect/sub-effect
- statement: PROCESSED / NOT_PROCESSED / ACCEPTED / COMMITTED / ABSENT
- boundary: transporte / gateway / target / durable commit
- issuer
- scope
- target_incarnation
- authority_epoch/root
- evidence_reference
- coverage_start/end
- freshness/continuity proof
- validity semantics
- dependencies
- confidence is descriptive evidence metadata, never authority by itself

Un claim NOT_PROCESSED de transporte no demuestra NOT_COMMITTED del target si otra frontera pudo procesarlo.

## 4. Decision Contract
El Decision Contract no inventa hechos: combina Claims bajo reglas explícitas para decidir una acción de Nexo.

Ejemplo:
Claim A: protocolo garantiza NOT_PROCESSED en la frontera target.
Claim B: no existe otra ruta concurrente con el mismo effect_identity.
Decision: NOT_COMMITTED admissible.

Pero:
Claim A: TCP timeout.
Decision: UNKNOWN_EXTERNAL; no retry automático.

Por tanto:
CLAIM = qué evidencia existe.
DECISION = qué conclusión operacional permite esa evidencia.
No deben fusionarse.

## 5. Effect Contract
El Effect Contract define la semántica real del destino:
- operation_id/effect_identity
- payload fingerprint
- target identity/incarnation
- acceptance boundary
- commit boundary
- idempotency semantics
- retention horizon
- receipt/lookup semantics
- negative-evidence semantics
- restore/rollback semantics
- partial-effect semantics
- fencing/version requirements

Sin este contrato, un Claim “not processed” puede ser verdadero en una capa y falso para la propiedad que Nexo necesita.

## 6. Código real inspeccionado
La inspección estructural del repositorio sí encontró implementación existente relacionada con efectos y recuperación:
- src/nexo/effect-adapter.js
- src/nexo/runtime.js
- src/nexo/orchestrator.js
- tests/nexo/effect-adapter.test.mjs
- tests/nexo/effect-intent-persistence.test.mjs
- tests/nexo/restart-reconstruction.test.mjs

Esto corrige una conclusión anterior demasiado amplia: las búsquedas exactas no encontraron ciertos nombres en la superficie consultada, pero el árbol sí contiene código de efectos/reconstrucción.

En effect-adapter.js se observa:
- journal preparado antes de ejecutar;
- un journal preparado no se trata como prueba de que el efecto no ocurrió;
- si existe entrada prepared, se exige reconcile antes de ejecutar de nuevo;
- una excepción del handler produce EFFECT_OUTCOME_UNKNOWN;
- una reconciliación verificada puede convertir esa incertidumbre en completed;
- idempotencyKey evita repetir un resultado ya persistido.

En runtime.js:
- se separa adapterResult de outcome durable;
- la reconstrucción usa recordNexoOutcome/recordNexoExecution;
- execution-only no se considera completion en los tests de reconstrucción.

Los tests verifican estas reglas para el código actual, pero esto NO equivale a una prueba formal de la arquitectura futura ni demuestra cobertura de todas las fronteras externas.

## 7. Nueva tensión detectada
Hay que estudiar cuidadosamente la diferencia entre:
A) “el adapter no volvió a ejecutar”
B) “el efecto externo nunca ocurrió”
C) “Nexo tiene evidencia suficiente para clasificar NOT_COMMITTED”.

A puede estar implementado localmente mientras B siga siendo desconocido. C requiere evidencia del Effect Contract/target/protocolo.

## 8. Ataques AB104.213
1. timeout después de que target aceptó;
2. gateway rechaza pero backend recibió por otra ruta;
3. GOAWAY con frontera correctamente aplicable vs GOAWAY no recibido;
4. REFUSED_STREAM mal emitido por servidor que sí pasó frames a aplicación;
5. intermediario afirma NOT_PROCESSED sin autoridad;
6. target registry vacío después de restore;
7. dos rutas concurrentes con mismo operation_id;
8. operación parcialmente procesada antes de rechazo;
9. aceptación durable sin receipt;
10. claim válido pero para target_incarnation anterior;
11. claim válido históricamente pero autoridad revocada;
12. negative claim correcto para transporte pero insuficiente para commit.

## 9. Estado epistemológico
CONFIRMED BY RESEARCH:
- negative evidence must be boundary-specific;
- protocol-guaranteed non-processing is materially stronger than timeout;
- Claim/Decision/Effect are distinct semantic layers;
- current repository contains real effect/recovery code that must be audited rather than assumed absent.

UNKNOWN/PENDING:
- exact external effect boundary of the current implementation;
- whether current adapters can represent target-incarnation/authority/receipt semantics;
- complete NOT_COMMITTED proof path;
- whether all partial/streaming cases are represented;
- formal verification of these properties;
- implementation completeness.

AB50→AB58 residuals remain unchanged:
TERNARY_MATH_GAP FOUND;
TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS;
TERNARY_PAA_COLLISION UNKNOWN;
EVENTDAG_CLOSURE PARTIAL;
RECONSTRUCTION BOUNDED_ONLY;
SEMANTIC_FREEZE NOT_DECLARED;
FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.

## 10. DO-NOT-REPEAT
Do not equate timeout with NOT_COMMITTED.
Do not treat local journal absence as proof of external absence.
Do not treat idempotencyKey as proof that target enforces idempotency.
Do not treat protocol-level non-processing as target-level non-commit without boundary mapping.
Do not trust negative claims outside their scope/incarnation/freshness.
Do not turn current tests into formal proof.
No V21, no architecture implementation yet.

## 11. Exact next action AB104.214
Trace the current effect path end-to-end in code:
orchestrator -> runtime -> effect-adapter -> simulation-adapter -> persistence/memory -> recovery.
For every boundary, classify what is actually durable, what is only in-memory, what evidence is produced, and where UNKNOWN can be lost or incorrectly converted into failed/completed. Then inspect the corresponding tests for missing crash/interleaving cases.
