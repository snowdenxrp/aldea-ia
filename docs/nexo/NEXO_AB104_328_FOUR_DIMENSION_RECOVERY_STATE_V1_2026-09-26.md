# NEXO AB104.328 — Four-dimensional recovery state

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
External-effect recovery should separate the durable recovery point from the actual external outcome. NVIDIA's current state-handling guidance explicitly distinguishes target state, stable operation identity, observed external identity, and ambiguous outcomes; it recommends fail-closed behavior when safe reconciliation is unavailable. citeturn0search0

## Candidate four dimensions
1. **Authority/Fence Safety** — can stale authority still be rejected at the target effect boundary?
2. **Historical Effect Knowledge** — can we establish whether the operation committed, did not commit, or remains UNKNOWN?
3. **Target-State Integrity** — is the recovered target state itself authenticated/current enough for the claim?
4. **Idempotency/Coverage** — is the operation registry/receipt/history sufficiently complete to deduplicate and reconcile?

These dimensions are independent. A system can be fence-safe while historical effect knowledge remains UNKNOWN; it can have historical receipts while current authority is stale; it can have intact operation identity while target state coverage is incomplete.

## Candidate state vector
`R = <FenceSafety, EffectKnowledge, TargetIntegrity, IdempotencyCoverage>`

Candidate values per dimension:
`GOOD | DEGRADED | UNKNOWN | CONFLICT`

### Important rule
No scalar "recovered = true" should erase the vector. A transition is executable only when the dimensions required by that specific effect contract satisfy its admission predicate. Otherwise `UNKNOWN/STOP` or `CONFLICT`.

This aligns with current recovery guidance that ambiguous external outcomes require reconciliation rather than blind retry, and that fencing, idempotency, and reconciliation solve different failure modes. citeturn0search0turn0search8

## Non-claim
This vector is a candidate model, not a final Nexo schema and not formally verified.

## Next
AB104.329 — study whether these four dimensions can be composed with the existing multidimensional recovery frontier without losing partial-order information or creating an unsafe scalarization.
