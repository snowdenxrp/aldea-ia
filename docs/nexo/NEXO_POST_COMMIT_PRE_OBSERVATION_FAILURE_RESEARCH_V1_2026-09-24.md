# NEXO — POST-COMMIT / PRE-OBSERVATION FAILURE RESEARCH V1
Date: 2026-09-24
Status: RESEARCH / ARCHITECTURAL PRECONDITION
Implementation: BLOCKED.

## Scope
Attack: multiple external resources commit; Nexo crashes before complete observation/recording; recovery sees mixed current/historical evidence; observers are stale/unavailable; resource history may have rolled forward/backward.

## Findings
PCO-01: External commit can precede local observation/recording. A lost response is not failure/no-effect; reconciliation is required.
PCO-02: Stable effect identity must survive crash so recovery can distinguish retry from new effect.
PCO-03: Internal durable commit is not external-world confirmation.
PCO-04: Recovery must start from authoritative durable control state, then reconcile external resources; it must not infer world state from missing local records.
PCO-05: Resource histories may be newer than Nexo's restored history. Current resource evidence can invalidate a historical local assumption.
PCO-06: Resource histories may be rolled back or compacted. Missing historical evidence is not proof that an effect never occurred.
PCO-07: Snapshot integrity proves snapshot integrity, not freshness/currentness. etcd recovery documents revision rollback after restore and the need for revision-bump/compaction handling for stale consumers. Research analogy only.
PCO-08: A consensus log can provide durable committed control history, but that does not automatically provide external-world history. Raft distinguishes committed log entries from application to state machines; external providers remain outside that log.
PCO-09: Evidence must bind to resource incarnation/context, effect identity, observation generation/time, authoritative order where available, and freshness.
PCO-10: Reconciliation itself can be stale. A query returning current state cannot necessarily prove a historical event if the resource has since changed.
PCO-11: Multiple observers sharing the same stale cache, trust root or provider cannot establish independent corroboration.
PCO-12: Resource replacement creates a new incarnation. Historical evidence from the old incarnation must not silently authorize actions against the new incarnation.
PCO-13: External history retention is a claim requirement. If a claim requires historical proof beyond retention/compaction, the claim must degrade to UNKNOWN rather than invent history.
PCO-14: Recovery must preserve uncertainty: UNKNOWN survives restart/restore until a valid reconciliation transition resolves it.
PCO-15: Reconciliation result itself is a protected transition with its own context, authority, dependency closure and evidence.
PCO-16: Reconciliation must distinguish CURRENT_STATE, HISTORICAL_EVENT_EVIDENCE, and ABSENCE_OF_CURRENT_OBSERVATION.
PCO-17: A restored local snapshot can be authentic and internally consistent while semantically stale relative to external resources.
PCO-18: External resource rollback can make old state appear current; continuity/fencing must be evaluated at the resource side when world-effect claims depend on it.
PCO-19: Post-commit/pre-observation failure can create a mixed-generation view: local control generation N, resource A generation N+1, resource B unknown, evidence cache generation N-1. Individual current-looking fields do not establish coherent context.
PCO-20: Recovery cannot clear a safety barrier merely because the local database lacks a record of the event.
PCO-21: Reconciliation must be idempotent and generation-aware; repeated recovery must not create new effects or overwrite newer evidence with older observations.
PCO-22: Evidence freshness and claim validity are separate from evidence authenticity.
PCO-23: If resource history is compacted and the claim needs the removed history, the claim is unprovable from that resource alone.
PCO-24: Cross-resource reconciliation may itself have partial results; unresolved resources keep the protected claim at UNKNOWN/DEGRADED.
PCO-25: The final release decision must depend on a coherent current ContextIdentity/VersionSet, not a set of independently current fields.

## Recovery conceptual sequence
RESTORE
→ HISTORICAL_LOCAL_BASELINE
→ CURRENT_CONTROL_CONTEXT
→ IDENTIFY_UNCERTAIN_EXTERNAL_EFFECTS
→ ESTABLISH_RESOURCE_IDENTITY/INCARNATION
→ RECONCILE_EACH_RESOURCE
→ CLASSIFY_EVIDENCE
→ DETECT_CONFLICTS/ROLLBACK/STALE_HISTORY
→ UPDATE_EXTERNAL_EFFECT_STATE
→ RECOMPUTE_CLAIMS
→ REVALIDATE_FENCES/AUTHORITY
→ EXPLICIT_RELEASE or HOLD/QUARANTINE.

## Candidate invariants
INV-PCO-01: Loss of observation after external attempt MUST NOT imply no effect.
INV-PCO-02: Recovery MUST preserve effect identity across reconciliation/retry.
INV-PCO-03: Restored local state MUST NOT override newer authoritative external evidence.
INV-PCO-04: Missing/compacted external history MUST NOT be treated as evidence of absence.
INV-PCO-05: Reconciliation evidence MUST be bound to resource incarnation/context and freshness.
INV-PCO-06: Reconciliation MUST NOT promote UNKNOWN to VERIFIED without property-specific valid evidence.
INV-PCO-07: Multiple observers do not establish independence unless dependency/failure-domain separation is sufficient for the claim.
INV-PCO-08: Resource rollback/replacement MUST trigger continuity/currentness evaluation before protected release.
INV-PCO-09: Reconciliation is a protected transition and cannot grant unrestricted execution authority.
INV-PCO-10: Mixed-generation state MUST NOT be treated as coherent current context.
INV-PCO-11: Repeated recovery/reconciliation MUST be idempotent and monotonic with respect to current authoritative evidence.
INV-PCO-12: Claim validity MUST respect historical evidence retention/compaction boundaries.

## Research inputs
AWS Builders Library describes ambiguous timeout as requiring reconciliation and recommends stable caller request identifiers/idempotency; it also emphasizes atomic recording of idempotency token plus mutation. etcd documents that snapshot restore can move revisions backward and that caches/watchers can become inconsistent; revision bump/compaction can invalidate stale consumers. Raft provides durable committed control-log semantics, but not external-world truth.

## Open
- Exact external history retention contract.
- Cross-resource reconciliation ordering.
- Resource-side continuity anchors.
- Formal model of mixed-generation evidence.
- Recovery proof/refinement.
- Fault injection for crash after external commit and before local observation.
- Provider-specific reconciliation contracts.
- Whether ExternalEffectHistory should be canonical or claim-specific evidence.

## Next
Continue from PCO-25 into double-failure:
external commit + local crash + resource rollback/replacement + stale observer + recovery restart.
