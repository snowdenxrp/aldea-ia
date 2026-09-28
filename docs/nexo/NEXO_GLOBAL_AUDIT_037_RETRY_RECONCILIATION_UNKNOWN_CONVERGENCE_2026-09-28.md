# GLOBAL-AUDIT-037 — RETRY/RECONCILIATION CONVERGENCE UNDER UNKNOWN — 2026-09-28

## Objective
Attack whether repeated UNKNOWN states can converge safely without changing authority, admission identity or effect identity.

## Adversarial cases
1. UNKNOWN after send timeout, then provider query says accepted.
2. UNKNOWN after send timeout, then provider query remains UNKNOWN.
3. UNKNOWN followed by local authority revocation before reconciliation.
4. UNKNOWN followed by resource reincarnation before reconciliation.
5. UNKNOWN followed by policy generation change.
6. UNKNOWN followed by retry while original effect may still exist.
7. Two reconciliation workers race and obtain different observations.
8. Reconciliation result arrives after a new admission was issued.
9. External provider returns stale status from an older resource incarnation.
10. Recovery loses local reconciliation progress and repeats the query.

## Findings
UNKNOWN is not a transient error value. It is a semantic state carrying unresolved alternatives that may affect future authorization, effect identity and recovery.

A safe reconciliation transition must preserve:
- original OperationID;
- original AdmissionID and its historical authority context;
- AttemptID lineage;
- EffectID when an external effect may have been attempted;
- resource incarnation;
- provenance of every reconciliation observation;
- generation/order at which the observation was authoritative.

A reconciliation result may resolve effect state without creating a new authorization. Conversely, a new authorization may be required if the old admission expired/revoked, but that new AdmissionID must not overwrite or reinterpret the old UNKNOWN attempt.

## Convergence rule
Repeated reconciliation is safe only if it is idempotent with respect to the same observation identity/generation and cannot erase contradictory historical evidence.

`RECONCILIATION_IDEMPOTENCE != EFFECT_IDEMPOTENCE`.

A provider response of UNKNOWN or stale observation cannot promote the claim. Conflicting authenticated observations require reconciliation of ordering/incarnation; they do not automatically imply FALSE.

## Retry rule
A retry after UNKNOWN must first determine whether the original external effect could already exist. If yes, the retry must reuse or bind to the stable external effect identity where the provider supports it, or remain HOLD/QUARANTINED if safe deduplication is unavailable.

A new AttemptID does not imply a new EffectID. A new EffectID may represent a genuinely new external effect only under an explicit claim/provider contract.

## Authority rule
Reconciliation cannot resurrect authority. If the original AdmissionID is revoked/expired, reconciliation may establish what happened externally, but it cannot make the old admission valid again. A new authorization is a distinct event.

## Resource rule
If the resource incarnation changed, an old effect observation cannot silently be attached to the new incarnation. Historical effect state remains bound to its original incarnation.

## Key invariant
`NO_UNKNOWN_ERASURE`: a transition from UNKNOWN to a resolved state must be supported by authenticated, context-bound evidence sufficient to eliminate the relevant alternative histories; otherwise UNKNOWN persists.

## Status
Semantic adversarial result only. No exhaustive execution, TLC/TLAPS proof or runtime fault injection.

## Next
GLOBAL-AUDIT-038 — attack contradictory reconciliation evidence, observation ordering and stale provider responses.

P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; composition algebra universality UNKNOWN; reconciliation convergence proof UNKNOWN; formal verification NOT PERFORMED; implementation NOT STARTED.
