# NEXO GLOBAL AUDIT-064 — FEDERATION CONVERGENCE / OBSERVATION SEMANTICS
Date: 2026-09-28
Repository: snowdenxrp/aldea-ia
Status: research/audit artifact only

## Objective
Attack the assumption that observed federation convergence implies semantic finality. Examine asynchronous validator observations, out-of-order bundle propagation, duplicate/replayed transitions, missing update intervals, partitions/healing, clock skew versus sequence/epoch semantics, eventual consistency, stale-but-valid metadata during recovery, and convergence certificates.

## External evidence studied
SPIFFE Federation requires periodic bundle refresh because bundle contents change over time. It defines a monotonically increasing spiffe_sequence for update ordering/supersession when present, and a refresh hint for expected polling cadence. It also states that update distribution to validators is implementation-specific and that foreign bundle chains involve operations occurring at different times. Federation maintenance therefore has explicit propagation and temporal semantics; a fetched bundle is not equivalent to a globally synchronized state. citeturn0search0turn0search1

SPIFFE also requires the validator to select the bundle corresponding to the presented trust domain; if no matching bundle exists, the peer is untrusted. This makes observation state claim-relevant at the validator, rather than merely operational metadata. citeturn0search5

TUF provides a useful external analogue for treating version progression and persistent trusted state as security-relevant. An audit of TUF also documents that update-cycle semantics themselves can contain ambiguity if a version transition does not precisely define which checks continue after an equal-version condition. citeturn0search16

## Findings

### A — Convergence is not semantic finality
If validators eventually report the same bundle/epoch, that establishes an observation relation only if the observation domain and convergence criterion are defined. It does not by itself prove that no authoritative update, revocation, delayed event, or partitioned source remains outside the observation domain.

DISTINCTION:
CONVERGED OBSERVATIONS != CLOSED CLAIM

### B — Eventual consistency does not establish closure
An eventual-consistency promise is a liveness property about propagation under stated assumptions. It does not automatically provide a safety proof that a current claim is final at an arbitrary observation point.

DISTINCTION:
EVENTUAL CONVERGENCE != CURRENT FINALITY
LIVENESS GUARANTEE != CLAIM COMPLETENESS

### C — Out-of-order bundle propagation
A validator can receive E3 after E1 even if E2 was generated earlier. Sequence numbers can establish ordering among versions when their semantics are authoritative, but they do not prove that every dependent federation artifact has reached the same epoch.

DISTINCTION:
VERSION ORDER != GLOBAL DEPENDENCY ORDER

### D — Duplicate/replayed transitions
Repeated delivery of an already-seen transition must be idempotent with respect to the intended semantic state. But idempotence of message handling does not prove that the message is current or authorized.

DISTINCTION:
IDEMPOTENT REPLAY HANDLING != CURRENT AUTHORITY

### E — Missing update intervals
If E1 is followed by E3 and E2 is never observed, the absence of E2 is not automatically evidence that E2 never existed or was semantically irrelevant. Gap detection requires an authoritative continuity/sequence contract.

DISTINCTION:
NOT OBSERVED != NOT EXISTED
SEQUENCE GAP != PROVEN ABSENCE

### F — Partition and healing
During a network partition, different validators may hold states E1 and E2. Healing can produce convergence, but the merge itself must preserve authority, revocation, epoch and provenance semantics. Simply adopting the highest observed version can be unsafe if sources are conflicting or incomparable.

DISTINCTION:
PARTITION HEALING != SEMANTIC MERGE CORRECTNESS

### G — Clock skew versus sequence/epoch
Wall-clock time cannot automatically define federation order when clocks differ. Conversely, a monotonic sequence/epoch cannot by itself establish real-world occurrence time or prove that an event was generated before a claim was admitted.

DISTINCTION:
CLOCK ORDER != SEMANTIC ORDER
SEQUENCE ORDER != EVENT OCCURRENCE TIME

### H — Stale-but-valid metadata
A cryptographically valid bundle can remain usable while being stale relative to current revocation or root state. SPIFFE's refresh mechanism and key-removal guidance show that propagation delay is operationally relevant to revocation and key lifecycle. citeturn0search0turn0search1

DISTINCTION:
CRYPTOGRAPHIC VALIDITY != CURRENT FRESHNESS

### I — Recovery after prolonged disconnection
A validator that reconnects after missing multiple refresh intervals may receive a current snapshot. That does not automatically prove the historical transition path is reconstructible, nor that the snapshot covers every claim-relevant revocation or mapping event.

DISTINCTION:
CURRENT SNAPSHOT != COMPLETE HISTORICAL RECONSTRUCTION

### J — Convergence certificate scope
A certificate asserting "all validators converged to E3" needs an explicit validator population, observation interval, source authority, epoch, completeness boundary, and dependency closure. Otherwise it proves only a narrower observation.

DISTINCTION:
CONVERGENCE CERTIFICATE != GLOBAL STATE CERTIFICATE

### K — Common-mode observation
If every validator derives its state from the same federation endpoint, cache distributor, or metadata registry, identical observations may reflect a common-mode source rather than independent confirmation.

DISTINCTION:
IDENTICAL OBSERVATIONS != INDEPENDENT EVIDENCE

### L — Claim-relative closure
A current authorization claim can require less or more observation scope depending on the claim. Therefore "the federation converged" is too coarse to establish closure for every claim.

DISTINCTION:
GLOBAL CONVERGENCE != CLAIM-RELATIVE COMPLETENESS

## Result
FOUND:
- convergence is distinct from semantic finality;
- eventual consistency is not claim closure;
- sequence ordering does not automatically order all dependent federation state;
- replay idempotence does not prove current authority;
- missing observations cannot be treated as proof of absence;
- partition healing does not automatically establish safe semantic merge;
- clock order and sequence order answer different questions;
- cryptographic validity does not imply freshness;
- recovery snapshots do not prove complete historical reconstruction;
- convergence certificates are claim-scoped evidence;
- common-mode observation can masquerade as independent confirmation;
- closure must be claim-relative.

NOT CLOSED:
FutureObs_PAA; P_AA quotient congruence; complete federation convergence/observation algebra; R1-R5 completeness/minimality; dependency/TCB/evidence reducer completeness; independence/quorum completeness; retention/reconstruction soundness.

NOT PERFORMED:
implementation; formal verification; runtime/fault injection; V21; semantic freeze.

## Global epistemic state — preserve exactly
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
formal verification = NOT_PERFORMED
implementation = NOT_STARTED
V21 = FORBIDDEN / NOT_STARTED
semantic freeze = NOT_DECLARED

AB55/AB56 carryover unchanged:
AB55 did not execute the full UsedAdmissionContext/EventDAG/FutureObs_PAA space.
AB56 specified the missing interpreter but did not close FutureObs_PAA.

## Next exact mission — GLOBAL-AUDIT-065
Attack federation observation gaps and negative evidence:
- whether missing bundles/events can support absence claims;
- freshness-expiry versus semantic revocation;
- sequence gaps and reset/reinitialization;
- validator population completeness;
- offline validators and hidden state;
- cache eviction and evidence loss;
- deletion/termination observations;
- negative claims about "no active credential", "no current root", or "no revocation";
- whether observation certificates can prove absence without a completeness contract.

No implementation. No V21. Preserve UNKNOWN unless evidence closes a boundary.
