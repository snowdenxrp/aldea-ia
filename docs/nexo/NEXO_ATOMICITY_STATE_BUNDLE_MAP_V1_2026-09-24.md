# NEXO ATOMICITY STATE BUNDLE MAP V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. No implementation authorized.

## 1. External cross-check

NIST SP 800-160 Rev. 1 frames trustworthy systems engineering across the lifecycle and treats security/trustworthiness as a systems-engineering concern. NASA systems engineering explicitly separates implementation, integration, verification, validation and transition, and calls for functional/timing/state analysis and end-to-end integration. Therefore this map treats atomicity as a property of protected state transitions and interfaces, not as an assumption that one database transaction automatically proves system correctness. citeturn0search3turn0search0turn0search4

## 2. Atomicity vocabulary

- SAME_LINEARIZATION: state must be observed as one protected transition; partial visibility cannot create authority or safety bypass.
- DURABLE_BEFORE: the record must be durable before crossing a dangerous boundary.
- ORDERED_DURABLE: exact ordering matters, but all fields need not share one transaction.
- ASYNC_RECONCILABLE: may be written asynchronously only if stale/missing state cannot grant authority and convergence failure yields HOLD/RESTRICT/REVALIDATE.
- EXTERNAL_BOUNDARY: no local atomic transaction can make the external effect atomic; identity and UNKNOWN semantics must survive.
- RECONSTRUCTABLE: cache may be rebuilt, but reconstruction cannot create authority.

## 3. Canonical bundles

### B1 — Authorization Admission
EffectBinding identity + current AuthorityContext + PolicyBaseline + InvariantBaseline + applicable StopState + RecoveryFence + VersionSet.
Required: SAME_LINEARIZATION for authoritative acceptance. Durable before AUTHORIZED is exposed.

### B2 — Reservation / Fencing
Authorization context + EffectBinding + ControlLease generation/fence.
Required: SAME_LINEARIZATION or equivalent fencing protocol. Fence durable before actuation.

### B3 — Final Execution Gate
Current AuthorityContext + EffectBinding + ControlLease/fence + StopState + RecoveryFence + VersionSet.
Required: SAME_LINEARIZATION at final protected admission, or equivalent serialization with provable stale-actor fencing.

### B4 — External Effect Intent
EffectBinding + durable operation lifecycle + external-attempt intent/idempotency record.
Required: DURABLE_BEFORE external attempt. Does not make the external system atomic.

### B5 — External Outcome / UNKNOWN
Effect identity + external outcome state + response/observation references.
Required: ORDERED_DURABLE. Timeout/crash/partition/response loss may yield UNKNOWN; UNKNOWN cannot become NOT_APPLIED merely because local execution ended.

### B6 — Reconciliation
Exact EffectBinding + external observation + provenance + freshness + reconciliation authority + reconciliation generation.
Required: SAME_LINEARIZATION for accepting reconciliation. Competing reconcilers require fencing.

### B7 — Verification / Release Decision
Reconciled effect + EvidenceRecord set + evidence validity + current Policy/Invariant + DependencyGraph + VersionSet + relevant AuthorityContext + Stop/Recovery state.
Required: SAME_LINEARIZATION or equivalent serialization. Verification is derived, not an authority-bearing mutable flag.

### B8 — Emergency Stop
StopState + stop epoch + enforcement state/proof.
Required: SAME_LINEARIZATION for local stop admission/enforcement. External cancellation is separate and cannot be inferred from local ACK.

### B9 — Recovery Release
RecoveryFence + current AuthorityContext + StopState + reconciliation state + VersionSet + DependencyGraph + recovery-owner identity.
Required: SAME_LINEARIZATION for RELEASE_ELIGIBLE/EXPLICIT_RELEASE. Recovery ownership cannot silently become execution authority. Critical UNKNOWN blocks automatic release.

### B10 — Update Activation
Complete VersionSet + artifact/config integrity + safety gate/verifier versions + RecoveryFence + old-version fence + activation state.
Required: SAME_LINEARIZATION or equivalent stale-version fencing at activation. Signature/provenance alone is insufficient.

### B11 — Decommission Closure
Authority revocation + delegation revocation + worker termination evidence + lease closure + pending-effect reconciliation + secret handling + recovery/update-path closure + final lifecycle state.
Required: ORDERED_DURABLE plus protected final closure. External observations may require reconciliation before DECOMMISSIONED.

## 4. What may remain asynchronous

Only state that cannot grant authority or erase safety uncertainty: analytics/telemetry copies, non-authoritative caches, UI projections, planner/optimization state, convenience indexes, noncritical audit replicas and derived metrics.

Not harmlessly asynchronous: authority revocation, stop fences, active safety configuration, effect identity, critical UNKNOWN, release eligibility, decommission closure and safety-relevant evidence invalidation.

## 5. Local vs external atomicity

LOCAL ATOMICITY means a protected state transition cannot be observed as an unsafe partial transition.

EXTERNAL ATOMICITY means the external world changed exactly once/never/partially.

Nexo can directly control the first. The second requires exact effect identity, idempotency where available, external observation/acknowledgement, reconciliation and durable UNKNOWN semantics. Local commit never proves external-world success.

## 6. Cross-store decision gate

A. Single authoritative state machine/store: simpler linearization and cross-object invariants, but with scalability/availability tradeoffs.

B. Multiple authoritative stores with transactional commit: preserves partitioning, but only if transaction failure semantics actually cover every protected transition.

C. Multiple stores with fencing/epochs/idempotency/durable intent/reconciliation: can cross non-atomic boundaries, but requires formal proof that partial/stale state cannot grant authority or bypass safety.

No topology is selected yet. Selection follows the bundle map and TCB analysis.

## 7. Minimum durability classes

P0 — safety semantics: authority revocation/version context; STOP state/epochs; unresolved critical effect identity/state; decommission state; critical safety evidence.

P1 — operational control state: operation lifecycle; EffectBinding; RecoveryFence; VersionSet; Policy/Invariant baselines; delegations; migration state.

P2 — non-authoritative derived state: planner caches; optimization state; UI projections; convenience analytics.

P0 must survive restart with integrity. P1 must survive or be reconstructable without authority escalation. P2 may be reconstructed.

## 8. Rejected atomicity shortcuts

- DB commit = external effect success.
- Lease write = authorization.
- Evidence write = verification.
- Cached approval = current authority.
- Checkpoint restore = authority restore.
- Update signature = safety admission.
- Stop ACK = verified external cancellation.
- New operation_id = resolution of old UNKNOWN.
- Reconciliation owner = unrestricted execution authority.
- Persisted derived status = authoritative truth.
- Eventual consistency = safe merely because it eventually converges.

## 9. New invariants

ATOM-01: every protected transition declares its atomicity class.
ATOM-02: authority admission shares one linearization decision or an equivalent proven serialization.
ATOM-03: dangerous external boundaries require durable intent/effect identity before dispatch when duplicate ambiguity is possible.
ATOM-04: UNKNOWN is durable safety state, not a transient error.
ATOM-05: asynchronous state cannot grant authority, clear STOP, resolve UNKNOWN, or establish verified external truth.
ATOM-06: evidence acceptance/invalidation has protected ordering sufficient to prevent stale evidence from authorizing release.
ATOM-07: recovery release is atomic with current fence/authority/safety context or equivalently fenced.
ATOM-08: update activation cannot expose an incompatible VersionSet as active for protected effects.
ATOM-09: decommission closure cannot be final while unresolved authority/effect/recovery paths remain.
ATOM-10: local atomicity never implies external-world atomicity.
ATOM-11: durability guarantees are stated per variable.
ATOM-12: the chosen atomicity mechanism becomes part of the TCB wherever it affects a protected guarantee.
ATOM-13: every asynchronous dependency has an explicit stale/missing/failure consequence.
ATOM-14: cross-store protocols are modeled with crash, partition, retry, replay and stale-actor interleavings before admission.

## 10. Research result and next gate

The clean architecture must not choose a database topology first. Correct order:

state variables → protected transitions → read/write sets → atomicity bundles → failure/interleaving semantics → authoritative topology/protocol → TCB → formal model → implementation.

Architecture remains BLOCKED until all canonical variables are covered, every protected transition maps to an atomicity class, race cases map to bundle boundaries, P0/P1 durability is explicit, cross-store candidates are formally comparable, TCB consequences are known, and external reconciliation contracts are complete.

No implementation, migration or V21 runtime construction is authorized by this artifact.