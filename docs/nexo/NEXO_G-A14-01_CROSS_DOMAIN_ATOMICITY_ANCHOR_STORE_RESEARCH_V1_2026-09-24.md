# NEXO — G-A14-01 Cross-Domain Atomicity: Protected Store + Monotonic Anchor
## Research Delta V1 — 2026-09-24

Status: RESEARCH / DESIGN REFINEMENT
Gate: G-A14-01 remains OPEN
Implementation: NOT STARTED
Formal verification: NOT PROVEN

## 1. Research question

Can a protected store and an independently protected monotonic anchor be combined safely when they do not share atomicity?

Critical failure windows:
- anchor advanced, store not committed;
- store committed, anchor not advanced;
- command result lost after either side;
- anchor unavailable/rate-limited;
- crash/restart between operations;
- recovery from an older store snapshot;
- anchor reset/replacement/reprovisioning;
- disagreement between anchor and store.

## 2. Primary findings

TCG TPM 2.0 specifies NV counters as monotonic and requires that a counter not move backward; it also addresses deletion/recreation by ensuring a recreated counter cannot reuse an older count. The specification also distinguishes orderly-counter persistence behavior and requires special handling after unorderly shutdown. This gives a genuine anti-regression primitive, but not atomicity with an external application store.

Microsoft's TPM 2.0 reference implementation shows the actual separation: NV_Increment reads the current NV value, increments it, then calls the NV persistence path. That path can return TPM_RC_NV_UNAVAILABLE or TPM_RC_NV_RATE. Therefore an external protected-store transaction cannot assume that a TPM increment is automatically part of its own atomic commit.

The reference implementation's time subsystem provides another useful precedent: when NV is unavailable, the TPM's clock may stop advancing and the reported safe state becomes false. This supports a Nexo rule that loss of the anchor's currentness primitive must not be interpreted as currentness.

Heads/LinuxBoot uses a TPM monotonic counter plus a hash of the counter stored on /boot. Its code verifies the binding at boot and fails preflight for missing/unreadable/inconsistent rollback-counter state. This is a concrete example of an anchor + binding pattern, not a cross-domain atomic commit.

NIST SP 800-193 emphasizes independent protection of recovery roots/data and fail-safe behavior when protected critical state cannot be trusted. This is consistent with quarantine rather than optimistic recovery.

## 3. Important architectural result

A monotonic anchor solves only one property:

MONOTONICITY(anchor)

It does not by itself prove:

CURRENT_STATE(store)
STATE_SEMANTIC_VALIDITY
AUTHORITY_VALIDITY
EFFECT_RECONCILIATION
EVIDENCE_VALIDITY

Therefore:

ANCHOR != AUTHORITY
ANCHOR != WORLD TRUTH
ANCHOR != COMPLETE STATE

The anchor must be treated as a protected witness for a claim, not as the owner of the whole semantic state.

## 4. Cross-domain atomicity result

A two-step protocol cannot simply pretend to be one atomic transaction.

Protocol A:
1. commit store
2. advance anchor

Failure after step 1 can leave:
STORE=new, ANCHOR=old

Protocol B:
1. advance anchor
2. commit store

Failure after step 1 can leave:
ANCHOR=new, STORE=old

Neither state may be silently interpreted as success.

Therefore the architecture needs a third semantic outcome:

CROSS_DOMAIN_UNCERTAIN

This is distinct from:
- transaction failed;
- transaction succeeded;
- external effect UNKNOWN.

It means the protected transition's relationship to the anchor is unresolved.

## 5. Safe consequence

If anchor > store's bound lineage:
- store may be stale;
- no protected authority may be released from that store;
- recovery must reconcile or obtain a new admissible lineage.

If store > anchor:
- the store contains state that has not been durably represented by the anchor;
- the state must not automatically be treated as current;
- recovery must reconcile the discrepancy before safety-critical release.

If anchor unavailable:
- currentness claim becomes UNKNOWN;
- protected release is blocked.

If anchor is reset/reprovisioned:
- this is not equivalent to a normal restart;
- the old lineage cannot be silently trusted;
- explicit re-enrollment/recovery under a protected procedure is required.

## 6. Refined currentness model

Currentness should be represented as a claim with explicit binding:

CurrentnessClaim =
{
  anchor_identity,
  anchor_value,
  anchor_epoch/lineage,
  protected_state_digest_or_equivalent,
  state_lineage,
  recovery_lineage,
  VersionSet,
  trust_context,
  validation_time/context,
  validity,
  dependencies
}

The exact representation remains OPEN.

A valid monotonic value without a valid binding is insufficient.

## 7. Candidate protocol classes

### A. Store-first + anchor-second
Advantage: state exists before witness advances.
Failure: anchor lag after store commit.
Safe recovery requires determining whether the store commit is actually admissible/current.

### B. Anchor-first + store-second
Advantage: witness records intent/frontier before state.
Failure: anchor can lead store.
Safe recovery requires treating the gap as reserved/uncertain rather than successful.

### C. Intent record + anchor + state
Introduce an intermediate durable protected intent that records the cross-domain operation identity and expected binding.
Still requires recovery semantics if any participant is unavailable.

### D. Independent witness + protected store + recovery journal
Can reduce ambiguity by retaining a protected cross-domain journal.
Still does not create true atomicity unless the mechanism itself provides it.

### E. Consensus-backed state machine containing the anchor operation
Can provide atomic ordering inside the replicated state machine if the anchor is represented by the same trusted mechanism.
Does not automatically solve a physically external TPM/hardware counter.

## 8. Strong negative result

No protocol can infer atomic success from two independently durable components merely because both are durable.

Durability is not atomicity.
Monotonicity is not atomicity.
Integrity is not freshness.
Freshness is not semantic validity.

## 9. Required Nexo contracts

PSC-14 — Cross-Domain Commit Uncertainty:
If protected state and its required anti-regression witness cannot establish their required relationship, the result is UNKNOWN/QUARANTINED for safety purposes.

PSC-15 — Anchor Binding:
An anchor value is usable only with a valid binding to the exact protected lineage/context for which it is claimed.

PSC-16 — Anchor Failure Closed:
Unavailable, reset, contradictory, or untrusted anchor state cannot silently preserve protected release eligibility.

PSC-17 — Discrepancy Non-Resolution:
anchor/store disagreement cannot be resolved by timeout, retry, new operation_id, or snapshot restore alone.

PSC-18 — Recovery Lineage:
Recovery from a state whose currentness cannot be established creates a distinct recovery lineage and does not inherit normal execution authority automatically.

## 10. New adversarial counterexamples

CE-GA14-01-13:
Store commits, crash before anchor update, response lost. Restart must not guess whether anchor update occurred.

CE-GA14-01-14:
Anchor advances, crash before store commit. Restart sees anchor ahead and must not manufacture the missing state.

CE-GA14-01-15:
Anchor is unavailable during commit. Store success cannot be interpreted as fully current if the anchor is required by policy.

CE-GA14-01-16:
Old store snapshot + current anchor. Binding must reject the old lineage.

CE-GA14-01-17:
Current store + reset/reprovisioned anchor. Reset is not evidence that the current store is safe.

CE-GA14-01-18:
Anchor and store each independently recover successfully but from different histories. Integrity of both does not prove common lineage.

CE-GA14-01-19:
Anchor increments twice because a retry repeats the anchor operation, while the logical operation was single. Anchor protocol must define idempotence/consumption semantics.

CE-GA14-01-20:
Anchor operation returns an error after the underlying increment may have taken effect. Caller must reconcile rather than blindly retry as a new logical effect.

## 11. Code-study conclusions

The Microsoft TPM reference implementation is useful evidence for the separation of:
- command semantics;
- NV state;
- NV availability/rate errors;
- persistent state;
- startup/recovery.

The Heads implementation demonstrates a real binding pattern between an external monotonic counter and recoverable disk state.

These implementations do not prove the Nexo protocol. They establish concrete failure modes and demonstrate that anti-rollback systems already require explicit binding and fail-closed behavior.

## 12. Mini-audit against A01-A14

No contradiction found with:
- INFORMATION != CAPABILITY != AUTHORITY != EFFECT != EVIDENCE;
- protected linearization;
- fencing/epochs;
- UNKNOWN preservation;
- recovery quarantine;
- TCB claim-specific invalidation;
- common-mode analysis;
- ReleaseEligible as derived predicate.

Refinement required:
G-A14-01 must explicitly distinguish:
(a) protected-store atomicity,
(b) anchor monotonicity,
(c) anchor/state binding,
(d) cross-domain uncertainty,
(e) recovery lineage.

## 13. Status

G-A14-01a — semantic non-regression requirement: SUBSTANTIALLY DESIGNED.

G-A14-01b — concrete anti-rollback mechanism: OPEN.

G-A14-01c — cross-domain atomicity protocol: OPEN.

G-A14-01d — anchor/store binding protocol: OPEN.

G-A14-01e — implementation feasibility: OPEN.

G-A14-01f — formal verification: NOT PROVEN.

No implementation gate is opened by this research.

## 14. Sources

- TCG TPM 2.0 Library Specification, current resource page: https://trustedcomputinggroup.org/resource/tpm-library-specification/
- TPM 2.0 Part 1 Architecture, NV Counter behavior: https://trustedcomputinggroup.org/wp-content/uploads/TPM-2.0-1.83-Part-1-Architecture.pdf
- Microsoft TPM 2.0 reference implementation, NV_Increment.c: https://github.com/microsoft/ms-tpm-20-ref/blob/main/TPMCmd/tpm/src/command/NVStorage/NV_Increment.c
- Microsoft TPM 2.0 reference implementation, Time.c: https://github.com/microsoft/ms-tpm-20-ref/blob/main/TPMCmd/tpm/src/subsystem/Time.c
- LinuxBoot Heads rollback counter implementation: https://github.com/linuxboot/heads/blob/master/doc/tpm.md
- NIST SP 800-193: https://csrc.nist.gov/pubs/sp/800/193/final

Continuity rule:
DESIGNED != IMPLEMENTED != PROVED != VERIFIED != DEPLOYED VERIFIED.
