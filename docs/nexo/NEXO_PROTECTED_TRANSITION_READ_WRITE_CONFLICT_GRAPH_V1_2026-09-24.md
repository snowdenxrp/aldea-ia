# NEXO PROTECTED TRANSITION READ-WRITE CONFLICT GRAPH V1 — 2026-09-24

Status: RESEARCH / ARCHITECTURAL PRECONDITION. No implementation and no topology selected.

## 1. Research basis

NIST SP 800-160 Rev. 1 states that a secure system begins in a secure state and that every state transition must remain secure; it also treats protective failure and recovery as part of the system state-transition design. This supports deriving protected atomicity from the exact state and transition semantics rather than selecting a database topology first. citeturn0search0turn0search25

## 2. Method

For each protected transition, define:

READ_SET
WRITE_SET
OWNERSHIP
PRECONDITIONS
POSTCONDITIONS
LINEARIZATION_REQUIREMENT
CRASH_SEMANTICS
PARTITION_SEMANTICS.

Two transitions conflict when at least one writes an authoritative variable read or written by the other and the ordering can change a safety-relevant result.

Conflict classes:

WW = write/write
RW = read/write
WR = write/read
CTX = context/version dependency
EXT = external-effect interaction
EVID = evidence invalidation interaction.

## 3. Canonical variables

V01 IdentityContext
V02 AuthorityContext
V03 PolicyBaseline
V04 InvariantBaseline
V05 Operation
V06 EffectBinding
V07 ControlLease/Fence
V08 StopState
V09 RecoveryFence
V10 VersionSet
V11 ExternalEffectState
V12 EvidenceRecord
V13 VerificationClaim
V14 ReconciliationContext
V15 DependencyGraph
V16 DecommissionState
V17 Delegation
V18 Change/InvalContext
V19 ProofContext/Status
V20 DurableHistory.

Derived values:
D01 ReleaseEligibility
D02 AssuranceState
D03 ClaimValidity
D04 AffectedClaimSet
D05 EvidenceFreshness/Validity
D06 CurrentContextFingerprint.

## 4. T-AUTH-01 Authorization admission

READ:
V01, V02, V03, V04, V06, V08, V09, V10, V15, V18.

WRITE:
V05 lifecycle/admission fields; V20.

Requires protected relation among:
V02 + V03 + V04 + V06 + V08 + V09 + V10 + V15.

Conflicts:
- RevokeAuthority: RW/WW V02/V18;
- PolicyChange: RW V03;
- InvariantChange: RW V04;
- Stop: RW/WW V08;
- Recovery: RW V09;
- VersionActivation: RW V10;
- DependencyAssuranceChange: RW V15;
- EffectMutation: WW V06.

Minimum atomicity:
the authorization decision must not observe a mixture of incompatible safety contexts.

## 5. T-AUTH-02 Revocation

READ:
V02, V05, V06, V07, V08, V09, V10.

WRITE:
V02, V18, relevant fencing context, V20.

Must dominate stale:
authority, queue, lease, worker, cache and recovery contexts.

Key property:
a revocation that is durable but not fully propagated must still prevent protected execution through an independent current-context gate.

## 6. T-RES-01 Reservation/fencing

READ:
V02, V06, V07, V08, V09, V10.

WRITE:
V07, V20.

Conflict:
Reserve↔Reserve;
Reserve↔Revoke;
Reserve↔Stop;
Reserve↔Recovery;
Takeover↔OldOwner.

Minimum requirement:
single protected serialization/fencing point for ownership/generation.

## 7. T-EXEC-01 Final execution gate

READ:
V01, V02, V06, V07, V08, V09, V10, V15, V18.

WRITE:
V05 lifecycle, V11 external-attempt intent, V20.

This is one of the highest-concentration transitions.

Conflicts:
Execute↔Revoke
Execute↔Stop
Execute↔Recovery
Execute↔LeaseExpiry
Execute↔Update
Execute↔Decommission
Execute↔DependencyChange.

Minimum requirement:
current exact-effect context + current safety/fence context must be evaluated as one protected admission decision.

## 8. T-EFF-01 External-effect intent

READ:
V06, V02, V07, V10.

WRITE:
V11 intent/lifecycle, V20.

Requires durable-before external attempt.

Important:
internal commit and external effect cannot be assumed atomic.

## 9. T-EFF-02 External outcome

READ:
V06, V11, V14.

WRITE:
V11 outcome, V20.

Possible outcomes:
APPLIED
NOT_APPLIED
UNKNOWN
PARTIALLY_APPLIED.

Timeout/crash/response loss may produce UNKNOWN.

Conflict:
Outcome↔Retry
Outcome↔Revoke
Outcome↔Recovery
Outcome↔Reconcile.

## 10. T-RECON-01 Reconciliation

READ:
V06, V11, V12, V14, V15, V18.

WRITE:
V14, V11 reconciled state, V20.

Requires exact effect identity and current reconciliation generation.

Conflict:
Reconcile↔CompetingReconcile
Reconcile↔EvidenceInvalidation
Reconcile↔DependencyChange
Reconcile↔Decommission.

## 11. T-VER-01 Verification

READ:
V03, V04, V06, V10, V11, V12, V14, V15, V18, V19.

WRITE:
V13, V20.

Verification is claim-specific.

Conflict:
Verify↔PolicyChange
Verify↔InvariantChange
Verify↔VersionChange
Verify↔EvidenceInvalidation
Verify↔DependencyChange
Verify↔ProofContextChange.

Minimum requirement:
a claim cannot become valid using evidence/context that changed during verification.

## 12. T-STOP-01 Stop enforcement

READ:
V02, V06, V07, V08, V09, V10.

WRITE:
V08, V18, V20.

This is an independent protected transition.

Conflict:
Stop↔Execute
Stop↔Recovery
Stop↔Update
Stop↔Decommission.

Minimum requirement:
in-scope execution cannot linearize after the STOP fence without an explicitly authorized new context.

## 13. T-RECOV-01 Recovery admission

READ:
V01, V02, V08, V09, V10, V11, V14, V15, V18.

WRITE:
V09, V20.

Recovery cannot restore V02 merely because a checkpoint contains old authority.

Conflict:
Recovery↔Execute
Recovery↔Stop
Recovery↔Update
Recovery↔Decommission
Recovery↔UNKNOWN.

## 14. T-UPD-01 Version activation

READ:
V01, V03, V04, V09, V10, V15, V18, V19.

WRITE:
V10, V18, V20.

Conflict:
Update↔Execute
Update↔Evidence
Update↔Recovery
Update↔Rollback
Update↔DependencyChange.

Minimum requirement:
complete VersionSet becomes current through one protected activation transition.

## 15. T-DECOM-01 Decommission closure

READ:
V01, V02, V05, V06, V07, V09, V10, V11, V14, V17, V18.

WRITE:
V01/V02/V07/V09/V16/V17/V18/V20 as applicable.

This is intentionally broad because decommission must fence authority-restoring paths.

Conflict:
Decommission↔Restart
Decommission↔Recovery
Decommission↔Execute
Decommission↔Delegation
Decommission↔Update.

## 16. Conflict graph — highest-risk edges

### C01
AUTHORIZATION ↔ REVOCATION

Shared:
AuthorityContext, EffectBinding, context version.

Required:
same protected ordering domain.

### C02
AUTHORIZATION ↔ POLICY/INVARIANT CHANGE

Shared:
policy/invariant context.

Required:
no authorization decision may commit against an obsolete safety baseline.

### C03
EXECUTION ↔ STOP

Shared:
EffectBinding, StopState, execution lifecycle.

Required:
protected STOP fence must dominate stale execution.

### C04
EXECUTION ↔ RECOVERY

Shared:
EffectBinding, RecoveryFence, lifecycle.

Required:
recovery cannot coexist with protected execution on stale context.

### C05
EXECUTION ↔ DECOMMISSION

Shared:
identity, operation/effect, authority, lifecycle.

Required:
decommission fences future actuation.

### C06
EVIDENCE ↔ INVALIDATION

Shared:
EvidenceRecord, context/version/dependency.

Required:
invalidation cannot race with claim acceptance in a way that leaves stale evidence accepted.

### C07
VERIFICATION ↔ POLICY/VERSION

Shared:
claim, evidence context, policy/VersionSet.

Required:
verification must be bound to the exact safety context.

### C08
RECOVERY ↔ UNKNOWN

Shared:
ExternalEffectState, reconciliation context.

Required:
recovery cannot resolve UNKNOWN by assumption.

### C09
UPDATE ↔ EXECUTION

Shared:
VersionSet, final execution gate.

Required:
activation cannot create an incompatible execution context.

### C10
DECOMMISSION ↔ RECOVERY

Shared:
identity, authority, recovery fence.

Required:
decommission dominates resurrection.

## 17. Conflict graph implication

The graph shows that not every variable needs one global transaction.

The highest-concentration subgraph is approximately:

Identity
→ Authority
→ EffectBinding
→ Stop/Recovery
→ VersionSet
→ Protected Transition.

ExternalEffectState branches at the external boundary.

Evidence/Verification branch after observation and return to protected decision points.

Therefore the likely minimum protected domain is a connected subgraph, not the entire application state.

## 18. Candidate minimum atomic bundles derived from conflicts

B-A1 Authorization:
Authority + EffectBinding + Policy + Invariant + Stop + Recovery + VersionSet.

B-A2 Reservation:
Authorization context + EffectBinding + Coordination fence.

B-A3 Final Execution Gate:
Authority + EffectBinding + Coordination + Stop + Recovery + VersionSet.

B-A4 External Intent:
EffectBinding + durable intent + external lifecycle.

B-A5 External Outcome:
EffectBinding + outcome + observation references.

B-A6 Reconciliation:
EffectBinding + accepted observation + reconciliation context.

B-A7 Verification:
Claim + evidence set + current safety context + dependency closure.

B-A8 Recovery Release:
RecoveryFence + Authority + Stop + Reconciliation + VersionSet + dependencies.

B-A9 Update Activation:
VersionSet + safety gate/verifier + recovery fence + old-version fence.

B-A10 Decommission:
Authority + delegation + worker/lease closure + pending effects + recovery/update closure.

These are derived candidates, not implementation transactions.

## 19. Atomicity hierarchy

A useful hierarchy emerges:

L0 — local/derived
L1 — durable ordered
L2 — serialized protected transition
L3 — linearizable authority/safety transition
L4 — external effect boundary.

Not every object should be promoted to L3.

Promotion to L3 is justified only where ordering can change whether an unauthorized or unsafe protected outcome is possible.

## 20. Minimum linearization points — research candidates

LP-01 Authorization accepted.
LP-02 Reservation/fence acquired.
LP-03 Final execution admitted.
LP-04 STOP enforcement becomes effective.
LP-05 Recovery release becomes effective.
LP-06 VersionSet activation becomes effective.
LP-07 Decommission closure becomes effective.

External outcome is not an internal linearization point for world truth; it is an external boundary requiring reconciliation.

## 21. Store ownership consequence

The conflict graph implies ownership candidates:

- Authority store owns V02.
- Safety/policy store owns V03/V04.
- Operation/effect store owns V05/V06.
- Coordination store owns V07.
- Stop store owns V08.
- Recovery store owns V09.
- Version/config store owns V10.
- External-effect/reconciliation domain owns V11/V14.
- Evidence domain owns V12.
- Verification domain owns V13/V19.
- Dependency/configuration domain owns V15.
- Lifecycle/decommission domain owns V16/V17.
- Invalidation/change domain owns V18.
- Durable audit/history owns V20.

But ownership does NOT mean each store may independently authorize changes.

Cross-owner protected transitions require an explicit serialization protocol.

## 22. New invariants

RW-01: every protected transition declares complete safety-relevant read/write sets.
RW-02: hidden safety-relevant reads are prohibited.
RW-03: any conflict capable of changing authorization/safety outcome requires protected ordering.
RW-04: stale reads cannot grant authority.
RW-05: authorization cannot commit against mixed policy/invariant/VersionSet context.
RW-06: STOP and recovery fences participate in final execution admission.
RW-07: external outcomes remain separate from internal linearization.
RW-08: evidence invalidation conflicts with verification and must be ordered or conservatively resolved.
RW-09: decommission conflicts with every authority-restoring path.
RW-10: store ownership does not imply unrestricted mutation authority.
RW-11: cross-owner protected transitions require explicit serialization/fencing.
RW-12: asynchronous updates are permitted only when stale state cannot create a protected outcome.
RW-13: minimum atomicity should be derived from safety-relevant conflicts, not convenience.
RW-14: linearization points must be observable in implementation and traceable to formal transitions.
RW-15: every conflict has explicit crash, retry, partition and timeout semantics.

## 23. Result

The read/write conflict graph provides the first concrete derivation of the minimum protected semantic domain.

It does NOT yet prove that a particular database, consensus protocol, mutex, CAS, transaction system or distributed algorithm can implement it.

That remains a separate implementation-linearizability question.

The current architecture hypothesis is therefore:

SMALL PROTECTED LINEARIZATION DOMAIN
+
EXPLICIT CROSS-STORE FENCING
+
EXTERNAL EFFECT BOUNDARY
+
DEPENDENCY-AWARE INVALIDATION
+
CLAIM-SPECIFIC EVIDENCE/VERIFICATION.

This remains a hypothesis until the next research stages.

## 24. Next research gate

Derive the actual **linearization protocol options** for the highest-risk conflicts:

AUTHORIZATION ↔ REVOCATION
EXECUTION ↔ STOP
EXECUTION ↔ RECOVERY
EXECUTION ↔ UPDATE
DECOMMISSION ↔ RECOVERY
EVIDENCE ↔ INVALIDATION.

Compare:
- compare-and-swap;
- transactional serialization;
- consensus-backed state machine;
- epoch/fencing protocol;
- hybrid protected-core protocol.

Then determine which semantics can actually be implemented and what the formal model must prove.

Architecture remains blocked.