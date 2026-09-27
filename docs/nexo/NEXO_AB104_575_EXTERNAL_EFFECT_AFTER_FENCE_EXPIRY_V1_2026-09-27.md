# NEXO — AB104.575 — External effect after fence expiry/revocation

Date: 2026-09-27
Status: RESEARCH COMPLETE — DESIGN INPUT ONLY
Implementation: NONE.

## Evidence
AWS documents that idempotency tokens are scoped by API semantics and may have finite lifetime. Cloud Control API states a client token is valid for 36 hours; after expiry the same token is treated as a new request. citeturn0search3turn0search7
AWS also documents that identical client-token retries can be safe, while parameter changes cause an idempotency mismatch. citeturn0search6turn0search8
Kubernetes explicitly separates object name from UID: a deleted object can be recreated with the same name, while each historical object receives a distinct UID. citeturn0search0turn0search15
AWS Cloud Control further warns that a resource operation may consist of multiple underlying calls and can partially apply without rollback. citeturn0search10

## Finding
A provider can legitimately report that an effect committed even after Nexo's local authority fence expired. That creates no permission to erase or rewrite the historical fact.

The correct model separates:
1. EFFECT OUTCOME — what happened externally.
2. AUTHORITY VALIDITY — whether Nexo was authorized when submission occurred.
3. CURRENT ADMISSIBILITY — what Nexo may do now.
4. COMPENSATION STATE — whether a corrective effect is required.

Therefore:

HISTORICAL_COMMIT != CURRENT_AUTHORIZATION

and

FENCE_REVOCATION != RETROACTIVE_UNDO.

## Critical cases

A. Commit before fence expiry, response arrives after expiry
→ effect may be historically authorized; delayed observation does not retroactively invalidate the submission.

B. Submission accepted while fence valid, provider commits after fence expiry
→ historical execution timing becomes provider evidence; Nexo must record the exact known/unknown timeline. Current policy must decide admissibility/compensation. Do not silently relabel it as authorized or unauthorized without evidence of the provider's execution point.

C. Nexo submits after fence expiry
→ no valid authority for a new mutation; provider success does not manufacture authority.

D. Outcome UNKNOWN when fence expires
→ do not retry automatically. Reconcile first. A later success must be recorded as external history, not used to reconstruct an authorization that cannot be proven.

E. Fence revoked for safety reason
→ historical effect remains immutable. A separate compensating action may be required if policy permits and the target remains the same valid incarnation.

F. Resource/provider reincarnates before late commit
→ old effect must remain bound to old incarnation. A success on a new incarnation is a different effect unless explicit continuity evidence exists.

## New state dimensions
ExternalEffectRecord should not collapse these fields into one status:

Outcome: COMMITTED | NOT_COMMITTED | UNKNOWN
SubmissionAuthority: VALID | INVALID | UNKNOWN
ExecutionTimeRelationToFence: BEFORE | AFTER | UNKNOWN
TargetIncarnation: identified immutable lineage
CurrentAdmissibility: ALLOWED | BLOCKED | REQUIRES_REVIEW
Compensation: NONE | REQUIRED | IN_PROGRESS | COMPLETED | UNKNOWN

These are design candidates, not finalized schema.

## Key invariant
Nexo must never use a later external COMMITTED observation to infer that the original authorization was valid at execution time unless the provider supplies sufficient timing/causal evidence.

Likewise, expiration or revocation of a fence must not rewrite a previously recorded historical event.

## Compensation boundary
Compensation is a NEW effect, not a rollback of history.

If effect E happened after authority became invalid, the record remains:
E = COMMITTED
Authority-at-execution = INVALID/UNKNOWN
Compensation = separate decision/effect.

This preserves event-sourcing integrity and prevents false claims that the original side effect was never performed.

## Partial-effect warning
Provider-level success may not imply atomic completion of all underlying physical/service actions. AWS Cloud Control explicitly documents partial application without rollback. Therefore Nexo's external effect record must distinguish provider operation outcome from verified world-state outcome.

## Closure
AB104.575 establishes the separation:
EXTERNAL FACT
≠ AUTHORITY AT TIME
≠ CURRENT AUTHORIZATION
≠ COMPENSATION.

Still OPEN:
- exact causal timestamp/evidence requirements;
- provider clock trust and ordering;
- compensation safety when original effect is irreversible;
- concurrent compensations/races;
- partial external effects and reconciliation;
- formal model and verification;
- implementation/fault injection.

## Next exact step
AB104.576 — research irreversible/non-compensatable external effects: how Nexo should behave when an unauthorized or UNKNOWN effect cannot safely be undone, including evidence preservation, containment, admission control, and recovery without pretending rollback occurred.
