# NEXO — EFFECT OUTCOME AMBIGUITY + COMPENSATION SELECTION RESEARCH V1
Date: 2026-09-25
Status: RESEARCH / ARCHITECTURAL PRECONDITION
Implementation: BLOCKED. No V21.

## Scope
An external effect has UNKNOWN outcome after timeout/crash/lost acknowledgement. STOP may activate while recovery decides whether to retry, wait, reconcile, compensate, or quarantine. The external resource may have partially committed.

## Research inputs
AWS Step Functions redrive preserves successful step results/history and reruns unsuccessful work rather than blindly replaying the whole execution; its redrive API also uses a client token for request idempotency. This is a concrete example that recovery/replay needs explicit identity and retained history, not simply a fresh execution. citeturn1search0turn1search1
Kubernetes uses Lease objects for coordination/leader election; the current owner is established through shared coordination state rather than local belief alone. This supports treating recovery ownership/fencing as protected coordination state, not as an attribute restored from a stale checkpoint. citeturn1search5
Node.js documents that fs/promises operations are not synchronized/threadsafe for concurrent modification of the same data, and that writeFile calls on the same file must be awaited; filesystem persistence therefore cannot by itself be treated as a distributed transaction with an external effect. citeturn0search1
The transactional-outbox pattern likewise documents the fundamental crash ambiguity: a relay can publish an effect and crash before recording publication, requiring idempotent consumers and/or reconciliation rather than assuming absence. citeturn0search0

## Findings
EOA-01: UNKNOWN means the system lacks sufficient evidence to classify the external effect as absent, present, partial, or reversed. It is not equivalent to failure.
EOA-02: A retry is a new attempt, not proof that the original attempt did not occur.
EOA-03: Reusing the same stable external-effect identity can make a retry safe only if the external sink actually enforces that identity/idempotency semantics.
EOA-04: Local idempotency prevents duplicate local execution semantics; it does not establish external-world idempotency.
EOA-05: A compensation is a new protected effect with its own authorization, identity, fencing, postconditions and reconciliation. It is not time reversal.
EOA-06: Compensation under UNKNOWN is unsafe by default when compensation itself could duplicate, amplify, or reverse an effect that never happened.
EOA-07: Retry, wait, reconcile, compensate and quarantine are distinct recovery decisions and require effect-class-specific admissibility rules.
EOA-08: Reconciliation should be attempted before compensation whenever a reliable, non-destructive external query can establish the current effect state without creating a new protected effect.
EOA-09: If external state cannot be resolved, the safe default for irreversible or high-impact effects is HOLD/QUARANTINE rather than speculative compensation.
EOA-10: A reversible effect may permit bounded compensation under uncertainty only if the effect contract proves that the compensating operation is safe for every unresolved state admitted by the contract.
EOA-11: Compensation admissibility must consider partial-commit states, not only {did/not}.
EOA-12: STOP does not resolve UNKNOWN. It may prevent additional local/protected attempts while leaving the external outcome unresolved.
EOA-13: STOP can invalidate a previously eligible retry or compensation; release/admission must revalidate current STOP, recovery ownership, resource fence and effect context at the protected boundary.
EOA-14: A stale recovery actor must not issue retry/compensation after ownership transfer even if its checkpoint says the operation is unresolved.
EOA-15: Effect identity and resource incarnation must survive recovery; a replaced external resource must not be treated as the same world solely because identifiers match.
EOA-16: Evidence collected before a resource fence, policy, STOP or ownership change may require revalidation.
EOA-17: Provider acknowledgement is evidence, not automatically world truth; assurance depends on the provider's documented semantics and the claim being made.
EOA-18: A local durable prepared record plus a crash does not prove the handler never ran. Conversely, a missing prepared record does not prove the handler never ran if the persistence boundary failed.
EOA-19: Therefore the execution owner must persist enough intent/effect identity before execution to support later reconciliation, but must still classify post-crash outcome as UNKNOWN until external evidence resolves it.
EOA-20: Completion should require claim-specific evidence; a local handler return may be sufficient only for effects whose world boundary is inside the same protected durability domain.
EOA-21: Compensation selection must be a policy decision over effect class + known/unknown outcome + STOP state + resource incarnation/fence + evidence freshness + recovery ownership, not a generic fallback.
EOA-22: "Retry until success" is invalid for non-idempotent or externally ambiguous effects unless the effect contract explicitly bounds duplicate/replay behavior.
EOA-23: A failed reconciliation query is not evidence that the effect is absent.
EOA-24: If reconciliation is eventually consistent, a negative observation may remain insufficient for immediate compensation; the observation contract must state freshness and completeness.
EOA-25: The decision record should preserve why retry/compensation was admissible or rejected, including the evidence and context generation used.
EOA-26: Recovery decisions must be monotonic with respect to authoritative evidence/context; a later stale observation must not downgrade a previously verified current-world fact.
EOA-27: If two recovery actors produce conflicting decisions, the protected decision domain must serialize/compare-and-set them or explicitly enter conflict/quarantine.
EOA-28: The smallest safe universal recovery rule is: UNKNOWN external outcome + no verified reconciliation + nontrivial external effect => no automatic compensating effect; HOLD/QUARANTINE pending resolution.
EOA-29: This is a conservative default, not a universal liveness guarantee. Effect classes may define stronger bounded recovery contracts after evidence.
EOA-30: Exactly-once external semantics are not inferred from an internal idempotency key.

## Candidate decision matrix
Outcome known ABSENT:
- Retry may be admissible if current authority/fence/STOP/context permit and effect contract permits retry.
Outcome known PRESENT/COMPLETED:
- Do not retry the original effect; record/reconcile completion.
Outcome PARTIAL:
- Follow effect-class-specific continuation or compensation protocol; generic retry is forbidden.
Outcome UNKNOWN:
- Reconcile first if safe and meaningful.
- If unresolved, HOLD/QUARANTINE by default for nontrivial effects.
- Compensation only if an effect-class contract proves safety across the admitted uncertainty set.
- Retry only if stable external identity/idempotency semantics make duplicate attempt safe and current policy permits it.

## Candidate state additions
EffectOutcomeAssessment:
- assessment_id
- external_effect_identity
- resource_incarnation
- observed_state
- evidence_refs
- observation_generation/context
- freshness/completeness
- authority/recovery epoch
- decision: RETRY | WAIT | RECONCILE | COMPENSATE | QUARANTINE
- admissibility_basis
- durable sequence

CompensationBinding:
- compensation_id
- original_effect_identity
- allowed_uncertainty_set
- effect_class
- resource_incarnation
- authority/fence
- preconditions
- postconditions
- reconciliation requirements

These are candidate objects; schema remains OPEN.

## Candidate invariants
INV-EOA-01: UNKNOWN external outcome MUST NOT be treated as ABSENT.
INV-EOA-02: NEW ATTEMPT MUST NOT imply NEW EFFECT.
INV-EOA-03: Compensation MUST be a separately authorized protected effect.
INV-EOA-04: Automatic compensation under UNKNOWN MUST require an effect-class proof/contract covering the unresolved state set.
INV-EOA-05: STOP MUST NOT be interpreted as resolution of external UNKNOWN.
INV-EOA-06: Stale recovery actors MUST be rejected at the retry/compensation protected boundary.
INV-EOA-07: Resource incarnation/fence MUST be current for any new external effect.
INV-EOA-08: Completion classification MUST satisfy the evidence contract for the claim.
INV-EOA-09: Failed reconciliation MUST NOT be converted into evidence of absence.
INV-EOA-10: Conflicting recovery decisions MUST serialize, compare-and-set, or enter explicit conflict/quarantine.
INV-EOA-11: Recovery decisions MUST preserve the context/evidence generation used to make them.
INV-EOA-12: Internal idempotency MUST NOT be promoted into an external exactly-once guarantee without sink semantics.

## Architecture consequence
The protected transition must include an effect-class-specific Outcome/Recovery Decision Contract. The generic runtime can expose UNKNOWN and reconciliation primitives, but it must not choose retry or compensation generically. The final Nexo architecture needs a policy-controlled decision layer above the generic effect adapter.

## Open
1. Formal classification of effect classes by reversibility/duplication/partial-commit behavior.
2. Exact evidence requirements for "known absent" and "known present".
3. Provider-specific reconciliation guarantees and eventual-consistency bounds.
4. Formal proof/refinement that compensation is safe for each admitted uncertainty set.
5. STOP + compensation conflict policy per effect class.
6. Fault injection: crash after external commit but before durable completion.
7. Fault injection: crash before prepared-intent durability.
8. Fault injection: stale recovery actor attempts retry/compensation after ownership transfer.
9. Fault injection: resource replacement between original effect and reconciliation.
10. Multi-resource UNKNOWN and partial-commit expansion.

## Next attack
**MULTI-RESOURCE UNKNOWN + PARTIAL COMMIT + RECOVERY RESTART**:
A protected operation spans resources A/B; A commits, B is UNKNOWN; recovery crashes and restarts under a new incarnation; one resource is replaced; STOP changes; stale evidence and late ACKs arrive. Determine the minimum state/identity/fencing/evidence needed to avoid unsafe duplicate or compensating effects.

Do not implement.
Do not construct V21.
Maintain:
DESIGNED != IMPLEMENTED != FORMALLY VERIFIED != RUNTIME VERIFIED != DEPLOYED VERIFIED.
