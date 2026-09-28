# GLOBAL-AUDIT-037 CONTINUITY

Audit commit: 54d8f80766d05addbd4c35afa5cc7ae03f24a022
Previous continuity: 9ceea30801ef3d724f09909740a4548cacc1703a

Completed retry/reconciliation convergence attack under UNKNOWN.

UNKNOWN is a semantic state carrying unresolved alternative histories, not a transient error code. Safe reconciliation preserves OperationID, original AdmissionID/context, AttemptID lineage, EffectID when an effect may exist, resource incarnation, observation provenance and authoritative observation generation/order.

Reconciliation may resolve effect state without creating authorization. If old authority expired/revoked, reconciliation cannot resurrect it; a new AdmissionID is a distinct authorization and must not overwrite the old UNKNOWN attempt.

Repeated reconciliation must be idempotent relative to observation identity/generation and must not erase contradictory historical evidence. `RECONCILIATION_IDEMPOTENCE != EFFECT_IDEMPOTENCE`.

Retry after UNKNOWN must first consider whether the original effect could exist. If so, stable EffectID/deduplication must be used where the provider contract supports it, otherwise HOLD/QUARANTINE may be required.

Resource incarnation changes do not permit old effect evidence to be attached to a new incarnation.

Candidate invariant: `NO_UNKNOWN_ERASURE` — UNKNOWN may become resolved only with authenticated, context-bound evidence sufficient to eliminate the relevant alternatives.

No formal proof/model execution/runtime fault injection. No implementation/V21.
Next: GLOBAL-AUDIT-038 — contradictory reconciliation evidence, observation ordering and stale provider responses.
Carryover unchanged: P_AA quotient congruence UNKNOWN; FutureObs_PAA UNKNOWN; R1-R5 completeness/minimality UNKNOWN; dependency completeness UNKNOWN; TCB completeness UNKNOWN; composition algebra universality UNKNOWN; reconciliation convergence proof UNKNOWN; formal verification NOT PERFORMED.
