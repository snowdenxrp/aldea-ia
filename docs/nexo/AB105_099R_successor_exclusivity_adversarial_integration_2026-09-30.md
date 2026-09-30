# AB105.099R — adversarial integration of successor exclusivity

Date: 2026-09-30
Chain: AB105.098R -> AB105.099R

## Objective
Test successor exclusivity against the already-defined STOP, authority epoch, fencing, replay/idempotency, recovery, reconciliation, and EventDAG boundaries. No implementation.

## Fresh primary evidence
RFC 9334 treats freshness as an appraisal-policy decision and explicitly notes races around epoch transitions; epoch identifiers can be delayed, dropped, replayed, or reordered. Therefore an accepted epoch is evidence for a freshness policy, not by itself proof of exclusive authority. citeturn1search0turn1search24
NIST's recovery/reconstitution guidance distinguishes restoration to a known state from returning to fully operational state, including assessment and possible reauthorization. citeturn1search1turn1search2

## Adversarial integration
### A — stale successor epoch
Successor presents an old epoch after a newer authority transition.
Result: STOP; stale epoch cannot establish current authority.

### B — predecessor acts after fence issuance
Fence exists as an issued record but enforcement is not proven.
Result: UNKNOWN/STOP for exclusive effects; issuance is not enforcement.

### C — replayed transfer request
Same transfer identifier is replayed.
Result: idempotent recognition; replay cannot create a second authority transition.

### D — transfer records arrive out of order
SUCCESSOR_RELEASE arrives before evidence of predecessor fencing.
Result: no inferred causal order; release remains blocked until required predecessor-exclusion evidence is satisfied.

### E — missing predecessor successor record
A queried history ends without a successor/terminal record.
Result: UNKNOWN, not EMPTY/TERMINAL.

### F — EventDAG reconstruction is partial
Multiple admissible histories remain.
Result: successor release is allowed only if all admissible histories are decision-equivalent for the exact release claim; otherwise UNKNOWN/STOP.

### G — successor is fresh but authority changed
Freshness proves recent evidence, not that authority remained unchanged after evidence generation.
Result: recheck authority/epoch at the release boundary.

### H — predecessor and successor both hold valid-looking credentials
Credential validity alone does not establish exclusive scope ownership.
Result: exclusivity remains UNKNOWN unless the authority-transfer policy provides a stronger exclusion mechanism.

### I — external effect spans the transfer
An effect begins under predecessor and completes/appears under successor.
Result: effect identity and reconciliation cross the runtime boundary; runtime identity cannot be used as effect identity.

### J — STOP during transfer
STOP_REQUESTED occurs while transfer is between fencing and successor release.
Result: successor release is blocked; STOP does not retroactively prove predecessor quiescence or erase prior effects.

### K — recovery during an unresolved transfer
Recovery selects a checkpoint from the middle of the transfer.
Result: transfer state is reconstructed as partial/in-progress; no clean predecessor or successor authority is inferred.

### L — duplicate evidence surfaces
Multiple records report the same fence/epoch transition.
Result: duplicate evidence is not duplicate authority transition; identity/correlation rules deduplicate observations without upgrading assurance.

## Cross-boundary invariants
EXCLUSIVITY_PROVEN -> requires CURRENT_AUTHORITY_VALID.
CURRENT_AUTHORITY_VALID -> does not imply EXCLUSIVITY_PROVEN.
FENCE_ISSUED -> does not imply PREDECESSOR_STOPPED.
FENCE_ENFORCED -> does not imply EFFECT_RECONCILED.
SUCCESSOR_EPOCH_ACCEPTED -> does not imply EXCLUSIVITY_PROVEN.
REPLAY_RECOGNIZED -> does not imply EFFECT_COMPLETED.
PARTIAL_EVENTDAG -> cannot imply TERMINALITY.
FRESH_EVIDENCE -> does not imply CURRENT_AUTHORITY_FOREVER.
STOP_REQUESTED -> does not imply STOP_ENFORCED.
TRANSFER_COMPLETE -> does not imply ZERO_PRIOR_EFFECT.

## Decision-equivalence rule
The existing EventDAG rule is sufficient: when reconstruction is ambiguous, successor release may be classified BOUNDED only if every admissible reconstruction produces the same decision for the exact release claim under the applicable policy. If any admissible history changes whether release is permitted, the result is UNKNOWN/STOP.

## Closure assessment
No new generic invariant was found beyond the existing authority, freshness, fencing, reconciliation, replay, and EventDAG boundaries.
Successor exclusivity therefore integrates cleanly with the existing model.
The remaining uncertainty is enforcement/mechanism-specific, not a missing generic semantic.

## Status
SUCCESSOR_EXCLUSIVITY_INTEGRATION = PASSED
CROSS_BOUNDARY_INVARIANTS = COMPLETE_AT_GENERIC_LAYER
AUTHORITY_EPOCH = CLOSED_GENERICALLY
STOP_FENCING = CLOSED_GENERICALLY_WITH_ENFORCEMENT_UNKNOWN
EVENTDAG_AMBIGUITY = CLAIM_RELATIVE
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.100R — close the successor-exclusivity branch with a compact normative contract and perform a global Nexo-core checkpoint. Then stop opening adjacent research branches unless the checkpoint identifies a concrete unresolved semantic dependency.