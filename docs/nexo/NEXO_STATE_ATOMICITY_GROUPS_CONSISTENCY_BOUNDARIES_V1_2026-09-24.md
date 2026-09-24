# NEXO STATE ATOMICITY GROUPS AND CONSISTENCY BOUNDARIES V1
Date: 2026-09-24
Status: RESEARCH/CONSOLIDATION — ARCHITECTURE STILL BLOCKED

## External cross-check
NIST SP 800-160 Rev. 1 treats secure, insecure and indeterminate states as first-class system conditions and states that each state transition must itself be secure. Its cyber-resiliency guidance includes anticipating, withstanding, recovering from and adapting to adverse conditions. NASA treats functional/timing/state analysis and integrated verification/validation as explicit systems-engineering activities. These sources support defining atomicity around the property being protected and validating transitions at the system boundary, rather than assuming a database transaction is sufficient.

## 1. Purpose
This artifact determines which canonical variables must move together for a protected semantic transition, which may be separated, and where protocolized reconciliation is required.

It does NOT select a database or implementation technology.

## 2. Atomicity vocabulary

### A0 — Independent
State may change independently without creating an unsafe authorization, false claim or inconsistent protected state.

### A1 — Ordered / causally linked
State may be stored separately, but consumers must observe a causally coherent version/order.

### A2 — Protected atomic group
Variables represent one safety-critical decision and must have one authoritative linearization or an equivalent proven protocol.

### A3 — Cross-boundary protocol
Local atomicity is insufficient because part of the semantic state exists outside the trusted control plane. The group requires durable intent, stable identity, fencing/idempotency where available, observation and reconciliation.

### A4 — Independent safety plane
The state must not share the same failure/authority path with normal execution even if it references the same operation.

## 3. Candidate atomic groups

| Group | Variables | Level | Reason |
|---|---|---:|---|
| G1 Identity admission | identity_id, identity_epoch, attestation/trust-root version | A2 | identity context must be coherent |
| G2 Authorization decision | operation_id, effect_id, authority_context_id, authority_epoch, scope, policy_version, invariant_version | A2 | exact effect must bind to current authority/safety context |
| G3 Reservation/fencing | effect_id, lease_id, owner, generation, fence token | A2 | stale owners must be excluded |
| G4 Final execution gate | effect_id, authority_epoch, fence token, stop_epoch, version_set_id | A2/A4 | final actuation decision must use current safety context |
| G5 Stop enforcement | stop_id, stop_epoch, target scope, enforcement state | A4 | independent safety plane |
| G6 Recovery release | recovery_fence_id, recovery_epoch, recovery_owner, stop_epoch, authority_epoch, reconciliation state, release decision | A2/A4 | recovery cannot manufacture execution authority |
| G7 Configuration activation | version_set_id, artifact versions, policy/invariant versions, dependency fingerprint, trust-root version, activation state | A2 | individually valid components may form an invalid system combination |
| G8 Evidence validity context | evidence_id, claim_id, effect/target binding, observer, freshness, provenance, dependency/version context | A1/A2 | evidence validity depends on exact context |
| G9 Verification decision | claim_id, required evidence set, verification-context fingerprint, derived status | A2 | current verification must not race with invalidation |
| G10 External effect identity | effect_id/effect_key, target, parameter fingerprint, operation_id, external state | A3 | external world is outside local atomicity |
| G11 Reconciliation | effect identity, observation, provenance, freshness, reconciliation generation, accepted world state | A3 | external truth requires protocol and evidence |
| G12 Decommission closure | lifecycle epoch, authority state, delegation state, worker state, lease state, pending effects, secret/recovery closure | A2/A3 | closure spans local and external residual effects |
| G13 Migration semantic boundary | schema/version set, migration epoch, source/target semantic fingerprints, write fencing state | A2/A3 | concurrent writes can corrupt semantic meaning |
| G14 Historical commit | operation/effect identity, verified claim, applicable authority/configuration context, commit revision | A2 | durable history must not falsely represent verification |

## 4. Important negative result
Not every variable should be placed in one giant transaction.

Examples that should NOT be merged indiscriminately:
- planner/model state with authorization;
- ordinary telemetry with stop state;
- proof cache with proof status;
- UI state with authority;
- analytics with external effect state;
- recovery checkpoint with current authority;
- model confidence with verification;
- historical audit with authorization.

The purpose of atomicity grouping is to prevent unsafe split-brain semantics, not to create a monolithic database.

## 5. Cross-group dependencies

### G2 → G3
Authorization must precede reservation; reservation cannot broaden scope.

### G3 → G4
Execution gate must consume the current fence; stale owners cannot act.

### G5 → G4
Stop enforcement dominates execution admission.

### G6 → G4
Recovery release can permit execution only after current authority/fence/reconciliation and explicit release.

### G7 → G2/G4/G9
Safety-relevant configuration changes invalidate affected authorization, execution and verification decisions.

### G8 → G9
Evidence context must match the verification claim.

### G10 → G11
External outcome is resolved only through reconciliation, not local commit.

### G11 → G9
Reconciliation provides evidence; verification still checks current policy/context.

### G12 → all active authority/effect paths
Decommission closure must fence active authority and residual effects before final closure.

## 6. Atomicity anti-patterns

AP-01: One global transaction containing planner, model, memory and safety state.
AP-02: Treating lease acquisition as authorization.
AP-03: Separating the authorization flag from the authority context that makes it valid.
AP-04: Updating stop state after execution has already crossed the final gate without an independent enforcement path.
AP-05: Marking an external effect APPLIED in the same local transaction as the request.
AP-06: Persisting release eligibility as an independently mutable flag.
AP-07: Updating policy/version without invalidating affected derived decisions.
AP-08: Restoring a checkpoint together with stale authority as though both were one trusted snapshot.
AP-09: Migrating semantic data without fencing concurrent writers.
AP-10: Treating an audit log transaction as proof of the protected state transition.

## 7. Boundary rule
An atomic group ends at the first boundary where Nexo cannot guarantee the required state transition.

For external effects:
LOCAL ATOMIC DECISION
→ durable intent/effect identity
→ external attempt
→ UNKNOWN/APPLIED/etc.
→ observation
→ reconciliation
→ verified claim

The external system is therefore a protocol participant, not part of Nexo's local atomic transaction unless its own semantics explicitly provide the required guarantee.

## 8. Partition semantics by group

G1/G2/G3/G4/G5/G6/G7/G9:
- inability to establish required current context → DENY/HOLD/RESTRICT.

G8:
- delayed evidence may remain pending if no unsafe decision can be made from stale evidence.

G10/G11:
- partition preserves UNKNOWN; retry must retain effect identity where duplicate effects are possible.

G12/G13:
- partition prevents closure/semantic migration claims until required parties are reconciled or safely fenced.

## 9. Durability implications

Must survive restart for safety semantics:
- authority revocation/epoch;
- stop state/epoch;
- unresolved external-effect identities;
- decommission fences;
- active recovery fence;
- active configuration/version baseline;
- critical delegation revocations.

May be reconstructable:
- planner cache;
- derived analytics;
- non-authoritative UI state.

Reconstructable data must never be allowed to recreate an authoritative state without revalidation.

## 10. TCB consequence
The minimum TCB is not yet a component list. It is the union of mechanisms that enforce A2/A4 groups and the A3 boundary protocol for the specific safety claims.

Candidate TCB responsibilities:
- identity/trust-root validation;
- authority-context validation;
- protected state linearization;
- stop enforcement;
- recovery fencing;
- effect identity binding;
- evidence validity/invalidation;
- configuration/version admission.

Planner/model/memory/UI/analytics remain outside the TCB unless a specific claim explicitly depends on one of them.

## 11. New invariants

ATOM-01: Every A2 group has one authoritative linearization point or an equivalent proven protocol.
ATOM-02: A3 boundaries preserve identity and uncertainty across local/external separation.
ATOM-03: A4 safety-plane state cannot depend on normal execution authority for enforcement.
ATOM-04: Splitting an A2 group across stores requires an explicit atomicity-equivalent protocol.
ATOM-05: Combining unrelated state into one transaction does not itself improve safety and may enlarge TCB.
ATOM-06: Derived state cannot become authoritative through persistence.
ATOM-07: Material version/context changes invalidate affected atomic-group decisions.
ATOM-08: Restart cannot reconstruct A2/A4 authority from stale snapshots without current validation.
ATOM-09: External effects cannot be finalized by local atomic commit alone.
ATOM-10: Decommission and migration boundaries require explicit closure/fencing semantics.

## 12. Research gates now exposed

1. Validate that every protected transition maps to one atomicity group.
2. Identify groups that can be implemented with a single linearization point.
3. Identify groups requiring multi-step protocols.
4. Prove no critical state variable is left outside the necessary group.
5. Prove no group contains unnecessary authority or planner state.
6. Select candidate state-store topology only after these mappings.
7. Formalize group invariants in the unified model.
8. Derive implementation tests from group/race pairs.
9. Evaluate partition/availability tradeoffs per group.
10. Re-run common-mode analysis against each group.

Architecture remains BLOCKED.

DESIGNED != IMPLEMENTED != TESTED != VERIFIED.
