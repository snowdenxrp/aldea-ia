# GLOBAL-AUDIT-021 — AB36W–Z REVIEW — 2026-09-28

## W — bounded transition system / reduced product
AB36W defines a finite concrete protocol system and a candidate reduced product:
AuthorityContext × ResourceIncarnation × PolicyContext × DelegationContext × LeaseBridge × AdmissionBindingClass, optionally plus residual protocol support.
The important advance is an explicit reconstruction obligation: protocol semantics must be recoverable by a total function that preserves actual linkage, transitions, future observations, non-amplification and boundary semantics. If reconstruction fails, assessment must become UNKNOWN rather than decisive TRUE.
W also correctly emphasizes joint traces; componentwise tests are insufficient.

## X — compression attacks
AB36X systematically attacks removal of protocol label, atomic linearization, recheck facts, invalidation order, retry/attempt support, renewal history, consumption/replay state, bridge issuance linkage, UsedAdmissionContext and resource incarnation.
Results are mixed: some dimensions are conditionally removable when their semantics are encoded equivalently elsewhere; UsedAdmissionContext and incarnation-sensitive semantics cannot simply be replaced by arbitrary valid witnesses/current IDs.

## Y — residual relational quotient
AB36Y replaces a raw history bag with a semantic relation centered on actual admissions, bridges, protocol validity, order/invalidation relations and future support. This is a cleaner abstraction target because it distinguishes semantic obligations from physical storage fields.
It explicitly says FutureSupport need not enumerate every future trace; it is enough to preserve the continuation capability relevant to P_AA or conservatively return UNKNOWN.
This is a candidate relational quotient, not yet proven congruent.

## Z — residual minimality/reconstruction
AB36Z decomposes the residual into five semantic obligations:
R1 AdmissionLink
R2 ProtocolValidity
R3 Order/Linearization
R4 Invalidation/Continuation
R5 FutureSupport.
The crucial result is that these are obligations, not five mandatory implementation variables. Multiple obligations may be packed into one structure if a total reconstruction mapping preserves linkage, protocol validity, transitions, future observations, non-amplification and boundary.
Counterexamples show why a current validity bit, generic bridge, or resource_id alone cannot safely stand in for these semantics.

## Audit conclusion
AB36W-Z significantly improves the architecture's semantic vocabulary and provides a plausible route from raw history to a smaller claim-relative relational support. However, it does NOT establish that the proposed five-obligation set is complete, minimal, or uniquely sufficient.

The strongest surviving statement is:
A representation may be compressed only when every P_AA-relevant semantic obligation is reconstructible for all allowed continuations; otherwise the safe result is UNKNOWN/HOLD rather than an inferred TRUE_JUSTIFIED.

## Preserved UNKNOWN
P_AA quotient congruence UNKNOWN.
FutureObs_PAA sufficiency UNKNOWN.
Completeness of R1-R5 UNKNOWN.
Minimality of R1-R5 UNKNOWN.
Unique minimal representation UNKNOWN.
Formal verification NOT_PERFORMED.
Implementation NOT_STARTED.

## Next
GLOBAL-AUDIT-022 → cross-stage semantic closure check AB36A-Z, then targeted verification-gap inventory before any architecture construction.