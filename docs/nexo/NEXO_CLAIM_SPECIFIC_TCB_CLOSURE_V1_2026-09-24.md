# NEXO CLAIM-SPECIFIC TCB CLOSURE V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. Architecture remains blocked.

## 1. External cross-check

NIST defines architecture in terms of system elements, relationships and design/evolution principles, and its systems-security guidance emphasizes partitioning into security domains and controlling the relationships between them. NIST's cyber-resilience guidance also requires identifying operational, support and dependency contexts and the systems on which the system of interest depends. This supports computing TCB closure per claim rather than declaring one universal trusted list. citeturn0search0turn0search3turn0search6

## 2. Claim model

A critical claim is represented as:

CLAIM
→ protected outcome
→ state variables
→ required transitions
→ atomicity bundles
→ dependencies
→ failure domains
→ TCB closure
→ evidence requirements
→ invalidation conditions
→ recovery behavior.

TCB closure is the minimum set of mechanisms whose incorrect behavior could cause the claim to be accepted when it should not be accepted.

## 3. Canonical claims

### C-01 — Exact authorization
Question:
“Is this exact effect authorized now for this target and scope?”

Protected outcome:
AUTHORIZATION_ACCEPTED.

Required variables:
EffectBinding, AuthorityContext, PolicyBaseline, InvariantBaseline, StopState, RecoveryFence, VersionSet, Identity.

Atomicity:
B1.

Minimum TCB closure:
T1 Trust/Identity
+ T2 Authority
+ T3 Protected linearization
+ T8 Version admission
+ relevant T4/T5 safety fences.

Outside TCB by default:
planner, model, UI, memory, reward.

Invalidated by:
revocation, authority epoch change, policy/invariant change, relevant VersionSet change, stop/recovery fence, identity invalidation.

### C-02 — Protected execution admission
Question:
“May this exact effect cross the final actuation gate?”

Protected outcome:
EXECUTION_ENABLED.

Required:
C-01 + current lease/fence + final gate + current stop/recovery state.

Atomicity:
B2 + B3.

Minimum TCB:
C-01 closure
+ coordination/fencing
+ final execution gate
+ stop enforcement.

Critical common modes:
coordination store, host/runtime, identity, trust root, policy/config.

### C-03 — Emergency stop locally enforced
Question:
“Has the protected execution path been blocked by the stop mechanism?”

Protected outcome:
LOCAL_STOP_ENFORCED.

Required:
StopState, stop epoch, enforcement mechanism, current target scope.

Atomicity:
B8.

Minimum TCB:
T4 Stop plane
+ identity/authority for stop request
+ protected state transition/linearization.

Important:
This claim is about local enforcement only. It does NOT prove an external system stopped.

### C-04 — External effect identity preserved
Question:
“Can a retry or recovery unambiguously refer to the same external effect?”

Protected outcome:
EFFECT_IDENTITY_STABLE.

Required:
EffectBinding, effect_key, target fingerprint, normalized parameter fingerprint, operation linkage, idempotency/replay policy.

Atomicity:
B4/B5.

Minimum TCB:
T6 Effect identity
+ durable storage/ordering required to preserve it.

A new operation_id cannot replace this identity.

### C-05 — External effect reconciled
Question:
“Has the external-world outcome of this exact effect been sufficiently reconciled?”

Protected outcome:
RECONCILED_EFFECT.

Required:
exact effect identity, external observation, provenance, freshness, reconciliation authority, reconciliation generation.

Atomicity:
B5 + B6.

Minimum TCB:
T6 Effect identity
+ T7 evidence validity
+ reconciliation authority
+ external observation path.

Critical common modes:
same observer/source, network, provider, identity, telemetry, clock, administrative domain.

### C-06 — Verified mission/world claim
Question:
“Can Nexo treat the reconciled effect as verified under the current safety context?”

Protected outcome:
VERIFIED_CLAIM.

Required:
reconciliation, evidence set, evidence validity, current Policy/Invariant, VersionSet, dependency closure, required authority context.

Atomicity:
B7.

Minimum TCB:
T7 Evidence validity
+ T8 Version admission
+ protected verification transition
+ current policy/invariant authority.

Independent verification is claim-specific.

### C-07 — Recovery release
Question:
“May a recovered instance leave quarantine and execute?”

Protected outcome:
EXECUTION_RELEASED_AFTER_RECOVERY.

Required:
RecoveryFence, current authority, StopState, reconciliation, VersionSet, dependency closure, recovery owner, explicit release.

Atomicity:
B9.

Minimum TCB:
T2 Authority
+ T3 Linearization
+ T4 Stop
+ T5 Recovery fence
+ T8 Version admission
+ reconciliation/evidence where required.

Forbidden:
checkpoint alone; restart alone; recovery ownership alone.

### C-08 — Safety-relevant update activation
Question:
“May this complete version set become active for protected effects?”

Protected outcome:
VERSION_SET_ACTIVE.

Required:
artifact identity, provenance, signatures/attestation, builder/source policy, dependency closure, semantic compatibility, safety-property delta, common-mode review, independent admission, staging, old-version fencing.

Atomicity:
B10.

Minimum TCB:
T1 Trust/identity
+ T3 protected transition
+ T8 Version admission
+ safety gate/recovery fence.

Signature validity alone is insufficient.

### C-09 — Decommissioned identity remains fenced
Question:
“Can a decommissioned identity regain authority or leave residual protected work?”

Protected outcome:
DECOMMISSION_FINAL.

Required:
authority revocation, delegation revocation, worker termination, lease closure, pending-effect reconciliation, secret handling, recovery/update closure.

Atomicity:
B11.

Minimum TCB:
T2 Authority
+ T3 fencing/linearization
+ T5 recovery
+ lifecycle/decommission authority
+ external reconciliation where effects remain.

## 4. Claim intersections

Some claims share unavoidable TCB components:

C-01 ∩ C-02:
Authority + linearization + version context.

C-02 ∩ C-03:
Final gate must recognize independent STOP.

C-02 ∩ C-07:
Recovery cannot bypass the same final execution gate.

C-04 ∩ C-05:
Stable effect identity is prerequisite to meaningful reconciliation.

C-05 ∩ C-06:
Reconciliation is evidence, not automatically verification.

C-06 ∩ C-08:
Version/configuration changes can invalidate verification.

C-07 ∩ C-09:
Recovery and decommission must share resurrection-prevention semantics.

These intersections identify candidate common-mode concentrations.

## 5. Minimum unavoidable trust concentrations

### TC-A — Current authority
Without trustworthy current authority, exact authorization cannot be established.

### TC-B — Protected transition semantics
Without trustworthy serialization/linearization, concurrent actors may bypass individually correct policy.

### TC-C — Safety stop
Without trustworthy independent enforcement, local execution can bypass emergency containment.

### TC-D — Effect identity
Without stable effect identity, UNKNOWN/retry semantics cannot be made safe.

### TC-E — Evidence validity
Without trustworthy evidence binding/invalidation, verification can be detached from the actual effect.

### TC-F — Version/configuration integrity
Without trustworthy active-version determination, the system cannot know which safety semantics it is running.

These are candidate architectural trust concentrations, not yet declared single points of failure.

## 6. Claim-specific independence

Independence must be stated as:

CLAIM + FAILURE ASSUMPTION + DEPENDENCY CLOSURE + REQUIRED DIVERSITY.

Example:
“two verifiers are independent” is incomplete.

Correct form:
“For claim C-06, verifier V1 and V2 are independent with respect to failure domains X/Y/Z under assumptions A/B/C.”

If those assumptions fail:
ASSURANCE_DEGRADED → HOLD/RESTRICT/REVALIDATE where required.

## 7. Availability consequence

For each claim, dependency unavailability must have an explicit result.

Examples:
- current authority unavailable → no new protected authorization;
- stop status unavailable → final execution admission cannot safely proceed;
- recovery fence unavailable → remain quarantined;
- critical evidence freshness unavailable → verification pending/blocked;
- external observation unavailable after dispatch → UNKNOWN;
- noncritical planner unavailable → cognition can degrade without granting authority.

This prevents one global “system unavailable” state from hiding radically different safety consequences.

## 8. TCB closure test

For each claim, the architecture must later demonstrate:

1. every required variable is included;
2. every protected transition is included;
3. every safety-critical dependency is included;
4. every common-mode dependency is included;
5. every trust root is included;
6. every recovery/update path that can alter the claim is included;
7. no component outside the declared closure can independently produce the protected outcome;
8. invalidation of any required dependency invalidates or degrades the claim.

## 9. New invariants

CLAIM-TCB-01: TCB is claim-specific.
CLAIM-TCB-02: a claim cannot be accepted if an undeclared safety-critical dependency can independently alter its outcome.
CLAIM-TCB-03: every claim has explicit dependency and failure-domain closure.
CLAIM-TCB-04: claim-specific independence assumptions are part of the claim evidence.
CLAIM-TCB-05: loss of a required TCB dependency has an explicit assurance consequence.
CLAIM-TCB-06: recovery/update paths that can alter a claim are part of that claim's TCB closure.
CLAIM-TCB-07: no model/planner/metric can independently create a protected outcome unless explicitly made part of that claim's trusted closure.
CLAIM-TCB-08: changing a claim's TCB closure is a safety-relevant architecture change requiring impact analysis and reverification.
CLAIM-TCB-09: shared TCB components are treated as common-mode candidates across all dependent claims.
CLAIM-TCB-10: a historical verification result cannot establish a current claim when its TCB closure or assumptions changed.

## 10. Result

The claim-specific analysis exposes six major candidate trust concentrations:

AUTHORITY
LINEARIZATION
STOP
EFFECT IDENTITY
EVIDENCE VALIDITY
VERSION/CONFIGURATION INTEGRITY

They are not yet implementation components. They are semantic responsibilities.

This is important: the clean architecture should be designed around these responsibilities and their boundaries, then decide which physical components implement them.

## 11. Next research gate

Now we can perform the topology comparison properly.

For each candidate:

A — single authoritative state machine/store
B — multiple stores with transactional commit
C — multiple stores with fencing/epochs/idempotency/reconciliation

we will compare:

- claim TCB size;
- common-mode concentration;
- atomicity coverage;
- crash semantics;
- partition semantics;
- stale-actor prevention;
- recovery complexity;
- external-effect handling;
- evidence invalidation;
- update/decommission behavior;
- formal-model complexity;
- implementation verification burden.

The comparison will remain descriptive, not a premature architecture selection.

No implementation, migration or V21 runtime construction is authorized.