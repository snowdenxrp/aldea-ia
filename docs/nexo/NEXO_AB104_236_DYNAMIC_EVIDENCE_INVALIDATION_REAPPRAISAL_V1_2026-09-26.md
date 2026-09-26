# NEXO AB104.236 — DYNAMIC EVIDENCE INVALIDATION AND REAPPRAISAL V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
Invalidation must change CURRENT ADMISSIBILITY without rewriting HISTORICAL FACT.

A claim can remain historically authentic while becoming inadmissible for a new decision because a dependency changed: root rotation, signer revocation, target reincarnation, archive rollback, or freshness expiration.

## Dependency-aware invalidation
Candidate propagation:
ROOT/ANCHOR change -> AUTHORITY_CONFIGURATION affected -> SIGNER/QUORUM claims affected -> derived CLAIMS affected -> DECISIONS affected -> pending PERMISSIONS revalidated/fenced.

TARGET_INCARNATION change -> target-bound receipts/claims from prior incarnation become historical-only for the new incarnation; operation identities must not silently cross incarnations; pending effects require new boundary authorization.

FRESHNESS rollback/expiry -> freshness-dependent claims become STALE/UNKNOWN; they are not rewritten as false historical facts; pending permissions must be re-evaluated.

ARCHIVE RESTORE -> restored history can remain historical evidence, but absent continuity to the current anchor it cannot establish current authority; archive absence never proves historical non-existence.

## Revocation semantics
Candidate states:
VALID_HISTORICAL
CURRENT_ADMISSIBLE
STALE
REVOKED_FOR_FUTURE_USE
COMPROMISED
CONFLICTING
UNAVAILABLE
UNKNOWN

A key revoked today does not automatically make every historical statement false. Conversely, a historical signature must not automatically authorize a new action after revocation.

SCITT RFC 9943 separates signed statements from later relying-party policy decisions and notes that registered statements can be superseded; relying parties apply their own validation policies. This supports preserving history while changing admissibility. citeturn0search0

## RATS cross-check
RFC 9334 separates Evidence, Verifier appraisal, Attestation Results and Relying-Party authorization. It also treats freshness as something evaluated by policy; a result can become stale without the historical result ceasing to exist. citeturn0search1

A current 2026 RATS application-layer draft similarly keeps authority references and authorization decisions separate from trustworthiness claims. Draft/reference only. citeturn0search4

## Invalidation propagation
Candidate:
DEPENDENCY_CHANGED -> identify affected claims -> append INVALIDATION_EVENT -> mark dependent claims STALE/REVOKED/CONFLICT/UNKNOWN -> invalidate dependent pending decisions -> require fresh admissibility evaluation -> fence pending external effects -> preserve original claims/decisions as historical records.

Crucial rule:
INVALIDATED_CLAIM != DELETED_CLAIM

## Race: invalidation vs effect
If authorization E7 exists, revocation E8 occurs, and worker sends E7:
- target fence rejects E7 -> NOT_COMMITTED only if rejection guarantees non-acceptance;
- target accepts E7 before E8 linearizes -> historical effect remains E7-authorized;
- target cannot establish ordering -> UNKNOWN_EXTERNAL;
- local revocation alone is insufficient because worker may be partitioned.

## Race: archive restore
Restoring an older archive after a newer root/epoch was accepted must not roll current authority backward. Claims may remain historical, but pending permissions depending on restored freshness are blocked until continuity is re-established.

## Race: signer revocation
Historical statements can remain attributable to a signer after later revocation. New authority decisions should reject the signer after the applicable effective point. Exact historical acceptance depends on the revocation contract and effective-time evidence.

## Current prototype implications
The inspected prototype has local execution/outcome journals and local state revisions, but no demonstrated dependency graph or invalidation engine connecting root/configuration changes to claims and pending effects.

No implementation claim.

## AB50->AB58 residuals
UNCHANGED:
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION/IMPLEMENTATION = NOT_PERFORMED

AB55 remains minimal boolean 64 states x 6 total orders = 384 per attack x 8 attacks; not full UsedAdmissionContext/EventDAG/FutureObs_PAA.

## DO-NOT-REPEAT
- revocation != historical erasure
- stale != false
- unavailable != NOT_COMMITTED
- archive restore != current authority
- invalidation != deletion
- local invalidation != target fencing
- historical authorization != current permission
- no V21
- no architecture implementation
- no unsupported formal/CI/fault-injection claims

## Exact next mission
AB104.237: attack invalidation ordering and durable propagation — crash during invalidation, queued decisions, concurrent root rotation/revocation, stale caches, multi-device propagation, and whether an invalidation can be lost or arrive after an effect crosses the boundary.