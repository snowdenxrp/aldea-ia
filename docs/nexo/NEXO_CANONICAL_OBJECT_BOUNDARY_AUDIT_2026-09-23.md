# NEXO Canonical Object Boundary Audit — 2026-09-23

## Purpose
Refine the canonical model before implementing the unified TLA+ specification. This records object-boundary decisions from the previous code/formal audit and a fresh concurrency cross-check.

## External cross-check
Linearizability gives a useful requirement for Nexo's coordination operations: each concurrent operation should have an effective point between invocation and response, while preserving real-time ordering. This is a correctness property for the concurrent coordination object, not evidence that an external-world effect happened. citeturn0search24turn0search25

Therefore Nexo must distinguish:
- atomicity/linearizability of its coordination state;
- truth about an external effect;
- authorization to perform or release work.

One cannot substitute for another.

## Boundary decision 1 — Operation
An Operation identifies the requested logical action and its immutable request fingerprint.
Minimum identity: operation_id, request_fingerprint, requested scope, creation/expiry metadata, and parent/child relation where applicable.
An Operation does not itself prove authorization, execution, or success.

## Boundary decision 2 — EffectBinding
EffectBinding is immutable for the admitted operation.
Minimum identity: effect_id/effect_key, operation_id, target/resource identity, target fingerprint, normalized-parameters fingerprint, expected preconditions, expected effect, idempotency/replay policy, and reversibility/compensation metadata.
A new operation_id cannot silently reuse unresolved evidence from another effect identity.

## Boundary decision 3 — AuthorityContext
Authority is versioned and epoch-fenced.
Minimum identity: authority_epoch, authorization basis, authorized scope, policy_version, invariant_version, expiry, and revocation state.
Material authority revocation invalidates active admission/release authorization. A stale owner cannot recover authority from a checkpoint, lease, process restart, or cached token.

## Boundary decision 4 — EvidenceRecord
Evidence is not world truth.
Minimum identity: evidence_id, operation_id, effect_id, target fingerprint, observed state/value, observation timestamp, freshness deadline, provenance chain, observer identity, observer dependency closure, trust-root versions, policy/invariant versions, dependency-graph version, and authority epoch.
Lifecycle: OBSERVED -> VALID; or OBSERVED/VALID -> STALE | INVALIDATED.
Observation may create OBSERVED evidence. Only an explicit verification transition can create VALID evidence.
A lease expiring does not automatically erase otherwise valid evidence. Release eligibility must re-evaluate freshness, identity, versions, authority and dependency closure.

## Boundary decision 5 — ControlLease
Ownership and evidence are separate.
Use distinct coordination domains: execution lease, recovery lease, reconciliation lease.
The lease proves current coordination ownership only.
Lease expiry does NOT prove that the external effect did not happen, cancellation succeeded, the world is unchanged, or previous evidence is false.
Recovery and reconciliation ownership remain mutually exclusive for the same critical operation while either is actively coordinating unresolved state.

## Boundary decision 6 — ReleaseEligibility
Do not store release eligibility as an authoritative boolean.
Derive it from current state:
1. Operation is in a release-eligible lifecycle state.
2. Exact EffectBinding matches the evidence.
3. Evidence is VALID and fresh.
4. Evidence provenance and dependency closure satisfy required assurance.
5. Evidence authority/policy/invariant/dependency versions are current.
6. Current authority is valid and not revoked.
7. No active STOP/revocation fence invalidates the operation.
8. Required recovery/reconciliation obligations are satisfied.
9. Coordination ownership, if required for the transition, is current and correctly fenced.
10. No unresolved critical UNKNOWN/PARTIAL external effect remains.
A cached release-authorized flag is not durable authority and must be recomputable after restart.

## Boundary decision 7 — Linearization points
The canonical model must identify atomic transition points for at least: recovery lease acquisition/release, reconciliation lease acquisition/release, authority revoke, emergency stop, effect admission, release authorization, and commit.
This is required to make concurrency scenarios precise. It does not make the external-world effect itself linearizable.

## New adversarial obligations
A. Recovery lease expires while VALID evidence remains fresh: new owner may take coordination; evidence is not automatically converted to UNKNOWN.
B. Recovery lease expires while evidence is stale: release remains blocked.
C. Reconciliation completes, then its lease expires: evidence remains durable; ownership disappears; a later recovery owner must revalidate current evidence before release.
D. Authority is revoked after evidence verification: evidence may remain historically valid; current release authorization is invalidated.
E. Policy/dependency graph changes after evidence verification: evidence requires revalidation if the change is material to the protected claim.
F. Two owners concurrently acquire the same lease: at most one acquisition may linearize successfully.
G. Old owner acts after takeover: operation must be rejected by generation/token fencing.
H. STOP races with release: there must be a single ordering point; if STOP linearizes first, release cannot take effect.

## Important correction to the first canonical sketch
The first sketch incorrectly made a current recovery lease a direct prerequisite for ReleaseEligible. That conflates coordination ownership with the truth of already-reconciled evidence.
The corrected architecture is: recovery/reconciliation ownership permits a state transition, while EvidenceRecord + AuthorityContext + EffectBinding + Dependency/Safety Context determine whether the transition is substantively justified.
A release transition may require a current recovery owner as an execution/coordination guard, but that is different from the evidence being valid.

## Status
This is a design audit, not implementation.
SANY/TLC: NOT RUN.
Runtime tests: NOT RUN.
Formal equivalence: NOT CLAIMED.
Next canonical task: rewrite the TLA+ core with separate ExecutionLease/RecoveryLease/ReconciliationLease records, durable EvidenceRecords, explicit version invalidation, and named linearization points before deriving executable evaluator changes.