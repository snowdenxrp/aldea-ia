# NEXO AUTHORITY-UNAVAILABLE BOUNDED-SAFETY CONSTITUTIONAL SUCCESSION RELEASE RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## 1. Research question
Can Nexo move safely from total constitutional authority loss through bounded safety, constitutional succession, revalidation, and release without allowing safety mode to self-authorize?

## 2. External cross-check
BFT safety protocols rely on explicit quorum/intersection and protocol locking rules; HotStuff is a representative example. This validates the need for explicit ordering/locking but does not solve Nexo's constitutional trust boundary, common-mode dependencies, external enforcement, or recovery semantics. citeturn0search0turn0academia12
Generalized Byzantine quorum research demonstrates that trust structures can be expressed with richer Boolean/threshold compositions rather than a single numerical threshold. citeturn0academia13
Formal work also shows that changing configuration/epochs is a separate proof problem: single-epoch safety does not automatically establish reconfiguration safety. citeturn0search14

## 3. Composite lifecycle
Candidate lifecycle:
NORMAL_AUTHORITY
→ AUTHORITY_DEGRADED
→ AUTHORITY_UNAVAILABLE
→ BOUNDED_SAFETY_ONLY
→ SUCCESSION_CANDIDATE
→ SUCCESSION_VALIDATION
→ SUCCESSION_ORDERED
→ PREDECESSOR_FENCED
→ SUCCESSOR_ACTIVE
→ CONTRACT_REVALIDATED
→ RECOVERY_REVALIDATED
→ ASSURANCE_RECOMPUTED
→ RELEASE_ELIGIBLE
→ EXPLICIT_RELEASE
→ NORMAL_AUTHORITY

Failure/uncertainty at any protected transition:
AUTHORITY_UNAVAILABLE / QUARANTINED / BOUNDED_SAFETY_ONLY.

## 4. Bounded safety is not a recovery authority
Define:
SafetyCapabilityEnvelope

It contains only preauthorized capabilities such as:
- maintain STOP;
- maintain existing resource-side fences;
- reject new protected effects;
- preserve durable evidence;
- reconcile;
- observe;
- prepare succession candidates;
- execute explicitly preauthorized containment.

It cannot:
- grant ordinary authority;
- redefine membership;
- redefine succession;
- create a new trust anchor;
- broaden its own scope;
- publish constitutional currentness.

Rule:
SAFETY_CAPABILITY_SCOPE <= PREAUTHORIZED_SAFETY_SCOPE.

## 5. Safety mode must be monotonic with respect to authority
Entering bounded safety may reduce capability but cannot increase constitutional authority.

Candidate invariant:
SAFETY_MODE_CANNOT_INCREASE_AUTHORITY.

Any operation whose only justification is "we are in emergency mode" is denied unless already authorized by the pre-existing constitutional contract.

## 6. Safety mode and stale snapshots
A stale snapshot may restore safety configuration but not current authority.

Therefore:
SNAPSHOT_RESTORE -> SAFETY_CONFIGURATION_RESTORED
does not imply:
CURRENT_AUTHORITY_RESTORED.

Safety configuration itself must still be checked for:
- current fence generation;
- current stop state;
- current resource incarnation;
- current dependency closure;
- current artifact/config baseline.

## 7. Succession candidate
A candidate successor is initially:
SUCCESSOR_CANDIDATE

not:
SUCCESSOR_CURRENT.

It must bind:
- predecessor context;
- succession rule;
- anchor context;
- membership generation;
- transition generation;
- ordering position;
- common-mode closure;
- dependency closure;
- scope;
- emergency origin;
- evidence set;
- expiry/revalidation.

## 8. Succession validation
Candidate validation:
VERIFY_TRUST_ANCHOR
→ VERIFY_SUCCESSION_RULE
→ VERIFY_MEMBERSHIP
→ VERIFY_QUORUM/TRUST FORMULA
→ VERIFY_FAILURE-DOMAIN CLOSURE
→ VERIFY_EQUIVOCATION STATUS
→ VERIFY PREDECESSOR CUTOFF
→ VERIFY STALE-DESCENDANT INVALIDATION
→ VERIFY ENFORCEMENT
→ ESTABLISH ORDERING.

No direct candidate -> current transition.

## 9. Predecessor fencing
A successor cannot become fully current merely because its certificate is valid.

If predecessor authority can still produce protected effects, the successor's safety claim may be incomplete.

Therefore:
SUCCESSOR_ACTIVATION
requires predecessor cutoff/fencing when the claim requires exclusivity.

If enforcement cannot be verified:
SUCCESSION_ACTIVE may remain PROVISIONAL for non-authoritative preparation but cannot become CURRENT for claims requiring exclusivity.

## 10. Split succession candidates
Suppose:
S1 = successor A
S2 = successor B

Both have valid local certificates.

If no authoritative order exists:
SUCCESSION_CONFLICT
→ AUTHORITY_UNAVAILABLE.

No deterministic tie-break such as:
- first received;
- largest quorum;
- highest local epoch;
- newest timestamp;
- local majority
may be used unless explicitly defined by the constitutional contract.

## 11. Late evidence
Evidence arriving after succession may change:
- equivocation detection;
- compromise boundary;
- external effect state;
- fence state;
- resource incarnation;
- dependency state.

Therefore succession is not necessarily final forever.

Candidate:
POST_SUCCESSION_INVALIDATION

Late evidence triggers:
CLASSIFY
→ CHECK CONTEXT
→ CHECK AUTHENTICITY
→ CHECK ORDER
→ CHECK DEPENDENCIES
→ DETERMINE IMPACT
→ INVALIDATE/DEGRADE/RETAIN
→ RECOMPUTE CLAIMS.

Late evidence does not automatically invalidate everything; lateness and invalidity are distinct.

## 12. Release eligibility
Release must remain derived.

Candidate:
RELEASE_ELIGIBLE iff:
- current constitutional context exists;
- successor is ordered/current;
- predecessor is fenced/invalidated where required;
- membership and trust formula current;
- recovery authority current;
- STOP state permits release;
- external effect uncertainty is reconciled to the required claim floor;
- assurance context is coherent;
- no unresolved critical dependency/equivocation;
- all mandatory safety boundaries verified.

Then:
RELEASE_ELIGIBLE != RELEASED.

Only explicit release linearization grants normal execution authority.

## 13. No hidden authority in release preparation
Preparation artifacts, certificates, snapshots, and proof caches cannot themselves grant authority.

Therefore:
PREPARED_SUCCESSOR != CURRENT_SUCCESSOR
PROOF_OF_SUCCESSION != AUTHORITY
RECOVERY_PROGRESS != AUTHORITY
RECONCILIATION_PROGRESS != AUTHORITY.

## 14. Emergency safety and external effects
If an external provider continues an effect despite local safety mode, Nexo cannot claim external quiescence unless the provider-side enforcement boundary is controlled and verified.

Therefore:
SAFETY_MODE_ACTIVE != EXTERNAL_QUIESCENCE.

This preserves the previously established enforcement boundary.

## 15. Double recovery
Two recovery agents may both be in bounded safety mode.

That is acceptable if safety mode has no authority-amplifying transitions.

The dangerous transition is:
SAFETY_ONLY -> CURRENT_AUTHORITY.

That transition must pass through the constitutional succession boundary.

## 16. Recovery-of-recovery
If succession validation itself crashes:
- preserve the candidate and evidence as historical/provisional state;
- do not treat progress as authority;
- reacquire current recovery ownership;
- revalidate the succession context;
- restart from the last durable protected boundary.

Candidate:
SUCCESSION_PROGRESS_CHECKPOINT

but:
CHECKPOINT != CURRENTNESS.

## 17. Bounded safety termination
Safety mode must have a termination policy.

Candidate exits:
A. NORMAL_SUCCESSION_COMPLETED
B. AUTHORITY_UNAVAILABLE_PERSISTENT
C. SAFE_DECOMMISSION
D. QUARANTINED
E. HUMAN/GOVERNANCE_RECOVERY_REQUIRED

It must not terminate merely because:
- a timer expired;
- connectivity returned;
- a local node claims success;
- a snapshot looks newer.

## 18. Authority-unavailable is an explicit state
Candidate:
AuthorityUnavailableState

Allowed:
- observe;
- preserve;
- fence;
- reconcile;
- prepare;
- verify;
- produce non-authoritative evidence.

Forbidden:
- declare current root;
- grant protected authority;
- publish authoritative assurance;
- authorize normal execution;
- rewrite constitutional succession.

## 19. Minimal transition contract
Candidate:
AuthorityRecoveryTransition {
  transition_id,
  predecessor_context,
  candidate_successor_context,
  trust_anchor_context,
  succession_rule,
  membership_generation,
  quorum/trust formula,
  failure-domain closure,
  dependency closure,
  equivocation status,
  predecessor cutoff,
  fence evidence,
  enforcement verification,
  external reconciliation status,
  assurance generation,
  ordering position,
  publication boundary,
  invalidation triggers
}

## 20. Strong invariant
Candidate:
NO_AUTHORITY_AMPLIFICATION_DURING_UNAVAILABLE_STATE

If state S is bounded safety/authority unavailable, every reachable protected state must have authority scope <= the preauthorized safety envelope until a constitutionally ordered successor transition commits.

This is stronger than simply saying "emergency mode cannot self-promote" because it applies to all hidden transitions, delegated capabilities, queued work, callbacks, retries, and recovery workers.

## 21. Hidden-path closure
The transition must close:
- active workers;
- queued commands;
- retries;
- delayed jobs;
- callbacks;
- provider redrives;
- delegated capabilities;
- child effects;
- recovery agents;
- compensation effects;
- update/bootstrap paths.

Otherwise a hidden continuation could bypass the bounded safety boundary.

Candidate:
SafetyModeEffectPathClosure.

## 22. Multi-resource case
If only some resources can be safely fenced:
GLOBAL_SAFETY != PARTIAL_SAFETY.

The system may publish a weaker containment claim, but cannot promote it to global constitutional release.

Rule:
CLAIM_SCOPE <= VERIFIED_ENFORCEMENT_SCOPE.

## 23. Formalization target
The future formal model should include:
- authority unavailable;
- bounded safety;
- succession candidates;
- conflicting candidates;
- anchor compromise;
- membership transition;
- predecessor fencing;
- external enforcement;
- late evidence;
- recovery crash;
- hidden continuations;
- release publication.

Core invariants:
AS-01 no authority amplification in bounded safety.
AS-02 no candidate successor becomes current without ordered succession.
AS-03 current successor requires required predecessor cutoff/fence.
AS-04 local certificate validity does not imply global currentness.
AS-05 stale snapshot cannot restore current authority.
AS-06 late evidence can invalidate/degrade successor assurance.
AS-07 release eligibility is derived and not itself authority.
AS-08 explicit release is the protected authority transition.
AS-09 safety mode does not imply external quiescence.
AS-10 hidden effect paths must be included in safety closure.
AS-11 partial fencing cannot promote to global claim.
AS-12 recovery progress/checkpoint cannot grant authority.
AS-13 no unresolved succession conflict may publish current authority.
AS-14 authority-unavailable remains a valid terminal state.
AS-15 concrete implementation must refine the abstract recovery/succession machine.

## 24. Architectural consequence
The constitutional branch now has a complete conceptual safety corridor:

CONSTITUTIONAL TRUST BOUNDARY
        ↓
CONSTITUTIONAL TRUST ANCHOR
        ↓
CONSTITUTIONAL ORDERING
        ↓
AUTHORITY UNAVAILABLE
        ↓
BOUNDED SAFETY
        ↓
SUCCESSION CANDIDATE
        ↓
SUCCESSION ORDER
        ↓
PREDECESSOR FENCE
        ↓
SUCCESSOR REVALIDATION
        ↓
ASSURANCE / RECONCILIATION
        ↓
RELEASE ELIGIBILITY
        ↓
EXPLICIT RELEASE
        ↓
NORMAL AUTHORITY

The important property is that BOUNDED SAFETY is a side corridor that cannot skip the constitutional succession boundary.

## 25. Research conclusion
The architecture does not need to remain fully operational during loss of constitutional authority.

It needs to remain:
SAFE WITHIN ITS PREAUTHORIZED SAFETY ENVELOPE.

This permits graceful degradation without inventing authority.

The correct fallback is not "keep operating."
It is:
"preserve safety, preserve evidence, preserve recoverability, and refuse unsupported authority."

## 26. Next gate
The next research gate is to attack the corridor itself with:
- queued effects crossing the authority-loss boundary;
- delegated child capabilities;
- callbacks/redrives;
- compensation effects;
- update/bootstrap effects;
- external provider continuation;
- stale recovery owner;
- late compromise evidence;
- successor activation followed by immediate root revocation;
- crash exactly between predecessor cutoff and successor publication.

The target is a single end-to-end closure property:
NO_PROTECTED_EFFECT_CAN_CROSS_FROM_AUTHORITY_UNAVAILABLE_OR_BOUNDED_SAFETY_INTO_CURRENT_AUTHORITY_WITHOUT_A_CONSTITUTIONALLY_ORDERED_AND_ENFORCED_TRANSITION.

## Verification status
No SANY/TLC execution.
No TLAPS proof.
No implementation refinement.
No runtime/fault-injection verification.
No correctness guarantee.
