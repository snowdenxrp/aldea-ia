# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.224

## Persisted
- Research: docs/nexo/NEXO_AB104_224_MINIMAL_LINEARIZATION_PRIMITIVE_EPOCH_FENCE_CAS_V1_2026-09-26.md
- Commit: 3706440cccf8921ec4785b05777cee08e1b700b8

## Core result
- Authority epoch identifies authorization generation but is insufficient unless the target enforces current epoch.
- Resource-scoped fencing token directly addresses delayed/stale workers when the target remembers and rejects older tokens.
- Target-side CAS/conditional version can provide a linearization point when the actual effect is atomically guarded by that target state.
- No single mechanism was selected as final architecture.
- The minimum useful safety boundary is a target-enforced conditional acceptance rule tied to authority freshness.
- Fence state itself must survive restore/clone/reincarnation; otherwise rollback can resurrect stale authority.
- Global epoch, resource fence and target version may have different scopes and could potentially compose, but composition is still an open research problem.

## Code study
- Direct AB104.223 inspection remains the stronger evidence for current prototype behavior.
- Repeated code-search queries in this pass returned no matches for getStateVersion/stateVersion/idempotencyKey/effectJournal; this is a search limitation only.
- No implementation was added.

## External evidence
- Fencing-token analysis: target/resource server must reject older tokens. citeturn0search0
- RATS separates appraisal from relying-party authorization and treats freshness as policy-dependent, with residual race conditions. citeturn0search1
- TUF snapshot/version/expiration mechanisms illustrate coherence and freshness separation. citeturn0search2turn0search3

## Residuals
AB50→AB58 remain unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.
AB55 remains limited to boolean 64 states × 6 total orders = 384 per attack × 8 attacks.

## Constraints
- Research/study only.
- No V21.
- No architecture implementation yet.
- Preserve UNKNOWN/PENDING and contradictions.
- No unsupported formal verification, CI, security, correctness, or fault-injection claims.

## Exact next mission
AB104.225: attack composition of global authority epoch + resource-scoped fence + target CAS under restore/clone/partition and partial-effect interleavings; continue code study and external research.

## DO-NOT-REPEAT
- worker-held epoch != target-enforced freshness
- fence state that rolls back != anti-rollback authority
- local CAS != external fencing unless it guards the actual effect boundary
- rejection != NOT_COMMITTED unless rejection guarantees non-acceptance
- historical authorization != current permission
- no V21 / no architecture implementation