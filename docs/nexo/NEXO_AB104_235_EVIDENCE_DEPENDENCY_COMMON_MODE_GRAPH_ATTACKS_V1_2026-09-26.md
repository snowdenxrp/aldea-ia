# NEXO AB104.235 — EVIDENCE DEPENDENCY / COMMON-MODE GRAPH ATTACKS V1 — 2026-09-26

## Status
Research/study only. No architecture implementation.

## Core result
Evidence independence must be modeled as a dependency graph, not inferred from the number of records, signatures, devices or services.

If claims C1,C2,C3 all depend on root R, then compromise or rollback of R is a common-mode event. The three claims do not provide three independent observations of R.

## Dependency dimensions
Candidate graph edges:
- signer -> key;
- key -> authority configuration;
- configuration -> root;
- root -> protected anchor;
- snapshot -> storage lineage;
- freshness -> clock/counter/anchor;
- receipt -> transparency service;
- observation -> target incarnation;
- decision -> all claims it consumes.

Independence must be evaluated per failure domain, not globally.

## Attacks
1. Shared root: five signatures collapse to one root dependency.
2. Cloned devices: five device identities may derive from one copied state.
3. Shared backup: apparently independent histories all originate from one restored image.
4. Shared freshness: different claims rely on the same rollbackable clock/counter.
5. Shared verifier: multiple appraisals repeat one observation and do not add independent observation.
6. Shared target: multiple receipts from the same target observation are corroborating records, not independent executions.
7. Shared transparency service: multiple receipts may prove registry inclusion while sharing the same service failure domain.
8. Nested evidence: claim B cites claim A; B does not create a new observation of A.
9. Circular evidence: A validates B while B is used to validate A; this cannot bootstrap authority.
10. Cross-device quorum from cloned roots: threshold can pass while independence is false.

SCITT separates issuer statements from transparency-service receipts and notes that transparency does not prevent compromised issuers; receipts prove registration/inclusion in the VDS. This supports treating issuer and registry as separate dependency domains rather than counting receipts as independent truth. citeturn0search12turn0search4

TUF makes role trust configuration explicit: roles specify trusted keys and signature thresholds. This shows that threshold evaluation depends on an authority configuration, not merely signature count. citeturn0search11

## Dependency collapse rule
Candidate rule:
If two claims share a material dependency whose failure can cause both claims to be false, they cannot be counted as independent for that failure mode.

This does not make the claims useless. They can still increase integrity, traceability or corroboration, but not independence against the shared failure.

## Prototype repository inspection
Direct main inspection confirms the current prototype has local evidence structures but not the proposed authority dependency graph.

Observed:
- effect-adapter.js uses executionJournal and local idempotencyKey; journal is capped at 200 entries.
- runtime.js derives idempotency as missionId:stepId and stores local execution/outcome records.
- simulation-adapter.js uses nexoEffectRevision as a local state revision and postcondition evidence.
- memory.js keeps Nexo executions to 200 and effectJournal to 200 entries.
- None of these inspected structures bind an operation to a protected authority root, authority epoch, target incarnation, signer set, quorum configuration or evidence dependency graph.
- Local stateVersion / nexoEffectRevision is not demonstrated as external fencing or rollback-resistant authority.
- The exception path in effect-adapter.js returns EFFECT_OUTCOME_UNKNOWN without calling persist(), while the existing test expectation recorded in prior research expects an UNKNOWN journal result. This discrepancy remains unresolved; no test-pass claim.

Repository source evidence:
effect-adapter blob SHA 3ed48663b4da0d165c3a86da248d3f11d1e7b598
runtime blob SHA 1b4096bd6868fd9086ba6740f07d6a104a258651
orchestrator blob SHA 973d3d5406c5cab16fb49529d94e07a1557c3111
simulation-adapter blob SHA 291ef4d43ca1af2dad29503d8c15f5cdd05aa114c
memory blob SHA c70f246a85e8c513b8f746d7de237f881b0de91c

## Candidate graph
EFFECT_RESULT -> OBSERVATION -> TARGET_INCARNATION -> AUTHORITY_CONTEXT -> ROOT/ANCHOR -> FRESHNESS -> DECISION

Parallel:
RECEIPT -> ISSUER/TRANSPARENCY_SERVICE -> REGISTRY_ROOT -> ANCHOR

A receipt can strengthen registry evidence without becoming an independent target observation.

## Decision impact
When a root, configuration, target incarnation or freshness source becomes stale, revoked or compromised, dependent claims must be reappraised together. History is preserved; admissibility changes.

Candidate classifications:
INDEPENDENT
CORRELATED
COMMON_MODE_DEPENDENT
DERIVED
CIRCULAR
CONFLICTING
UNAVAILABLE
UNKNOWN

## Important negative result
There is no safe rule number_of_claims >= threshold => independent.
Independence is a semantic property of the dependency/failure graph.

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
- more signatures != more independent evidence
- more devices != independent failure domains
- receipt inclusion != target effect truth
- derived claim != independent observation
- quorum threshold != independence proof
- shared root invalidation must propagate to dependent claims
- no V21
- no architecture implementation
- no unsupported formal/CI/fault-injection claims

## Exact next mission
AB104.236: study dynamic dependency invalidation — root rotation, signer revocation, target-incarnation change, archive restoration and freshness rollback; determine how dependent claims and decisions should transition without rewriting historical evidence.