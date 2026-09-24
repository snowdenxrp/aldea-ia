# NEXO DEEP RESEARCH DELTA — EVIDENCE / CONCURRENCY / TRUST / RECOVERY
Date: 2026-09-23

## Purpose
Deep research pass before canonical architecture consolidation. This pass deliberately does not claim that the architecture is complete or formally verified.

## External technical cross-checks

### TLA+ / PlusCal
TLA+ is appropriate for specifying concurrent/distributed algorithms and TLC searches reachable state spaces for invariant violations/counterexamples. PlusCal translates algorithms to TLA+. A successful model check is evidence about the specified model, not proof that an implementation matches it.
Sources: Lamport, PlusCal tutorial; Lamport, TLC documentation / invariance checking.
Architectural consequence: separate MODEL-CHECKED, IMPLEMENTATION-TESTED, and IMPLEMENTATION-FORMAL-CORRESPONDENCE.

### Linearizability / atomic coordination
Herlihy and Wing define linearizability as requiring each concurrent operation to appear to take effect at a point between invocation and response.
Architectural consequence: recovery-owner acquisition, reconciliation-owner acquisition, release, revoke, and stop transitions need explicit atomicity/linearization points in the runtime. TLA+ atomic actions do not by themselves prove the concrete storage/CAS implementation is linearizable.

### External-effect retry / idempotency
RFC 9110 distinguishes idempotent requests from non-idempotent requests and notes that communication failure can leave the client unable to know whether an operation succeeded.
Architectural consequence: timeout/connection loss produces UNKNOWN unless exact effect reconciliation resolves the state. Automatic retry of non-idempotent effects requires an effect identity or equivalent proof that the original effect did not occur.

### Key / trust-anchor lifecycle
NIST SP 800-57 emphasizes key compromise recovery, accountability, trust-anchor authenticity, and limiting compromise blast radius.
Architectural consequence: trust-root compromise/revocation is a first-class dependency state. A cryptographically valid signature under a compromised or invalidated root is not sufficient for admission.

### Platform protection / detection / recovery
NIST SP 800-193 organizes platform resiliency around protection, detection, and recovery, including protection against unauthorized changes and secure recovery.
Architectural consequence: the safety-plane recovery path must be separately protected; rollback/recovery artifacts need their own trust and admission checks; recovery is not equivalent to restoring authority.

### Secure software development / supply chain
NIST SP 800-218 treats secure software development as a lifecycle discipline; NIST has also published a 1.2 draft.
Architectural consequence: artifact identity, provenance, builder/dependency closure, policy compatibility, and admission remain bound as a versioned System Version Set.

## New contradictions / gaps identified
1. Evidence truth vs observation: a reconciler observing a value cannot directly set verified_world_state. Observation is evidence; verification is a separate transition.
2. Evidence survival vs lease expiry: lease expiry revokes ownership, not necessarily already-valid evidence. Evidence validity instead depends on identity, generation/owner context, freshness, provenance, and current policy/dependency compatibility.
3. Generation monotonicity: generation >= 0 is not temporal monotonicity. The model must encode new_generation = old_generation + 1 on acquisition and unchanged generation on non-acquisition transitions.
4. Trust-root invalidation: a valid signature under an invalidated/compromised trust root cannot remain admissible merely because cryptographic verification succeeds.
5. Version binding: evidence produced under policy/invariant/dependency graph version V cannot automatically authorize release under incompatible V+1. Material changes must invalidate or force revalidation.
6. Cross-operation evidence: evidence must bind exact operation_id, effect_id/effect_key, target/resource identity, and expected-effect fingerprint.
7. Authority revocation: revocation must invalidate release authorization and prevent stale recovery/reconciliation owners from producing admissible evidence.
8. Stop semantics: STOP enforcement is a local/control-plane property unless external actuation cancellation is independently verified. Executor ACK alone is insufficient to prove world termination.
9. Common-mode evidence: two observers sharing the same manipulated source, trust root, clock, storage, identity provider, or dependency are not independent merely because they are separate processes.
10. Recovery snapshot: a single compromised snapshot cannot recreate independent trust/authority domains without qualification.
11. Release boolean: ReleaseEligible must be derived from current Operation, EffectBinding, AuthorityContext, EvidenceRecord, and ControlLease state; it must not depend on a cached boolean or a single worldState flag.
12. Correspondence: mapping names between executable and TLA+ artifacts is insufficient. Correspondence must bind states, transitions, guards, affected variables, prohibitions, and invalidation behavior.

## Required canonical objects
- Operation
- EffectBinding
- AuthorityContext
- EvidenceRecord
- ControlLease
- DependencyClosure / SafetyClaim
- SafetyPlane / TrustContext

## Required epistemic separation
observed_state
evidence_state
verified_world_state
external_effect_state
UNKNOWN is epistemic uncertainty; it is never interpreted as absence.

## Required release derivation
Release must require, at minimum: exact operation/effect/target binding; current authority epoch; current policy/invariant/dependency versions; valid non-expired control ownership where required; valid evidence provenance; evidence freshness; admissible dependency closure; no relevant compromised/unknown dependency; no active stop/revocation fence; reconciliation for the exact effect; sufficient verification state; and no cross-operation evidence substitution.

## Verification status
Research cross-check: DONE for this delta.
Canonical implementation: NOT YET CONSOLIDATED.
TLA+ SANY/TLC: NOT EXECUTED in this pass.
Runtime tests: NOT EXECUTED in this pass.
No claim of formal or runtime verification is made.