# GLOBAL-AUDIT-107

## Scope
Cross-provider effect identity and deduplication semantics under retries, migration, and finite dedup/history windows.

## Fresh evidence
AWS Durable Execution states that replay/retry may execute an operation more than once; at-most-once is per retry attempt and does not guarantee exactly-once across a workflow. It exposes deterministic OperationId and AttemptNumber separately, and recommends stable idempotency keys for external services. AWS also states that an interrupted side-effecting step may require checking the external system to determine whether the operation succeeded. Cloud Tasks is at-least-once, allows duplicate execution, and provides no execution-order guarantee. Its task-name deduplication is a bounded service feature, not a universal world-effect identity. etcd snapshot restoration creates a new logical cluster identity and older restored revisions can leave caches/watchers inconsistent.

## Findings
1. LOGICAL_OPERATION_ID != PROVIDER_REQUEST_ID.
2. PROVIDER_REQUEST_ID != EXTERNAL_EFFECT_ID.
3. EXTERNAL_EFFECT_ID != RECEIPT_ID.
4. RECEIPT_ID != PROOF_OF_UNIQUE_EFFECT.
5. IDEMPOTENCY_KEY != EFFECT_IDENTITY.
6. IDEMPOTENCY_KEY + PROVIDER_NAMESPACE != GLOBAL_EFFECT_IDENTITY.
7. SAME_KEY + NEW_PROVIDER_INCARNATION != SAME_DEDUP_HISTORY.
8. DEDUP_HIT != HISTORICAL_SINGLE_EFFECT.
9. DEDUP_MISS != HISTORICAL_NO_EFFECT.
10. DEDUP_EXPIRY != HISTORICAL_NO_EFFECT.
11. RETRY_ATTEMPT_COUNT != EFFECT_COUNT.
12. ATTEMPT_LINEAGE != EFFECT_LINEAGE.
13. PROVIDER_EXECUTION_STATUS != WORLD_EFFECT_STATUS.
14. PROVIDER_RECEIPT != EXTERNAL_WORLD_RECEIPT.
15. RECEIPT_REPLAY != NEW_EFFECT_OBSERVATION.
16. CURRENT_PROVIDER_STATE != COMPLETE EFFECT HISTORY.
17. CURRENT_DEDUP_STATE != COMPLETE DEDUP HISTORY.
18. MIGRATION_MAPPING != CROSS_PROVIDER EFFECT IDENTITY.
19. SAME_OPERATION_ID ACROSS PROVIDERS != SHARED DEDUP SEMANTICS.
20. RECONCILIATION MATCH != HISTORICAL CAUSAL RECONSTRUCTION.
21. FINITE DEDUP WINDOW + UNOBSERVED LATE EFFECT -> UNKNOWN.
22. FINITE RECEIPT RETENTION + REQUIRED HISTORY > RETENTION -> UNKNOWN.
23. PROVIDER LOCAL EXACTNESS != GLOBAL EXACTNESS.
24. WORKFLOW EXACTNESS CLAIM != EXTERNAL WORLD EXACTNESS CLAIM.

## New adversarial boundary
Consider:
O is one logical operation.
P1/I1 receives O and creates attempt A1; external effect may occur but receipt is lost.
Migration activates P2/I2.
P2/A2 receives the same logical operation and returns a duplicate/dedup result.
The dedup record in P2 later expires or is compacted.
A delayed P1 receipt arrives after P2 reconciliation.
A recovery restores P1 or P2 from an older checkpoint.

The system cannot infer one unique historical effect solely from the final state, receipt, operation ID, idempotency key, or dedup result. The historical claim must remain partitioned by evidence and authority domain, with UNKNOWN when required observations have expired or are unavailable.

## Research-only consequence
Future Nexo effect contracts need at least separate concepts for:
logical operation identity; attempt identity; provider incarnation; provider request identity; external-effect identity; idempotency namespace/domain; dedup state and validity horizon; receipt identity/provenance; authority/fencing epoch; event-time vs observation-time; retention horizon; reconciliation state; and UNKNOWN.

No implementation or architecture decision is authorized by this audit.

## FutureObs_PAA
UNKNOWN. Not closed.

## Global epistemic state
P_AA quotient congruence = UNKNOWN
FutureObs_PAA = UNKNOWN
R1-R5 completeness = UNKNOWN
R1-R5 minimality = UNKNOWN
dependency completeness = UNKNOWN
TCB completeness = UNKNOWN
evidence reducer completeness = UNKNOWN
independence proof = UNKNOWN
quorum semantics completeness = UNKNOWN
retention/reconstruction soundness = UNKNOWN
population completeness = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED
AB55/AB56 carryover = UNRESOLVED
