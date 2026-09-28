# GLOBAL-AUDIT-024 — CLAIM-RELATIVE OBSERVATION AND CONTINUATION UNIVERSE — 2026-09-28

## Scope
Define the semantic contract required before attempting G1/G6/G7. This artifact freezes neither implementation nor a final architecture. It defines what must be specified so later bounded checking and proof are meaningful.

## 1. Claim contract

Target claim:
P_AA = every internally admitted effect at the Z1→Z3 boundary is justified by the authority and protocol context actually used by that admission, under the declared claim assumptions.

The claim is scoped by:
- subject/identity;
- operation and attempt identity;
- resource identity and resource incarnation;
- authority identity/epoch/delegation;
- policy context;
- protocol family and protocol-specific obligations;
- admission binding;
- temporal/history assumptions;
- Z1→Z3 boundary;
- evidence/provenance completeness assumptions.

Z4 external-world truth is outside P_AA. External effect confirmation is a separate claim.

## 2. Observation contract

Define a total partial-information observation:
Obs_AA(H, c) ∈ {TRUE_JUSTIFIED, FALSE, UNKNOWN}

where H is a concrete history and c is the claim contract.

Observation is claim-relative: changing c can legitimately change the observation.

TRUE_JUSTIFIED requires:
1. actual admission linkage is identified;
2. required authority validity is established for the claim-relative historical point;
3. required protocol semantics are established;
4. resource incarnation/binding requirements hold;
5. required policy/delegation/epoch/fence conditions hold;
6. no unresolved claim-relevant dependency remains;
7. the Z1→Z3 boundary conditions are satisfied.

FALSE requires a demonstrated violation/counterexample under the claim contract.

UNKNOWN applies when required information, ordering, reconstruction, or protocol semantics are insufficient to distinguish TRUE_JUSTIFIED from a possible violating history.

UNKNOWN is not FALSE and is not permission to choose a favorable representative.

## 3. Observation invariance requirement

For a proposed abstraction α:
if α(H1)=α(H2), safe quotienting requires that Obs_AA(H1,c) and Obs_AA(H2,c) agree for every declared future continuation, or that the abstraction produces the same conservative UNKNOWN where the retained information is insufficient.

Current observation equality alone is insufficient.

## 4. Explicit continuation universe

Let T be the declared transition alphabet:

AUTH_ISSUE
AUTH_REVOKE
EPOCH_ADVANCE
POLICY_CHANGE
DELEGATION_CHANGE
RESOURCE_REINCARNATE
LEASE_ISSUE
LEASE_EXPIRE
LEASE_RENEW
LEASE_CONSUME
ATTEMPT_CREATE
RETRY
DECIDE
RECHECK
ADMIT
ABORT
STUTTER

A legal continuation is not an arbitrary sequence of labels. Each transition has:
- preconditions;
- state/history effects;
- authority/binding effects;
- protocol-specific effects;
- invalidation effects;
- boundary effects;
- whether it can affect future P_AA observation.

## 5. Continuation semantics

For history H and continuation τ:
H·τ is legal only if every transition in τ satisfies its preconditions against the preceding history/state.

Define FutureObs_AA(H,c) as the set/function of observations over all legal finite continuations in the declared universe, including UNKNOWN outcomes.

A candidate quotient must preserve FutureObs_AA, not merely Obs_AA at the current point.

## 6. Boundary discipline

Only Z1→Z3 authorization/admission semantics are in this claim universe.

Z1 may establish:
- authority;
- admission;
- protected transition authorization;
- fence/epoch conditions;
- protocol validity required by P_AA.

Z3 may:
- execute/attempt the admitted operation;
- report execution/observation facts.

Z4 may determine external-world outcome, but Z4 outcome is not silently substituted for Z1 authorization validity.

## 7. Stuttering

STUTTER is legal only when it preserves all P_AA-relevant semantic obligations and does not alter the future continuation space relevant to the claim.

A concrete event that changes hidden claim-relevant history cannot be classified as harmless stutter merely because current visible fields are unchanged.

## 8. Finite research universe

For executable bounded research, declare finite domains for:
- identities;
- operations;
- attempts;
- resources/incarnations;
- authorities/epochs;
- policies/delegations;
- bridge/lease records;
- event identifiers;
- bounded history length;
- bounded continuation depth.

The finite model is a research instance. Its results are valid only for that declared domain and assumptions unless a separate proof establishes generalization.

## 9. Required adversarial continuation families

At minimum:
- REVOKE between DECIDE and ADMIT;
- EPOCH_ADVANCE between DECIDE and ADMIT;
- POLICY_CHANGE/DELEGATION_CHANGE in both orders;
- RESOURCE_REINCARNATE before/after admission;
- LEASE_EXPIRE before retry/admission;
- LEASE_RENEW before/after authority/policy change;
- LEASE_CONSUME before retry;
- partial versus complete RECHECK;
- retry with same versus new attempt;
- mixed protocol families with equal current visible fields;
- second failure during recovery/reconciliation where applicable.

## 10. Closure condition for G1/G6/G7

G1 is specified when Obs_AA is total over the declared history/claim domain and UNKNOWN conditions are explicit.

G6 is satisfied only when proposed equivalent representatives have matching observations under every legal transition in the declared continuation universe.

G7 is satisfied only when the declared FutureObs_AA support is sufficient for every allowed continuation in the declared universe, with UNKNOWN preserved consistently where evidence is insufficient.

None of these conditions is yet claimed as proven.

## 11. Remaining semantic questions

1. Is the declared transition alphabet complete for P_AA?
2. Which transition parameters affect claim observation?
3. What exact history ordering relation is authoritative?
4. What makes two attempts equivalent or distinct?
5. Which lease renewal/consumption semantics are authoritative?
6. Which RECHECK facts are mandatory?
7. Which Z1/Z3 events can alter future continuation space without changing current visible state?
8. What finite abstraction, if any, is sound for unbounded histories?

## 12. Gate

This artifact makes G1/G6/G7 testable without pretending they are solved.

Next exact action:
GLOBAL-AUDIT-025 → adversarial completeness review of the transition alphabet and parameter dimensions, followed by construction of the bounded research-state schema. No implementation and no V21.
