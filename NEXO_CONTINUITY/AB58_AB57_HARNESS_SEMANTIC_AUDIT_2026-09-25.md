# AB58 — AB57 HARNESS SEMANTIC AUDIT / NON-CLOSURE FINDINGS — 2026-09-25

Status: IN PROGRESS / RESEARCH-ONLY
Parent frontier: AB57 (f88f703c890064cdadd4f50a37bf22233de2b43b)

## Purpose

Audit the persisted AB57 executable harness before adding protocol semantics. This audit is intentionally conservative: it uses only the persisted AB57 implementation and its documented research boundary. It does not import undocumented protocol rules and does not promote any UNKNOWN result.

## Verified findings

### F1 — FutureObs_PAA is currently degenerate

AB57::legal_continuation_orders() returns only ("ADMIT",). Therefore future_obs_set(state) is currently equivalent to evaluating P_AA at the supplied state. It does not enumerate any post-event continuation.

Consequence: the FutureObs_PAA reconstruction criterion is not executable yet. No future-observation separator can be established by this implementation.

Status: ESTABLISHED FROM CODE AUDIT.

### F2 — continuation legality is intentionally absent, not merely incomplete in the caller

LEASE_RENEW, RETRY, MUTATION and RECHECK are marked UNKNOWN in EVENTS and apply() returns UNKNOWN for them. legal_continuation_orders() nevertheless suppresses all such successors instead of representing their legality as an UNKNOWN-valued branch.

Consequence: the current harness is safe against invented semantics, but it is not a complete three-valued continuation model. A future implementation must distinguish:
- no legal continuation established;
- legal continuation established;
- legality unknown.

It must not silently convert UNKNOWN into an empty set.

Status: ESTABLISHED FROM CODE AUDIT.

### F3 — EventDAG currently has no explicit ordering evidence

All AB57 Event definitions have empty explicit_predecessors. dag_edges() therefore emits an empty edge set for the current event vocabulary.

Consequence: topological_orders() enumerates all permutations, but this is not yet a protocol-derived EventDAG. The implementation does not currently distinguish an independently reorderable pair from a pair whose ordering legality is unknown.

Status: ESTABLISHED FROM CODE AUDIT.

### F4 — UsedAdmissionContext identity check is not yet a discriminating test

context(state) derives its fields from state.binding and the copied scalar identity fields. The current event implementations mutate validity predicates only and do not mutate binding identity. Therefore context(final_state) == context(initial_state) is expected for the currently executable known events and does not yet test identity preservation across admission-affecting mutations.

Consequence: the identity check must be upgraded only when canonical protocol evidence defines an event that can change or rebind admission context. Until then, retain the check but do not interpret it as evidence of protocol-level context preservation.

Status: ESTABLISHED FROM CODE AUDIT.

### F5 — lower_obs is an identity-bearing projection, not yet the canonical lower-arity P_AA observation

lower_obs() returns the complete symbolic binding tuple plus selected ordered pairs. This is useful as an identity-bearing research projection, but AB57 itself does not establish that this tuple is the exact observational quotient required by the AB51/AB56 reconstruction criterion.

Consequence: equality under lower_obs() must not be treated as proof of observational equivalence until the canonical observation vocabulary and quotient are explicitly derived from persisted evidence.

Status: ESTABLISHED FROM CODE AUDIT.

## What this audit does NOT establish

- No ternary P_AA collision.
- No failure of reconstruction.
- No protocol semantics for LEASE_RENEW, RETRY, MUTATION or RECHECK.
- No EventDAG closure.
- No semantic freeze.
- No formal verification.

## Exact next executable increment

1. Recover the canonical observation vocabulary and action semantics from AB54/AB56 artifacts already in the repository.
2. Add a three-valued continuation representation in which UNKNOWN legality is preserved rather than omitted.
3. Enumerate only continuations whose legality is explicitly evidenced; retain UNKNOWN branches separately.
4. Add explicit EventDAG edges only where canonical evidence declares ordering.
5. Re-run lower-arity equivalence and FutureObs_PAA without broadening the binding domain.
6. Re-run the eight ternary attacks through the complete gate.
7. Persist results and unchanged UNKNOWN labels before any 286-triple expansion.

## Non-loss rule

This artifact does not modify or supersede AB50–AB57. It records an audit of the current executable boundary and narrows the next implementation step.
