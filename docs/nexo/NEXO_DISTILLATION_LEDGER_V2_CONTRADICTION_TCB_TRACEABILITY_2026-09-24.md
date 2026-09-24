# NEXO DISTILLATION LEDGER V2 — CONTRADICTIONS, TCB, OWNERSHIP, TRACEABILITY
Date: 2026-09-24
Status: SECOND DISTILLATION PASS / ARCHITECTURE STILL BLOCKED

## Research basis
NASA defines bidirectional traceability between requirements, system elements and verification/validation artifacts, and treats requirements change/configuration control as a lifecycle concern. NIST SP 800-160 similarly calls for traceability from protection needs and requirements through architecture, interfaces, analysis and verification, while SSDF emphasizes tracking security requirements/design decisions and release provenance. These practices support the Nexo research rule that no architectural claim should exist without a traceable source, owner and verification boundary. 

## 1. Contradictions found among CARRY_FORWARD items

### X1 — Authority vs recovery ownership
Potential contradiction:
- authority must be current and fenced;
- recovery must be able to act when normal authority is unavailable.

Resolution direction:
Recovery authority cannot be inferred from normal authority absence. Recovery needs its own explicitly bounded authority basis, emergency conditions, scope, expiry and audit trail.
Status: REWORK REQUIRED.

### X2 — Emergency stop vs emergency recovery
Potential contradiction:
- STOP dominates execution;
- recovery may need to act while STOP remains active.

Resolution direction:
Recovery may manipulate recovery/safety state while execution remains fenced. “Recovery authority” must not imply “execution release authority.”
Status: CARRY_FORWARD + explicit separation required.

### X3 — Evidence vs verifier
Potential contradiction:
- evidence must be independently verified;
- verifier itself is a dependency that can fail or be compromised.

Resolution:
Verification claims must include verifier trust context and failure-domain closure. A verifier can produce evidence but cannot make itself independent by declaration.
Status: CARRY_FORWARD + dependency closure.

### X4 — Lease ownership vs authority
Potential contradiction:
- lease controls coordination;
- protected transitions require current authority.

Resolution:
Lease is necessary coordination context at most; it never substitutes for authority.
Status: CARRY_FORWARD.

### X5 — Formal model vs implementation
Potential contradiction:
- TLA/TLC can establish modeled invariants;
- implementation may differ.

Resolution:
Formal evidence cannot automatically transfer to implementation. Transfer requires explicit correspondence/refinement plus implementation-level evidence.
Status: OPEN until correspondence is demonstrated.

### X6 — Requirement change vs safety invariant
Potential contradiction:
- requirements can evolve;
- some invariants define the security/safety meaning of the system.

Resolution:
Requirement/configuration change must be classified by semantic impact. Changes affecting trust anchors, safety invariants, authority semantics or proof meaning require stronger review/re-verification.
Status: CARRY_FORWARD + REWORK change taxonomy.

### X7 — Unknown vs recovery
Potential contradiction:
- UNKNOWN external effect must persist;
- recovery wants a clean restart.

Resolution:
Recovery can restore execution state but cannot erase UNKNOWN. Reconciliation is a prerequisite for release where the unknown effect is critical.
Status: CARRY_FORWARD.

### X8 — Independence vs practical deployment
Potential contradiction:
- multiple evidence sources may share infrastructure;
- full physical independence may be impossible.

Resolution:
Independence is claim-scoped and must state the domains that remain shared. If required independence cannot be established, assurance degrades rather than being silently accepted.
Status: CARRY_FORWARD.

## 2. Hidden coupling discovered

The following must NOT become implicit shared mutable state:

- AuthorityContext ↔ Lease
- EvidenceRecord ↔ ReleaseEligibility
- RecoveryFence ↔ normal ExecutionLease
- ProofStatus ↔ writable cache flag
- Policy version ↔ model confidence
- Telemetry timestamp ↔ trusted global time
- Checkpoint ↔ authority
- Update journal ↔ release authority
- Metric/reward ↔ authorization
- Human approval ↔ unrestricted capability

Derived state must be recomputable from authoritative inputs where feasible.

## 3. State ownership rule

Every mutable critical state needs exactly one authoritative owner or an explicitly serialized multi-owner protocol.

Candidate ownership classes:
- Authority owner
- Coordination owner
- Execution owner
- Recovery owner
- Reconciliation owner
- Evidence/provenance owner
- Policy/configuration authority
- Trust-root authority
- Verification authority

Ownership itself is not authority to alter every related state.

Required property:
OWNER_OF_STATE != AUTHORITY_TO_CHANGE_ALL_STATES.

## 4. Minimum Trusted Computing Base direction

The TCB should contain only mechanisms whose compromise would invalidate a protected claim.

Candidate TCB:
- trust-root/identity primitives;
- authority validation;
- safety/policy gate;
- protected state transition/linearization primitive;
- emergency-stop enforcement path;
- recovery fence;
- critical effect identity binding;
- evidence validity/invalidity gate;
- configuration/version integrity.

Likely outside TCB:
- planner/model;
- natural-language interface;
- ordinary memory/knowledge;
- UI;
- noncritical analytics;
- optimization/reward computation;
- convenience orchestration.

Important:
“Outside TCB” does not mean “untrusted garbage.” It means the component must not be able to create the protected guarantee by itself.

## 5. State-machine completeness checks

Every critical state machine must answer:
1. Who owns the state?
2. What creates the state?
3. What destroys it?
4. What transitions are legal?
5. What transitions are forbidden?
6. What evidence authorizes each transition?
7. What epoch/version/fence must match?
8. What happens on timeout?
9. What happens on restart?
10. What happens on partition?
11. What happens on conflicting authority?
12. What happens when dependency trust changes?
13. What happens when evidence becomes stale?
14. What happens when policy changes?
15. What happens when migration fails?
16. What happens during decommissioning?

Missing answers mean OPEN, not “implementation detail.”

## 6. Canonical traceability chain

The future system should support this chain:

StakeholderNeed
→ Requirement
→ Constraint/Invariant
→ ArchitecturalBoundary
→ State/Transition
→ ImplementationElement
→ VerificationMethod
→ EvidenceRecord
→ OperationalClaim
→ ChangeImpact

And reverse:

ObservedFailure
→ Evidence
→ AffectedClaim
→ AffectedRequirement/Invariant
→ AffectedBoundary/Implementation
→ CorrectiveChange
→ Reverification
→ UpdatedBaseline

No isolated “PASS” should close a chain.

## 7. Traceability failure classes

T-01 Orphan requirement: no design allocation.
T-02 Orphan implementation: no originating requirement or approved derived rationale.
T-03 Orphan test: no requirement/claim being verified.
T-04 Orphan evidence: no exact claim/context/effect binding.
T-05 Stale evidence: context changed after evidence generation.
T-06 Broken reverse trace: failure cannot locate affected requirement/design.
T-07 Hidden requirement: behavior exists but is undocumented.
T-08 Overloaded requirement: one requirement hides multiple independently owned properties.
T-09 Unverifiable requirement: no feasible verification method.
T-10 Invalidated baseline: change occurred without impact/reverification.

## 8. New architectural invariants

TCB-01: A component outside the TCB cannot independently establish a protected guarantee.
TCB-02: TCB membership is claim-specific, not a universal trust label.
OWN-01: Critical mutable state has one authoritative owner or explicit serialization.
OWN-02: State ownership does not imply unrestricted authority.
OWN-03: Recovery ownership cannot implicitly grant execution release.
STATE-01: Every critical transition has explicit preconditions, postconditions, prohibitions and failure semantics.
STATE-02: Restart, timeout, lease expiry and partition have explicit state semantics.
TRACE-01: Every critical requirement traces to design, implementation and verification evidence.
TRACE-02: Every critical evidence record traces back to an exact claim and context.
TRACE-03: Every observed critical failure traces backward to requirements and forward to corrective verification.
TRACE-04: Configuration/context changes trigger impact analysis for affected claims.
CHANGE-01: Changes affecting safety/authority/proof semantics require stronger revalidation than ordinary configuration changes.
INDEP-01: Independence claims are scoped to explicit failure domains.
INDEP-02: Shared dependencies cap the assurance claim.
UNKNOWN-01: Safety-relevant UNKNOWN cannot be cleared by restart or state restoration alone.

## 9. Open gates after V2 distillation

1. Canonical object model and ownership matrix.
2. Complete state/transition matrix.
3. Trusted computing base boundary review.
4. Requirements-to-invariant-to-test traceability matrix.
5. Formal model unification and correspondence.
6. Actual SANY/TLC execution.
7. Implementation linearizability evidence.
8. Runtime enforcement evidence.
9. Fault-injection/adversarial tests.
10. External-world reconciliation tests.
11. Data/migration semantic integrity.
12. Long-run rollover/resource/dependency tests.
13. Decommissioning closure tests.

## 10. Decision
The ledger does not yet authorize architecture construction.

The next research/distillation task is to produce the canonical ownership matrix and complete state-transition inventory. This must be done before writing architectural layers because ownership and transition semantics determine the actual boundaries between them.

DESIGNED != IMPLEMENTED != TESTED != VERIFIED.
