# NEXO GLOBAL AUDIT-096 — Revocation Propagation Across Incarnations

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope

Credential revocation, old-key reuse, delayed revocation visibility, provider-side credential caches, fencing-token reuse, emergency authority, recovery after revocation, and FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Fresh evidence

etcd documents explicit user/role grant and revocation operations, including role revocation and account deletion. citeturn0search1turn0search5

etcd leases provide a concrete bounded revocation mechanism: revoking or expiring a lease deletes attached keys and emits deletion events. citeturn0search0turn0search9

A May 2026 etcd security release fixed an RBAC authorization bypass affecting authenticated users in specific transaction paths. This is direct evidence that authorization semantics can depend on exact request composition and implementation boundaries, not only on the existence of a valid credential. citeturn0search10

## Findings

AUTHENTIC KEY != CURRENT AUTHORITY
REVOCATION ISSUED != REVOCATION OBSERVED EVERYWHERE
REVOCATION OBSERVED != REVOCATION ENFORCED EVERYWHERE
OLD KEY != CURRENT INCARNATION
KEY REUSE != IDENTITY CONTINUITY
CACHE FRESHNESS != REVOCATION COMPLETENESS
CACHE EXPIRY != PROOF OF GLOBAL REVOCATION
FENCING TOKEN REUSE != AUTHORITY CONTINUITY
REVOCATION OF E1 != ERASURE OF E1 HISTORY
RECOVERY FROM PRE-REVOCATION STATE != RESTORATION OF CURRENT AUTHORITY
EMERGENCY AUTHORITY != UNIVERSAL PRECEDENCE
SIGNED REVOCATION != COMPLETE REVOCATION PROPAGATION
MULTIPLE REVOCATION OBSERVATIONS != INDEPENDENT REVOCATION ROOTS
CURRENT DENIAL != HISTORICAL NON-EXECUTION
CURRENT ACCEPTANCE != HISTORICAL AUTHORIZATION
REVOKED CREDENTIAL != PROVEN ABSENCE OF EFFECT
REVOCATION CLOSURE != FUTURE FINALITY
REVOCATION CLOSURE != FUTUREOBS_PAA CLOSURE

## Key analysis

### 1. Revocation is scope-bearing

A revocation must identify the subject/incarnation, authority scope, effective interval and relevant epoch. Revoking one credential cannot automatically be interpreted as revoking every historical action of the subject.

### 2. Propagation is a separate evidence boundary

A source can record a revocation while a provider-side cache, offline verifier or disconnected incarnation still has the previous authorization state.

Therefore:
REVOCATION RECORD != GLOBAL ENFORCEMENT STATE

### 3. Old-key reuse

Reusing a key identifier after revocation creates an identity ambiguity unless key incarnation/credential epoch is explicit.

SAME KEY ID != SAME CREDENTIAL INCARNATION

A later credential using the same textual identifier cannot silently inherit or erase the old credential's history.

### 4. Recovery after revocation

Restoring a snapshot predating revocation can resurrect stale authority unless recovery imports the later revocation boundary or is fenced by a newer authoritative epoch.

RESTORE != REAUTHORIZATION

### 5. Provider caches

A cache can legitimately hold an older authorization decision for a bounded interval, but cache TTL alone does not establish that no later revocation exists outside the cache's observation domain.

BOUNDED STALENESS != GLOBAL REVOCATION COMPLETENESS

### 6. Fencing-token reuse

A fencing token is only meaningful within its issuing authority/domain and monotonicity contract. Reusing an old token after incarnation change can make an old writer appear current.

TOKEN VALUE != AUTHORITY INCARNATION

### 7. Emergency authority

An emergency credential can supersede ordinary authority only if its scope, issuer, epoch, duration and precedence semantics are explicit. Emergency status alone cannot justify universal precedence.

EMERGENCY STATUS != UNIVERSAL PRECEDENCE

### 8. Authorization bugs as boundary evidence

The 2026 etcd RBAC bypass demonstrates that authorization can fail at a specific operation composition boundary even while the caller is authenticated. This reinforces the separation:
AUTHENTICATION != AUTHORIZATION != EFFECT ADMISSIBILITY
citeturn0search10

### 9. Historical decisions

A later revocation changes current admissibility according to its scope and effective interval. It does not erase the historical fact that an earlier authorization decision was made.

CURRENT REVOCATION != HISTORICAL ERASURE

### 10. FutureObs_PAA

Even a bounded revocation propagation proof cannot prove that no later observation will reveal delayed revocation, stale-cache use, provider-side acceptance, key reuse, recovery from an older checkpoint, or an external effect not represented in the evidence graph.

BOUNDED REVOCATION CLOSURE != FUTURE FINALITY
FUTUREOBS_PAA REMAINS UNKNOWN

## Research-only revocation boundary

Candidate record:

- subject identity;
- credential/key identity and incarnation;
- issuer and delegation chain;
- authority scope;
- effective interval;
- authority/fencing epoch;
- provider identity/namespace/incarnation;
- revocation event and reason;
- propagation observations;
- verifier/cache state and freshness;
- recovery checkpoint and restoration event;
- anti-rollback state;
- operation/attempt lineage;
- external enforcement evidence;
- receipt/reconciliation evidence;
- dependency/common-mode closure;
- retention/reconstruction loss;
- conflict state;
- emergency-authority semantics.

Not frozen. No protocol semantics are being declared.

## Verdict

P_AA quotient congruence = UNKNOWN
FutureObs_PAA = UNKNOWN
R1-R5 completeness = UNKNOWN
R1-R5 minimality = UNKNOWN
dependency completeness = UNKNOWN
TCB completeness = UNKNOWN
evidence reducer completeness = UNKNOWN
independence proof = UNKNOWN
quorum semantics completeness = UNKNOWN
retention/reconstruction soundness = UNKNOWN
population completeness = UNKNOWN
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

## Mandatory AB55/AB56 carryover

AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission

GLOBAL-AUDIT-097 — delayed revocation and cache/recovery races: offline verifiers, stale authorization snapshots, revocation arriving during an in-flight operation, emergency override races, provider cache invalidation, rollback to pre-revocation checkpoints, and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
