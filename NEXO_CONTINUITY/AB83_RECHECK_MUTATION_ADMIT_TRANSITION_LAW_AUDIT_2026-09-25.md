# AB83 — RECHECK + MUTATION + ADMIT transition-law audit
Date: 2026-09-25
Status: RESEARCH-ONLY

## Objective
Continue AB82 by auditing the smallest high-value ternary attack whose AB54 read-set explicitly contains the relevant facts:
RECHECK + MUTATION + ADMIT.

## External semantic anchor
A state-machine specification requires an initial-state predicate plus a next-state relation describing possible successive-state pairs. The next-state relation therefore has to characterize what successor steps are permitted; it is not enough to name state fields or merely record that an implementation writes a field. Lamport's TLA+ high-level description and specification paper make this distinction explicit.
Sources:
- https://lamport.azurewebsites.net/tla/high-level-view.html
- https://lamport.azurewebsites.net/pubs/spec-and-verifying.pdf

## Canonical evidence inspected
AB54 action schema defines:
- RECHECK reads exact fact-set, mutation state, attempt, policy/delegation/incarnation, boundary; creates a recheck result.
- ADMIT reads actual UsedAdmissionContext, authority/binding/policy/delegation/incarnation/protocol/boundary and required bridge/recheck facts; actual linkage is authoritative.
- Missing decisive evidence => UNKNOWN.
AB61 interpreter is explicitly research-only and marks MUTATION and RECHECK as semantic_status=UNKNOWN. It has a field recheck_valid, but its continuation_legality returns UNKNOWN for unresolved semantic events rather than inventing legality. Its quotient_status is UNKNOWN and retained_support is UNKNOWN.

## Audit result
The existing AB61 field write:
  MUTATION/RECHECK -> recheck_valid
is NOT a complete transition law.

It does not establish:
1. C2 — a complete legality/admission predicate for MUTATION or RECHECK.
2. C3 — the complete post-state relation, including the exact recheck result and every state component whose value may change.
3. C4 — complete invalidation/frame behavior tied to the exact mutation and recheck ordering.
4. C5 — a complete mapping from recheck result/fact-set to the actual admission context used by ADMIT.
5. C6 — an exhaustive domain over which successor enumeration is complete.

Therefore a bounded interpreter may safely preserve UNKNOWN, but it cannot classify the attack as KNOWN_EMPTY, KNOWN_NONEMPTY, or a concrete P_AA collision merely because recheck_valid exists.

## Minimal two-completion test
Let the same observed pre-state contain the AB54-required read-set.

Completion M1:
  MUTATION changes a claim-relevant fact F;
  RECHECK detects F and produces result R1;
  ADMIT is disallowed or produces observation O1.

Completion M2:
  MUTATION changes a non-claim-relevant fact, or the protocol defines the same visible fact differently;
  RECHECK produces R2;
  ADMIT produces O2.

If O1 != O2 and both completions remain compatible with the currently recovered evidence, the future-observation quotient cannot collapse them. If the protocol law does not determine which completion is legal, the correct classification remains UNKNOWN rather than stutter/no-op.

No concrete M1/M2 pair is asserted as legal Nexo protocol behavior here; constructing one without additional protocol evidence would invent missing semantics.

## Gate matrix
- Read-set explicitness: PASS (AB54)
- Source context: PARTIAL/KNOWN (AB76/AB80)
- Legality C2: UNKNOWN
- Complete post-state C3: UNKNOWN
- Frame/invalidation C4: UNKNOWN
- Observation/context mapping C5: PARTIAL/UNKNOWN
- Complete enumeration domain C6: UNKNOWN
- Successor status: UNKNOWN
- TERNARY_PROTOCOL_RESIDUAL: UNKNOWN_DUE_TO_MISSING_SEMANTICS
- TERNARY_PAA_COLLISION: UNKNOWN
- QUOTIENT_CONGRUENCE: UNKNOWN
- EVENTDAG_CLOSURE: PARTIAL
- RECONSTRUCTION: BOUNDED_ONLY
- SEMANTIC_FREEZE: NOT_DECLARED
- FORMAL_VERIFICATION: NOT_PERFORMED
- EXECUTION: NOT_VERIFIED
- Integrated Nexo assembly before architecture gate: BLOCKED

## Important negative result
AB83 does NOT prove that RECHECK + MUTATION + ADMIT creates a ternary P_AA collision.
It also does NOT prove that no such collision exists.
It establishes a narrower result: the currently recovered semantics are insufficient to classify the attack because the transition relation is incomplete.

## Exact next action
Audit LEASE_RENEW + POLICY_CHANGE + ADMIT next, focusing on whether any recovered evidence supplies a complete renewal legality/post-state law and bridge-to-admission linkage. Preserve UNKNOWN for every missing dimension. Do not expand to 286 triples unless a legal transition law survives the completeness gate.
