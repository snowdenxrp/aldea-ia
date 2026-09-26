# NEXO CONTINUITY CHECKPOINT — 2026-09-26 — AB104.223

## Persisted
- Research: docs/nexo/NEXO_AB104_223_REVOCATION_ROTATION_EFFECT_RACE_FENCING_V1_2026-09-26.md
- Commit: 33ae60563a46e6c47da5228e975da13f0199e640

## Core result
- A local authorization/freshness check cannot prevent a concurrent revocation/rotation race.
- Strong stale-authorization prevention requires the target/resource effect boundary to enforce an ordered freshness/fence condition.
- A signed old authorization can remain historically valid while being inadmissible as current permission.
- If the target does not enforce current authority/fencing, a stale worker can still produce an effect; Nexo may only be able to classify the outcome as UNKNOWN.
- Revocation after an already-linearized target acceptance does not erase the historical effect.
- Resource identity alone is insufficient across resource reincarnation; fence context must bind the resource incarnation/version.

## Current prototype code evidence
- effect-adapter.js checks getStateVersion() before precondition and again immediately before handler execution, and returns STATE_CHANGED_DURING_PRECONDITION when the local version changes during the precondition.
- This local check is NOT target-side fencing: the external state can change after the second read and before/during the handler effect.
- Prepared entries require reconciliation before another execution attempt.
- runtime.js currently constructs idempotencyKey as missionId:stepId; it does not itself bind target incarnation, authority epoch/root, or payload fingerprint.
- runtime/orchestrator persist and reconstruct local mission/effect outcomes; these are not proof of external target acceptance.
- Exact GitHub searches for authorityEpoch, fence/lease/fencing, stateVersion, and revoke/rotation/authorization/permission returned no matches in the available code-search surface. This is a search limitation, not proof of absence.

## Boundary model
Decision authorization -> operation/effect identity + authority epoch/root + fence context -> target acceptance check -> target linearization/commit -> receipt/reconciliation.

Candidate separated states:
- DECISION_AUTHORIZED(E1)
- FENCE_ACCEPTABLE(E1, resource incarnation)
- EFFECT_ACCEPTED
- EFFECT_COMMITTED
- EFFECT_OBSERVED
- REVOKED(E1)

## Race classifications
- target accepts E1 before revocation: historical EXTERNALLY_COMMITTED under E1.
- revocation E2 precedes target acceptance and target enforces fence: E1 rejected; NOT_COMMITTED only if rejection guarantees non-acceptance.
- local decision then crash before send: NOT_COMMITTED only with boundary-specific negative evidence; otherwise UNKNOWN.
- target accepts but local receipt is lost: UNKNOWN until target-authoritative reconciliation.
- delayed E1 after E2 with no target fence: UNKNOWN_EXTERNAL / unsafe protocol.

## External anchors studied
- Fencing-token analysis: resource server must reject older fencing tokens; client-side lease checks are insufficient.
- RATS freshness: freshness is policy-dependent and a race remains possible immediately after evidence is produced.
- TUF: versioning, expiration, roles and coherent snapshots distinguish stale/rollbacked metadata from current admissibility.

## Residuals
AB50→AB58 ternary/event/reconstruction/semantic/formal gaps unchanged and MUST remain visible:
- TERNARY_MATH_GAP = FOUND
- TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
- TERNARY_PAA_COLLISION = UNKNOWN
- EVENTDAG_CLOSURE = PARTIAL
- RECONSTRUCTION = BOUNDED_ONLY
- SEMANTIC_FREEZE = NOT_DECLARED
- FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED
- AB55 coverage was minimal boolean 64 states × 6 total orders = 384 per attack × 8 attacks, not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## Constraints preserved
- Research/study only.
- No V21.
- No architecture implementation yet.
- No silent overwrite/delete of historical evidence.
- No unsupported formal verification, CI, security, correctness, or fault-injection claims.
- Continue studying actual code and external sources before architecture design.

## Exact next mission
AB104.224: research the minimal linearization primitive for revocation + effect acceptance; compare authority epoch vs resource-scoped fencing token vs conditional target version; then attack restore/rollback, clone, multi-device and partial-effect cases. Continue code study and preserve continuity.

## DO-NOT-REPEAT
- local authorization check != target-side fencing
- signed old authorization != current permission
- timestamp/arrival order != authority order
- lease expiration != fencing unless target rejects stale holders
- prototype stateVersion check != proof of external race safety
- revocation != historical erasure
- missing local receipt != NOT_COMMITTED
- no V21 / no architecture implementation