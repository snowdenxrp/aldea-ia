# AB104.36 — Explicit-transition-only bounded frontier — 2026-09-25

Status: RESEARCH ONLY.

## Method

Formal crosscheck: an action denotes a relation between old and new states; history variables record past behavior but do not themselves supply a missing next-state relation. citeturn0search12turn0search15

Therefore this round considers only transitions whose canonical Pre/Post/Frame/Invalidation/HistorySupport/AdmissionLink contract was explicitly recovered.

## Result

Known explicit actions can constrain ordering and historical linkage, but any path that requires LEASE_RENEW or LEASE_CONSUME remains UNKNOWN because their complete successor relation is absent.

This means the bounded frontier can safely:
- compare explicit PolicyChange / ResourceReincarnate / LeaseExpire / RetryAttempt / Admit ordering;
- preserve historical admission linkage;
- detect no new concrete P_AA collision merely from ordering;
- stop propagation at an unresolved renewal/consume transition.

It must not:
- substitute LeaseExpire for LEASE_RENEW;
- treat ReplayState as a proven post-state;
- infer retry inheritance;
- collapse LeaseBridge with AdmissionBindingClass.

## Status

KNOWN-TRANSITION FRONTIER = OPEN
LEASE_RENEW = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
LEASE_CONSUME = UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
REPLAY_STATE_RECONSTRUCTION = UNKNOWN
CONCRETE_PAA_COLLISION = NOT_ESTABLISHED
QUOTIENT_CONGRUENCE = UNKNOWN
AB65_EXECUTION = NOT_VERIFIED

## Next

Continue bounded ordering only where every transition is explicit; persist any new separator only if its future P_AA consequence is itself established by canonical evidence.