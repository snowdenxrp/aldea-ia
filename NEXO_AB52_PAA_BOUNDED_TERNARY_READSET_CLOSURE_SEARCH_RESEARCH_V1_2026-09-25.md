# NEXO AB52 — BOUNDED TERNARY READ-SET CLOSURE SEARCH — 2026-09-25

Status: RESEARCH ONLY. Bounded semantic search evidence; no proof, no semantic freeze, no production implementation, no TLC/TLAPS.

## 1. Parent and objective

Parent:
AB51 — NEXO_AB51_PAA_TERNARY_JOINT_SEPARATOR_HYPEREDGE_CLOSURE_RESEARCH_V1_2026-09-25.md

Parent SHA:
d9252fca819b47659bebbf4a36b4cb2473963bed

Objective:
instantiate the AB50/AB51 ternary search far enough to test whether a legal ATOMIC, LEASE, or RECHECK transition can read an irreducible ternary distinction that is invisible to the retained lower-arity/protocol facts.

The central question is deliberately narrower than "are ternary relations mathematically possible?":

Can a legal P_AA transition distinguish H1 from H2 when:
- all retained unary facts agree;
- all retained binary order/invalidation/linkage facts agree;
- protocol-specific retained facts agree;
- AdmissionBindingClass and actual admission linkage agree;
- the only difference is a genuine ternary relation?

## 2. Bounded search universe

AB51 supplies 13 candidate event roles:

AUTH_REVOKE
POLICY_CHANGE
DELEGATION_CHANGE
RESOURCE_REINCARNATE
LEASE_RENEW
LEASE_EXPIRE
LEASE_CONSUME
RETRY
RECHECK
MUTATION
DECIDE
ADMIT
BOUNDARY_CHANGE

Number of unordered event-role triples:
C(13,3) = 286.

For three labeled events, the exhaustive set of strict partial orders contains 19 cases:
- 1 empty order;
- 6 single-edge orders;
- 6 two-edge transitive orders;
- 6 total orders.

Protocol variants tested:
ATOMIC, LEASE, RECHECK.

Thus the role/order/protocol skeleton count is:

286 × 19 × 3 = 16,302.

This is the complete ternary role/order/protocol skeleton for the stated candidate universe.

Bindings remain finite and claim-relative. The search does not claim to enumerate every concrete value assignment of the full AB50 domain; instead it exhaustively tests the structural read-set question against the canonical lower-arity-equivalence witness and the protocol read closures below. Therefore this round is a bounded closure result, not a complete concrete-state-space enumeration.

## 3. Canonical lower-arity collision witness

For each ternary candidate J(A,B,C), construct the AB51 stress pair:

H_even:
J = even parity over three binary event attributes.

H_odd:
J = odd parity over the same attributes.

Both have identical:
- unary projections;
- every binary projection.

Therefore a reconstruction function that receives only those unary/binary projections cannot in general recover J.

This is retained from AB51 and is not being promoted beyond its proven mathematical scope.

## 4. Retained P_AA read closure

The bounded protocol model gives each legal future transition a read-set built only from already retained semantic facts.

### ATOMIC read closure

A legal admission may read:
- authorization context;
- linearization/order;
- relevant interleaving exclusion;
- invalidation;
- immutable admission linkage;
- boundary;
- protocol state.

Any Boolean combination of these facts is reconstructible from the retained facts themselves. A conjunction of three or more retained facts is still not an irreducible ternary relation.

### LEASE read closure

A legal renewal/consume/admit may read:
- issuance-to-admission linkage;
- lease interval and expiry;
- renewal authority;
- consumption/replay state;
- policy/delegation/epoch/incarnation invalidation;
- bridge linkage;
- boundary.

Again, a joint validity condition such as:
authority AND policy-valid AND delegation-valid AND incarnation-current
is a higher-arity predicate over facts, but it is reconstructible from those retained facts. It does not require a new hyperedge merely because the predicate has three or more inputs.

### RECHECK read closure

A legal recheck/admit may read:
- exact fact-set;
- fact mutation;
- recheck order;
- attempt identity;
- actual result consumed by admission;
- policy/delegation/boundary applicability.

A multi-fact admission condition remains reconstructible when every input fact is already retained.

## 5. Exhaustive structural test

For every one of the 16,302 role/order/protocol skeletons:

1. impose the AB51 lower-arity equality gate;
2. replace the candidate ternary relation with the H_even/H_odd witness;
3. keep all retained protocol inputs identical;
4. enumerate the legal read-set categories for that protocol;
5. ask whether the transition can distinguish H_even from H_odd;
6. if it can, determine whether the distinction is already a retained input or reconstructible from retained inputs;
7. only classify it as a semantic residual if the transition reads an irreducible relation not represented by the retained closure.

Result of this structural closure search:

- A legal protocol read-set can combine multiple retained facts.
- No tested protocol read-set requires an additional semantic primitive merely because the condition is jointly evaluated.
- The parity witness remains invisible unless an explicit protocol primitive is added whose semantics directly read the parity/joint relation.
- Adding such a primitive would be adding new protocol semantics, not discovering that the existing ATOMIC/LEASE/RECHECK model secretly contained it.

## 6. Ternary candidate disposition

Under the stated bounded protocol semantics:

TERNARY_MATH_GAP = FOUND

The parity construction remains a valid mathematical non-reconstructibility witness.

TERNARY_PROTOCOL_RESIDUAL = NOT_FOUND_BOUNDED

No irreducible ternary relation was exposed by the tested ATOMIC/LEASE/RECHECK read closures.

TERNARY_PAA_COLLISION = NOT_FOUND_BOUNDED

No legal future P_AA continuation in the tested closure can distinguish the canonical lower-arity-equivalent pair.

HYPEREDGE_SEMANTIC_NECESSITY = NOT_FOUND_BOUNDED

No additional semantic hyperedge is justified by the tested ternary closure.

These are bounded results, not proofs.

## 7. Important negative result: what this search does NOT establish

This round does NOT establish that arbitrary future protocol extensions cannot introduce a ternary primitive.

It also does NOT establish:
- complete enumeration of every concrete AB50 binding assignment;
- universal absence of higher-order residuals;
- quotient congruence;
- HistorySupport elimination;
- LeaseBridge/AdmissionBindingClass merge;
- refinement correctness;
- semantic minimality;
- formal verification.

If a future protocol explicitly defines a ternary primitive, the read-set changes and this search must be rerun.

## 8. Four-event escalation decision

AB51 required four-event escalation only for a surviving ternary semantic residual.

Because no ternary semantic residual survived this bounded closure model, there is no justified four-event escalation from the ternary results alone.

This does NOT close all four-event questions. AB50 H6/H7 remain open as independent attacks unless their ternary projection can be shown to contain a surviving read-relevant residual.

Therefore:

FOUR_EVENT_ESCALATION_FROM_TERNARY = NOT_TRIGGERED

## 9. HistorySupport consequence

The search gives a bounded architectural indication:

HistorySupport does not need an independent semantic variable merely to store arbitrary joint predicates.

If a support fact is reconstructible from retained linkage/order/invalidation/protocol facts, it is absorbable.

If a support fact is not reconstructible but no legal P_AA transition reads it, it is nonsemantic for P_AA.

If a support fact is both irreducible and read by a legal transition, the search must return UNKNOWN or a residual rather than inventing a reconstruction.

Therefore:

HS_ELIMINATION = SUPPORTED_BOUNDED_FOR_TESTED_TERNARY_CLOSURE

This is not a global elimination result. Untested support paths remain open.

## 10. LeaseBridge / AdmissionBindingClass

No merge is established by this round.

The ternary closure result only shows that multi-input validity checks do not by themselves force a new hyperedge.

LeaseBridge still carries a different semantic question: how authorization facts are transported and preserved from issuance/decision to admission.

Therefore:

BRIDGE_MERGE = UNKNOWN

The next bridge attack must construct histories with equal AdmissionBindingClass and lower-arity facts but potentially different bridge provenance/consumption/renewal behavior, then apply future-observation comparison.

## 11. EventDAG consequence

The search supports using EventDAG hyperedges as a derived representation when:
- the relation is reconstructible from retained EventDAG facts;
- it is not independently read as a semantic primitive;
- provenance/order/invalidation are preserved.

A hyperedge should not be promoted to an abstract variable merely because a transition evaluates several facts jointly.

This is representational closure, not semantic expansion.

## 12. Current epistemic classification

Established by this round:
- 286 candidate ternary event-role triples were identified.
- 19 strict partial-order structures exist for three labeled events.
- 16,302 role/order/protocol skeletons were structurally covered.
- The AB51 parity witness remains mathematically valid.
- Existing tested protocol read closures do not expose that witness as an irreducible P_AA distinction.
- No bounded ternary P_AA collision was found under the stated semantics.

Still UNKNOWN:
- exhaustive concrete binding-state enumeration;
- independent four-event H6/H7 attacks;
- full EventDAG closure;
- HistorySupport global elimination;
- LeaseBridge/AdmissionBindingClass merge;
- quotient congruence;
- exact refinement mapping;
- TLA+ specification;
- TLC/TLAPS;
- semantic freeze.

## 13. Required next action

Do NOT declare semantic closure yet.

Next pass:
1. formalize the concrete finite state representation for H6/H7;
2. test the smallest four-event extensions only where ternary projections are individually absorbed;
3. explicitly attack joint invalidation across policy/delegation/incarnation/renewal;
4. explicitly attack recheck/mutation/retry/admit timing;
5. preserve UNKNOWN whenever transition semantics are not fully specified;
6. after four-event closure, attack LeaseBridge versus AdmissionBindingClass;
7. then attack quotient congruence under every legal transition class;
8. only after those gates, write the exact TLA+ abstract variables and refinement mapping.

## 14. Final status

Research only.
No production implementation.
No TLC.
No TLAPS.
No semantic freeze.

AB52 changes the frontier from:
"ternary residual UNKNOWN"
to:
"no ternary residual found under the explicitly instantiated ATOMIC/LEASE/RECHECK read closures, while concrete full-state enumeration remains open."

That distinction must be preserved in all future continuity recovery.
