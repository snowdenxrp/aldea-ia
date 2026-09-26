# NEXO CONTINUITY — AB104.342

AB104.342 persisted. Research only; no implementation.

## Finding
Distributed checkpoint GC determines obsolete state from future recovery usefulness/dependencies, not age alone. citeturn0search3turn0search22 Practical checkpoint systems likewise tie cleanup to explicit recovery policy. citeturn0search0turn0search1

Nexo should derive retention horizons per claim/effect contract rather than use a single global TTL.

Candidate horizon binds claim, contract version, dependency closure, required frontier interval, authority/epoch, target incarnation, coverage requirements, and revalidation policy.

Retention ends only when the claim is permanently closed with no reopening path, an authenticated summary fully subsumes the evidence, or an explicit policy retirement boundary is recorded.

## Invariants
`TTL_EXPIRED != GC_ELIGIBLE`
`CLAIM_RESOLVED != EVIDENCE_DISPOSABLE` without proof of no reopening or complete authenticated substitution.

## Constraints
No V21; no implementation; no formal verification claim; preserve AB50–AB58 residuals; no overwrite/delete.

## Exact next action
AB104.343 — study claim retirement/finality and how retirement interacts with authority epochs and UNKNOWN.

## DO-NOT-REPEAT
Never use elapsed time alone as proof that recovery evidence is safe to delete.
