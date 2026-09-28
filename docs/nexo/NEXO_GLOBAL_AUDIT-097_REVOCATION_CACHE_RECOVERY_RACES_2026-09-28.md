# NEXO GLOBAL AUDIT-097 — Delayed Revocation, Cache and Recovery Races

Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Branch: main

## Scope
Offline verifiers, stale authorization snapshots, revocation during in-flight operations, emergency override races, provider cache invalidation, rollback to pre-revocation checkpoints, and FutureObs_PAA.

No implementation. No V21. No semantic freeze.

## Fresh evidence
RFC 7009 explicitly notes that revocation can have a propagation delay in which some servers know about invalidation while others do not. It also requires clients not to use the token after successful revocation. citeturn0search2turn0search7

OAuth guidance also distinguishes authorization-server revocation from resource-server awareness for self-contained access tokens: a resource server may not learn of revocation until token expiry. citeturn0search6

Current TUF specification uses persisted versions, expiry, threshold signatures and explicit rollback/freeze checks. It requires clients to reject older trusted metadata and describes freeze attacks caused by withholding newer metadata. citeturn0search0

## Findings

REVOCATION ISSUED != REVOCATION OBSERVED EVERYWHERE
REVOCATION OBSERVED != REVOCATION ENFORCED EVERYWHERE
VALID TOKEN != CURRENT AUTHORIZATION
CACHE HIT != CURRENT AUTHORIZATION
TOKEN EXPIRY != UNIVERSAL REVOCATION BOUNDARY
OFFLINE VERIFIER != CURRENT VERIFIER
STALE SNAPSHOT != CURRENT AUTHORITY
SNAPSHOT VALIDITY != REVOCATION COMPLETENESS
REVOCATION DURING FLIGHT != AUTOMATIC EFFECT ABSENCE
REQUEST AUTHORIZED AT START != EFFECT AUTHORIZED AT COMMIT
REVOKED-AFTER-START != AUTOMATIC ROLLBACK
EMERGENCY OVERRIDE != RETROACTIVE ERASURE
CACHE INVALIDATION != EXTERNAL EFFECT CANCELLATION
ROLLBACK TO PRE-REVOCATION CHECKPOINT != CURRENT REAUTHORIZATION
PERSISTED VERSION != GLOBAL REVOCATION STATE
ANTI-ROLLBACK != EXTERNAL-WORLD COMPLETENESS
REVOCATION CLOSURE != FUTURE FINALITY
REVOCATION CLOSURE != FUTUREOBS_PAA CLOSURE

## Race analysis

### 1. Revocation propagation window
RFC 7009 directly acknowledges a period where some servers know about revocation and others do not. Therefore a revocation event and global enforcement are separate evidence boundaries. citeturn0search2

### 2. Offline/self-contained credentials
A self-contained token can remain cryptographically valid to a resource server after the authorization server has revoked it, until the resource server's validation semantics recognize the revocation or the token expires. This makes token validity and current authorization distinct. citeturn0search6

### 3. In-flight operation
If authorization is checked at operation start and revocation arrives before external effect, the system needs an explicit effect-admission contract. Start-time authorization cannot automatically prove commit-time authorization.

### 4. Cache invalidation
Invalidating a local cache does not cancel an already accepted external request. Cache state is evidence about a verifier, not direct evidence about an external effect.

### 5. Emergency override race
An emergency authority may be legitimate for a bounded scope/interval while an ordinary revocation is simultaneously propagating. Without explicit precedence, epoch and scope semantics, deterministic selection can manufacture authority.

### 6. Recovery rollback
Restoring a checkpoint from before revocation can resurrect stale authorization. TUF demonstrates why rollback resistance and persisted trusted version state are explicit security state, not incidental metadata. citeturn0search0

### 7. Negative conclusion remains unsafe
Failure to observe revocation on one verifier does not prove revocation did not occur; observing revocation on one verifier does not prove every verifier enforced it.

NO REVOCATION OBSERVED != NO REVOCATION
REVOCATION OBSERVED LOCALLY != GLOBAL REVOCATION

## Research-only boundary
A candidate revocation/race record must bind:
- subject and credential incarnation;
- authorization issuer/delegation;
- scope and effective interval;
- authority/fencing epoch;
- authorization-check time and effect-admission time;
- operation/attempt identity;
- verifier/cache identity and freshness;
- propagation observations;
- provider execution/receipt state;
- recovery snapshot/revision and restoration event;
- anti-rollback state;
- emergency-authority contract;
- reconciliation lineage;
- provenance/dependency closure;
- retention/reconstruction loss;
- conflict/revocation state.

Not frozen.

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
GLOBAL-AUDIT-098 — attack authorization/effect linearization at the external boundary: revocation exactly around commit, provider acceptance vs execution, cancellation races, receipt ambiguity, retry after revocation, and FutureObs_PAA.

No implementation. No V21. Preserve UNKNOWN.
