# GLOBAL-AUDIT-025 — ADVERSARIAL TRANSITION ALPHABET COMPLETENESS REVIEW — 2026-09-28

## Scope
Adversarial review of the AB36 transition alphabet defined in GLOBAL-AUDIT-024. The goal is to find semantic transition classes that could alter P_AA observations or future continuation space while being absent from the current alphabet. This is a completeness attack, not a claim that the proposed additions are required after formal scoping.

## 1. Baseline alphabet under attack
AUTH_ISSUE, AUTH_REVOKE, EPOCH_ADVANCE, POLICY_CHANGE, DELEGATION_CHANGE, RESOURCE_REINCARNATE, LEASE_ISSUE, LEASE_EXPIRE, LEASE_RENEW, LEASE_CONSUME, ATTEMPT_CREATE, RETRY, DECIDE, RECHECK, ADMIT, ABORT, STUTTER.

## 2. Missing semantic classes identified

### A. Authority/fence lifecycle
Candidate classes:
- AUTH_DELEGATE / DELEGATION_GRANT
- AUTH_DELEGATION_REVOKE
- CAPABILITY_ISSUE
- CAPABILITY_REVOKE / SCOPE_CHANGE
- FENCE_ISSUE / FENCE_ADVANCE
- FENCE_REVOKE
- AUTH_SUSPEND / AUTH_REINSTATE

Reason: P_AA depends on authority, epoch, delegation, capability/scope and fence freshness. A single generic AUTH_REVOKE or EPOCH_ADVANCE may not represent all transitions that can invalidate an already-bound admission.

### B. Admission lifecycle
Candidate classes:
- ADMISSION_BIND
- ADMISSION_FINALIZE
- ADMISSION_CANCEL
- ADMISSION_EXPIRE
- ADMISSION_REVOKE
- ADMISSION_REAUTHORIZE

Reason: if admission binding, consumption, revocation or reauthorization changes future Z1→Z3 authorization, collapsing them into ADMIT/ABORT can hide distinct continuation spaces.

### C. Operation/attempt lifecycle
Candidate classes:
- OPERATION_CREATE
- ATTEMPT_BIND_AUTH
- ATTEMPT_REBIND
- ATTEMPT_ABORT
- ATTEMPT_EXPIRE
- RETRY_WITH_NEW_AUTH
- RETRY_WITH_SAME_AUTH

Reason: RETRY alone is under-parameterized if the semantics differ by whether authorization is inherited, revalidated or replaced.

### D. Protocol state transitions
Candidate classes:
- PROTOCOL_SELECT
- PROTOCOL_SWITCH
- ATOMIC_LINEARIZE
- LEASE_ACTIVATE
- LEASE_FENCE
- RECHECK_FACT_CAPTURE
- RECHECK_FACT_INVALIDATE

Reason: protocol identity is not merely a label when it changes legal future transitions. These classes may ultimately be derived events rather than physical transitions, but that derivation must be proved.

### E. Dependency/evidence lifecycle
Candidate classes:
- EVIDENCE_CAPTURE
- EVIDENCE_INVALIDATE
- PROVENANCE_COMPLETE
- PROVENANCE_LOSS
- DEPENDENCY_VERSION_ADVANCE
- DEPENDENCY_INCARNATE

Reason: P_AA explicitly treats incomplete claim-relevant information as UNKNOWN. A dependency changing without an explicit modeled transition can make FutureObs unsound.

### F. Resource lifecycle
Candidate classes:
- RESOURCE_REPLACE
- RESOURCE_SUSPEND
- RESOURCE_RESTORE
- RESOURCE_FENCE_ADVANCE

RESOURCE_REINCARNATE may subsume some of these only if the claim contract explicitly maps all of their effects to incarnation/fence changes.

### G. Recovery/reconciliation
Candidate classes:
- STOP_REQUEST
- STOP_ENFORCE
- RECOVERY_FENCE_ESTABLISH
- RECONCILIATION_REQUIRED
- RECONCILIATION_COMPLETE
- RECOVERY_RELEASE

These are conditionally inside P_AA. If the claim scope includes recovery transitions at the Z1→Z3 boundary, omitting them creates a future-continuation hole. If recovery is explicitly outside P_AA, the exclusion must be part of the claim contract rather than an implicit omission.

## 3. Parameter-dimension attacks

Even existing transition labels are incomplete without parameters that may change observations.

Minimum candidate dimensions:
- stable authority identity vs subject identity;
- epoch/version;
- delegation identity and grant/revoke generation;
- capability/scope;
- policy version/generation;
- resource identity + incarnation;
- operation identity;
- attempt identity;
- admission identity;
- bridge/lease identity;
- protocol family;
- protocol generation/version;
- issue/expiry/renewal/consumption generation;
- fence generation;
- dependency/provenance generation;
- event identity;
- authoritative ordering/linearization point;
- recheck fact-set identity;
- evidence completeness status.

## 4. Adversarial omission criterion

A transition class is semantically required if there exists H1,H2 such that:
1. H1 and H2 are equal under all currently retained state dimensions;
2. one history contains the candidate transition and the other does not;
3. both remain legal under the declared assumptions;
4. some legal future continuation produces different P_AA observations or different UNKNOWN behavior.

This is stronger than showing that the transition changes raw state.

## 5. Conditional reductions

The audit does NOT require every candidate class to become a separate transition.

A class may be represented as:
- a parameterized instance of an existing transition;
- a derived semantic event;
- a relation inside LeaseBridge/Binding/RProto;
- an auxiliary history fact;

only if the representation preserves current observation, legal continuation space, actual linkage, invalidation, and UNKNOWN semantics.

## 6. Immediate high-risk omissions

The strongest candidates requiring explicit resolution before finite modeling are:

1. FENCE lifecycle.
2. Capability/scope change.
3. Admission binding/revocation lifecycle.
4. Attempt rebind/new-authorization semantics.
5. Recheck fact capture/invalidation.
6. Dependency/provenance invalidation.
7. Resource replacement/restoration semantics.
8. Recovery/STOP transitions if included in claim scope.
9. Explicit linearization point for ATOMIC.
10. Lease activation/fencing semantics.

These are not yet declared mandatory; they are the highest-priority completeness questions.

## 7. Result

The AB36-024 alphabet is NOT yet demonstrated complete.

The attack found several semantic classes that can plausibly alter P_AA future observations while being represented only indirectly or not at all. Therefore constructing a finite model from the 17 labels without first resolving these classes would risk baking an incomplete transition universe into the model.

## 8. Gate

No model is frozen yet.

Next exact action:
GLOBAL-AUDIT-026 → resolve the high-risk omissions into a claim-scoped transition schema, explicitly deciding which are physical transitions, derived relations, or excluded by P_AA scope. Then define bounded state parameters. No implementation and no V21.
