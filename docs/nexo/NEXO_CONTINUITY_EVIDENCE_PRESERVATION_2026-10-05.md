# NEXO CONTINUITY — Evidence Preservation Checkpoint — 2026-10-05

## User instruction
User explicitly requested that all progress continue to be recorded so nothing is lost if chat continuity is interrupted.

## Preservation rule
Every material finding, correction, epistemic-state change, evidence identity, contradiction, and next frontier must be persisted in the repository before moving on. Chat text is not the canonical state.

## Current canonical AB105 state
- HB(W1→D1): UNKNOWN / NOT IDENTIFIED.
- W1→ENQUEUE: UNKNOWN / NOT IDENTIFIED.
- W1→R1: UNKNOWN.
- Stale-read execution: NOT OBSERVED / NOT DISPROVEN.
- Security vulnerability: NOT ESTABLISHED.
- AB105.117R: EXISTS / VERIFIED RAW EVIDENCE.
- Canonical raw chain: run 37098764557 → job 111133973894 → artifact 11265332252.
- 370778: HISTORICAL / UNRESOLVED; do not count as a second sample.
- No rerun of PR92, PR93, PR94/G0, TLC, or AB105.117R.
- No artificial W1-derived latch/volatile/barrier/Future synchronization.

## Last persisted checkpoints
- 926aa81514e372a5b779486bd3d78f9003a954e7 — 370778 claim sweep.
- eef106f34a43fa0c2b377cd7e248cef36b03ac16 — historical claim reconciliation.
- 74eed883f2e1aa3f2509fbbf53ef837925dcdc06 — run identity reconciliation.
- a2568915e9e70215fb89df8c5bf577e38667b6ed — final claim-language sweep.
- b296cf7792bbae97524cfd948dc960358f3fed33 — definitive W1→D1 HB matrix.
- 2601565076a92270151d42129a527d837f0dffb8 — SocketServer/request-admission + AuthHelper source audit.
- d392339a6a053571ff7f9d02fb45b4d63fbf4e0c — indirect synchronization/network boundary audit.
- 4c7f68016a37c9a6cebafa9cfabb3294caedc640 — BrokerMetadataPublisher callback boundary audit.
- 269d95a7fcea757c7a540e7dbff4b93d7740b904 — exact RequestChannel HB audit.
- c33abd44e1f93e2e5b32442f0dbee26563575db4 — exact SocketServer producer-path audit.

## Evidence methodology
Accepted evidence requires:
trigger/path → run → job → executed head/pin → raw artifact/log → semantic interpretation.
If a link is missing, classify as PENDING/UNKNOWN rather than runtime evidence.

## JMM reference
Official Oracle JLS states that happens-before is built from program order and synchronizes-with edges plus transitive closure; Java concurrent-utilities documentation also specifies publication guarantees for queues, executors, Futures, locks, and related synchronizers. This is methodological reference, not evidence about Kafka's concrete implementation. citeturn0search12turn0search0

## Next frontier
Search for any remaining indirect production synchronization/publication mechanism between MetadataLoader W1 and independently generated request publication, while preserving the no-artificial-synchronization constraint. Stop at the first actual synchronization edge; if none is found, retain UNKNOWN.

## DO-NOT-REPEAT
Do not repeat completed source audits or successful G0 solely because the chat is lost. Recover from this checkpoint and the linked prior checkpoints first.


## REGLA OFICIAL — CONTINUITY

Cuando Kevin indique **CONTINUITY**, no se debe recuperar únicamente el último mensaje, chat o checkpoint.

**CONTINUITY = reconstruir el estado completo de la investigación NEXO antes de continuar.**

### 1. Estado histórico
Debe integrar obligatoriamente:
- Checkpoints AB104/AB105.
- Findings anteriores.
- Evidencia ya validada.
- UNKNOWN/PENDING.
- Contradicciones y correcciones históricas.

### 2. Estado nuevo
Debe integrar:
- Commits posteriores.
- PRs.
- Workflows/runs.
- Artifacts y hashes.
- Nuevos experimentos.
- Nuevos hallazgos posteriores al último checkpoint.

### 3. Reconciliación
Debe determinar:
- Qué evidencia sigue vigente.
- Evidencia duplicada.
- Evidencia supersedida.
- Contradicciones.
- Hallazgos antiguos que hayan quedado enterrados.

### 4. Mapa epistemológico
Cada afirmación debe clasificarse como:
- 🟢 VERIFIED / OBSERVED
- 🟡 UNKNOWN / PENDING
- 🔴 CONFLICT / UNSUPPORTED
- SUPERSEDED / DUPLICATE, cuando corresponda.

### 5. Control de repetición
CONTINUITY debe respetar el **DO-NOT-REPEAT** y evitar repetir experimentos, TLC, auditorías o búsquedas ya cerradas, salvo razón nueva y explícita.

### 6. Destino
Después de reconstruir el estado completo, CONTINUITY debe llevar directamente al siguiente punto de investigación que todavía falta resolver.

### Regla fundamental
- Nunca continuar desde memoria parcial si existe información histórica que pueda cambiar la conclusión.
- Nunca considerar que «lo último encontrado» equivale automáticamente a «lo último verdadero».
- La continuidad canónica es el **estado reconciliado de toda la evidencia**, no la antigüedad del mensaje.

### Objetivo operativo
Que Kevin pueda escribir simplemente **CONTINUITY** y recuperar:
**lo anterior + lo nuevo + lo perdido/enterrado + las contradicciones + lo que ya NO debe repetirse + el siguiente paso correcto.**
