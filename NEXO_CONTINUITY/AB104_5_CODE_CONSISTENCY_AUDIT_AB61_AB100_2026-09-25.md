# AB104.5 — Code consistency audit AB61/AB100 — 2026-09-25

## Findings

### F1 — AB100 documentation/code contradiction
AB100's module docstring says it “Preserves AB61 semantics; does not invent LEASE_CONSUME law.” The implementation does not preserve AB61's consume behavior: AB61's historical apply path sets lease_valid=False for LEASE_CONSUME, while AB100 marks LEASE_CONSUME UNKNOWN and apply() refuses to execute UNKNOWN events. Therefore “preserves AB61 semantics” is not literally true for LEASE_CONSUME. This is documentation drift and must not be interpreted as protocol evidence.

### F2 — AB61 history execution intentionally bypasses continuation legality
A later AB61 repair changed execute() from calling continuation_legality() plus apply_known() to calling apply_history_event() directly. This is an intentional research-boundary repair: a candidate history event is applied according to its bounded historical transition effect without claiming that the event is legal as a future continuation. This is correct as a separation of concerns, but it means AB61 execution output must never be read as proof that every executed event is legally continuable.

### F3 — AB61 LEASE_CONSUME remains an explicit scaffold behavior
Because apply_history_event retains the old bounded effect (lease_valid=False), AB61 still contains a concrete consume effect even while its continuation legality returns UNKNOWN for semantic-status UNKNOWN events. This is acceptable only as a historical/scaffold representation; it is not a recovered protocol law.

### F4 — AB100 replay representation is stricter but incomplete
AB100 introduces ReplayState with consumed_attempts and completeness. ADMIT returns UNKNOWN until replay coverage is COMPLETE and FALSE for a known consumed attempt. This is more explicit about epistemic coverage, but it does not specify the transition that creates consumed_attempts because LEASE_CONSUME remains UNKNOWN.

## Consequence
There are now two separate research layers:
1. historical bounded event-effect scaffold (AB61);
2. conservative replay-aware uncertainty model (AB100).

Neither alone is canonical protocol semantics. A future adapter must make this distinction explicit and preserve provenance for each effect.

## Required invariant for future code
No test may use an AB61 concrete LEASE_CONSUME effect to claim a legal protocol successor unless the source law is recovered. Conversely, AB100's UNKNOWN consume transition must not be interpreted as evidence that consumption has no effect.

Gate statuses unchanged: LEASE_CONSUME UNKNOWN_DUE_TO_MISSING_COMPLETE_LAW; QUOTIENT_CONGRUENCE UNKNOWN; TERNARY_PAA_COLLISION UNKNOWN; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION NOT_PERFORMED; AB65_EXECUTION NOT_VERIFIED; 286 expansion BLOCKED.
