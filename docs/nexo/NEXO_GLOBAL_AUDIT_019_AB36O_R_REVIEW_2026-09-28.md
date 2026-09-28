# GLOBAL-AUDIT-019 — AB36O–R REVIEW — 2026-09-28

## Findings
AB36O characterizes the semantic preorder through claim-relative concretization only under an expressiveness/completeness condition. It explicitly rejects treating alpha/gamma-shaped functions as a Galois connection without domains, orders, monotonicity and adjunction proof. It also makes future continuation semantics explicit.

AB36P continues protocol unification. ATOMIC/LEASE/RECHECK can share a claim contract only if their concrete histories map to the same semantic admission predicate while preserving linkage, invalidation, temporal, replay and boundary obligations. Protocol labels may be removable only after behavioral equivalence is established.

AB36Q requires protocol history to preserve or reconstruct all claim-relevant admission linkage, ordering/linearization, lease expiry/renewal/consumption, recheck facts, attempt binding, incarnation and invalidation context. Atomicity is a semantic constraint, not a label.

AB36R derives a behavioral lower bound for protocol history support. It shows via countermodels why removing linearization, expiry, renewal, consumption, recheck facts, used-authority linkage, attempt identity or resource incarnation can split P_AA behavior when those semantics are claim-relevant. It does NOT prove a unique minimal representation.

## Audit conclusion
The key advance is that protocol compression is now explicitly a behavioral quotient problem:
CURRENT_STATE_EQUALITY is insufficient.
The quotient must preserve current semantics, allowed future transition space, future P_AA observations, actual admission linkage and conservative UNKNOWN behavior.

Surviving distinctions are semantic, not necessarily physical fields. A literal ProtocolClass is not proven necessary, but protocol semantics are.

## Status
P_AA quotient congruence = UNKNOWN.
FutureObs_PAA sufficiency = UNKNOWN.
Minimal protocol history = UNKNOWN.
ProtocolClass eliminability = UNKNOWN.
Formal verification = NOT_PERFORMED.

## Next
GLOBAL-AUDIT-020 → AB36S–V: transition stability, collision attacks, future-observation bounded distinguishability and protocol minimality/packing.