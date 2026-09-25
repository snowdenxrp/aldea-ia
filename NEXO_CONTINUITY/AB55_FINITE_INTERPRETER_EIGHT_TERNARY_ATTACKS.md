# NEXO AB55 — FINITE RESEARCH INTERPRETER / EIGHT TERNARY ATTACKS V1 — 2026-09-25

Status: RESEARCH ONLY
Implementation of Nexo runtime: NOT STARTED
TLC/TLAPS: NOT STARTED
Semantic freeze: NOT DECLARED

## 1. Purpose

AB54 normalized the P_AA transition semantics. AB55 instantiates a small finite research interpreter and executes the eight highest-value ternary attacks requested by AB54.

This interpreter is not the Nexo runtime. It is a bounded research instrument.

## 2. Conservatism rule

The interpreter has three epistemic outcomes:

TRUE
FALSE
UNKNOWN

UNKNOWN is returned whenever AB54 leaves a decisive transition rule unspecified.

The interpreter must never invent a successor merely to obtain a two-valued result.

## 3. Finite domain

The bounded state space uses six binary dimensions:

policy_compatible
delegation_valid
incarnation_compatible
lease_valid
attempt_bound
recheck_valid

Authority validity, binding completeness and admission-protocol validity start valid.

There are 64 initial binding states.

Each ternary attack has 6 event permutations.

Therefore each attack executes 384 finite histories.

This is deliberately a small bounded domain and is NOT the complete Cartesian binding-state space.

## 4. Eight attack results

### 1. POLICY_CHANGE + DELEGATION_CHANGE + ADMIT

Histories: 384
TRUE: 8
FALSE: 376
UNKNOWN: 0

No semantic contradiction was produced by this bounded interpreter.

### 2. DELEGATION_CHANGE + RESOURCE_REINCARNATE + ADMIT

Histories: 384
TRUE: 8
FALSE: 376
UNKNOWN: 0

No semantic contradiction was produced by this bounded interpreter.

### 3. LEASE_RENEW + POLICY_CHANGE + ADMIT

Histories: 384
TRUE: 8
FALSE: 184
UNKNOWN: 192

UNKNOWN is expected because AB54 deliberately does not specify the exact successor-validity semantics of LEASE_RENEW.

This is evidence that the interpreter is preserving the missing-semantics boundary rather than silently completing it.

### 4. LEASE_EXPIRE + RETRY + ADMIT

Histories: 384
TRUE: 12
FALSE: 180
UNKNOWN: 192

UNKNOWN is required because AB54 leaves retry inheritance/new-attempt semantics protocol-dependent.

### 5. DECIDE + AUTH_REVOKE + ADMIT

Histories: 384
TRUE: 12
FALSE: 372
UNKNOWN: 0

No semantic contradiction was produced by this bounded interpreter.

### 6. RECHECK + MUTATION + ADMIT

Histories: 384
TRUE: 10
FALSE: 150
UNKNOWN: 224

UNKNOWN is required because MUTATION has no independent transition semantics in AB54 and RECHECK depends on an exact fact-set/order/result linkage.

### 7. RETRY + LEASE_CONSUME + ADMIT

Histories: 384
TRUE: 12
FALSE: 180
UNKNOWN: 192

UNKNOWN is required because retry inheritance remains protocol-dependent.

### 8. RESOURCE_REINCARNATE + LEASE_RENEW + ADMIT

Histories: 384
TRUE: 8
FALSE: 184
UNKNOWN: 192

UNKNOWN is required because LEASE_RENEW successor semantics remain incomplete.

## 5. Interpretation

The eight attacks did not establish a P_AA collision.

They also do not prove ternary sufficiency.

The strongest result at this stage is methodological:

- the AB54 matrix can be executed as a finite transition schema;
- missing semantics propagate to UNKNOWN;
- unspecified retry/renewal/mutation behavior is not silently converted into protocol law;
- no tested bounded history produced an unexpected P_AA-positive result solely from the explicitly modeled invalidations.

The TRUE/FALSE counts are coverage of this bounded interpreter, not a safety score.

## 6. Important limitation

This run does NOT yet perform the full AB51 collision test.

In particular, it has not established, for every candidate:
1. equality of all lower-arity observations;
2. equality of all lower-arity future observations;
3. a legal joint distinction;
4. a legal future continuation that reads the distinction;
5. FutureObs_PAA separation;
6. deterministic reconstruction failure.

Therefore:
TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS
TERNARY_PAA_COLLISION = UNKNOWN
HYPEREDGE_SEMANTIC_NECESSITY = UNKNOWN

## 7. Newly confirmed semantic gaps

The interpreter exposed three concrete places where the matrix must remain conservative:

- LEASE_RENEW successor validity;
- RETRY inheritance / same-attempt semantics;
- MUTATION as a named transition and its relationship to RECHECK.

These are not bugs in the interpreter. They are explicit research gaps.

## 8. Next experiment

Before broadening to all 286 triples:

1. enrich the finite interpreter with the AB54 partial-order event histories;
2. encode lower-arity observation projections;
3. encode FutureObs_PAA including UNKNOWN;
4. enumerate candidate worlds with equal unary/binary projections;
5. search for legal joint distinctions;
6. test deterministic reconstruction;
7. test EventDAG absorption;
8. only then broaden to all 286 triples.

Four-event escalation remains prohibited unless a candidate survives the full ternary gate.

## 9. Status

Finite interpreter: EXECUTED
Eight highest-value ternary attacks: EXECUTED
P_AA collision: NOT FOUND
Ternary closure: NOT PROVEN
HistorySupport elimination: UNKNOWN
LeaseBridge/AdmissionBindingClass merge: UNKNOWN
Formal verification: NOT PERFORMED
Runtime implementation: NOT PERFORMED
