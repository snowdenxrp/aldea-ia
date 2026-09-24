# NEXO — CROSS-RESOURCE ATOMICITY RESEARCH V1
Date: 2026-09-24
Status: RESEARCH / ARCHITECTURAL PRECONDITION
Implementation: BLOCKED. No V21. No runtime changes.

## 1. Research position
This round continues the sequence after external resource fencing. It studies protected effects spanning multiple external resources without assuming one universal distributed transaction mechanism.

Core distinctions:
- CONTROL_ATOMICITY != COORDINATION_ATOMICITY != EFFECT_ATOMICITY != OBSERVATION_ATOMICITY.
- PREPARED != COMMITTED != EXTERNAL_ATTEMPTED != EXTERNAL_CONFIRMED.
- COMPENSATION != UNDO != TIME REVERSAL.
- IDEMPOTENCY protects against duplicate execution; it does not itself provide cross-resource atomicity.
- INTERNAL_COMMIT != WORLD_EFFECT_SUCCESS.
- TIMEOUT != ABORT != NO_EFFECT.

## 2. Adversarial findings
### XA-01 Partial commit
A multi-resource effect can reach A=COMMITTED, B=COMMITTED, C=UNKNOWN/FAILED. This must be an explicit reconciliation state, not ordinary failure.

### XA-02 Compensation is a new protected effect
Compensation requires its own effect identity, authority, fencing/currentness, idempotency, retry and reconciliation semantics.

### XA-03 Compensation is not time reversal
Compensation can leave observations, notifications, fees, audit records or downstream effects that cannot be erased.

### XA-04 Compensation can partially fail
A compensation failure creates another partial state and must not be assumed successful.

### XA-05 PREPARED is a distinct promise
If a protocol uses PREPARED, its contract must define durability, crash recovery, conflict/fence retention and decision recovery semantics.

### XA-06 Commit decision must be durable and singular
A coordinator/recovery split must not allow incompatible decisions for the same protected transaction. Stale coordinators require fencing.

### XA-07 Participant footprint must not silently expand
If E={A,B} becomes E={A,B,C}, the new footprint requires explicit revalidation or a new protected effect identity.

### XA-08 Unknown participant outcome stays UNKNOWN
Timeout, process exit or missing response cannot prove the participant did not commit.

### XA-09 Idempotency != atomicity
Stable effect identity makes retries safer, but does not repair partial cross-resource commit.

### XA-10 External provider without idempotency
Ambiguous external effects require provider-specific reconciliation/reservation/at-most-once/non-retryable semantics as appropriate; blind retry is unsafe for non-idempotent effects.

### XA-11 Recovery is bounded
Recovery cannot use a magical undo privilege. Reconciliation and compensation remain protected effects under current safety context.

### XA-12 Compensation conflicts with concurrent effects
Compensation must participate in conflict-footprint/coordination semantics or it can invalidate later operations.

### XA-13 Semantic context can change
Historical effects may need reconciliation under a newer policy/invariant context. Historical authority must not silently become current normal execution authority.

### XA-14 Internal and external commit are separate
A local durable intent/commit cannot be interpreted as proof that the external world changed.

### XA-15 External effect can precede local recording
The provider may execute before Nexo durably records the result. Recovery therefore needs external reconciliation.

### XA-16 Provider acknowledgement is evidence, not automatic world truth
Provider responses are evidence whose trust, freshness, context and independence must be evaluated.

### XA-17 Conflicting observers
Disagreement becomes CONFLICTING_EVIDENCE/UNKNOWN or degraded assurance until resolved.

### XA-18 External history matters
Current resource state may not prove a historical effect occurred or never occurred. Where historical claims matter, external history/evidence is a separate concern.

### XA-19 Resource incarnation
Replacement of a logical resource requires a new incarnation/fencing context. Historical credentials/tokens must not automatically survive replacement.

### XA-20 Partition is not STOP
Loss of communication does not prove the remote resource stopped.

### XA-21 Cross-domain causal ordering
When STOP and external execution occur across domains, wall-clock timestamps alone cannot establish ordering. UNKNOWN_ORDER may be required.

## 3. Candidate canonical additions
Conceptual objects/properties needing architectural evaluation:
- PrepareCertificate
- TransactionContext
- ExternalEffectHistory
- ResourceIncarnation
- ControlCommit / EffectCommit distinction
- atomicity model declaration per EffectClass
- RetryClass / external effect semantics

## 4. Candidate invariants
INV-XA-01: A multi-resource protected effect MUST explicitly declare its atomicity model; absence of a global transaction MUST NOT be silently interpreted as atomicity.
INV-XA-02: PREPARED MUST remain distinct from COMMITTED, EXTERNAL_ATTEMPTED and EXTERNAL_CONFIRMED.
INV-XA-03: Partial external commit MUST enter explicit reconciliation/compensation handling and MUST NOT be represented as simple failure.
INV-XA-04: Compensation MUST be a separately authorized protected effect.
INV-XA-05: Idempotency MUST NOT be treated as proof of cross-resource atomicity.
INV-XA-06: Complete participant/effect footprint MUST be frozen or explicitly revalidated before the relevant commitment boundary.
INV-XA-07: UNKNOWN participant outcome MUST NOT be converted to success/failure solely by timeout, process exit or missing response.
INV-XA-08: Internal transaction commit MUST NOT prove external-world success.
INV-XA-09: Reconciliation/compensation MUST obey current authority, fencing, identity, continuity and dependency rules.
INV-XA-10: Replacement resource/controller MUST use a new incarnation and MUST NOT inherit authority solely from historical state.
INV-EVIDENCE-24: Multiple observations require relevant dependency/failure-domain separation before being promoted as independent corroboration.
INV-DECOM-07: Resource/controller replacement must establish new incarnation and prevent resurrection of historical authority.

## 5. Architecture consequence
Nexo should not impose one universal cross-resource transaction protocol. Instead, each protected EffectClass must declare the required semantic guarantee and the minimum coordination/fencing/reconciliation protocol capable of preserving it under its declared failure model.

Potential protocol families remain OPEN:
A. strong distributed atomicity (e.g. prepare/commit)
B. saga/compensation
C. hybrid local atomicity + fencing + stable effect identity + reconciliation
D. resource-specific protocol

No family is selected yet.

## 6. Open questions
1. Which effect classes require true all-or-none atomicity?
2. Which effects are safely compensatable?
3. Which effects are irreversible and therefore require reconciliation-first semantics?
4. What participant recovery guarantees are required for PREPARED?
5. What is the minimum Protected Coordination Domain for each cross-resource invariant?
6. How is a singular durable commit decision recovered without allowing stale coordinators?
7. How are multi-resource fences coordinated?
8. How is external history preserved across resource replacement/rollback?
9. How are partial compensation and concurrent compensation conflicts handled?
10. How does the formal model represent cross-resource UNKNOWN and causal order?

## 7. Evidence boundary
External distributed-systems patterns (2PC, sagas, idempotency, fencing) are research inputs/analogies, not proof that Nexo satisfies any guarantee. Formal verification, implementation refinement, fault injection and provider-specific tests remain open.

## 8. Next attack
POST-COMMIT / PRE-OBSERVATION FAILURE:
multiple resources commit, Nexo crashes before complete observation/recording, recovery sees mixed current/historical evidence, observers are unavailable or stale, and resource history may have rolled forward/backward.

Required connections:
Continuity Root + External Effect History + Reconciliation + Recovery + Evidence + Cross-domain Linearization.
