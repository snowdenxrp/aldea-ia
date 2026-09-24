# NEXO ASSURANCE ROOT ROTATION, COMPROMISE DURING COMPACTION AND TRUST CONTINUITY RESEARCH V1 — 2026-09-24

## Status
RESEARCH ONLY. No V21 implementation. No V20 patching. No correctness/runtime guarantee.

## External anchors
NIST SP 800-57 treats trust anchors, key compromise, key lifecycle, revocation and recovery as explicit key-management concerns. RFC 6024 requires trust-anchor management to support recovery from trust-anchor compromise/loss without requiring trust-store reinitialization. These support the architectural premise that trust-root change is a state transition with its own recovery semantics, not merely a configuration edit. citeturn0search14turn0search17
TLA+ explicitly models assumptions separately from theorems; a theorem is valid relative to its assumptions. This supports binding every assurance artifact to its trust-root assumptions rather than silently treating a historical root as timeless truth. citeturn0search13turn0search4

## Core finding
A compaction certificate created under root A cannot automatically remain valid after root A is revoked, compromised, superseded, or its trust context changes.

ROOT_VALIDITY != CERTIFICATE_CURRENTNESS
ROOT_CONTINUITY != AUTHORITY_CONTINUITY
SIGNATURE_VALIDITY != CURRENT_TRUST

A cryptographically valid historical signature can establish origin under root A, but not by itself establish that root A remains trusted for a current safety claim.

## 1. Root generation must bind assurance artifacts
Candidate fields:
- root_id
- root_generation
- trust_set_fingerprint
- root_transition_id
- effective cutoff
- predecessor/successor relation
- transition authority
- revocation state
- compromise state
- affected descendant closure
- verification context.

Every compaction certificate must bind its root context.

## 2. Root rotation is a protected transition
Candidate protocol:

REQUEST_ROOT_TRANSITION
→ AUTHENTICATE_NEW_ROOT
→ BIND_NEW_TRUST_CONTEXT
→ PREPARE_TRANSITION
→ ESTABLISH_OLD_ROOT_CUTOFF
→ INVALIDATE/FENCE_AFFECTED_DESCENDANTS
→ VERIFY_ENFORCEMENT
→ ACTIVATE_NEW_ROOT
→ REVALIDATE_ASSURANCE_ARTIFACTS
→ RECOMPUTE_PERMITTED_CLAIMS
→ EXPLICIT_RELEASE

Root rotation cannot be treated as a simple replacement of a public key or configuration field.

## 3. Historical certificates after root rotation
Three cases must be separated.

### Case A — historical provenance
The certificate says: this artifact was signed/issued under root A.

This can remain useful as historical provenance if A's historical authenticity is still accepted.

### Case B — current authorization
The certificate says: this artifact is currently authoritative.

This must be revalidated against the current root/trust context.

### Case C — safety assurance
The certificate says: the compacted summary still justifies claim C.

This requires current trust context plus current dependency/closure validity.

HISTORICAL_AUTHENTICITY != CURRENT_ASSURANCE.

## 4. Root compromise after reclamation
Attack:
1. root A authorizes compaction;
2. raw history is reclaimed;
3. root A is later discovered compromised;
4. Nexo needs to determine which certificates/claims depended on A;
5. some raw evidence is gone.

Therefore every root transition needs a durable descendant/reliance closure.

Candidate: RootRelianceClosure.

It records which:
- certificates;
- summaries;
- claims;
- authority grants;
- evidence attestations;
- reclamation decisions

depend on a root generation.

Without this, root compromise can invalidate artifacts whose dependencies cannot be reconstructed.

## 5. Root cutoff must propagate to compaction
When root A is cut off:

ROOT_CUTOFF
→ CERTIFICATE_INVALIDATION
→ CLAIM_REVALIDATION
→ AUTHORITY_FENCING
→ EFFECT_RECONCILIATION
→ COMPACTION_REASSESSMENT

A compaction certificate depending on A cannot remain silently current.

Potential outcomes:
- REVALIDATED under B;
- HISTORICAL_ONLY;
- CLAIM_DEGRADED;
- UNKNOWN;
- QUARANTINED.

## 6. Overlapping roots A and B
Overlap is not automatically safe.

During transition:
A_ACTIVE + B_ACTIVE

must have explicit semantics:
- which root can authorize protected effects?
- which root can invalidate A?
- which certificates can be issued?
- can A create new delegated authority?
- can B validate A-derived descendants?
- which root owns recovery?
- what prevents split-brain root issuance?

Candidate RootTransitionContext must define an authority cutoff and allowed transition operations.

The architecture must not infer:
TWO_VALID_ROOTS = TWO_INDEPENDENT_AUTHORITIES.

## 7. Old-root snapshot resurrection
A snapshot containing root A or an A-derived trust set is a hidden authority branch.

Therefore:
SNAPSHOT_RESTORE != TRUST_CONTEXT_RESTORE

Restoring an old snapshot must not restore:
- current root authority;
- current certificate validity;
- current delegation;
- current recovery ownership;
- current compaction authority.

A restored snapshot must enter a quarantine/revalidation path.

## 8. Root transition depending on compacted evidence
This is the deepest circularity attack.

Suppose:
A authorized compaction.
Compaction deleted evidence E.
Later root transition B requires E to establish the impact of A.
E no longer exists.

Then root rotation depends on information whose deletion was justified by the old root.

Therefore root-transition safety must have a foundation independent of the reclaimed evidence, or the evidence must remain retained until the root's reliance window closes.

Candidate: RootTransitionRetentionBoundary.

## 9. Root continuity chain
A candidate continuity relation:

ROOT_0
→ TRANSITION_1
→ ROOT_1
→ TRANSITION_2
→ ROOT_2

Each transition must preserve enough metadata to establish:
- predecessor authenticity;
- cutoff;
- successor activation;
- descendant invalidation;
- transition authority;
- verification;
- retained historical provenance.

But:
CONTINUITY_CHAIN != AUTOMATIC_CURRENT_AUTHORITY.

Current authority still requires the current root context and current policy/epoch/dependency state.

## 10. Compaction validity under root change
Candidate certificate state machine:

ROOT_BOUND
→ COMPACTION_VALID
→ ROOT_TRANSITION_PENDING
→ ROOT_CONTEXT_RECHECK
→ either:
  - CURRENT_UNDER_NEW_ROOT
  - HISTORICAL_ONLY
  - INVALIDATED
  - CLAIM_DEGRADED
  - QUARANTINED

No certificate should remain silently CURRENT merely because its old signature verifies.

## 11. Root compromise after destructive reclamation
If compromise is detected after raw history deletion, the system must still be able to answer:
- Which root generation authorized deletion?
- Which closure domain was assumed?
- Which certificates depended on that root?
- Which claims depended on those certificates?
- Which descendants could still act?
- Which resource incarnations were involved?
- What enforcement/fencing was verified?
- What must now be revalidated?

This establishes a minimum retention rule:

ROOT_RELIANCE_METADATA MUST OUTLIVE THE RAW HISTORY IT JUSTIFIES RECLAIMING.

## 12. New invariants
RR-01: Root rotation is a protected authority/trust transition, not a configuration mutation.
RR-02: Historical root authenticity does not imply current trust.
RR-03: Root cutoff invalidates or forces revalidation of dependent current assurance artifacts.
RR-04: Root compromise must have a durable descendant/reliance closure.
RR-05: Old-root snapshots cannot restore current authority.
RR-06: Overlapping roots require explicit transition semantics and cannot silently create parallel authority.
RR-07: A root transition cannot depend solely on evidence whose retention was authorized by the predecessor root if that evidence has already been reclaimed.
RR-08: Compaction certificates must bind root generation/trust context.
RR-09: Root continuity does not automatically establish current authority.
RR-10: After root compromise, the system must retain enough dependency metadata to identify affected certificates, claims, capabilities and reclamation decisions.

## Candidate objects
- RootTrustContext
- RootGeneration
- RootTransitionContext
- RootRelianceClosure
- RootTransitionRetentionBoundary
- RootCutoff
- TrustContextFingerprint
- HistoricalAssuranceRecord
- CurrentAssuranceBinding
- RootDependentClaimSet

## Architecture consequence
Trust-root lifecycle must join the existing protected transition family alongside:
- authority epochs;
- stop epochs;
- recovery epochs;
- fence generations;
- policy/invariant generations;
- dependency generations;
- resource incarnations;
- assurance generations;
- compaction/reclamation generations.

This reinforces:
CURRENTNESS IS MULTIDIMENSIONAL.

No single generation number can safely substitute for all of them.

## Next unresolved attack
The next attack is root compromise discovered after a partition with overlapping roots and a partially completed compaction.

Attack:
- partition separates A-side and B-side;
- both have apparently valid trust contexts;
- A-side completes summary commit;
- B-side starts root rotation;
- one side reclaims history;
- the partition heals;
- old and new root contexts meet;
- some evidence was compacted;
- recovery itself may have used different roots.

We need to determine the minimum SafetyOrderingDomain and RootTransitionOrdering needed to prevent split-brain assurance and stale compaction from becoming current authority.

No correctness guarantee is claimed.
