# AB105.112R — finite abstraction consistency audit

Date: 2026-09-30
Chain: AB105.111R -> AB105.112R

## Objective
Audit the candidate finite abstraction before writing/running the model-checking artifact. The goal is to identify impossible states, deadlocks, missing distinctions, and unnecessary cardinality—not to claim a proof.

## Primary evidence
TLC explicitly supports invariant checking, deadlock checking, constraints, symmetry, and finite model values. Its explicit-state exploration checks reachable states and reports a state with no enabled successor as deadlock. citeturn0search0turn0search12
Lamport's TLA+ material distinguishes finite model checking from proof: a finite model can expose errors in the selected instance, while mathematical proof is required for an unbounded correctness claim. Symmetry reduction can reduce equivalent states when the modeled permutations preserve the specification. citeturn0search13turn0search14

## 1. Cardinality audit
The previous candidate domains were intentionally conservative. For the first executable model, the following reductions are sufficient for the frozen safety boundaries:

- Runtime: 2 identities — predecessor and successor. A third runtime is not required to expose successor exclusivity failure; it can be added later as a stress extension.
- Epoch: 3 values — OLD, CURRENT, FUTURE. Two values cannot represent a delayed future epoch and stale predecessor simultaneously.
- Operation: 2 identities plus NONE. One operation is insufficient to distinguish duplicate/replay from a distinct operation.
- Effect: 2 identities plus NONE. Two effects are required to expose partial-effect reconciliation across operations.
- Evidence item: 2 identities plus NONE. One item cannot represent conflicting/correlated evidence.
- Subject/resource identity: 2 identities plus NONE. One identity cannot test identity separation/reuse against another incarnation.

These are minimum candidate bounds for the adversarial properties currently frozen, not a mathematically proven global minimum.

## 2. State categories that must remain distinct
These pairs are not safely mergeable:

- VALID_AUTHORITY / STALE_AUTHORITY / UNKNOWN_AUTHORITY
- STOP_REQUESTED / STOP_ENFORCED / UNKNOWN_FENCING
- FENCE_ISSUED / FENCE_ENFORCED / UNKNOWN_FENCING
- SUCCESSOR_AUTHORITY / SUCCESSOR_EXCLUSIVITY
- EFFECT_OBSERVED / EFFECT_UNKNOWN / EFFECT_ABSENT_UNPROVEN
- DUPLICATE / NEW / CONFLICTING_REPLAY
- PARTIAL_RECONSTRUCTION / COMPLETE_RECONSTRUCTION
- FRESH / STALE / UNKNOWN_FRESHNESS
- SUFFICIENT_COVERAGE / PARTIAL_COVERAGE / UNKNOWN_COVERAGE
- INDEPENDENT / CORRELATED / UNKNOWN_INDEPENDENCE
- ATOMIC / COMPENSATABLE / RECONCILIABLE / UNSUPPORTED.

Collapsing any pair above would make at least one previously frozen invariant untestable.

## 3. Impossible-state constraints
The model should prohibit, rather than merely mark, the following combinations:

- ENFORCED_STOP with STOP=NONE;
- FENCE_ENFORCED without the corresponding fence having been issued, unless the model explicitly represents an independently observed external fence;
- SUCCESSOR_EXCLUSIVITY=PROVEN while successor authority is UNKNOWN/STALE/REVOKED;
- EFFECT_OBSERVED with no admissible effect identity;
- DUPLICATE operation with a different operation identity;
- COMPLETE_RECONSTRUCTION while required successor coverage is UNKNOWN/PARTIAL;
- ATOMIC capability when the selected participant set lacks the required atomic capability;
- CURRENT authority derived solely from an OLD epoch;
- RELEASE_SUCCESSOR while predecessor exclusivity is UNKNOWN for a consequential exclusive effect.

Important: an impossible state is different from an UNKNOWN state. UNKNOWN is a reachable epistemic condition; impossible means the model transition relation must never construct it.

## 4. Required reachable UNKNOWN states
UNKNOWN must remain reachable in the model. Otherwise the abstraction would accidentally prove away the uncertainty Nexo is explicitly designed to preserve.

At minimum, reachable UNKNOWN states must include:
- UNKNOWN_AUTHORITY;
- UNKNOWN_FRESHNESS;
- UNKNOWN_EFFECT;
- UNKNOWN_FENCING;
- UNKNOWN_EXCLUSIVITY;
- UNKNOWN_RECONCILIATION;
- UNKNOWN_RECONSTRUCTION.

Each must have at least one path from an admissible initial state.

## 5. Deadlock audit
A deadlock is not automatically a safety violation in Nexo; STOP/BLOCKED states may intentionally have no consequential action enabled while waiting for new evidence.
Therefore the first model must distinguish:
- SAFE_WAIT: no consequential transition enabled, but a recheck/evidence transition remains possible;
- TERMINAL_SAFE: intentionally final state;
- ILLEGAL_DEADLOCK: no enabled transition despite the specification requiring progress under the modeled assumptions.

TLC can report deadlocks, but whether a no-successor state is erroneous is a model-level semantic decision; therefore the configuration must not blindly equate every blocked state with failure. citeturn0search0turn0search2

## 6. Symmetry opportunity
Interchangeable operation IDs, effect IDs, evidence IDs, and resource identities can potentially be represented as symmetry sets, provided every specification action and invariant is permutation-preserving.
Do not apply symmetry to predecessor/successor runtime roles or OLD/CURRENT/FUTURE epoch labels: those have semantic roles and are not interchangeable.
TLA+ supports symmetry reduction through permutation groups; this can reduce exploration without merging states that have different semantic roles. citeturn0search13

## 7. Required invariant coverage
The executable model must directly check at least:

S1 — no consequential effect without current authority.
S2 — STOP request never silently becomes STOP enforced.
S3 — fence issuance never silently becomes fence enforcement.
S4 — successor release requires the configured exclusivity predicate.
S5 — observed effect never proves authorization by itself.
S6 — unknown effect never becomes absent without evidence.
S7 — partial reconstruction never becomes complete merely from a terminal record.
S8 — replay/duplicate never creates a new effect.
S9 — recovery never silently transfers current authority.
S10 — weaker atomicity capability never satisfies an ATOMIC requirement.
S11 — reconciliation is required where expected and observed effects differ materially.
S12 — identity/incarnation distinctions are preserved.

## 8. Result of audit
NO_NEW_GENERIC_SEMANTIC_GAP_FOUND.
FINITE_CARDINALITY = REDUCED_TO_CANDIDATE_MINIMUM.
IMPOSSIBLE_STATE_CONSTRAINTS = DEFINED.
REACHABLE_UNKNOWN_STATES = REQUIRED.
DEADLOCK_SEMANTICS = DISTINGUISHED.
SYMMETRY = OPTIONAL_AND_ROLE-BOUND.
INVARIANT_COVERAGE = DEFINED.
MODEL_CHECKING = NOT_YET_RUN.
FORMAL_PROOF = NOT_PERFORMED.
IMPLEMENTATION = NOT_PERFORMED.

## Anti-overclaim
FINITE_ENUMERATION != MODEL_CHECKING.
MODEL_CHECKING_PASS != UNBOUNDED_PROOF.
NO_COUNTEREXAMPLE_FOUND != IMPLEMENTATION_VERIFIED.
SAFE_WAIT != ILLEGAL_DEADLOCK.
UNKNOWN_REACHABLE != SYSTEM_FAILURE.

## Next exact direction
AB105.113R — write the actual minimal TLA+ model/checking artifact from this audited abstraction, including Init, Next, typed UNKNOWN states, impossible-state constraints, the 12 frozen safety invariants, and explicit SAFE_WAIT/TERMINAL handling. Then run only the smallest bounded model first; preserve any counterexample exactly.