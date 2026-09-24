# NEXO — CONCURRENT EXTERNAL EFFECTS UNDER SPLIT-BRAIN AND RECONCILIATION
Date: 2026-09-24
Status: RESEARCH ONLY — CLEAN ARCHITECTURE DESIGN — NOT IMPLEMENTED — NOT SANY/TLC VERIFIED

## 1. Research question
Attack the case where two partitioned authority contexts both produce external effects before reconciliation, then reconnect.

Question: How can Nexo distinguish duplicate, conflicting, independent, compensating, stale, and unknown effects without treating local commit or later reconciliation as proof that the other effect did not occur?

## 2. External cross-check
Raft explicitly addresses retry ambiguity: a command may be committed before the client receives the response, so a retry can execute the command again unless unique command serial numbers are used and tracked. This supports the Nexo distinction between attempt identity and effect identity, but does not solve arbitrary external-world duplication. citeturn0search25

etcd distinguishes linearizable operations from serializable member-local reads that can be stale, supporting the requirement for current authoritative ordering for protected decisions rather than trusting a local replica. citeturn0search0turn0search9

NIST SP 800-193 separates protection, detection and recovery functions and emphasizes trusted foundations for them, supporting separation of recovery/reconciliation authority from historical state being recovered. citeturn0search24turn0search1

## 3. Core finding
After split-brain, effects may be identical, semantically equivalent, disjoint, commutative, order-sensitive, conflicting, compensating, or of unknown relationship.

Therefore:
LOCAL_COMMIT != GLOBAL_EFFECT_TRUTH
RECONCILIATION != RETROACTIVE ATOMICITY

## 4. Effect identity must survive partition
Every protected effect needs stable identity independent of process identity.

EffectIdentity:
- effect_id
- logical operation identity
- target identity
- resource incarnation
- authority context fingerprint
- effect class
- attempt lineage
- parent/child lineage
- continuation lineage

AttemptIdentity is separate:
- attempt_id
- effect_id
- executor
- retry/redrive lineage
- provider execution identity if available

NEW ATTEMPT != NEW EFFECT
SAME EFFECT ID != PROOF OF EXTERNAL DEDUPLICATION

Deduplication is only a safety mechanism if the external boundary contract actually enforces it.

## 5. Double-commit classification
D0 same externally identifiable effect
D1 duplicate with provider-confirmed idempotency
D2 distinct disjoint effects
D3 distinct commutative effects
D4 order-sensitive effects
D5 conflicting effects
D6 one compensates another
D7 relationship unknown

D7 requires claim-specific safety handling.

## 6. Resource incarnation
If resource R changes from incarnation I1 to I2, an old effect targeting I1 cannot automatically be interpreted as affecting I2.

RESOURCE ID != RESOURCE INCARNATION

Reconciliation binds effect → target → incarnation → provider execution → observation generation.

## 7. Effect interaction graph
Nodes = external effects.
Edges = semantic interaction.

Labels:
DISJOINT
COMMUTATIVE
ORDER_SENSITIVE
MUTUALLY_EXCLUSIVE
CONDITIONALLY_COMPATIBLE
CONFLICTING
UNKNOWN

A component containing UNKNOWN or CONFLICTING relationships cannot be collapsed to a single safe history without additional evidence or a sound containment contract.

This extends prior EffectInteractionContract research.

## 8. Ordering
Wall-clock timestamps cannot decide causality under partition.

Required dimensions:
EVENT_TIME
OBSERVATION_TIME
AUTHORITATIVE_ORDER
EXTERNAL_PROVIDER_ORDER, if contractually available

Without authoritative order, order-sensitive effects may remain UNKNOWN.

## 9. Reconciliation sequence
PARTITION_HEALED
→ FREEZE_PROTECTED_ADMISSION
→ COLLECT_EFFECT_IDENTITIES
→ COLLECT_RESOURCE_INCARNATIONS
→ ESTABLISH_AUTHORITATIVE_ORDER
→ BUILD_INTERACTION_GRAPH
→ CLASSIFY_EFFECT_RELATIONSHIPS
→ RECONCILE_PROVIDER_STATE
→ DETECT_CONFLICTS
→ APPLY ONLY CONTRACT-SAFE COMPENSATION
→ RECOMPUTE ASSURANCE
→ REVALIDATE FENCES
→ EXPLICIT RELEASE or HOLD/QUARANTINE

No step silently erases an effect from history.

## 10. Compensation is not undo
A compensating effect does not prove the original effect never occurred.

COMPENSATION != HISTORICAL ERASURE

Historical effects can remain material to accounting, safety, causal reasoning, audit, and future reconciliation.

## 11. Provider contract classes
E0 strongly reconcilable and idempotently identifiable
E1 bounded reconciliation
E2 partially observable
E3 weakly observable
E4 effectively unreconcilable

If an E4 effect can violate a mission invariant during split-brain, authorization requires an independent enforcement mechanism or a weaker claim.

## 12. Resource-side fencing
Resource-side fencing is a strong safety mechanism candidate:
current_fence_generation == accepted_generation

Old partition → reject.
Current partition → accept.

If the resource cannot enforce the boundary, Nexo cannot claim internal revocation prevented external effects.

## 13. Split-brain + retry
Timeline:
1. P1 sends E.
2. Provider commits E.
3. P1 crashes before observation.
4. P2 retries.
5. Provider receives E'.
6. Provider lacks idempotency.
7. Both effects occur.

Stable effect identity, provider idempotency, and reconciliation are distinct layers. Timeout is not proof of non-execution. This matches retry ambiguity documented in Raft. citeturn0search25

## 14. Conflicting root generations
If E1 was authorized under G1 and E2 under G2, neither generation alone proves which external effect is canonical.

Post-partition resolution must establish:
- authoritative trust transition;
- admissibility under that transition;
- which effects reached external boundaries;
- containment status;
- compensation safety;
- mission-invariant status.

## 15. Mission invariant impact
Two partitions may each believe a resource invariant remains safe while their combined effects violate it.

LOCAL_INVARIANT_VALIDITY != MISSION_INVARIANT_VALIDITY
UNKNOWN_CONSUMPTION != ZERO_CONSUMPTION

## 16. Candidate object: EffectReconciliationSet
Binds:
- effect identities
- attempt identities
- resource incarnations
- provider observations
- authoritative ordering
- interaction contracts
- uncertainty sets
- affected mission invariants
- fences
- compensation contracts
- assurance context

Produces:
- reconciled facts
- unresolved UNKNOWNs
- claim-strength ceiling
- required containment
- release eligibility or quarantine

## 17. Candidate object: ExternalEffectContinuityContext
Binds:
- effect identity
- authority continuity
- root generation
- resource incarnation
- provider execution identity
- retry lineage
- reconciliation generation
- observation generation
- effect-path closure
- contract version

This prevents historical success from being silently reused as current evidence after root rotation, resource replacement, or provider contract drift.

## 18. New invariants
EE-01 No retroactive atomicity: reconciliation cannot make already-executed external effects behave as if only one existed.
EE-02 Stable effect identity: retries preserve logical effect identity unless explicitly creating a new semantic effect.
EE-03 Attempt/effect separation: different attempts do not imply different effects.
EE-04 Incarnation binding: old-resource effects require proof before promotion to current resource truth.
EE-05 Unknown preservation: unknown provider outcome survives restart, restore, and partition healing until resolved.
EE-06 Conflict closure: unknown/conflicting interaction components cannot be reduced to one safe history without additional evidence or containment.
EE-07 Compensation integrity: compensation cannot erase historical effect identity.
EE-08 Mission accounting: unknown consumption cannot be treated as zero.
EE-09 External enforcement ceiling: claim scope cannot exceed verified enforcement scope.
EE-10 Release after reconciliation: protected release requires current authority continuity plus reconciliation of required external effects.

## 19. Adversarial fixtures
EE-A01 both partitions execute the same logical effect.
EE-A02 same effect with different attempt IDs.
EE-A03 provider lacks idempotency.
EE-A04 effect commits before crash and second partition retries.
EE-A05 conflicting effects on one resource.
EE-A06 commutative effects.
EE-A07 order-sensitive effects.
EE-A08 resource replacement between effects.
EE-A09 stale provider observation after new effect.
EE-A10 compensation while original effect remains UNKNOWN.
EE-A11 snapshot restores pre-effect local state.
EE-A12 root rotation between effect and observation.
EE-A13 partition heals after both effects affect a mission invariant.
EE-A14 resource-side fence rejects one partition but not the other.
EE-A15 provider cannot expose complete history.
EE-A16 provider exposes current state but not causal history.
EE-A17 external rollback/replacement hides earlier effect.
EE-A18 reconciliation crashes halfway and resumes from stale checkpoint.

## 20. Distillation
CARRY_FORWARD:
- stable effect identity
- attempt/effect separation
- resource incarnation
- interaction graph
- UNKNOWN preservation
- external enforcement ceiling
- mission-level invariant accounting
- compensation as a new effect

REWORK:
- EffectReconciliationSet
- ExternalEffectContinuityContext
- exact provider contract classes
- conflict-graph reduction rules

REJECT:
- last observation wins
- latest timestamp wins
- local commit as external truth
- timeout == no effect
- compensation == erasure
- snapshot restore == external-world rollback

OPEN:
- formal proof of reconciliation safety
- executable model
- provider-specific refinement
- SANY/TLC
- runtime fault injection

## 21. Status
RESEARCH COMPLETE FOR THIS ATTACK ROUND.
DESIGN CANDIDATE ONLY.
NO V21 IMPLEMENTATION.
NO FORMAL CORRECTNESS CLAIM.
NO RUNTIME CORRECTNESS CLAIM.
