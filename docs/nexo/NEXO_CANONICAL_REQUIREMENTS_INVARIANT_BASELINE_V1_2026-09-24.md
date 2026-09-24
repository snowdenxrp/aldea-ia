# NEXO CANONICAL REQUIREMENTS AND INVARIANT BASELINE V1 — 2026-09-24

Status: PRE-ARCHITECTURE BASELINE
Purpose: freeze semantic requirements before architecture construction
Architecture: BLOCKED until final completeness audit

## 1. Baseline rule

This baseline is derived from the V1–V20 reconciliation, second-order gap closure, state/transition inventory, atomicity analysis, TCB analysis, information-flow analysis, evidence/observability research, common-mode analysis, and refinement research.

It is a requirements/invariant baseline, not an architecture and not an implementation.

NIST describes architecture as a structured specification of an acceptable solution and treats trustworthy behavior as an emergent system property requiring lifecycle engineering, verification, validation and traceability. citeturn0search0turn0search9

No requirement below is considered implemented or verified merely because it is written here.

## 2. Normative vocabulary

The following distinctions are mandatory:

AUTHORITY != COORDINATION != WORLD_TRUTH
EVIDENCE != CLAIM != ASSURANCE
LEASE != AUTHORITY
GENERATION != FENCE
FENCE != EPOCH
PROVENANCE != TRUTH
OBSERVED != VERIFIED
LOCAL_SUCCESS != WORLD_OUTCOME
WORLD_OUTCOME != MISSION_SUCCESS
AUTHENTICITY != AUTHORIZATION
AUTHORIZATION != EXECUTION
RESTART != AUTHORITY
CHECKPOINT != AUTHORITY
UPDATE_AUTHENTICITY != SAFETY_COMPATIBILITY
FORMAL_PASS != RUNTIME_CORRECTNESS

## 3. Requirement classes

R0 — mission/semantic requirement
R1 — safety/security invariant
R2 — authority/control requirement
R3 — state/atomicity requirement
R4 — evidence/verification requirement
R5 — resilience/recovery requirement
R6 — lifecycle/change requirement
R7 — operational requirement
R8 — human/governance requirement
R9 — formal/refinement requirement
R10 — observability/traceability requirement

## 4. Mission and semantic requirements

REQ-M01:
Every protected action must have an explicit mission/goal context and must distinguish objective from proxy/metric.

REQ-M02:
Local task completion must never be treated as verified mission/world success without the required external evidence.

REQ-M03:
Proxy optimization cannot acquire authority merely because it improves a metric or reward.

REQ-M04:
Mission changes must be versioned and must identify affected goals, claims, invariants and policies.

## 5. Identity requirements

REQ-I01:
Every protected operation has an immutable operation identity and request fingerprint.

REQ-I02:
Every externally relevant effect has an immutable effect identity/effect key.

REQ-I03:
Every effect is bound to exact target identity/fingerprint.

REQ-I04:
Normalized parameters are fingerprinted.

REQ-I05:
Retry/replay semantics are explicit for every protected effect.

REQ-I06:
A new operation identity cannot resolve, overwrite or erase an unresolved prior effect.

REQ-I07:
Cross-operation evidence substitution is prohibited.

## 6. Authority requirements

REQ-AU01:
Authority is scoped to principal, operation/effect, target, policy/invariant context and validity interval.

REQ-AU02:
Authority is versioned and revocable.

REQ-AU03:
No ordinary planner/model/executor may increase its own authority.

REQ-AU04:
Authority changes require a protected transition.

REQ-AU05:
Authority context changes invalidate affected derived claims/evidence.

REQ-AU06:
Coordination ownership cannot grant authority.

REQ-AU07:
Recovery ownership cannot silently grant normal execution authority.

REQ-AU08:
Human approval becomes authoritative only through an explicit authorization contract bound to the exact effect.

REQ-AU09:
Delegation cannot exceed parent scope and must carry expiry/revocation semantics.

REQ-AU10:
Authority must fail closed when required authority context cannot be established.

## 7. Coordination and fencing

REQ-C01:
Coordination is separate from authority.

REQ-C02:
A lease may coordinate a transition but cannot establish world truth.

REQ-C03:
A stale coordination owner must be unable to perform protected transitions after fencing.

REQ-C04:
Every fencing mechanism has an authoritative owner and explicit invalidation semantics.

REQ-C05:
Generation/epoch counters may exist only when each has unique semantics, owner, persistence and verification obligations.

REQ-C06:
Process restart, timeout, lease expiry or network restoration cannot implicitly restore authority.

## 8. Protected transition requirements

REQ-T01:
Every protected transition declares owner, authority basis, required scope, input state, preconditions, read set, write set, affected objects, linearization/equivalent serialization, postconditions, forbidden concurrent transitions, durability, crash semantics, partition semantics, timeout semantics, retry semantics, evidence requirements and recovery path.

REQ-T02:
Safety-relevant reads cannot be hidden from the transition contract.

REQ-T03:
Every protected transition has an explicit atomicity class.

REQ-T04:
Linearization points must be identifiable in the implementation or replaced by a formally equivalent serialization protocol.

REQ-T05:
No implementation ACK may be treated as an abstract commit unless correspondence proves that mapping.

REQ-T06:
Cross-store transitions must specify atomicity, ordering, crash and reconciliation semantics.

REQ-T07:
Stale/replayed protected commands must fail safely.

## 9. External-effect requirements

REQ-E01:
External effects use exact immutable effect identity.

REQ-E02:
External effect state distinguishes at minimum:
NOT_ATTEMPTED, EXECUTING, UNKNOWN, PARTIALLY_APPLIED, APPLIED, REVERSED, RECONCILED.

REQ-E03:
Timeout, crash or lost response after external attempt maps to UNKNOWN unless independent evidence proves otherwise.

REQ-E04:
UNKNOWN cannot be cleared by timeout, process restart, lease expiry or new operation identity.

REQ-E05:
Reconciliation must bind observation to exact effect and target.

REQ-E06:
External provider responses are observations unless independently verified to satisfy a claim.

REQ-E07:
External world atomicity is never assumed from internal transaction atomicity.

## 10. STOP requirements

REQ-S01:
Emergency stop is an independent safety plane.

REQ-S02:
STOP_REQUESTED, STOP_ENFORCING, STOP_VERIFIED and external cancellation are distinct semantics.

REQ-S03:
Executor cannot clear or weaken STOP.

REQ-S04:
STOP enforcement must have an independently specified enforcement path.

REQ-S05:
STOP verification requires evidence appropriate to the claim; executor ACK alone is insufficient.

REQ-S06:
STOP survives restart, timeout, lease expiry and ordinary recovery until explicit release conditions are satisfied.

REQ-S07:
External cancellation and local execution fencing are separate states.

## 11. Recovery requirements

REQ-RC01:
Restart never implies authority restoration.

REQ-RC02:
Recovery begins in a fenced/quarantined state.

REQ-RC03:
Recovery admission verifies identity, artifact/configuration, current fence, current authority, VersionSet and reconciliation state.

REQ-RC04:
Recovery release requires a distinct recovery authority/owner.

REQ-RC05:
Critical UNKNOWN prevents automatic release unless a valid claim-specific rule proves safety.

REQ-RC06:
Checkpoint restores state only; it does not restore authority.

REQ-RC07:
Recovery cannot resurrect decommissioned identity or stale authority.

REQ-RC08:
Recovery semantics are explicit under crash, partition, storage rollback and observer loss.

## 12. Configuration/update requirements

REQ-U01:
Update authenticity and update authorization are separate checks.

REQ-U02:
Safety-relevant activation requires complete VersionSet compatibility.

REQ-U03:
VersionSet includes all safety-relevant runtime, policy, invariant, schema, trust-root, recovery, verifier, safety-gate and dependency context.

REQ-U04:
Rollback is a governed transition, not an image selection operation.

REQ-U05:
UNKNOWN critical effects prohibit automatic rollback unless explicitly justified by the safety contract.

REQ-U06:
Downgrade protection prevents reintroduction of invalidated authority/trust semantics.

REQ-U07:
Configuration changes are classified by safety impact.

REQ-U08:
Safety-semantic model/evidence changes require re-verification.

## 13. Evidence and observability requirements

REQ-V01:
Every safety-critical claim identifies its exact scope, effect, target, context and evidence set.

REQ-V02:
Evidence records bind provenance, observer, timestamp/time basis, freshness deadline, policy/invariant version, VersionSet, dependency closure and relevant authority context.

REQ-V03:
Evidence has explicit validity/invalidation state.

REQ-V04:
Context changes propagate invalidation to affected evidence and claims.

REQ-V05:
LOGGED != OBSERVED; OBSERVED != VERIFIED.

REQ-V06:
Evidence cannot authorize itself.

REQ-V07:
Evidence producers cannot accept their own critical claims without the defined independent verification path.

REQ-V08:
Negative claims such as NO_EFFECT, NO_ACTIVE_WORK or NOT_APPLIED require explicit evidence semantics; absence of telemetry is not negative evidence.

REQ-V09:
Proof status is derived from current verification context, not a mutable green flag.

REQ-V10:
Every operational claim has an evidence freshness/expiry rule.

REQ-V11:
Evidence dependencies include common-mode/failure-domain information where independence matters.

REQ-V12:
Evidence remains traceable to the exact artifact/configuration/formal-model context under which it was produced.

## 14. Claim and assurance requirements

REQ-CL01:
A claim is a bounded proposition, never a global truth assertion.

REQ-CL02:
A claim identifies assumptions, evidence, dependencies, failure domains, policy/invariant versions and expiry.

REQ-CL03:
Valid individual claims cannot be composed unless their contexts are compatible.

REQ-CL04:
Claim composition cannot manufacture independence, freshness, authority or world truth.

REQ-CL05:
Assurance is derived from currently valid claims and dependencies.

REQ-CL06:
Required independence collapse degrades assurance and cannot silently preserve NORMAL status.

REQ-CL07:
A4 unknown assumptions cannot support safety-critical release.

REQ-CL08:
Claim invalidation causes release eligibility to be recomputed.

## 15. Dependency/common-mode requirements

REQ-D01:
Every safety-critical claim has dependency closure.

REQ-D02:
Failure domains are explicit.

REQ-D03:
Process/service/model diversity is not treated as independence without dependency analysis.

REQ-D04:
Shared trust root, administrator, provider, storage, clock, policy source or data source may constitute common-mode coupling.

REQ-D05:
Common-mode collapse lowers the affected claim's assurance when independence is required.

REQ-D06:
Recovery and emergency-stop paths receive their own common-mode analysis.

## 16. TCB requirements

REQ-TCB01:
TCB is claim-specific.

REQ-TCB02:
Each critical claim declares minimum TCB components.

REQ-TCB03:
TCB semantic authority is minimized.

REQ-TCB04:
TCB components have explicit trust roots, dependencies and failure domains.

REQ-TCB05:
A component cannot simultaneously hold mutually conflicting powers unless explicitly justified and verified.

REQ-TCB06:
TCB compromise has an explicit containment/recovery behavior.

REQ-TCB07:
Verifier authority and runtime execution authority are separated where required by the claim.

## 17. Information-flow requirements

REQ-F01:
Information flow, capability flow, authority flow, effect flow and evidence flow are distinct.

REQ-F02:
Untrusted or weakly trusted information cannot silently promote itself to authority.

REQ-F03:
Planner/model outputs cannot directly mutate protected authority state.

REQ-F04:
Executor cannot modify its own admission criteria.

REQ-F05:
Evidence producers cannot accept their own critical claims.

REQ-F06:
Recovery receives checkpoint/state information without inheriting authority.

REQ-F07:
Trust promotion is explicit and claim-specific.

REQ-F08:
Transformations preserve provenance and cannot silently exceed input trust.

## 18. Resource and operational requirements

REQ-O01:
Safety, recovery, fencing and verification resources cannot be starved by ordinary workloads.

REQ-O02:
CPU, memory, storage, bandwidth, queue, concurrency, quota and human-attention exhaustion are safety-relevant failure modes where applicable.

REQ-O03:
Resource exhaustion has explicit degraded-mode behavior.

REQ-O04:
Critical evidence and safety logs have protected capacity or fail-closed behavior.

REQ-O05:
Clock failure, storage failure, identity-provider failure and network partition have explicit semantics.

REQ-O06:
Long-running operation rollover is bounded and tested.

## 19. Human/governance requirements

REQ-H01:
Human instruction, authorization, delegation, preference, observation, emergency intervention and ambiguity are distinct input classes.

REQ-H02:
Inferred intent/preferences cannot silently become authority.

REQ-H03:
Human approval is bound to exact effect identity and context.

REQ-H04:
Conflicting authorities have explicit precedence and fail-safe behavior.

REQ-H05:
Emergency authority is explicitly scoped.

REQ-H06:
Human unavailability/fatigue/delay are operational assumptions, not invisible guarantees.

## 20. Decommission requirements

REQ-DM01:
Decommission is a protected lifecycle transition.

REQ-DM02:
Decommission fences active identity and delegated work.

REQ-DM03:
Pending external effects are reconciled or explicitly retained as UNKNOWN.

REQ-DM04:
Leases, workers, credentials, recovery/update paths and delegated authority are closed/revoked.

REQ-DM05:
Historical evidence is preserved according to its retention policy while active authority is revoked.

REQ-DM06:
Restart/snapshot restore cannot resurrect decommissioned authority.

REQ-DM07:
Final decommission closure requires verifiable postconditions.

## 21. Formal-model requirements

REQ-FM01:
The abstract safety model is explicit.

REQ-FM02:
Protected transitions are represented explicitly.

REQ-FM03:
Every implementation refinement boundary has a defined mapping.

REQ-FM04:
Implementation steps map to abstract steps or proven stuttering steps.

REQ-FM05:
Linearization correspondence is explicit.

REQ-FM06:
Crash, partition, retry, fencing and external UNKNOWN have refinement mappings.

REQ-FM07:
Formal assumptions are versioned/fingerprinted.

REQ-FM08:
Safety and liveness evidence are distinguished.

REQ-FM09:
TLC simulation is not represented as exhaustive evidence.

REQ-FM10:
Proof/cache status is derived from the current proof context.

REQ-FM11:
Formal correspondence includes states, transitions, pre/postconditions, read/write sets, affected variables, forbidden transitions and assumptions.

REQ-FM12:
Formal PASS cannot be promoted to runtime verification without implementation correspondence evidence.

## 22. Verification/observability requirements

REQ-VR01:
Every critical requirement has a declared verification method.

REQ-VR02:
Verification evidence is versioned and context-bound.

REQ-VR03:
Verification results distinguish PASS, FAIL, INCONCLUSIVE and STALE.

REQ-VR04:
Counterexamples preserve enough trace/context information to reproduce the failure.

REQ-VR05:
Runtime traces map to the canonical operation/effect/state model.

REQ-VR06:
Trace evidence identifies the first divergence between expected and observed behavior.

REQ-VR07:
Fault injection covers protected transitions and combined failure classes.

REQ-VR08:
Verification results maintain bidirectional traceability:
Requirement ↔ Invariant ↔ Architecture ↔ Implementation ↔ Test ↔ Evidence ↔ Claim.

REQ-VR09:
Historical verification evidence cannot be reused after a context change without revalidation.

REQ-VR10:
The architecture baseline itself has verification evidence and cannot alter its own verification criteria to obtain PASS.

## 23. Lifecycle/change requirements

REQ-L01:
Every safety-relevant artifact has version identity.

REQ-L02:
Changes identify affected requirements, invariants, claims, evidence, formal models, mappings and tests.

REQ-L03:
Safety-semantic changes require independent review and re-verification.

REQ-L04:
Trust-root changes trigger dependency/claim impact analysis.

REQ-L05:
Schema/semantic migration preserves or explicitly invalidates affected evidence and authority.

REQ-L06:
Rollback and restore are governed transitions.

REQ-L07:
Decommission and disposal include active authority/recovery/update closure.

REQ-L08:
Baseline activation is itself a protected transition.

## 24. Meta-invariants

META-01:
No subject under verification can weaken the criteria by which it is verified.

META-02:
No runtime component can grant itself authority through its own evidence.

META-03:
No stale evidence can establish current release eligibility.

META-04:
No unknown external outcome can be silently converted to a known negative/positive state.

META-05:
No restart can create authority.

META-06:
No common-mode assumption may be hidden inside an independence claim.

META-07:
No redundant safety state may exist without unique semantics, owner and verification obligation.

META-08:
No historical PASS overrides a current dependency/context invalidation.

META-09:
No safety guarantee may rely on an unclassified assumption.

META-10:
No architecture baseline may declare itself verified solely through mutable state it controls.

## 25. Traceability contract

Every critical requirement must map:

Stakeholder Need
→ Requirement
→ Risk/Threat
→ Invariant
→ Architectural Boundary
→ State Variable
→ Protected Transition
→ Implementation Element
→ Verification Method
→ Evidence
→ Claim
→ Operational Baseline.

Reverse path:

Observed Failure
→ Evidence
→ Affected Claim
→ Requirement/Invariant
→ Boundary
→ Implementation
→ Corrective Change
→ Reverification
→ New Baseline.

## 26. Completeness gate

The architecture may not begin until every requirement is classified as:

IMPLEMENTED BY ARCHITECTURE
EXTERNAL DEPENDENCY
DEFERRED WITH JUSTIFICATION
NOT APPLICABLE WITH JUSTIFICATION
OPEN.

No silent omissions.

## 27. Baseline status

Semantic requirements: DRAFT-COMPLETE FOR AUDIT.
Invariant baseline: DRAFT-COMPLETE FOR AUDIT.
Verification semantics: DRAFT-COMPLETE FOR AUDIT.
Observability semantics: DRAFT-COMPLETE FOR AUDIT.
Implementation: NOT STARTED.
Architecture: BLOCKED.

Next gate:
perform one final architecture-from-requirements completeness audit, including requirements coverage, stakeholder coverage, lifecycle coverage, failure-mode coverage, evidence coverage, TCB coverage, dependency coverage, and explicit external assumptions.

Only after that gate passes may architecture construction begin.
