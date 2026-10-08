# NEXO NCS — STEP 7 CLAIM-SPECIFIC EQUIVALENCE MATRIX
Date: 2026-10-08
Status: EVIDENCE-BASED DESIGN CHECKPOINT

## Decision
No universal observation-equivalence predicate is authorized. Equivalence is claim-specific and requires all claim-critical causal dimensions to be established as equivalent.

## Evidence layers
### MASTER
- Claim-specific provenance/dependencies must survive compression.
- Deduplication is not proof of equivalence.
- Missing evidence remains UNKNOWN; no fabricated identity.

### AB
- Action/target or WriteSet-level equivalence can hide causal differences.
- Logical identity is insufficient where recreated entities/incarnations matter.
- Derived/helper/cache values are not authority boundaries.

### P/P112
- Findings can collide when causal dimensions differ.
- Aggregate findings and temporal samples require scope/freshness semantics.
- Severity is not claim identity.
- Existing identity must be exhausted before inventing a new identity mechanism.

## Current producer classes
| Finding | Observed causal dimensions currently present | Equivalence status |
|---|---|---|
| MESH_MISSING | producer, code, agent, message; render-probe condition | 🔵 target/incarnation and observation freshness are not universal |
| NOT_IN_SCENE | producer, code, agent, message | 🔵 scene/entity incarnation and observation version not established |
| HIDDEN | producer, code, agent, message | 🔵 visibility observation context/version not established |
| OFFSCREEN | producer, code, agent, message | 🔵 spatial/render observation context/version not established |
| VISUAL_NO_LOCOMOTION_SAMPLE | producer, code, message; report-level moving/agent counts | 🔵 sample/window identity not established |
| EXPLORER_STALLED | producer, code, agent, message; exploration counts are report observations | 🔵 temporal/window/version context not established |
| BEHAVIOR_IDLE_SAMPLE | producer, code, message; report-level activity map/count | 🔵 sample/window identity not established |
| NEGATIVE_RESOURCE | producer, code, resource type, amount | 🔵 resource incarnation/version and observation freshness not established |
| SOCIAL_DEPRIVATION | producer, code, message; aggregate average social | 🔵 population scope/window/version not established |
| ROUTINE_PHASE_MISSING | producer, code, agent, message; phase/sequence/remaining report data | 🔵 routine incarnation/window/version not established |
| SPECIALIST_ERRORS | producer, code, message; derived error count from other findings | 🔵 dependency set is not durably carried in finding itself |

## Consequence
The current data is sufficient to preserve provenance, but not sufficient to prove a universal equivalence relation for production findings.

Therefore:
1. ObservationEnvelope preserves available evidence.
2. Candidate admission must not silently deduplicate observations whose claim-critical dimensions are unproven.
3. No observation ID, queue, retry, tombstone, or compatibility layer is introduced.
4. Claim-specific equivalence predicates may be added only when a concrete claim contract establishes the required dimensions.
5. If a claim requires unavailable dimensions, equivalence remains UNKNOWN rather than being guessed.

## Explicitly closed
The 8-step admission boundary is not reopened:
NOT_ADMITTED remains a bounded-admission result, not FAILED, RESOLVED, COMMITTED, or RETRIED.

## Next construction action
Select one concrete finding-to-claim mapping and define its smallest equivalence predicate from existing evidence. Do not generalize until that concrete contract is proven.
