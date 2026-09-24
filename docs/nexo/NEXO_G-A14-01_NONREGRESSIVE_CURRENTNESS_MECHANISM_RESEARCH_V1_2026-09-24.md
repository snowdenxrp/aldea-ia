# NEXO — G-A14-01 Non-Regressive Currentness Mechanism Research V1 — 2026-09-24

Status: FEASIBILITY / PROTOCOL RESEARCH
Scope: G-A14-01 only
Implementation of Nexo: NOT STARTED
Technology selection: NOT FINAL
Predecessor artifacts modified: NONE

## 1. Objective

Determine what classes of mechanisms can establish a non-regressive currentness witness when the primary protected store, replicas, snapshots, logs, and recovery media may fail or roll back together.

The study remains technology-neutral at the Nexo architecture level. Existing systems are evidence about mechanisms, not automatic architectural choices.

## 2. Primary observations

### 2.1 Storage-local monotonicity is not automatically global monotonicity

etcd/raft rejects an incoming snapshot that is older than the storage snapshot already held by that storage abstraction. This is useful local protection, but it does not prove that an independently restored copy of the entire storage domain cannot be older than a previously accepted protected state.

etcd recovery can bump revisions and mark revisions compacted, explicitly creating a semantic discontinuity for clients/caches after restore. This supports treating recovery as a timeline transition rather than a byte-for-byte continuation. However, the revision mechanism belongs to etcd's own semantic domain and is not by itself a generic Nexo authority witness.

### 2.2 Database recovery can intentionally branch history

PostgreSQL PITR explicitly creates a new timeline after archive recovery. A restored state can therefore be authentic and internally consistent while belonging to a different historical branch. This is a strong precedent for separating storage lineage from current authority lineage.

### 2.3 Hardware/platform monotonic counters can provide replay detection, but only within their own trust/failure model

Intel documentation describes monotonic counters as a mechanism for detecting replay of older protected data. The same documentation also describes cases where counter state can be lost/reset and requires the application to handle unexpected counter loss. Intel SGX Platform Services historically used replay-protected storage for counter state; corruption or loss of the underlying protection could invalidate the counter database and cause counters to be lost.

Therefore a hardware counter is not automatically a permanent universal witness. Its reset/loss semantics must be incorporated into the protocol.

### 2.4 Remote/centralized witnesses trade independence for dependency

Intel has documented remote/centralized trusted sources as a workaround where local trusted time/counter facilities are unavailable. This demonstrates a viable class of architecture, but it introduces a dependency whose compromise, rollback, availability and common-mode relationships must be modeled.

## 3. Mechanism classes

### M1 — Primary-store epoch/generation

Example: increment an epoch on recovery or leadership transition.

Guarantee:
- useful for stale actors when the epoch itself is protected.

Failure:
- if the same store can be rolled back, the epoch can roll back too.

Conclusion: insufficient alone against whole-domain rollback.

### M2 — Replicated consensus state

Guarantee:
- quorum ordering and protected linearization can be strong.

Failure:
- if every replica, snapshot and recovery artifact can be restored to an older mutually consistent state, consensus cannot distinguish that historical state from the current state without an additional surviving fact.

Conclusion: strong ordering mechanism, not automatically an independent anti-rollback witness.

### M3 — Snapshot/revision discontinuity

Guarantee:
- invalidates stale clients/caches and makes recovery branching explicit.

Failure:
- the new revision itself must be protected from rollback.

Conclusion: necessary/useful recovery mechanism, insufficient as sole witness unless its root is independently protected.

### M4 — Hardware/platform monotonic counter

Guarantee:
- can detect replay when the counter survives independently of replayable application storage.

Failure:
- counter loss/reset, platform replacement, firmware/root-of-trust changes, availability and performance limits must be handled explicitly.

Conclusion: promising witness class where a suitable trusted primitive exists; not universal and not automatically permanent.

### M5 — Independent remote witness

Guarantee:
- can preserve currentness outside the primary failure domain.

Failure:
- witness availability, compromise, rollback, equivocation, trust-root compromise and common-mode dependencies.

Conclusion: promising but becomes an explicit dependency and potentially part of the relevant TCB for claims that rely on it.

### M6 — Independent append-only log / transparency-style witness

Guarantee:
- can establish that a state/version was observed or registered in an external history.

Failure:
- registration alone does not necessarily prove that the current state is the latest admissible state unless the protocol defines freshness and omission/equivocation handling.

Conclusion: potentially useful evidence/currentness layer, but must not be confused with authority by itself.

### M7 — Hybrid witness

Candidate form:

protected replicated state
+ recovery lineage
+ independent currentness witness
+ fencing
+ fail-closed recovery
+ application operation/effect identity

Conclusion: currently the strongest architecture class observed, but still a candidate rather than a final design.

## 4. Adversarial matrix

| Failure | Store epoch | Consensus | Snapshot revision | Hardware counter | Remote witness | Required behavior |
|---|---|---|---|---|---|---|
| Primary crash | Usually survives if durable | Strong if quorum survives | Recoverable | Independent if available | Independent | recover + verify |
| Stale snapshot | May regress | May reject locally | Can invalidate old revisions | Detects replay if bound correctly | Can detect older version | quarantine |
| Whole-domain rollback | Regresses | May regress together | Regresses | Can detect if independent | Can detect if independent | no authority |
| Replica stale | stale | quorum can exclude | stale | independent | independent | fence stale actor |
| Witness unavailable | N/A | N/A | N/A | N/A | unavailable | fail closed for claims requiring witness |
| Witness rollback | possible | possible | possible | depends on primitive | possible | treat currentness as UNKNOWN |
| Witness compromised | compromised | compromised | compromised | compromised | compromised | invalidate dependent claims / enter recovery |
| Recovery branch | ambiguous | historical branch | explicit branch possible | must bind branch | can record branch | new recovery lineage |

## 5. Critical derived rule

A currentness witness is useful only if at least one fact needed to distinguish the current protected safety state from an older state survives the failure domain capable of rolling back the protected store.

Formally, if:

P = primary protected state
W = currentness witness

and the adversary/failure can restore both P and W to an earlier jointly consistent state, then W provides no anti-rollback information against that failure.

Therefore:

INDEPENDENCE MUST BE DEFINED BY FAILURE DOMAIN, NOT BY PROCESS/DEVICE COUNT.

This is a direct continuation of A09.

## 6. Witness failure semantics

The witness must have an explicit state model:

AVAILABLE_AND_CURRENT
AVAILABLE_BUT_STALE
UNAVAILABLE
INCONSISTENT_WITH_PRIMARY
COMPROMISED_OR_UNTRUSTED
RESET/REINITIALIZED

Only AVAILABLE_AND_CURRENT may satisfy a currentness gate.

All other states must prevent protected release unless another independently sufficient path proves currentness.

A witness reset must NOT be interpreted as a fresh clean slate. It is a discontinuity requiring recovery/re-establishment of trust.

## 7. TCB consequence

A witness does not automatically enter the entire Nexo TCB.

Instead, it enters the dependency/TCB boundary for every safety claim whose proof depends on its currentness assertion.

This preserves the A10 principle of claim-specific TCB while preventing a hidden dependency from being treated as external and irrelevant.

## 8. New invariants

### INV-G14-01-19 — Whole-domain rollback

If all state used to establish currentness can regress together, the system MUST NOT claim currentness from those states alone.

### INV-G14-01-20 — Witness failure fail-closed

If required currentness evidence is unavailable, stale, inconsistent, reset or untrusted, protected release MUST remain blocked.

### INV-G14-01-21 — Witness reset is not freshness

Reset/reinitialization of a currentness witness MUST NOT itself authorize previously protected state.

### INV-G14-01-22 — Recovery creates lineage discontinuity

A recovery that cannot prove continuity with the previously authoritative timeline MUST enter a distinct recovery lineage and remain non-authoritative until explicitly admitted.

### INV-G14-01-23 — Independence is failure-domain based

Two mechanisms MUST NOT be considered independent merely because they are different processes, replicas, products or services if a common failure can roll them back or compromise them together.

### INV-G14-01-24 — Currentness is claim-scoped

A witness may support a specific claim without automatically establishing truth, authority, or external effect completion.

## 9. Counterexamples retained

CE-NRC-01: all replicas restore to an older consistent snapshot; consensus reports a perfectly valid historical state.

CE-NRC-02: epoch is stored only inside the rollbackable store; epoch returns from 11 to 10.

CE-NRC-03: witness and primary share the same backup administrator and backup set; both roll back together.

CE-NRC-04: hardware counter is reset/lost; system treats zero as a new trusted beginning.

CE-NRC-05: remote witness is unavailable; system treats timeout as evidence that primary state is current.

CE-NRC-06: witness says version 11 existed, but primary restored to version 10 and the protocol incorrectly treats existence as proof of current state.

CE-NRC-07: witness is compromised and signs a fabricated higher epoch; monotonicity without trusted identity is insufficient.

CE-NRC-08: recovery creates a new branch but old actors continue using credentials/fences from the pre-recovery lineage.

## 10. Status by mechanism

M1 primary epoch: REJECTED as sole solution.

M2 consensus: DESIGNATED as a possible linearization/storage layer, not sole anti-rollback solution.

M3 revision/timeline discontinuity: DESIGNATED as a recovery semantic, not sole witness.

M4 hardware monotonic primitive: OPEN / promising where available; failure/reset semantics unresolved.

M5 remote witness: OPEN / promising; dependency and common-mode model unresolved.

M6 independent log: OPEN; freshness and omission semantics unresolved.

M7 hybrid: DESIGNATED as the leading architecture class, not a final architecture.

## 11. Coherence audit against A01-A14

No contradiction identified.

A05 is strengthened: authoritative topology must include a currentness/non-regression gate.

A06 is strengthened: linearization must be meaningful across recovery and cannot depend on a state that recovery can silently rewind.

A07 is strengthened: recovery cannot release authority when currentness is UNKNOWN.

A08 is strengthened: a witness statement is evidence for a currentness claim, not world truth.

A09 is directly reinforced: independence is a failure-domain property.

A10 is refined: witness dependencies belong in claim-specific TCB analysis.

A11 is expanded with whole-domain rollback, witness reset, witness loss and recovery-lineage interleavings.

A12 remains the formal boundary; the witness state and failure semantics will need formalization before implementation.

A13 remains deployment mapping; deployment independence must be defined by actual common-mode failure domains.

A14 remains the completeness audit; G-A14-01 stays open.

## 12. Decision

G-A14-01 is NOT CLOSED.

The research has reduced the unresolved design space to mechanisms that can provide a fact outside the rollback domain of the primary protected store, or to a protocol that deliberately refuses authority when such a fact is unavailable.

The strongest current candidate is a hybrid, but the exact witness mechanism is intentionally undecided.

Do not proceed to G-A14-02 yet.

## 13. Next research step

Study the strongest remaining witness classes in depth:

1. TPM 2.0 monotonic/NV state and its actual reset/authorization semantics;
2. hardware-backed replay-protected storage and its failure/reset behavior;
3. remote witness protocols and their consistency/availability tradeoffs;
4. append-only/transparency-style witnesses and freshness/omission problems;
5. recovery lineage protocols;
6. exact TCB/common-mode consequences.

For each, study both primary specifications and real implementation code where available.

Do not select technology for Nexo until the semantic comparison is complete.
