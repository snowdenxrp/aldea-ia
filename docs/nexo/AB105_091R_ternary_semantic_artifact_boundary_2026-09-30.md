# AB105.091R — historical ternary semantic artifact boundary

Date: 2026-09-30
Chain: AB105.090R -> AB105.091R

## Objective
Determine whether the smallest missing FutureObs_PAA/ternary semantic artifact can be reconstructed from the historical AB50–AB55 evidence without inventing protocol semantics.

## Historical evidence inspected
AB55 finite interpreter source commit d11479da99e93e463adefcae9cadfbdc7dfecb4d explicitly states it is a bounded research interpreter and preserves UNKNOWN when AB54 semantics are unspecified.
The interpreter enumerates 2^6 = 64 bounded initial boolean states and 6 event permutations per three-event attack, producing 384 cases per attack across eight selected attacks.
AB55 itself marks LEASE_RENEW, RETRY, and MUTATION semantics as unspecified/UNKNOWN and records that the domain is intentionally bounded.
The later AB55 continuity checkpoint explicitly states that the lower-arity/FutureObs_PAA reconstruction layer was still next, rather than completed.

## Fresh primary evidence
RFC 5323's three-valued logic distinguishes an undefined expression from the well-defined truth value UNKNOWN; UNKNOWN must not be silently converted into TRUE or FALSE. citeturn1search0turn1search24
RFC 2360 describes protocol state-machine diagrams/tables as representations of specified state transitions and says the detailed protocol specification takes precedence over the model. A missing transition rule therefore cannot be supplied merely from the shape of an observed event sequence. citeturn1search4turn1search25
RFC 9334 likewise separates evidence from appraisal and makes policy/semantics explicit inputs to the resulting decision; freshness cannot eliminate semantic uncertainty. citeturn0search0

## Reconstruction test
Question: Can the finite semantic table be recovered from existing AB50–AB55 artifacts alone?

Result: NO.

Reason 1 — bounded coverage.
The AB55 64-state × 6-order interpreter is explicitly a bounded attack model, not the full FutureObs_PAA/EventDAG state space.

Reason 2 — missing transition semantics.
AB55 contains explicit UNKNOWN-producing transitions for LEASE_RENEW, RETRY, and MUTATION. Those are semantic holes, not merely untested combinations.

Reason 3 — missing FutureObs_PAA layer.
The historical continuity record itself says FutureObs_PAA/reconstruction was not yet executed at AB55.

Reason 4 — no valid inference rule.
Event ordering or observed syntax cannot manufacture the missing transition meaning. Doing so would convert UNKNOWN_DUE_TO_MISSING_SEMANTICS into invented semantics.

Reason 5 — equivalence cannot yet be proven.
AB105.090R established that ambiguity can be closed only if all admissible reconstructions are decision-equivalent for the exact claim. The historical artifacts do not provide the missing transition relation needed to enumerate all admissible reconstructions.

## Smallest missing artifact
The irreducible missing artifact is:

TERNARY_TRANSITION_SEMANTICS_SPEC

containing, at minimum:
- state domain and state invariants;
- event domain;
- valid predecessor/context conditions;
- transition function or explicit UNKNOWN for every undefined transition;
- successor/terminal rules;
- epoch/retry/lease inheritance rules;
- duplicate/replay identity rules;
- FutureObs_PAA binding semantics;
- equivalence relation for decision-relevant terminal states.

Without this artifact, a larger exhaustive interpreter would only enumerate assumptions.

## Closure decision
Do NOT claim the historical ternary branch closed.
Do NOT expand the interpreter to arbitrary larger state spaces before the semantic artifact exists.
Do NOT infer missing transitions from current Nexo design preferences.

The correct state is:
TERNARY_MATH_GAP = FOUND
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
EVENTDAG_CLOSURE = PARTIAL
RECONSTRUCTION = BOUNDED_ONLY
SEMANTIC_FREEZE = NOT_DECLARED
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Research stopping rule
This branch now has a precise stopping boundary.
Further research is justified only if primary evidence for the missing TERNARY_TRANSITION_SEMANTICS_SPEC is located or the historical artifacts are found to contain it.
Otherwise the branch should remain explicitly UNKNOWN rather than become an indefinite search.

## Result
The smallest missing ternary semantic artifact cannot be reconstructed from the currently verified historical AB50–AB55 evidence.
This is a genuine UNKNOWN boundary, not a tooling gap.

## Status
TERNARY_SEMANTIC_ARTIFACT = MISSING
TERNARY_BRANCH = CLOSED_WITH_EXPLICIT_UNKNOWN_BOUNDARY
FUTUREOBS_PAA = NOT_SEMANTICALLY_CLOSED
EVENTDAG_RECONSTRUCTION = BOUNDED_ONLY
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.092R — perform a final dependency audit around this closed-with-UNKNOWN ternary branch: verify which current Nexo requirements actually depend on the missing semantic artifact and whether any can proceed independently. Do not reopen the ternary search unless a concrete dependency requires it.

Historical AB50–AB58 unresolved state remains unchanged and must not be collapsed.