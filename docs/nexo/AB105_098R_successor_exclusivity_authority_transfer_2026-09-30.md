# AB105.098R — successor exclusivity and authority-transfer contract

Date: 2026-09-30
Chain: AB105.097R -> AB105.098R

## Objective
Define the generic semantic boundary for transferring consequential authority from a predecessor runtime to a successor without assuming that state copying, recovery, or a new epoch alone prevents split-brain.

## Fresh evidence
RFC 9334 identifies epoch IDs as freshness mechanisms but explicitly notes that epoch information can be replayed, delayed, dropped, or reordered; therefore an epoch value by itself is not sufficient proof of current authority. citeturn0search0
NIST SP 800-53 CP-10 separates recovery/reconstitution from reauthorization and requires restoration to a known state; NIST's recovery guidance also treats concurrent processing as a distinct validation condition rather than silently assuming exclusive operation. citeturn0search2turn0search3
RFC 9722 provides a concrete distributed-systems example where overlapping active roles can create duplicate effects, illustrating why role transfer needs an explicit overlap/exclusion rule. citeturn0search1

## Core semantic distinction
SUCCESSOR_IDENTITY != SUCCESSOR_AUTHORITY.
NEW_EPOCH != PROVEN_EXCLUSIVITY.
FENCE_ISSUED != FENCE_ENFORCED.
PREDECESSOR_STOP_REQUESTED != PREDECESSOR_STOPPED.
STATE_TRANSFERRED != AUTHORITY_TRANSFERRED.
AUTHORITY_TRANSFERRED != EFFECT_RECONCILED.

## Authority-transfer contract
AUTHORITY_TRANSFER_ID
PREDECESSOR_RUNTIME_ID
SUCCESSOR_RUNTIME_ID
RESOURCE_OR_MISSION_SCOPE
PREVIOUS_EPOCH
SUCCESSOR_EPOCH
TRANSFER_POLICY_VERSION
TRANSFER_TRIGGER
PREDECESSOR_STATUS
FENCE_EVIDENCE
SUCCESSOR_IDENTITY_EVIDENCE
CURRENT_AUTHORITY_EVIDENCE
PENDING_EFFECT_RECONCILIATION
EXCLUSIVITY_RESULT
RELEASE_DECISION
VALID_UNTIL_OR_RECHECK
FAIL_STATE

## Exclusivity states
EXCLUSIVITY_PROVEN
EXCLUSIVITY_BOUNDED
EXCLUSIVITY_UNKNOWN
EXCLUSIVITY_CONFLICTING
EXCLUSIVITY_NOT_ESTABLISHED

EXCLUSIVITY_PROVEN requires policy-defined evidence that no other runtime can validly perform consequential effects in the transferred scope for the accepted epoch.
EXCLUSIVITY_BOUNDED is permitted only when policy explicitly accepts a bounded overlap/uncertainty for the consequence class; it MUST NOT be represented as exclusive authority.
EXCLUSIVITY_UNKNOWN/CONFLICTING/NOT_ESTABLISHED maps to UNKNOWN/STOP whenever the intended effect requires exclusive authority.

## Transfer protocol boundary
1. REQUEST_TRANSFER — identify scope and intended successor.
2. INVALIDATE_OR_FENCE_PREDECESSOR — issue the authority transition.
3. OBSERVE_ENFORCEMENT — collect evidence that the predecessor can no longer exercise the transferred authority.
4. ESTABLISH_SUCCESSOR_EPOCH — bind the successor to the accepted authority epoch.
5. RECONCILE_IN_FLIGHT_EFFECTS — resolve effects spanning the transfer boundary.
6. APPRAISE_EXCLUSIVITY — determine whether exclusive authority is proven, bounded, unknown, or conflicting.
7. RELEASE_SUCCESSOR — only if policy prerequisites are satisfied.

These are semantic stages, not an assertion that one atomic mechanism can implement them.

## Critical race cases
### R1 — predecessor acts after fence issuance
Fence issuance is not enforcement. If enforcement cannot be established, successor release is UNKNOWN/STOP for exclusive effects.

### R2 — successor receives stale epoch
Stale epoch cannot authorize consequential effects. The successor must re-obtain/revalidate current authority.

### R3 — predecessor and successor both appear healthy
Health is not authority. Both cannot be treated as active authorities for the same exclusive scope unless the policy explicitly defines multi-writer semantics.

### R4 — transfer acknowledgement is lost
Missing acknowledgement is not proof of predecessor shutdown. Recovery uses reconciliation, not blind retry.

### R5 — successor crashes after release
Recovery must begin from the successor's persisted authority-transfer state and revalidate current authority; it cannot assume the prior release remains valid forever.

### R6 — effects cross the transfer boundary
Effect ownership must be reconciled independently of runtime identity. Transfer completion cannot erase an unresolved external operation.

## Minimal release predicate
SUCCESSOR_RELEASE =
  SUCCESSOR_IDENTITY_VERIFIED
  AND CURRENT_AUTHORITY_VALID
  AND SUCCESSOR_EPOCH_ACCEPTED
  AND EXCLUSIVITY_RESULT_POLICY_ACCEPTED
  AND PENDING_EFFECTS_POLICY_RESOLVED
  AND VALIDITY_WINDOW_ACTIVE

Any mandatory UNKNOWN produces UNKNOWN/STOP.

## New boundary
Generic successor exclusivity is now semantically defined, but its enforcement mechanism remains deliberately unspecified.
Nexo must not assume that a lease, distributed lock, process termination, network partition detector, epoch counter, or provider-specific revocation mechanism alone proves exclusivity. The mechanism becomes an implementation-specific adapter whose evidence must satisfy the generic contract.

## Result
No new generic recovery primitive was found.
Successor exclusivity is an extension of the existing authority epoch + fencing + reconciliation model, not a new evidence taxonomy.
The semantic branch can now close at the generic layer with enforcement unknown until a concrete mechanism is selected and tested.

## Status
SUCCESSOR_EXCLUSIVITY = SEMANTICALLY_DEFINED
AUTHORITY_TRANSFER = SEMANTICALLY_DEFINED
EPOCH_FRESHNESS = EXISTING_DEPENDENCY
FENCING_ENFORCEMENT = PROVIDER/IMPLEMENTATION_DEPENDENT_UNKNOWN
IN_FLIGHT_EFFECT_RECONCILIATION = REQUIRED
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.099R — adversarial integration of successor exclusivity with the existing STOP, epoch, fencing, replay/idempotency, and EventDAG boundaries. Goal: determine whether any cross-boundary invariant is still missing before this Nexo-core branch is closed.