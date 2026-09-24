# NEXO — G-A14-01 PROTECTED-STORE FAILURE SEMANTICS — RESEARCH / PROTOCOL DELTA V1 — 2026-09-24

Status: FEASIBILITY / PROTOCOL RESEARCH
Scope: G-A14-01 only
Implementation: NOT STARTED
Technology selection: NOT STARTED
SANY/TLC: NOT EXECUTED
Architecture predecessors modified: NONE

## 0. Purpose

This artifact attacks G-A14-01 from the semantic layer first.

It does not select PostgreSQL, Raft, etcd, Kafka, Redis, cloud storage, language, framework, or any other concrete technology.

The question is not merely whether protected state can survive a crash. The question is whether the protected store can fail, recover, partition, roll back, or lose part of its durable representation without allowing a previously consumed authority, fence, operation identity, decommission state, STOP state, or safety context to become valid again.

Core separation retained throughout:

- durable internal record != external-world truth;
- internal commit != external effect;
- restored state != restored authority;
- durable log != evidence that the external world performed an effect;
- timeout != external non-effect;
- snapshot authenticity != snapshot freshness/currentness.

## 1. Source basis

NIST SP 800-160 Rev. 1 treats trustworthy-system engineering as a lifecycle discipline spanning architecture, implementation, integration, verification and validation. NIST SP 800-160 Vol. 2 Rev. 1 treats cyber-resiliency as the ability to anticipate, withstand, recover from and adapt to adverse conditions. These support treating recovery and failure semantics as architectural properties rather than infrastructure afterthoughts.

NIST SP 800-193 provides a particularly relevant anti-rollback principle: recovery mechanisms must protect critical state, detect unauthorized changes, and prevent unauthorized rollback to an earlier authentic but unsafe version. Its guidance also illustrates a broader point relevant here: an authentic older state is not necessarily an acceptable current state.

The Raft paper provides a concrete distributed-systems example of the commit/no-response problem: a command may be committed before the client receives the response, causing a retry; unique command serial numbers and retained prior responses are used to prevent duplicate state-machine execution. Raft also distinguishes replicated-state-machine consistency from external-world effect semantics.

These sources support the problem framing; they do not by themselves prove a Nexo implementation.

## 2. Definition: protected store is authoritative only for protected internal state

The protected store is authoritative when, for the safety-relevant internal state under its ownership, there is exactly one admissible current state/ordering for protected decisions and stale or conflicting representations cannot independently authorize a protected transition.

It is NOT authoritative over:

- whether an external provider actually performed an effect;
- whether a physical target changed;
- whether an external cancellation succeeded;
- whether the external world currently matches an internal expectation.

Therefore:

PROTECTED STORE AUTHORITY
!= WORLD AUTHORITY

The store may authoritatively say:
operation E1 was admitted under authority epoch 11.

It may not infer:
the world definitely executed E1.

## 3. Minimum P0 state

The previous P0/P1/P2 classification is retained, but G-A14-01 requires a sharper rule.

P0 is not "everything important."

P0 is the minimum state whose regression, substitution, or loss could cause a stale actor or restored snapshot to regain a safety-relevant capability.

At minimum, P0 must cover the current protected state or an equivalent protected derivation for:

1. Identity status and identity epoch.
2. Authority status, scope, issuer/context and authority epoch.
3. Operation identity and lifecycle for all unresolved or safety-relevant operations.
4. EffectBinding identity and immutable effect fingerprint.
5. Coordination owner/generation/fence for every protected scope.
6. STOP state and STOP epoch.
7. Recovery fence/epoch and recovery ownership state.
8. VersionSet/policy/invariant safety context required for current admission.
9. External effect state sufficient to preserve UNKNOWN/PARTIALLY_APPLIED.
10. Decommission state and anti-resurrection state.
11. Required evidence validity/invalidation state where that state gates release.
12. Migration/schema compatibility state whenever incompatible representations coexist.
13. The protected durable ordering/history needed to establish the above.
14. A current anti-rollback witness or equivalent mechanism for detecting/regarding stale restoration.

P1 may contain operationally durable information used for recovery and reconciliation, but P1 cannot independently grant authority.

P2 may be reconstructed and must never become an authority source merely because it was restored.

## 4. Central finding: rollback resistance is not the same as durable storage

A durable WAL, transaction log, snapshot, or replicated database can provide durability and recovery semantics without, by itself, proving that a restored image is newer than every state previously accepted by the protected system.

Therefore:

DURABLE != NON-REGRESSIVE

A snapshot may be:
- authentic;
- internally consistent;
- cryptographically intact;
- successfully restored;

and still be safety-invalid because it predates a consumed authority epoch, fence, STOP epoch, decommission closure, or effect identity decision.

This is the principal G-A14-01 finding.

## 5. Required concept: non-regression / anti-resurrection state

The architecture needs an explicit concept stronger than ordinary durable state:

PROTECTED MONOTONICITY ANCHOR (PMA)

A PMA is a safety-relevant state element or independently protected witness whose accepted value cannot be rolled back without the protected system detecting that regression and refusing protected release.

The PMA does not need to be one global counter.

It may be scoped by:

- identity;
- authority domain;
- coordination scope;
- operation/effect;
- recovery scope;
- VersionSet/update domain;
- decommission domain;
- migration domain.

The exact concrete realization remains OPEN.

### 5.1 What must be monotonic or non-regressive

The following semantic facts require monotonic protection:

A. Identity lifecycle
ACTIVE -> FENCED/REVOKED/DECOMMISSIONED cannot regress to ACTIVE from an older restore.

B. Authority epoch
An older authority epoch cannot regain current validity after a newer protected epoch has been accepted.

C. Coordination generation/fence
An older owner/generation/fence cannot pass the current protected fence.

D. STOP epoch/state
A later STOP state cannot be silently cleared by restoring an earlier state.

E. Recovery epoch
An old recovery owner/fence cannot become current after a newer recovery transition.

F. VersionSet safety floor
A state known to require a newer safety context cannot silently return to an older incompatible context.

G. Operation/effect identity
A consumed operation/effect identity cannot be forgotten in a way that makes the same semantic effect appear to be a new unknown operation.

H. UNKNOWN
UNKNOWN cannot be erased merely because the internal store was restored to a point before the UNKNOWN was recorded.

I. Decommission closure
A closed identity/scope cannot be resurrected by stale state.

J. Evidence invalidation
A context change that invalidated evidence cannot be forgotten by rollback if that evidence could then satisfy a current release.

The semantic requirement is not that every integer only increases forever. The requirement is:

NO ACCEPTABLE RECOVERY MAY RE-ENABLE A SAFETY-RELEVANT STATE THAT WAS ALREADY SUPERSEDED, CONSUMED, FENCED, REVOKED, CLOSED, OR INVALIDATED.

## 6. The critical counterexample

Consider:

S0:
authority=A
authority_epoch=10
fence=F10
operation=E1 admitted
STOP=0

S1:
authority=A
authority_epoch=11
fence=F11
operation=E1 remains tracked
STOP=1

A failure restores an authentic snapshot of S0.

If S0 is accepted as current without an independent non-regression check, then:

- authority epoch 10 may become current again;
- F10 may become usable by a stale actor;
- STOP may disappear;
- the system may forget that E1 was already admitted;
- a retry may be interpreted under stale state;
- a decommission or revocation that occurred after S0 may disappear.

This is a semantic safety failure even if the snapshot is authentic and internally consistent.

Therefore:

AUTHENTIC SNAPSHOT + INTERNAL CONSISTENCY
does not imply
CURRENT SAFE STATE.

## 7. Why epochs alone are insufficient

An epoch prevents stale actors only if the current epoch itself cannot be rolled back.

If the same rollback-prone store contains:

epoch=11

and can later be restored to:

epoch=10

then the epoch mechanism has not failed mathematically; the persistence boundary has allowed the system to forget the epoch advancement.

Therefore:

EPOCH != ANTI-ROLLBACK BY ITSELF

The same applies to:
- generation;
- sequence;
- fence;
- transaction ID;
- command ID.

They establish ordering/identity only to the extent that the protected protocol preserves or independently validates their currentness.

## 8. Why command IDs are necessary but insufficient

The Raft model demonstrates the commit/no-response problem: a committed command can be executed before the client learns the result, so retry must not create a second state-machine execution.

Nexo therefore requires:

operation_id = logical operation identity
effect_key = semantic external-effect identity
attempt_id = execution attempt identity, if needed

and:

NEW ATTEMPT != NEW EFFECT

However, command identity only prevents duplicate protected interpretation if the identity history survives recovery.

If a rollback causes the system to forget that operation E1 was already admitted, a new attempt can appear new.

Therefore command IDs require durable/non-regressive identity history.

And even that does not establish external idempotency: the provider must either preserve effect identity or reconciliation must resolve the external state before a retry can be admitted.

## 9. Failure matrix

### F01 — Crash before protected commit

Before:
transition has been validated but not linearized.

Required result:
- no protected postcondition may be assumed;
- actor receives failure/unknown protocol response, not success;
- retry must revalidate current state;
- no new authority is inferred from the failed attempt.

Durable state:
pre-transition state or protocol-defined intermediate state.

External truth:
unknown unless an external attempt had already crossed the effect boundary.

Classification:
DESIGNED semantically.

### F02 — Crash during protected commit

Before:
transition is in the process of linearization.

Required result:
after recovery, the store must resolve to one of:
- transition not committed;
- transition committed;
- quarantined/indeterminate state requiring recovery.

It must not produce two incompatible current histories.

Classification:
DESIGNED semantically; concrete atomicity OPEN.

### F03 — Crash after commit, before response

Required result:
the committed transition remains authoritative after recovery.

Retry with the same operation/effect identity must not create a second protected effect.

The prior result should be recoverable from protected history where required.

This is the exact class addressed by command identity in Raft.

Classification:
DESIGNED; concrete mechanism OPEN.

### F04 — Loss of quorum / protected availability

If current authoritative state cannot be established:

- no new safety-critical authority is granted;
- no stale replica may promote itself merely because it is available;
- protected execution enters HOLD/RESTRICT/QUARANTINE according to scope;
- UNKNOWN remains UNKNOWN;
- STOP remains blocking unless current safe release can be established.

Availability loss is not permission to guess.

Classification:
DESIGNED semantically; mechanism OPEN.

### F05 — Network partition

A disconnected actor cannot extend authority merely from cached state.

If current epoch/fence/VersionSet cannot be validated:
protected admission is denied or held.

Classification:
DESIGNED.

### F06 — Stale replica

A stale replica may support non-authoritative reads only if explicitly classified.

It cannot grant current authority.

If used for recovery, its staleness must be detected or the resulting state must remain quarantined.

Classification:
DESIGNED.

### F07 — Corruption

If protected state fails integrity validation:

- do not interpret corrupted values as current authority;
- enter HOLD/QUARANTINE;
- preserve whatever evidence of corruption exists;
- recover only from a validated compatible state;
- validate anti-rollback/currentness before release.

Classification:
DESIGNED; concrete recovery mechanism OPEN.

### F08 — Storage rollback

This is the critical case.

If an older authentic state is restored:
- compare against PMA/currentness evidence;
- if freshness/currentness cannot be established, do not release protected execution;
- do not restore authority merely because the snapshot is authentic;
- preserve UNKNOWN and anti-resurrection constraints.

Classification:
REWORK required at architecture-contract level; mechanism OPEN.

### F09 — Old snapshot restore

Same as storage rollback.

An old snapshot may be useful as reconstruction input but is not automatically an authoritative state.

Restoration must be split:

RESTORE DATA
!=
RESTORE AUTHORITY

Classification:
DESIGNED with new explicit contract; implementation OPEN.

### F10 — Partial restoration

Examples:
- authority restored but history missing;
- history restored but current authority missing;
- index restored but object state missing;
- STOP state restored but fence state missing.

Required rule:
if a safety-critical dependency is missing or inconsistent, protected release is blocked.

No partial restoration may be treated as a complete current state.

Classification:
DESIGNED.

### F11 — Recovery after partition

Rejoining state must not automatically regain authority.

Recovery requires:
identity validation
+ current fence
+ current authority
+ VersionSet compatibility
+ STOP state
+ unresolved-effect reconciliation
+ recovery release.

Classification:
DESIGNED.

### F12 — Concurrent writes

Two protected writers must not both establish incompatible current state.

The store must provide an actual protected ordering/atomicity mechanism appropriate to the transition.

Application-level locking without a proof of crash/partition semantics is insufficient.

Classification:
OPEN at mechanism level.

### F13 — Partial durability

If only part of a transition survives, the recovery protocol must not infer the missing part.

A transition is either durably established according to its contract or treated as unresolved/quarantined.

Classification:
DESIGNED semantically; concrete durability contract OPEN.

### F14 — Index survives, state lost

The index cannot become authority by itself.

Object/state reconstruction must verify integrity, version, identity, and currentness.

Otherwise:
HOLD/QUARANTINE.

Classification:
DESIGNED.

### F15 — State survives, index lost

The state cannot be assumed current merely because objects exist.

Rebuild requires protected validation of:
identity;
epochs;
fences;
operation/effect identity;
STOP;
VersionSet;
decommission;
UNKNOWN.

Classification:
DESIGNED.

### F16 — Recovery with old epochs/fences

An old epoch/fence is never upgraded merely by successful restart.

The current protected context must dominate the restored one.

Classification:
DESIGNED.

## 10. New architectural contracts

### PSC-01 — Currentness Contract

A restored protected state may be admitted as current only if:

1. integrity is valid;
2. schema/VersionSet compatibility is valid;
3. identity context is valid;
4. anti-rollback/currentness is established;
5. all required P0 dependencies are present;
6. no newer protected state is known or detectable;
7. no blocking UNKNOWN/STOP/recovery fence is lost;
8. required reconciliation is complete.

If any condition is not established:

CURRENTNESS = UNKNOWN
and protected release = BLOCKED.

### PSC-02 — Authority Non-Regression Contract

For every protected authority domain D:

accepted_current_epoch(D) may not regress to an earlier value in an admissible state.

If a recovery input proposes an older value:

REJECT_OR_QUARANTINE.

The contract does not require a globally increasing clock or global counter.

### PSC-03 — Fence Non-Regression Contract

For every protected coordination scope:

a fence/generation that has been superseded cannot become current again.

Stale owners must remain rejected after recovery.

### PSC-04 — Lifecycle Non-Resurrection Contract

For every identity/scope:

DECOMMISSIONED is terminal for authority purposes.

A restored state that says ACTIVE must be rejected if a trusted non-regression witness establishes prior decommission closure.

### PSC-05 — STOP Non-Regression Contract

If a STOP epoch has been accepted, recovery cannot clear it by restoring an earlier state.

Current STOP status must be established before protected release.

### PSC-06 — UNKNOWN Preservation Contract

If an external effect is UNKNOWN, any recovery that cannot prove the UNKNOWN was resolved must preserve UNKNOWN.

Rollback, restart, timeout, new operation ID, lease expiry, snapshot restore, or provider reconnect cannot by themselves resolve it.

### PSC-07 — Identity Continuity Contract

operation_id and effect_key are immutable semantic identities.

Restoration must not cause a previously admitted semantic effect to become a new logical effect merely because its local attempt history was lost.

### PSC-08 — Partial-State Fail-Closed Contract

If a safety-relevant P0 component is missing, contradictory, stale, or unverifiable:

HOLD / RESTRICT / QUARANTINE

rather than best-effort reconstruction into an execution-enabled state.

### PSC-09 — Recovery Authority Contract

Restoration authority is not execution authority.

A recovery actor may reconstruct and reconcile state but cannot convert an uncertain restore into normal execution without the protected release protocol.

### PSC-10 — External-Truth Separation Contract

No protected-store recovery result may claim external effect completion unless the external-effect evidence/reconciliation contract independently supports that claim.

## 11. Important negative result

G-A14-01 cannot be completely solved by selecting a better database alone.

Reason:

If every copy of the supposedly authoritative anti-rollback state can be rolled back to the same older state, then no database-internal comparison can distinguish:

"this is the current state"

from

"this is a valid older state that has been restored."

Therefore some form of trusted non-regression information must exist outside the rollback domain or be protected by an equivalent mechanism whose failure semantics are themselves modeled.

This is a fundamental feasibility requirement, not a vendor preference.

## 12. Candidate mechanism classes — deliberately not selected

The following classes can potentially implement parts of the contract:

1. consensus-backed replicated log/state machine;
2. transactional/serializable protected store;
3. monotonic hardware/platform-backed counter or protected metadata;
4. separate quorum/fencing witness;
5. append-only or independently protected audit/history;
6. cryptographically chained history with an independently protected currentness anchor;
7. hybrid combinations.

Important:

- consensus can provide ordering and durable replicated state but does not automatically prove external-world effects;
- a WAL can provide recovery history but does not automatically provide anti-rollback against restoration of the entire storage domain;
- cryptographic integrity can prove "this snapshot has not been modified" but not necessarily "this snapshot is the newest acceptable state";
- an independent witness can help establish non-regression but introduces another trust/failure dependency;
- a hardware monotonic primitive can protect a counter but may itself become part of the TCB and availability/recovery model.

Technology feasibility must compare these classes against A05/A06 and the full failure model before selection.

## 13. Interaction with A05/A06

### A05 authoritative-state architecture

G-A14-01 strengthens the A05 definition of P0:

P0 is not merely state that must be durable.

P0 is state whose:
- loss;
- rollback;
- substitution;
- ambiguity;
- stale restoration

could create a safety-relevant false current state.

Therefore anti-rollback/currentness evidence becomes part of the protected-state contract.

### A06 linearization

A06 requires an actual linearization point.

G-A14-01 adds:

A linearization point is not sufficient if recovery can later forget that the transition occurred.

Therefore:

LINEARIZATION
+
DURABLE COMMIT SEMANTICS
+
NON-REGRESSION RECOVERY SEMANTICS

are all required for a persistent protected transition.

## 14. Impact on A07-A11

### A07
STOP state must survive or be independently re-established after storage recovery.

### A08
Evidence invalidation cannot be forgotten by restoring an older context.

### A09
The protected store itself becomes a failure-domain dependency requiring explicit common-mode analysis.

### A10
Any anti-rollback witness becomes part of the TCB for claims depending on non-regression.

### A11
The existing conceptual PASS for storage rollback is strengthened from:
"older epoch must not regain authority"
to:
"the architecture must define how an older authoritative representation is detected/rejected."

The semantic requirement was already present; the missing piece was the explicit currentness/non-regression contract.

## 15. New counterexamples added

CE-G01 — Authentic old snapshot resurrects revoked authority.

CE-G02 — Old snapshot clears STOP.

CE-G03 — Old snapshot resurrects decommissioned identity.

CE-G04 — Old snapshot forgets consumed effect identity and permits duplicate admission.

CE-G05 — Old snapshot forgets UNKNOWN and allows retry as if no external attempt occurred.

CE-G06 — Stale replica promoted during quorum loss.

CE-G07 — Index restored without object state causes false currentness.

CE-G08 — Object state restored without protected index/history causes false currentness.

CE-G09 — Recovery actor treats successful storage restoration as successful recovery release.

CE-G10 — Epoch exists but its durable storage rolls back, defeating stale-actor rejection.

CE-G11 — Cryptographically valid snapshot is older than the current protected state.

CE-G12 — Audit log says a newer state existed, but the authority decision path ignores the log and uses the older snapshot.

## 16. New invariant candidates

These are DESIGN candidates, not formally verified invariants.

INV-PS01 — Accepted protected current state cannot regress to a previously superseded safety state.

INV-PS02 — A stale restored epoch cannot become current authority.

INV-PS03 — A superseded coordination fence cannot become current.

INV-PS04 — Restoring an older state cannot clear an accepted STOP epoch.

INV-PS05 — Restoring an older state cannot resurrect decommissioned authority.

INV-PS06 — Restoring an older state cannot erase unresolved UNKNOWN.

INV-PS07 — Restoring an older state cannot create a new semantic effect identity for an already tracked effect.

INV-PS08 — Missing or contradictory P0 state prevents safety-critical release.

INV-PS09 — Successful restoration of storage does not imply successful recovery of authority.

INV-PS10 — Internal durable commit does not imply external effect completion.

INV-PS11 — Authenticity of a recovery image does not imply currentness of that image.

INV-PS12 — A protected linearization remains safety-relevant across crash/restart and cannot be semantically undone by stale restoration.

## 17. Status matrix

| Item | Status | Reason |
|---|---|---|
| Definition of protected-store authority | CLOSED_DESIGN | Explicitly separated from external-world authority |
| Minimum P0 semantics | CLOSED_DESIGN | Safety-critical state classes identified |
| Crash before commit | CLOSED_DESIGN | Required semantic outcome defined |
| Crash during commit | CLOSED_DESIGN / mechanism OPEN | Recovery outcome constrained; concrete atomicity remains open |
| Commit then crash before response | CLOSED_DESIGN | Command/effect identity continuity required |
| Quorum loss | CLOSED_DESIGN / mechanism OPEN | Fail-closed semantics defined |
| Partition | CLOSED_DESIGN | Cached authority cannot become current |
| Stale replica | CLOSED_DESIGN | Non-authoritative unless currentness established |
| Corruption | CLOSED_DESIGN | Quarantine/recovery contract defined |
| Storage rollback | REWORK | Explicit anti-rollback/currentness contract added |
| Old snapshot | REWORK | Restoration explicitly separated from authority restoration |
| Partial restoration | CLOSED_DESIGN | Missing P0 blocks release |
| Concurrent writes | OPEN | Concrete atomicity/linearization mechanism unresolved |
| Partial durability | CLOSED_DESIGN / mechanism OPEN | Semantic requirement defined |
| Index/state mismatch | CLOSED_DESIGN | Neither independently grants authority |
| Old epoch/fence recovery | CLOSED_DESIGN | Non-regression contract defined |
| Anti-rollback mechanism | OPEN | Concrete mechanism intentionally not selected |
| TLA+ verification | OPEN | SANY/TLC not executed |
| Runtime proof | OPEN | Implementation does not exist |
| Fault injection | OPEN | Planned later under G-A14-14 |

Overall G-A14-01:
**SEMANTIC CONTRACT: SUBSTANTIALLY DESIGNED**
**CONCRETE PROTOCOL: OPEN**
**TECHNOLOGY FEASIBILITY: OPEN**
**FORMAL VERIFICATION: OPEN**
**IMPLEMENTATION: NOT STARTED**

Therefore G-A14-01 is NOT CLOSED as an implementation/verification gate.

## 18. Mini-audit against A01-A14

No contradiction found with the central A01-A14 distinctions.

Confirmed compatible:

- Information != capability != authority != effect != evidence.
- Authority != coordination != world truth.
- Durable history != current authority.
- Internal commit != external effect.
- STOP != external cancellation.
- Checkpoint != authority.
- Rollback != reversal.
- Evidence != truth.
- UNKNOWN is preserved.
- Decommission is anti-resurrection.
- Recovery cannot self-authorize.
- VersionSet context remains binding.
- P0 remains minimal rather than becoming a general database.
- A12 safety invariants remain directionally consistent.
- A13 storage topology explicitly required failure semantics and snapshot compatibility.
- A14 correctly listed anti-rollback and protected-store semantics as open.

New result:
A14's G-A14-01 is not invalidated; it is refined.

The new refinement is:

A14-01:
"Exact protected-store failure semantics must be selected."

becomes:

G-A14-01a:
"Protected-store semantic failure contract and non-regression requirements are now defined."

G-A14-01b:
"Concrete protected-store protocol and anti-rollback mechanism remain OPEN."

This preserves the distinction between design and feasibility.

## 19. What remains open after this research

1. Which concrete mechanism can provide the required protected linearization?
2. Which mechanism can establish non-regression across the relevant failure domain?
3. Can the anti-rollback witness survive the same failures as the primary store without creating an unbounded new TCB?
4. What happens if the anti-rollback witness is unavailable?
5. What happens if primary store and witness disagree?
6. What is the exact quorum/loss-of-quorum policy?
7. What durability level is required for each protected transition?
8. How are snapshots/version compatibility verified?
9. How is recovery itself fenced against stale storage?
10. How does migration preserve the non-regression contract?
11. How is the resulting protocol represented in the concrete TLA+ model?
12. How is implementation linearizability tested?
13. How are crash/rollback/partial-write scenarios fault-injected?

## 20. Next step

Do NOT move automatically to G-A14-02.

First perform the required mini-audit and, if accepted, begin a focused technology-neutral feasibility comparison of the candidate mechanism classes for G-A14-01.

The next research question should be:

"Which mechanism classes can satisfy PSC-01 through PSC-10 under crash, partition, quorum loss, rollback, corruption, and recovery, and what new trust assumptions does each introduce?"

Only after that comparison should concrete technology selection be considered.

## 21. Continuity / preservation

This artifact is intentionally a NEW file.

It does not modify:
- A12;
- A13;
- A14;
- A05/A06;
- A07-A10;
- A11;
- earlier research/formal artifacts.

Any future correction must create a new versioned delta or a new artifact rather than silently replacing this record.

## Final gate

G-A14-01:
**DESIGNED SEMANTICS — NOT IMPLEMENTED — NOT FORMALLY VERIFIED — NOT CLOSED**

The key architectural result is:

**Durability is necessary but insufficient.**
**Protected authority requires non-regressive currentness.**
**Restoration can reconstruct data without restoring authority.**
**An authentic old state is still an old state.**

That distinction is now explicit and traceable.
