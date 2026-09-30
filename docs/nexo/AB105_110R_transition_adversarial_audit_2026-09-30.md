# AB105.110R — transition-level adversarial audit with stale, delayed, duplicate and adversarial inputs

Date: 2026-09-30
Chain: AB105.109R -> AB105.110R

## Objective
Re-run the frozen invariants after explicitly separating persistent state, derived predicates, external inputs and environmental assumptions.

## Primary evidence
TLA+ models behaviors as state sequences and distinguishes safety from liveness; safety violations are finite bad prefixes, while liveness concerns eventual behavior. citeturn0search12turn0search14
NIST SP 800-53A emphasizes traceability between requirements, assessment objectives and findings, supporting explicit coverage of each adversarial transition rather than treating one successful test as proof of the whole control. citeturn0search3turn0search13

## 1. Stale-input attacks

S1 — stale authority decision arrives after a newer epoch.
Guard compares epoch/freshness before use; stale input cannot establish current authority.
PASS.

S2 — stale evidence arrives after a newer observation.
Recorded as evidence with its own observation/freshness boundary; cannot overwrite newer truth merely by arrival.
PASS.

S3 — stale STOP/fence result arrives after state changed.
Arrival order is not semantic order; enforcement state requires correlation to the relevant authority/operation epoch.
PASS.

S4 — stale reconciliation result arrives after new effect evidence.
Derived reconciliation must use the current evidence set/version; stale result cannot silently replace it.
PASS.

## 2. Delayed-input attacks

D1 — delayed ACK after STOP request.
ACK does not cancel STOP automatically; operation/epoch context must match.
PASS.

D2 — delayed effect observation after recovery.
Effect remains UNKNOWN until observed/reconciled; recovery does not erase the possibility of prior effect.
PASS.

D3 — delayed predecessor event after successor creation.
Historical event is evaluated against identity/epoch; late arrival cannot automatically revoke a valid newer state.
PASS.

D4 — delayed authority response.
Response is accepted only if it satisfies the current decision's validity/freshness boundary.
PASS.

## 3. Duplicate-input attacks

R1 — duplicate operation request.
operation_id/idempotency identity prevents treating the duplicate as a new operation.
PASS.

R2 — duplicate effect notification.
Observation identity prevents duplicate evidence from becoming duplicate effect.
PASS.

R3 — duplicate STOP request.
Idempotent control transition; repetition does not create a new authority epoch or new effect.
PASS.

R4 — duplicate recovery request.
Recovery identity prevents duplicate recovery from creating a second successor authority.
PASS.

## 4. Adversarial-input attacks

A1 — forged success without required provenance.
Cannot satisfy evidence predicate.
PASS.

A2 — malformed epoch.
Rejected as invalid input; cannot establish authority.
PASS.

A3 — conflicting fresh observations.
Conflict state persists; freshness does not resolve conflict.
PASS.

A4 — evidence claims complete coverage but scope excludes target.
Coverage predicate remains unsatisfied.
PASS.

A5 — provider reports terminal operation while required effect identity is absent.
Operation terminality does not prove target effect completion.
PASS.

A6 — provider reports failure after a prior effect was already observed.
Failure state does not erase prior effect.
PASS.

A7 — adversarial replay with altered payload but same operation identity.
Identity/replay contract must treat the identity collision as conflict, not as a fresh operation.
PASS.

A8 — valid evidence from an untrusted/unknown dependency root.
Evidence dependency assurance remains UNKNOWN/insufficient according to decision policy.
PASS.

## 5. Transition-level invariant result
All tested paths preserve the frozen distinctions:
- stale != current;
- delayed != causally current;
- duplicate != new operation;
- acknowledgement != effect proof;
- effect != authorization proof;
- STOP requested != STOP enforced;
- fence issued != fence enforced;
- recovery != authority transfer;
- authority transfer != successor exclusivity;
- terminal operation != zero prior effect;
- fresh != conflict-free;
- complete query != complete history.

## 6. One formal requirement exposed
Every externally supplied event that can affect a derived guard needs an explicit correlation domain: at minimum subject/operation identity and the applicable epoch or validity boundary.
Without this, a formally well-typed stale event could be admitted into a current decision path.
This is a formal input-admission requirement, not a new architecture branch.

## 7. Pre-model-checking gate
The state/transition semantics now have:
- explicit state vs derived predicate separation;
- explicit external-input boundary;
- explicit environment assumptions;
- typed UNKNOWN states;
- explicit correlation/epoch requirement for consequential inputs;
- adversarial coverage for stale, delayed, duplicate and malformed inputs.

No new behavior-changing semantic choice was found.

## Result
TRANSITION_ADVERSARIAL_AUDIT = PASSED
STALE_INPUT = CONTAINED
DELAYED_INPUT = CONTAINED
DUPLICATE_INPUT = CONTAINED
ADVERSARIAL_INPUT = CONTAINED
INPUT_CORRELATION_BOUNDARY = REQUIRED_AND_DEFINED
NEW_SEMANTIC_BRANCH = NONE
MODEL_CHECKING = NOT_PERFORMED
FORMAL_PROOF = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.111R — formalize the input-admission/correlation boundary and then define the smallest finite model-checking abstraction: bounded identities, epochs, operations, effects and UNKNOWN states. First verify that the abstraction preserves every frozen invariant; do not claim proof of the unbounded system.