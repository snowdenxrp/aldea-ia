# NEXO AB104.310 — Idempotency retention, restore, and target incarnation

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
Idempotency is scoped by the target/resource contract and has a lifecycle. Keys may expire or be evicted, and reuse after expiry can be treated as a new operation. Therefore an idempotency record cannot be treated as permanent historical evidence unless its retention and restore coverage are proven.

## Evidence
The HTTP Idempotency-Key draft requires an explicit expiration policy and says the resource manages key lifecycle. AWS documents scoped client-token idempotency and rejects reuse with changed parameters; concrete services may define a bounded lifetime. RFC 9110 also warns that non-idempotent operations should not be retried automatically without a way to know the original was not applied. citeturn0search4turn0search2turn0search1

## Nexo consequence
1. Idempotency scope MUST include the target/resource namespace and, where relevant, target incarnation.
2. Expiry/eviction removes deduplication protection; it does not prove that the historical effect was absent.
3. A restored target whose idempotency registry cannot be proven complete for the relevant historical window MUST receive a new incarnation before effects resume.
4. Old operation IDs must not silently regain executable meaning after a restore that may have lost the dedupe/effect registry.
5. A receipt from incarnation I is historical evidence for I; it cannot become current evidence for incarnation J without an authenticated restore/lineage transition.
6. If an ambiguous operation predates a registry reset/expiry boundary, the safe recovery state is UNKNOWN_EXTERNAL unless target-authoritative evidence establishes the outcome.

## Candidate identity
`target_id + target_incarnation + logical_operation_id + effect_semantics_fingerprint`

The exact identity schema remains UNSELECTED.

## Explicit non-claims
No implementation or formal proof. This research does not establish a universal retention period; retention is a target-specific contract parameter.

## Next
AB104.311 — study durable idempotency/effect registries and whether their atomic boundary can bind dedupe record + target mutation + receipt.
