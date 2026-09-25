# AB85 — TARGETED RENEWAL-EVIDENCE RECOVERY — 2026-09-25

Status: RESEARCH ONLY. No implementation change, semantic freeze, TLC/TLAPS execution, or formal verification.

## Objective

Continue AB84 by recovering the earliest canonical evidence specifically relevant to LEASE_RENEW + POLICY_CHANGE + ADMIT.

## Evidence recovered

### AB20 — commit 6a9e70df634800ff40554c740b0e73314571bb26

AB20 defines a candidate normalized transition relation and records these lease/policy semantics:

- ChangePolicy changes policy consequences and invalidates a bridge if required compatibility no longer holds.
- IssueLease requires a valid authority basis and creates freshness/binding state but does not create authority.
- Admit requires valid current authority plus a valid complete bridge whose joint binding matches the admission.
- Candidate joint BridgeValid is:
  Fresh AND AuthorityCompatible AND PolicyCompatible AND DelegationCompatible AND IncarnationCompatible AND BoundaryCompatible AND BindingMatches.
- The trace basis includes T8: decide -> policy change -> admit.
- Lease expiry/admission and policy/admission races are explicit countermodel families.
- AB20 identifies three candidate admission linearization models, including lease/fence interval and explicit recheck.
- AB20 explicitly leaves exact quotient/transition completeness, formal syntax, TLC result, and implementation refinement open.

AB20 contains no complete LEASE_RENEW transition law.

### AB24 — commit 522110cf650c7acdc3be15d24901d649680a2aa3

AB24 defines a candidate Next_AA relation including IssueLease and ExpireLease, but does not include a completed renewal action with exact pre/postconditions.

AB24 states:
- PolicyChange may invalidate an otherwise identical bridge.
- Lease validity is joint rather than a single lease_valid bit.
- Every P_AA-relevant transition must specify precondition, changed fields, unchanged fields, cross-component invalidations, AdmissionClass effect, prior-bridge validity, and required historical support.
- LEASE is a protocol class where authorization is carried through a complete bound lease whose validity can be invalidated by relevant state changes.
- The future-behavioral quotient remains unresolved.
- Exact transition pre/postconditions remain open.

Again, no complete LEASE_RENEW law is recovered.

## Recovery attempts

Direct repository code search for:
- "renewal lease bridge policy"
- "LeaseBridge"
- "AB24"

returned no indexed file results.

Commit search did recover AB20 and AB24, so their canonical commits were inspected directly.

## Consequence

The targeted historical evidence strengthens the policy/bridge interaction but does NOT close renewal semantics.

What is now supported:
1. Policy change can invalidate a bridge when compatibility fails.
2. Lease validity is a joint semantic predicate, not an isolated freshness bit.
3. Admission must use the actual bound authorization context.
4. A P_AA-relevant transition needs a complete pre/post/invalidation/history specification.

What remains unsupported:
1. renewal legality;
2. renewal extension vs replacement;
3. renewal authority rule;
4. renewal-to-bridge replacement/retention;
5. renewal ordering against policy change;
6. complete successor domain;
7. complete mapping to UsedAdmissionContext.

## Gate result

C1 Source context: PARTIAL/KNOWN
C2 Complete renewal legality: UNKNOWN
C3 Complete renewal post-state: UNKNOWN
C4 Complete frame/invalidation: UNKNOWN
C5 Admission-context mapping: PARTIAL/UNKNOWN
C6 Complete successor domain: UNKNOWN

SUCCESSOR_STATUS: UNKNOWN

TERNARY_PROTOCOL_RESIDUAL: UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION: UNKNOWN
QUOTIENT_CONGRUENCE: UNKNOWN
EVENTDAG_CLOSURE: PARTIAL
RECONSTRUCTION: BOUNDED_ONLY
SEMANTIC_FREEZE: NOT_DECLARED
FORMAL_VERIFICATION: NOT_PERFORMED
EXECUTION: NOT_VERIFIED

## Important boundary

AB85 does not justify inventing a renewal rule from the fact that policy invalidation and lease validity are documented.

The correct next move is either:
A. recover a later/earlier artifact that explicitly specifies renewal; or
B. if no such artifact exists, record that the canonical research corpus reaches a semantic boundary at renewal and stop this branch rather than manufacture semantics.

## Exact next action

Search the canonical commit history for artifacts immediately adjacent to AB20/AB24 and later artifacts containing renewal/lease/bridge concepts by commit message and recovered diffs. If a complete renewal law is found, re-run C2-C6. Otherwise formally record the boundary and return to the next unresolved transition only with the same UNKNOWN discipline.
