# GLOBAL-AUDIT-020 — AB36S–V REVIEW — 2026-09-28

AB36S–V were directly reviewed as primary research artifacts.

## S — transition stability / collisions
AB36S defines a behavioral quotient requiring actual admission linkage, authorization, protocol validity, relevant temporal/replay/invalidation semantics, and correspondence of all allowed future continuations. Its countermodels cover revoke, renew, retry, policy, delegation, incarnation, recheck and atomicity. This demonstrates why current-state equality is insufficient. It does not prove quotient congruence.

## T — FutureObs quotient
AB36T makes the crucial distinction between complete-history concretization and prefix concretization. For prefixes, FutureObs must quantify over allowed continuation space. The proposed relation requires corresponding continuation spaces and equivalent future P_AA observations, including conservative UNKNOWN. This is the correct formal target, but it remains a candidate definition, not an established congruence theorem.

## U — bounded distinguishability / minimality
AB36U defines Dist_k for finite domains and bounded trace depth. A positive separator proves a distinction cannot be removed at that bound. A negative result proves only bounded non-distinguishability. Candidate dimensions include atomicity, lease linkage/expiry/renewal/consumption, recheck semantics, attempt identity, resource incarnation, authority epoch, policy/delegation context, actual UsedAuth/UsedBridge linkage, boundary and invalidation order. Several are conditional: their necessity depends on the claim/protocol contract or equivalent encoding elsewhere.

## V — bounded separating traces / packing
AB36V derives short candidate separators and explores packing multiple semantic dimensions into richer summaries. Packing can reduce physical state without removing semantic information, but it is safe only if the packed representation preserves every separating observation and joint relation. Bounded separators are evidence, not universal minimality.

## Audit conclusion
This is a major semantic milestone, not a proof closure. The research now has a precise target:
behavioral equivalence over future continuation space, with actual linkage and conservative UNKNOWN.
But:
BOUNDED_DISTINGUISHABILITY != UNIVERSAL_DISTINGUISHABILITY
NO_FOUND_SEPARATOR != PROOF_OF_EQUIVALENCE
PACKING != INFORMATION_LOSS
CURRENT_EQUIVALENCE != CONGRUENCE
QUOTIENT_DEFINITION != QUOTIENT_THEOREM

## Status
P_AA quotient congruence UNKNOWN.
FutureObs_PAA sufficiency UNKNOWN.
Protocol minimality UNKNOWN.
Formal verification NOT_PERFORMED.
Implementation NOT_STARTED.

## Next
GLOBAL-AUDIT-021 → AB36W–Z: reduced semantic product, compression attacks, residual relational quotient, minimality/reconstruction.