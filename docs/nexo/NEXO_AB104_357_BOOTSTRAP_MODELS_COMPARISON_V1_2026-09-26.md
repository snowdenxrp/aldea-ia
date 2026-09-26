# NEXO AB104.357 — Independent bootstrap models comparison V1

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
RFC 6024 says initial trust-anchor manager authority must be established during initial configuration and may use out-of-band verification; it also requires replay detection and compromise/disaster recovery. citeturn0search0 NIST defines a trust anchor as a key trusted because it is directly built into hardware/software or securely provisioned out-of-band, which supports treating bootstrap as a distinct trust boundary. citeturn0search1 RPKI RFC 9691 demonstrates staged successor-key rollover under the current TA, with a controlled acceptance interval before switching local state. citeturn0search2 Current CORIM work also makes trust dependencies explicit and states that trust-anchor provisioning is outside the specification, reinforcing that bootstrap must be modeled separately. citeturn0search4

## Comparison

### 1. Offline root
Strength: separates recovery authority from the online/recoverable store.
Can establish: authenticated root transition if the offline root is itself protected and the ceremony/policy is valid.
Cannot establish alone: online target state, historical completeness, or external effect truth.
Risk: availability/operational recovery burden.

### 2. Hardware-protected root
Strength: can keep bootstrap key outside ordinary application rollback state.
Can establish: possession/use of a protected bootstrap key and, if policy binds it, an authenticated transition.
Cannot establish alone: correct policy, correct recovery context, or semantic completeness.
Risk: hardware provenance/firmware/attestation becomes another dependency.

### 3. Quorum / multi-party recovery
Strength: avoids a single recovery key and can tolerate some unavailable/compromised participants.
Can establish: a protocol-defined recovery authorization if membership, threshold, epoch, and independence assumptions are satisfied.
Cannot establish: real-world independence merely from signature count; common-mode operators/infrastructure remain possible.
Risk: quorum assumptions and reconfiguration must be explicit.

### 4. Delegated recovery authority
Strength: operationally flexible and can support scoped recovery.
Can establish: recovery authority only within the delegation's authenticated scope and validity interval.
Cannot establish: authority beyond that scope or after delegation revocation/expiry.
Risk: delegation graph becomes another dependency that must be closed.

## Nexo finding
No model is universally sufficient. Bootstrap authority should be represented as a claim-specific dependency with:
`bootstrap_id + authority_root + scope + epoch + membership/delegation + freshness + transition_digest + independence_requirements`

Candidate outcomes:
`BOOTSTRAP_VALID | SCOPE_MISMATCH | STALE | INDEPENDENCE_INSUFFICIENT | DEPENDENCY_INCOMPLETE | CONFLICT | UNKNOWN`

Important invariants:
`SIGNATURE_COUNT != INDEPENDENCE`
`HARDWARE_ROOT != AUTOMATIC_TRUTH`
`DELEGATED_AUTHORITY != UNIVERSAL_AUTHORITY`
`OFFLINE_ROOT != COMPLETE_RECOVERY_EVIDENCE`

## Status
Exact bootstrap architecture remains UNSELECTED. No implementation or formal verification performed.

## Next
AB104.358 — study hybrid bootstrap: how independent recovery authorities can be combined without creating circular trust, hidden common-mode dependencies, or ambiguous authority ordering.
