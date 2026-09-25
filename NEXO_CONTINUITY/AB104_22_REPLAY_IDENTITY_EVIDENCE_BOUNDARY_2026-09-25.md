# AB104.22 — Replay identity evidence boundary — 2026-09-25

Status: RESEARCH ONLY. No protocol law inferred.

## Recovery

AB94 and AB100 were rechecked. AB94 recovers AB18's candidate LeaseBridge dimensions, including freshness/temporal validity, ReplayBinding, authority/policy/delegation/incarnation bindings, and attempt binding. It explicitly states that safe removal is not established.

AB100 provides a conservative research harness with ReplayState.consumed_attempts and completeness metadata. LEASE_CONSUME is deliberately marked UNKNOWN and its apply() path refuses to mutate state. ADMIT also returns UNKNOWN unless replay completeness is COMPLETE.

## What this establishes

1. Replay/consumption is a protocol-relevant candidate dimension in the research language.
2. The current harness does not establish the actual LEASE_CONSUME post-state.
3. A prior consumed-attempt distinction is not enough by itself to prove a P_AA collision; a complete legal future transition reading that distinction is still required.
4. Treating ReplayState as equivalent to lease_valid would be unsupported. Earlier AB104.4/AB104.5 audits already identified this semantic discrepancy between AB61 and AB100.
5. Therefore the minimal replay pair is useful as an adversarial test fixture, but cannot be promoted to a protocol counterexample.

## Targeted separator

Candidate pair:
H1: identical current lease/bridge/binding fields; no known consumption record.
H2: identical current lease/bridge/binding fields; consumed_attempts contains the bound attempt.

To turn this into a concrete separator, recovered protocol evidence must establish a legal future action whose outcome depends on consumption state (for example a later admission, retry, reuse, or renewal) and must specify its complete successor law.

Current evidence does not do so.

## Status

LEASE_CONSUME=UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW
REPLAY_SEPARATOR=IDENTIFIED_AS_CANDIDATE_ONLY
CONCRETE_PAA_COLLISION=NOT_ESTABLISHED
QUOTIENT_CONGRUENCE=UNKNOWN
EVENTDAG_CLOSURE=PARTIAL
RECONSTRUCTION=BOUNDED_ONLY
AB65_EXECUTION=NOT_VERIFIED

## Next

Search for a canonical transition law that explicitly consumes/replays an attempt or lease. If none is recovered, preserve UNKNOWN and test reconstructibility from event/order history without introducing an oracle or changing protocol semantics.
