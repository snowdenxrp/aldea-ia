# NEXO CONTINUITY HANDOFF — 2026-09-30 — AB105.116R

## Canonical continuity anchor
- Repository: snowdenxrp/aldea-ia, branch main.
- Historical recovery anchor: AB104.759R. Never restart from an older AB104 point and never invent an AB105.759R anchor.
- Current formal chain: AB105.111R → AB105.112R → AB105.113R → AB105.114R → AB105.115R → AB105.116R.
- Chats are disposable; GitHub is the continuity source. No scattered backup artifacts.

## Project rules
- INVESTIGAR → ANALIZAR → CONSTRUIR → GUARDAR.
- Preserve UNKNOWN/PENDING; never invent evidence or silently overwrite historical meaning.
- No V21 patching. Clean Nexo comes after the formal/evidence phase.
- Nexo need not be the largest intelligence; it must preserve identity, memory, authority and continuity while using stronger external intelligences.
- User wants a small Nexo first that can evolve.
- Never claim TLC PASS without an actual run and inspected result.
- Finite-model PASS is not a proof and does not verify implementation.
- Do not claim full S1–S12 verification if only a subset is configured.

## Semantic freeze
- S1 policy = CURRENT_AUTHORITY. Keep AUTHORITY_AT_ADMISSION, AUTHORITY_AT_EXECUTION and CURRENT_AUTHORITY_AT_EFFECT distinct. Revocation never rewrites authorityAtExecution.
- STOP: NONE → REQUESTED → ENFORCED. REQUESTED ≠ ENFORCED.
- Fence: NONE → ISSUED → ENFORCED. ISSUED ≠ ENFORCED.
- S4 successor release requires current valid authority, enforced fence, proven exclusivity and required atomicity capability.
- EXTERNAL_OBSERVED ≠ NEXO_EXECUTED. Observed effect does not prove authorization.
- UNKNOWN effect is not absence. UNKNOWN→OBSERVED needs positive evidence; UNKNOWN→ABSENT_UNPROVEN needs sufficient evidence of absence.
- PARTIAL reconstruction cannot become COMPLETE from a terminal record alone.
- Replay: same operation identity + same content = DUPLICATE; same identity + incompatible payload = CONFLICT; new identity/context = NEW. Preserve subject/incarnation.
- Recovery with unknown prior effect: RECOVERY → RECONCILIATION_REQUIRED → RECONCILE → REAUTHORIZE → CONTINUE; otherwise SAFE_WAIT/STOP.
- Required ATOMIC means only available ATOMIC satisfies it.
- Identity distinctions: subjectIdentity, incarnationId, operationId, operationFingerprint.
- FRESHNESS and INDEPENDENCE/CORRELATION are separate.
- RECEIVED ≠ ADMITTED; admissionStatus includes NONE/ACCEPTED/REJECTED/STALE/CONFLICTING/UNKNOWN.
- Coverage means sufficient for the current question/scope, not universal proof.

## Historical formal chain
- AB105.111R commit 514565077a05f1b970caf7029b1b60e3812d82bd: frozen input-admission boundary, finite abstraction, T1–T10 and S1–S12.
- AB105.112R commit 62f0e9922072891bc0f7bc1336828844c0ea7c45: cardinality/consistency audit, impossible states, UNKNOWN states, deadlock semantics, S1–S12 invariants.
- AB105.113R → AB105.114R commit e139a6ea6b9adf94adae6721d1874ae94d56b0b9: first model had a modeling error; corrected semantic boundary. Model error, not Nexo design failure.
- AB105.115R commit 6b3d89bbd659e138bfd0db5c6562fdd5f073cbb2: actual TLA+ artifact, but incomplete versus AB105.112R; therefore not a full verification target.

## AB105.116R
- Model: docs/nexo/formal/AB105_116R_NexoFinite116.tla
- Config: docs/nexo/formal/AB105_116R_NexoFinite116.cfg
- SANY workflow: .github/workflows/nexo-ab105-116r-sany.yml
- TLC workflow: .github/workflows/nexo-ab105-116r-tlc.yml
- Model preserves authority/epoch/admission/freshness/coverage/dependency/operation/stop/fence/successor/exclusivity/effect/reconstruction/reconciliation/atomicity distinctions.
- Corrections already made: external vs NEXO effect origin cannot overwrite each other; partial coverage cannot be set after COMPLETE; admission only before active operation; operation start has replay/context protection; successor release blocks on REQUIRED reconciliation or UNKNOWN effect.

## Configured TLC properties
- TypeOK
- S1_ExecutionAuthority
- S1_EffectAuthority
- S4_ReleaseRequirements
- S7_CompleteNeedsCoverage
- S10_AtomicRequirement
- CHECK_DEADLOCK = FALSE.
- Still not full S1–S12: S2, S3, S5, S6, S8, S9, S11, S12 require explicit audit/coverage.

## Actual CI evidence
- SANY succeeded: run 36775169803, commit dccbba89527cf6c61e1d14bf3222b944cb0ca41b. Earlier successful runs: 36775163015 and 36775108501.
- TLC run 36775426175 on commit 3d0fb9fcfab09c361dd26a3e8ef119a567ed6bc0 FAILED before model checking.
- Job 110091996116.
- Failure was workflow invocation, NOT a TLA+ counterexample: TLC received the config filename and tried to read AB105_116R_NexoFinite116.cfg.cfg. File not found; exit 255.
- Artifact nexo-ab105-116r-tlc-evidence, artifact ID 11124817511, contains the short failure log.
- TLC workflow fixed in commit ec15fb987f79b890c6bd5ad5c957ac2633f4b3dc by invoking the module without the .cfg suffix.
- Next action: verify the new push-triggered TLC run and inspect its job/log. Only then classify PASS/FAIL/model counterexample.

## Methodology
- For every S1–S12: A state exists; B adversarial state reachable; C violating attempt represented; D blocked/rejected/classified; E legitimate path remains; F property configured in TLC. Any missing item = NOT VERIFIED.
- Distinguish prohibited transition vs explicit rejection; model counterexample vs Nexo design counterexample; SANY success vs TLC success; finite check vs proof; safety vs liveness.

## Binding older continuity
- AB50→AB51→AB52→AB53→AB54→AB55→AB56→AB57→AB58 must not be erased.
- AB56 did NOT close FutureObs_PAA; interpreter missing.
- CLAIM_STATUS: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION NOT_PERFORMED.
- AB55 only covered 64 states × 6 total orders = 384 per attack for 8 attacks, not full UsedAdmissionContext/EventDAG/FutureObs_PAA.
- AB104.197: CommitRecord valid → reconstruct, do not repeat handler.
- AB104.212: crash ≠ execution result.
- AB104.368: authority A and target state T independent; A VALID + T UNKNOWN ⇒ UNKNOWN/STOP; A UNKNOWN + T VALID ⇒ UNKNOWN/STOP.
- AB104.728: reducer error coverage remained UNKNOWN despite tests for truncation/epochs/stale responses/fencing.
- GLOBAL-AUDIT-109: STOP REQUESTED ≠ ENFORCED; REVOCATION ISSUED ≠ ENFORCED EVERYWHERE; AUTH CACHE HIT ≠ CURRENT AUTHORITY; FENCE ISSUED ≠ ENFORCED.

## Next chat
- On CONTINUITY: start from AB104.759R; read this handoff; verify main HEAD and current commits; verify the TLC run after ec15fb987f79b890c6bd5ad5c957ac2633f4b3dc; inspect actual logs; continue from the verified result. Do not restart old work or create scattered backups.

## Reachability / semantic-independence audit — 2026-09-30
- Audit performed directly against the canonical AB105.116R TLA+ source and CFG; no model modification.
- TLC remains independently in progress: run 36781846063, job 110113752493, head ec15fb987f79b890c6bd5ad5c957ac2633f4b3dc. Steps 1–4 succeeded; step 5 "Run TLC finite model" remains in_progress; evidence upload is pending. Therefore no PASS/FAIL conclusion yet.
- Methodological correction: a value is not classified unreachable merely because no direct assignment appears to produce it. All predecessor paths must be considered. Confirmed example: authorityAtAdmission can be REVOKED because AdmitCurrent copies s.authority.
- Confirmed current domain/value reachability from Init + Next (subject to full path audit):
  * authority: UNKNOWN → VALID → REVOKED. STALE has no producer found.
  * authorityEpoch: NONE → CURRENT. OLD/FUTURE have no producer found.
  * authorityAtAdmission: UNKNOWN, VALID, REVOKED. STALE has no producer found.
  * authorityAtExecution: UNKNOWN → VALID. STALE/REVOKED have no producer found.
  * authorityAtEffect: UNKNOWN → VALID. STALE/REVOKED have no producer found.
  * admission: NONE, ACCEPTED, STALE, CONFLICTING, DUPLICATE. UNKNOWN has no producer found.
  * freshness: UNKNOWN, FRESH, STALE.
  * coverage: UNKNOWN, SUFFICIENT, PARTIAL.
  * dependency: UNKNOWN → CORRELATED. INDEPENDENT has no producer found.
  * operationState: NONE, IN_FLIGHT, STOPPING, TERMINAL. UNKNOWN has no producer found.
  * stop: NONE, REQUESTED, ENFORCED. UNKNOWN has no producer found.
  * fence: NONE, ISSUED, ENFORCED. UNKNOWN has no producer found.
  * successor: NONE, PRESENT, RELEASED.
  * exclusivity: NOT_ESTABLISHED → PROVEN. BOUNDED/CONFLICT/UNKNOWN have no producer found.
  * effectOrigin: NONE → EXTERNAL_OBSERVED or NEXO_EXECUTED, with mutual exclusion guards.
  * effectState: NONE, OBSERVED, UNKNOWN, ABSENT_UNPROVEN. PARTIAL has no producer found.
  * reconstruction: EMPTY, PARTIAL, COMPLETE. CONFLICT/UNKNOWN have no producer found.
  * reconciliation: NONE, REQUIRED, COMPLETE. CONFLICT/UNKNOWN have no producer found.
  * atomicity fields: Init UNSUPPORTED; SetAtomicity can independently assign all 4×4 req/avail combinations.
- Important independent dimensions confirmed in Next:
  * SetAtomicity has no state guard: 16 req/avail combinations are directly available from any state.
  * SetCorrelated has no guard and can set dependency=CORRELATED from any state.
  * SetSuccessor requires only successor=NONE and creates PRESENT.
  * IssueFence requires only fence=NONE and creates ISSUED; EnforceFence then creates ENFORCED.
  * MarkUnknown requires only effectState≠OBSERVED and creates UNKNOWN.
  * ObserveExternal requires only a non-NONE effect and effectOrigin≠NEXO_EXECUTED; it does not require an operation.
  * Recover requires only operationState≠NONE; it can create PARTIAL reconstruction from IN_FLIGHT, STOPPING, or TERMINAL, and may set reconciliation REQUIRED when effectState=UNKNOWN.
  * SetContext is constrained to NONE/TERMINAL operation states but resets admission to NONE; subject/incarnation are therefore independent inputs to admission/operation preparation, not freely mutable during an active operation.
  * SetPartialCoverage requires reconstruction≠COMPLETE but otherwise has no guard.
- Strongly coupled execution nucleus: StartOperation requires VALID authority + CURRENT epoch + ACCEPTED admission + FRESH freshness + SUFFICIENT coverage + stop NONE + fence≠ISSUED + operation NONE + non-NONE subject/incarnation, plus operation identity/context replay protection.
- Semantic warning: the existence of a producer-independent dimension does not by itself prove it is an abstraction artifact. It must be classified as (a) semantically intentional, (b) reserved/future, or (c) missing dependency/guard. No dimension/value is to be removed yet.
- TLC methodology cross-check: TLC model checking explores reachable states of Init ∧ □[Next]vars for the finite model; the raw Cartesian product of declared domains is therefore not the reachable-state count. Lamport's documentation explicitly distinguishes the finite model from the reachable state set. Keep 4.46×10^18 classified only as a raw product upper bound. citeturn0search12turn0search16
- Next exact audit: finish action-by-action predecessor/producer proof for every suspicious value; then construct the variable→actions→producible values→guards→dependencies→semantic-independence matrix. Cross SetAtomicity + SetContext + SetCorrelated + SetSuccessor + Fence + Effect + Recovery before any model change.


## Producer / predecessor audit — pass 1 — 2026-09-30
Direct source review of Init + every action in Next. No model changes.

### Producer graph conclusions
- authority: Init = UNKNOWN. EstablishAuthority is the only producer of VALID and requires authority != VALID. RevokeAuthority is the only producer of REVOKED and requires current VALID. Therefore STALE has no producer; UNKNOWN→VALID→REVOKED is the complete producer chain.
- authorityEpoch: Init = NONE. EstablishAuthority is the only writer and always sets CURRENT together with VALID. OLD/FUTURE have no producer; NONE→CURRENT only.
- authorityAtAdmission: Init = UNKNOWN. AdmitCurrent copies the current authority without constraining it to VALID; therefore UNKNOWN, VALID and REVOKED are reachable. This explicitly corrects the earlier overclaim. STALE has no producer.
- authorityAtExecution: Init = UNKNOWN. StartOperation is the only writer and is guarded by current authority VALID; therefore only UNKNOWN or VALID are reachable.
- authorityAtEffect: Init = UNKNOWN. ObserveNexo is the only writer and requires current authority VALID; therefore only UNKNOWN or VALID are reachable.
- admission: Init = NONE. AdmitCurrent→ACCEPTED; AdmitStale→STALE; AdmitConflict/ReplayConflict→CONFLICTING; ReplayDuplicate→DUPLICATE. UNKNOWN has no producer. SetContext resets admission to NONE.
- freshness: Init = UNKNOWN; AdmitCurrent→FRESH; AdmitStale→STALE. No action produces UNKNOWN after initialization and no action changes FRESH/STALE except the admission actions.
- coverage: Init = UNKNOWN; AdmitCurrent→SUFFICIENT; SetPartialCoverage→PARTIAL. No action returns PARTIAL→SUFFICIENT except a later AdmitCurrent, and SetContext itself does not clear coverage.
- dependency: Init = UNKNOWN; SetCorrelated→CORRELATED. INDEPENDENT has no producer. There is no action that establishes independent provenance.
- operationState: Init = NONE; StartOperation→IN_FLIGHT; RequestStop→STOPPING; EndOperation→TERMINAL. UNKNOWN has no producer. ContinueAfterRecovery can move STOPPING→IN_FLIGHT, but only after reconciliation COMPLETE, current valid authority, and non-UNKNOWN effect.
- stop: Init = NONE; RequestStop→REQUESTED; EnforceStop→ENFORCED. UNKNOWN has no producer; no reset action exists.
- fence: Init = NONE; IssueFence→ISSUED; EnforceFence→ENFORCED. UNKNOWN has no producer; no reset action exists.
- successor: Init = NONE; SetSuccessor→PRESENT; ReleaseSuccessor→RELEASED. RELEASED is terminal for this variable because SetSuccessor requires NONE.
- exclusivity: Init = NOT_ESTABLISHED; ProveExclusivity→PROVEN only when fence=ENFORCED. BOUNDED/CONFLICT/UNKNOWN have no producer; no action establishes them.
- effectOrigin: Init = NONE. ObserveExternal→EXTERNAL_OBSERVED, guarded against existing NEXO_EXECUTED. ObserveNexo→NEXO_EXECUTED, guarded against existing EXTERNAL_OBSERVED and additionally requiring IN_FLIGHT/current VALID/non-conflicting admission. Origin is monotonic from NONE into one of two mutually exclusive origins; no reset.
- effectState: Init = NONE. ObserveExternal/ObserveNexo→OBSERVED. MarkUnknown→UNKNOWN unless already OBSERVED. ObserveAbsent→ABSENT_UNPROVEN only from UNKNOWN with SUFFICIENT coverage. PARTIAL has no producer. MarkUnknown can be reached from the initial state and many unrelated states; UNKNOWN is therefore not evidence that a real execution/effect was previously attempted.
- reconstruction: Init = EMPTY; Recover→PARTIAL; CompleteReconstruction→COMPLETE. CONFLICT/UNKNOWN have no producer. Recover is enabled for any operationState != NONE, including IN_FLIGHT, STOPPING, and TERMINAL.
- reconciliation: Init = NONE. Recover changes it to REQUIRED iff effectState=UNKNOWN; otherwise leaves it unchanged. Reconcile→COMPLETE only from REQUIRED with SUFFICIENT coverage and non-UNKNOWN effect. CONFLICT/UNKNOWN have no producer.
- requiredAtomicity / availableAtomicity: Init = UNSUPPORTED. SetAtomicity is the only writer and has no state guard; all 4×4 pairs are reachable directly from any state. This is a genuine orthogonal dimension in the current abstraction, not merely a declared-domain artifact.

### New semantic flags discovered during the predecessor audit
1. fence=ENFORCED does NOT block StartOperation. StartOperation blocks only fence=ISSUED. Therefore a state can have an enforced fence and subsequently enter IN_FLIGHT. This may be intentional (fence as already-enforced prerequisite) or may indicate a missing semantic dependency; it must be resolved from the intended fence meaning before any change.
2. successor=PRESENT can be created independently of operation, authority, effect, fence, or recovery. ReleaseSuccessor later requires authority/current epoch, ENFORCED fence, PROVEN exclusivity, non-enforced stop, no REQUIRED reconciliation, non-UNKNOWN effect, and satisfied atomicity. The model separates successor creation from release gating by design; whether PRESENT-before-operation is legitimate remains an explicit semantic question.
3. IssueFence can create a fence from the initial state without an operation. ProveExclusivity can then operate on that fence without an operation. This is another candidate for intentional precondition state vs abstraction freedom.
4. SetPartialCoverage can run from the initial EMPTY reconstruction and does not require an active operation or evidence. Thus PARTIAL coverage is currently an independently injectable state, not necessarily an evidence-derived state.
5. Recover can run while an operation is IN_FLIGHT. The current model therefore allows reconstruction to begin before the operation reaches STOPPING/TERMINAL. This is potentially important because the semantic freeze describes recovery as a controlled sequence; do not label it a bug until the intended semantics are checked.
6. ObserveExternal can produce an OBSERVED effect from the initial state without any operation. This may be legitimate if the model represents externally observed effects independent of Nexo execution; otherwise it is a missing contextual dependency.
7. MarkUnknown can produce UNKNOWN from the initial state. Consequently UNKNOWN is a classification state, not proof of a prior effect/operation. Any interpretation that treats effect UNKNOWN as evidence of an attempted Nexo execution would be unsound for this model.
8. SetContext can be used in NONE/TERMINAL states and clears admission, but it does not clear freshness/coverage/authority snapshots. The model therefore permits a context reset followed by a fresh admission while retaining historical freshness/coverage values until overwritten. This needs semantic review, not immediate modification.
9. SetCorrelated is irreversible within this model: there is no action producing INDEPENDENT. If INDEPENDENT is intended as a meaningful state in this abstraction, a missing transition exists; if it is merely a reserved value, its presence inflates the declared domain but not the reachable graph.

### Status
- These are producer/predecessor findings, not final design judgments.
- No suspicious value has been deleted or reduced.
- No AB105.116R source/config/workflow modification was made.
- Next: construct the full variable/action/guard/dependency matrix and trace minimal witness paths for the candidate orthogonal states above. Then compare each against the semantic freeze and S1–S12 requirements before deciding whether any freedom is legitimate or a missing guard.


## Cross-dimension witness audit — pass 2 — 2026-09-30
Minimal conceptual traces were checked against the actual guards in Next. These are reachability witnesses, not semantic approval.

- Witness A — ENFORCED fence + active operation:
  Init → IssueFence → EnforceFence → EstablishAuthority → SetContext → AdmitCurrent → StartOperation.
  This is reachable because StartOperation rejects fence=ISSUED but explicitly permits fence=ENFORCED. Therefore 'fence ENFORCED while operation IN_FLIGHT' is not a Cartesian-only artifact; it is reachable by a short path. Semantic question: whether an already-enforced fence is a prerequisite/permission or a state that should exclude a new operation.
- Witness B — successor PRESENT without operation:
  Init → SetSuccessor.
  No operation, authority, effect, fence, or recovery is needed to create PRESENT. Therefore PRESENT-before-operation is genuinely reachable, not merely a domain-product artifact.
- Witness C — successor RELEASED without an operation:
  Init → SetSuccessor → EstablishAuthority → IssueFence → EnforceFence → ProveExclusivity → SetAtomicity(ATOMIC,ATOMIC) → ReleaseSuccessor.
  All ReleaseSuccessor guards can be satisfied while operationState remains NONE, stop NONE, reconstruction EMPTY, reconciliation NONE, effectState NONE. Therefore RELEASED-without-operation is reachable in the current model. This is a higher-priority semantic review item because release semantics may or may not require a prior operation/effect.
- Witness D — external OBSERVED effect without operation:
  Init → ObserveExternal(E1).
  effectOrigin=EXTERNAL_OBSERVED and effectState=OBSERVED are reachable without any operation. This is legitimate only if external observation is intentionally modeled as independent of Nexo execution.
- Witness E — UNKNOWN effect without operation:
  Init → MarkUnknown.
  effectState=UNKNOWN is reachable immediately. This confirms UNKNOWN is a generic uncertainty classification, not evidence that an operation happened.
- Witness F — PARTIAL coverage without evidence/reconstruction:
  Init → SetPartialCoverage.
  coverage=PARTIAL is reachable while reconstruction=EMPTY, operationState=NONE, effectState=NONE. This is another high-value semantic review item: coverage currently represents a state classification that can be injected independently of evidence.
- Witness G — reconstruction PARTIAL during IN_FLIGHT:
  Init → EstablishAuthority → SetContext → AdmitCurrent → StartOperation → Recover.
  reconstruction=PARTIAL is reachable while operationState=IN_FLIGHT. If recovery is intended only after stop/terminal boundaries, this is a missing guard; if recovery can begin concurrently with an active operation, it is intentional.
- Witness H — correlated dependency without any admission/operation:
  Init → SetCorrelated.
  dependency=CORRELATED is reachable in the initial semantic state. INDEPENDENT remains unreachable.
- Witness I — all atomicity pairs:
  From any state, SetAtomicity(req,avail) accepts any req and avail in the four-element Atomicity set. Therefore all 16 pairs are reachable, including combinations such as required=ATOMIC/available=UNSUPPORTED and required=UNSUPPORTED/available=ATOMIC. The model intentionally defers the compatibility question to AtomicitySatisfied/ReleaseSuccessor rather than constraining SetAtomicity.

### Priority for semantic review (not ranking design choices)
The traces most likely to distinguish 'real state' from 'abstraction freedom' are:
1. RELEASED with operationState=NONE.
2. PARTIAL coverage with reconstruction=EMPTY and no evidence.
3. Recover while operationState=IN_FLIGHT.
4. ENFORCED fence with operationState=IN_FLIGHT.
5. EXTERNAL_OBSERVED with no operation.
6. CORRELATED dependency with no operation/admission.
These require comparison against the frozen S1–S12 semantics before any guard/domain change.

### Important non-conclusion
A reachable state can still be semantically invalid. Reachability answers 'can this model produce it?'; semantic audit answers 'should the model produce it?'. We therefore must not convert these witnesses into fixes until their intended meaning is established.


## S1–S12 semantic coverage audit — pass 3 — 2026-09-30

Cross-checked AB105.116R against the frozen S1–S12 obligations recorded in AB105.111R/AB105.112R. This is a semantic coverage audit, not a claim that the missing properties are bugs. No model/config/workflow modification was made.

### S1 — current authority for consequential NEXO effect
- Present executable coverage: S1_ExecutionAuthority and S1_EffectAuthority are configured.
- StartOperation requires current VALID authority and CURRENT epoch; ObserveNexo additionally requires authorityAtExecution=VALID and current authority=VALID.
- Status: CHECKED in the current TLC configuration, subject to the finite model and actual TLC result still pending.
- Important: authorityAtAdmission is intentionally distinct and may be REVOKED/UNKNOWN; this does not by itself authorize execution.

### S2 — STOP requested versus STOP enforced
- Model explicitly separates REQUESTED and ENFORCED and has distinct RequestStop / EnforceStop actions.
- However, no S2 invariant is configured. The current model does not explicitly assert the intended monotonic/semantic relationship beyond the action guards.
- Status: NOT VERIFIED by TLC. Representation exists; property coverage missing.

### S3 — fence ISSUED versus ENFORCED
- Model explicitly separates ISSUED and ENFORCED with IssueFence / EnforceFence.
- No S3 invariant is configured.
- More importantly, StartOperation blocks fence=ISSUED but permits fence=ENFORCED. Thus ENFORCED-fence + IN_FLIGHT is reachable and requires semantic interpretation.
- Status: NOT VERIFIED.

### S4 — successor release requires exclusivity
- ReleaseSuccessor requires fence=ENFORCED and exclusivity=PROVEN; release snapshots are checked by S4_ReleaseRequirements.
- Status: CHECKED in current TLC configuration.
- Caveat from AB105.112R: the broader intended condition 'no consequential exclusive release while exclusivity is unknown' is represented only insofar as ReleaseSuccessor requires PROVEN; there is no separate invariant expressing the entire semantic contract.

### S5 — observed effect does not prove authorization
- EXTERNAL_OBSERVED and NEXO_EXECUTED are distinct origins and mutually guarded.
- But there is no configured invariant asserting that EXTERNAL_OBSERVED implies no authorization conclusion.
- ObserveExternal is reachable from Init without an operation.
- Status: NOT VERIFIED. The state distinction exists; the epistemic non-implication property is not explicitly checked.

### S6 — UNKNOWN effect cannot become ABSENT_UNPROVEN without evidence
- ObserveAbsent requires effectState=UNKNOWN and coverage=SUFFICIENT.
- This structurally blocks direct UNKNOWN→ABSENT_UNPROVEN without the coverage condition.
- No S6 invariant is configured.
- Status: REPRESENTED/BLOCKED BY ACTION GUARD, but NOT VERIFIED by a dedicated invariant.

### S7 — partial reconstruction cannot become COMPLETE merely from terminal record
- CompleteReconstruction requires PARTIAL reconstruction, SUFFICIENT coverage, and effectState != UNKNOWN.
- Current invariant S7 checks COMPLETE => SUFFICIENT coverage.
- The model does not encode a terminal-record-specific shortcut, but it also does not explicitly model a 'terminal record' as a reconstruction input.
- Recover is permitted in IN_FLIGHT, STOPPING, or TERMINAL states.
- Status: PARTIALLY REPRESENTED; NOT FULLY VERIFIED against the AB105.112R wording.

### S8 — replay/duplicate cannot create a new effect
- ReplayDuplicate sets admission=DUPLICATE; StartOperation requires ACCEPTED and thus cannot start from DUPLICATE.
- ObserveNexo explicitly blocks DUPLICATE and CONFLICTING admissions.
- However, there is no invariant relating an already-observed effect to operation identity/fingerprint, and external observation remains independent.
- Status: PARTIALLY REPRESENTED; NOT VERIFIED as a complete replay/effect property.

### S9 — recovery cannot silently transfer current authority
- Recovery path is explicit: Recover may require reconciliation, Reconcile completes it, Reauthorize restores VALID authority, ContinueAfterRecovery requires VALID authority + CURRENT epoch + reconciliation COMPLETE + non-UNKNOWN effect.
- No S9 invariant is configured.
- Status: REPRESENTED as a guarded transition sequence, NOT VERIFIED.

### S10 — weaker atomicity cannot satisfy ATOMIC
- AtomicitySatisfied requires requiredAtomicity != ATOMIC OR availableAtomicity=ATOMIC.
- S10_AtomicRequirement checks released + required ATOMIC => releaseAtomicity ATOMIC.
- Status: CHECKED in current TLC configuration.
- Note: SetAtomicity permits all 16 req/avail combinations; this is deliberate abstraction freedom until semantic review says otherwise.

### S11 — reconciliation required when expected/observed effects differ materially
- Current model has only one explicit trigger: Recover sets reconciliation=REQUIRED when effectState=UNKNOWN.
- Reconcile requires SUFFICIENT coverage and non-UNKNOWN effect.
- There is no explicit representation of a general expected-effect versus observed-effect mismatch predicate.
- Therefore the AB105.112R S11 wording is broader than the current executable abstraction.
- Status: NOT VERIFIED / semantic coverage gap.

### S12 — identity/incarnation distinctions preserved
- operationId, fingerprint, operationSubject, operationIncarnation are separate fields.
- StartOperation records subject/incarnation; replay actions compare current context with recorded context.
- No dedicated S12 invariant is configured.
- No effectId linkage to operationId exists; effectId is independent.
- Status: PARTIALLY REPRESENTED; NOT VERIFIED as a full identity/incarnation preservation property.

### Coverage conclusion
The current AB105.116R TLC configuration verifies only 5 named properties plus TypeOK: S1 execution authority, S1 effect authority, S4, S7 coverage implication, and S10 atomic requirement. This is materially less than the 12-property coverage defined in AB105.112R. A future PASS on the current run must therefore be reported only as a finite PASS for this configured subset, not as S1–S12 verification.

### Semantic questions now explicitly preserved before any edit
1. Is an ENFORCED fence a prerequisite state that permits a new operation, or should it block StartOperation?
2. Is successor creation/release allowed without a predecessor operation/effect, or must release be operation/effect-scoped?
3. Is PARTIAL coverage allowed as an independently injected epistemic state, or must it arise only from incomplete evidence/reconstruction?
4. May Recover begin while an operation is IN_FLIGHT, or only after STOPPING/TERMINAL?
5. Is EXTERNAL_OBSERVED intentionally operation-independent?
6. Does S11 require a new expected-vs-observed mismatch variable/predicate, or is UNKNOWN-effect recovery intended as the finite abstraction of mismatch?
7. Does S12 require effect/release linkage to operation identity/incarnation, beyond replay checks?

These remain UNKNOWN/OPEN semantic questions, not declared defects. No source change is authorized until the intended semantics are resolved from the frozen requirements/evidence.

## TLC live-status recheck — 2026-09-30
- Run 36781846063 / job 110113752493 remains IN_PROGRESS.
- Steps 1–4 completed successfully.
- Step 5 'Run TLC finite model' remains IN_PROGRESS.
- Step 6 evidence upload remains pending.
- Therefore there is still no valid TLC PASS/FAIL/counterexample result.
- A 404/non-available log while step 5 is still running must not be interpreted as a model failure.

## Action/guard dependency matrix — pass 4 — 2026-09-30

Second-pass audit over every action in AB105.116R. Findings are review items, not automatic fixes.

### Admission/context
- EstablishAuthority: authority/epoch coupling only.
- RevokeAuthority: authority-only; snapshots remain unchanged.
- AdmitCurrent: requires NONE/TERMINAL operation, but does not require current VALID authority, CURRENT epoch, or established identity/context. It can create ACCEPTED + FRESH + SUFFICIENT from UNKNOWN/REVOKED authority. StartOperation later blocks execution without VALID/CURRENT authority, so this is not an immediate S1 violation, but it tensions the AB105.111R ACCEPTED contract.
- AdmitStale and AdmitConflict have similarly broad guards and do not bind the result to explicit epoch/provenance/competing evidence.
- SetContext resets admission to NONE but leaves freshness/coverage/snapshots unchanged.

### Operation/replay
- StartOperation is the main cross-dimension gate: VALID authority + CURRENT epoch + ACCEPTED + FRESH + SUFFICIENT coverage + STOP NONE + fence != ISSUED + operation NONE + subject/incarnation + replay guard.
- fence=ENFORCED is allowed, so an enforced fence does not itself block a new operation.
- ReplayDuplicate/ReplayConflict have no operationState guard and can alter admission during IN_FLIGHT/STOPPING/TERMINAL when identity context matches.
- EndOperation changes only operationState; execution/effect identity remains.

### STOP/fence
- RequestStop is tied to IN_FLIGHT + STOP NONE.
- EnforceStop is independent of operationState.
- IssueFence is globally available from fence NONE; it requires no operation, successor, authority, or stop state.
- EnforceFence is globally available from ISSUED.
- Therefore fencing is modeled as an independently issuable/enforceable control dimension, not operation-scoped.

### Effect/evidence
- ObserveExternal is operation-independent and can create OBSERVED external effect from Init.
- ObserveNexo requires IN_FLIGHT, execution/current authority VALID, STOP not ENFORCED, and admission not DUPLICATE/CONFLICTING; it does not require FRESH, SUFFICIENT coverage, or a particular fence state.
- MarkUnknown is globally available whenever effect is not OBSERVED.
- ObserveAbsent requires UNKNOWN + SUFFICIENT coverage, but no operation/effect identity or provenance binding.
- Effect epistemics are therefore partly generic rather than operation/effect-instance scoped.

### Recovery/reconciliation
- Recover requires only operationState != NONE. It can run IN_FLIGHT, STOPPING, or TERMINAL and can regress COMPLETE reconstruction to PARTIAL.
- CompleteReconstruction requires PARTIAL + SUFFICIENT coverage + effect != UNKNOWN.
- Reconcile requires REQUIRED + SUFFICIENT coverage + effect != UNKNOWN.
- Reauthorize requires reconciliation COMPLETE + CURRENT epoch, but no fresh authority evidence. It can set authority VALID even if authority was previously REVOKED.
- ContinueAfterRecovery requires STOPPING + reconciliation COMPLETE + VALID/CURRENT authority + non-UNKNOWN effect.
- This is a high-priority semantic question because the frozen requirements separate current authority from recovery history.

### Successor/release
- SetSuccessor requires only successor=NONE.
- ProveExclusivity requires only fence=ENFORCED; it is not scoped to a specific successor, subject, operation, or participant set.
- SetAtomicity is fully orthogonal: all 16 required/available pairs are reachable.
- ReleaseSuccessor requires PRESENT + VALID/CURRENT authority + ENFORCED fence + PROVEN exclusivity + STOP != ENFORCED + reconciliation != REQUIRED + effect != UNKNOWN + AtomicitySatisfied.
- ReleaseSuccessor has no operationState, operationId, effectOrigin, effectId, subject, incarnation, coverage, or reconstruction guard.
- Existing witness remains valid: Init → SetSuccessor → EstablishAuthority → IssueFence → EnforceFence → ProveExclusivity → SetAtomicity(ATOMIC,ATOMIC) → ReleaseSuccessor reaches RELEASED with operationState=NONE and effectState=NONE.
- This is not declared a defect yet; it is the strongest candidate for a missing dependency if successor release is intended to be consequentially operation/effect-scoped.

### Newly identified semantic review questions
1. Does ACCEPTED admission require current VALID authority/CURRENT epoch?
2. Should replay classification be permitted after operation start?
3. Should fence/exclusivity be scoped to successor/runtime/operation rather than global?
4. May Reauthorize restore VALID from CURRENT epoch alone, or must fresh authority evidence exist?
5. Can Recover legitimately regress COMPLETE to PARTIAL?
6. Must ObserveAbsent be scoped to an expected operation/effect?
7. Must ReleaseSuccessor require operation/effect identity, or is it intentionally independent?
8. Is external observation intentionally allowed before any Nexo operation?

### Current classification
- Confirmed representation: major dimensions remain explicitly separated.
- Confirmed coverage gap: S2/S3/S5/S6/S9/S11/S12 lack dedicated invariants in current cfg.
- Strong semantic tensions: AdmitCurrent accepts without current authority; Reauthorize can restore VALID without explicit new authority evidence; ReleaseSuccessor is operation/effect-independent.
- No source/model change authorized yet.
- TLC remains a separate finite-checking process; its result cannot resolve semantic questions outside the supplied transition relation. TLC explores reachable states and checks configured properties. citeturn0search12turn0search13

## Historical cross-check against AB105.111R/112R — pass 5 — 2026-09-30

The three strongest tensions from pass 4 were compared against the original frozen contracts, without modifying AB105.116R.

### A. AdmitCurrent versus admission contract
AB105.111R defines ACCEPTED as requiring correlation and validity requirements to be satisfied. It also says RECEIVED != ADMITTED and lists subject identity, operation/authority epoch where applicable, incarnation where applicable, freshness, provenance, and coverage scope as the correlation envelope.

AB105.116R's AdmitCurrent only establishes input + ACCEPTED + FRESH + SUFFICIENT + authorityAtAdmission. It does not explicitly model provenance, authority epoch at admission, observation/event identity, or an admission-time identity binding.

Classification: **REAL MODELING-COVERAGE GAP**, not yet a proven safety violation. The model's ACCEPTED state is currently weaker than the frozen admission contract. This should not be fixed by merely adding a VALID-authority guard; the missing correlation dimensions must first be mapped to the finite abstraction so we do not collapse distinct semantics.

### B. Reauthorize versus authority semantics
AB105.111R freezes CURRENT authority as a distinct concept and AB105.112R explicitly requires that recovery must not silently transfer current authority.

AB105.116R's Reauthorize guard is only reconciliation COMPLETE + authorityEpoch CURRENT, then it writes authority=VALID. No new authority evidence or authorization transition is represented.

Classification: **STRONG SEMANTIC CONFLICT CANDIDATE**. The current action can manufacture VALID from a current epoch alone after reconciliation. Because authorityEpoch is itself only NONE/CURRENT in the executable model, the action currently lacks an explicit source of fresh authorization evidence.

This does not prove the intended system is wrong; it proves the finite model does not preserve the stronger frozen distinction unless reconciliation-complete is intentionally defined as sufficient reauthorization evidence.

### C. ReleaseSuccessor without operation/effect
AB105.112R states successor release is consequentially protected by authority, fence, exclusivity, and atomicity, but it does not explicitly state that a successor release must be operation-scoped. Therefore the existing RELEASED-with-NONE-operation witness is **not a direct contradiction** of S4 as written.

However, AB105.111R's correlation envelope says operation_id when operation-scoped and observation/event identity when evidence-scoped. If successor release represents a consequential operation/effect, the current model lacks those bindings.

Classification: **SEMANTIC SCOPE UNKNOWN**, not a declared bug. It becomes a real gap only if the frozen release semantics require operation/effect correlation.

### D. Additional finding: current S2/S3 wording versus model
AB105.112R describes S2 as STOP request never silently becoming STOP enforced and S3 as fence issuance never silently becoming fence enforcement. The current model uses separate actions, so there is no direct silent assignment in a single action. But this wording is better interpreted as requiring explicit state-transition provenance/guards, not merely distinct enum values.

Classification: **INVARIANT-COVERAGE GAP**. Dedicated S2/S3 invariants should be designed only after deciding the intended transition relation; adding tautological invariants would create false confidence.

### E. Additional finding: S11 cannot be faithfully checked yet
AB105.112R S11 requires reconciliation where expected and observed effects differ materially. AB105.116R has no explicit expected-effect state/predicate. UNKNOWN effect is not equivalent to a material mismatch.

Classification: **REPRESENTATION GAP**. We must not retrofit UNKNOWN as mismatch; the semantic distinction must remain explicit unless evidence shows the abstraction intentionally equates them.

### F. Additional finding: S12 is only partially represented
AB105.111R requires subject identity, operation identity when operation-scoped, incarnation identity when runtime/resource-scoped, and observation/event identity when evidence-scoped. AB105.116R has subject/incarnation/operation fields but effectId is not bound to operationId and there is no observation/event identity dimension.

Classification: **REPRESENTATION/COVERAGE GAP**. A future S12 invariant cannot honestly claim full identity preservation from the current variables alone.

### Net result
Pass 5 separates the findings into:
- REAL MODELING-COVERAGE GAP: ACCEPTED admission envelope.
- STRONG SEMANTIC CONFLICT CANDIDATE: Reauthorize can restore VALID from CURRENT epoch alone.
- SEMANTIC SCOPE UNKNOWN: operation-independent successor release.
- REPRESENTATION GAP: S11 expected-vs-observed mismatch.
- REPRESENTATION/COVERAGE GAP: S12 evidence identity binding.
- INVARIANT-COVERAGE GAPS: S2/S3 and others already recorded.

No source/config/workflow change made. The correct next step is to derive a **minimal missing-dimension proposal** from the frozen contracts, then test whether each added distinction is actually necessary before expanding the model. This follows the formal-method discipline that invariants describe reachable-state properties and should be checked against the actual transition relation, rather than inferred from labels alone. citeturn0search12turn0search15

## AB105.116R audit pass 6 — minimal-dimension derivation

Method: do not expand the state space merely because a field is missing. Each candidate dimension must close a frozen semantic distinction or an S1–S12 obligation.

### Candidate D1 — admission correlation
Required distinctions from AB105.111R:
- operation identity when operation-scoped;
- authority epoch when authority-scoped;
- subject identity;
- incarnation when runtime-scoped;
- observation/event identity when evidence-scoped;
- provenance/freshness/coverage.

Existing 116R already has operationId, subject, incarnation, freshness, coverage, and authorityAtAdmission, but lacks an explicit admission-time epoch field and evidence/provenance identity.

Decision: **authority-admission epoch is the first minimal candidate**. Evidence/provenance identity should NOT be added yet unless the admission contract is shown to require evidence-scoped admission in this exact transition.

### Candidate D2 — fresh reauthorization evidence
Problem: Reauthorize currently derives VALID from reconciliation COMPLETE + CURRENT epoch.

Decision: before adding a new variable, test whether the intended contract permits reconciliation COMPLETE itself to be the evidence of renewed authority. If not, a fresh-authority-evidence distinction is required. Until that semantic decision is frozen, **no code change**.

### Candidate D3 — expected effect for S11
S11 cannot be expressed faithfully with only effectState UNKNOWN/OBSERVED/ABSENT_UNPROVEN.

Decision: **candidate required if S11 is intended literally**. Minimal form should represent expected effect identity/state, not overload UNKNOWN. Exact domain remains OPEN.

### Candidate D4 — observation/event identity for S12
effectId exists, but it is only an untyped identifier and is not linked to operationId/incarnation.

Decision: **candidate required for full S12 evidence correlation**, but only after deciding whether effectId is intended as an observation/event identity or an effect identity. Do not add two identifiers until that distinction is frozen.

### Candidate D5 — STOP/FENCE provenance
Separate enum states already prevent silent equality collapse. However, S2/S3 require more than labels if transitions can be reached from arbitrary contexts.

Decision: first attempt non-tautological invariants over existing state transitions. **No new fields yet.**

### Candidate D6 — successor release scope
Existing release guard protects authority/fence/exclusivity/atomicity but not operation/effect identity.

Decision: **UNKNOWN semantic scope**. Do not add operation/effect guards until release is explicitly classified as operation-scoped or independently scoped.

### Minimality result
The current evidence supports only one immediate structural candidate with high confidence:
**D1a = admission-time authority epoch.**
D3 and D4 are conditional candidates; D2 and D6 require semantic freeze; D5 can be attempted without new state.

### Next audit
1. Trace D1a against all admission/start/replay transitions and S1/S8/S12.
2. Check whether adding D1a alone closes any historical contradiction without creating a false guarantee.
3. Keep TLC running independently; do not alter the live model while its current run is unresolved.
4. Save only this canonical handoff; no scattered backup artifact.

## AB105.116R audit pass 7 — D1a admission-epoch trace

D1a was traced against the current transition structure without changing the model.

### Trace 1: Establish → AdmitCurrent → Start
Current:
- EstablishAuthority sets authority=VALID, authorityEpoch=CURRENT.
- AdmitCurrent stores authorityAtAdmission=VALID but no admission-time epoch.
- StartOperation requires current authority VALID + CURRENT epoch and copies current authority to authorityAtExecution.

Finding: **the missing admission epoch is not observable after admission**. If authority is later revoked/re-established while the same admission remains ACCEPTED, the model cannot distinguish an admission made under the old authorization epoch from one made under the new epoch. StartOperation checks current epoch, but cannot check whether the admission belongs to that epoch.

Classification: **confirmed D1a relevance for epoch-binding semantics**.

### Trace 2: AdmitCurrent before authority establishment
Current AdmitCurrent can execute from Init and create ACCEPTED/FRESH/SUFFICIENT while authority is UNKNOWN and epoch NONE. StartOperation later blocks execution.

Finding: this is not an immediate S1 effect violation, but it means ACCEPTED does not mean “admitted under current authority.” This is consistent with the pass-5 admission-contract gap.

### Trace 3: Revoke → Establish → old admission → Start
Because AdmitCurrent stores no epoch, the model can:
1. establish CURRENT authority;
2. admit input;
3. revoke;
4. establish a new CURRENT authority;
5. start using the old ACCEPTED admission.

The finite abstraction has no way to determine whether the admission should survive the authority transition.

Classification: **semantic ambiguity converted into an unrepresentable distinction**. D1a would make the distinction testable; it does not by itself prove that the old admission must be rejected.

### Trace 4: Replay
ReplayDuplicate/ReplayConflict classify based on operationId/fingerprint/subject/incarnation, but admission-time epoch is absent.

Finding: D1a is orthogonal to replay identity. It should not be used as a substitute for S8's operation/fingerprint rules. If epoch is added, replay semantics must specify whether replay classification is epoch-sensitive or intentionally epoch-independent.

### Trace 5: S12 identity
Subject/incarnation/operation identity are preserved, but authorization epoch at admission is not. Therefore S12's identity distinction is only partial when authority-scoped admission is involved.

### Minimality conclusion
D1a is justified as a **semantic observability requirement**, not yet as a specific guard.

The next correct step is to enumerate the possible intended policies for an old admission:
- reject as stale;
- re-admit/revalidate under the new epoch;
- allow if the operation contract intentionally permits epoch-independent admission.

No policy is selected yet.

No AB105.116R source/config/workflow change was made.

## AB105.116R audit pass 9 — P1/P2/P3 against frozen admission semantics

Cross-check result:

### P1 — stale old admission
Strongest alignment with the frozen vocabulary when an input is explicitly authority-scoped. It preserves the distinction between admission under epoch E1 and execution under E2. However, the historical contract does not by itself state that every already-admitted item must be invalidated by a later epoch change. Therefore P1 is **supported but not frozen**.

### P2 — revalidate/re-admit
Also compatible with the frozen distinction because it creates an explicit transition instead of silently treating old admission as current. It preserves replay identity only if the contract explicitly keeps operationId/fingerprint/incarnation unchanged. Otherwise revalidation could accidentally become a new operation. Classification: **compatible, but requires an explicit revalidation contract**.

### P3 — epoch-independent admission
This is the weakest fit for inputs described as authority-scoped, because it leaves an ACCEPTED admission without an admission-time authority binding. It can still be valid for inputs whose admission is intentionally not authority-scoped. Classification: **not globally justified; only valid for a separately defined class of inputs**.

### Audit conclusion
We can now narrow the semantics without choosing an implementation:
- For **authority-scoped admission**, the model must preserve admission-time epoch identity.
- A later epoch change must not silently make an old admission appear current.
- Whether the old admission becomes STALE immediately (P1) or requires explicit revalidation (P2) remains OPEN.
- P3 cannot be the generic rule for authority-scoped admission; it remains possible only where the contract explicitly says admission is epoch-independent.

This is a semantic constraint, not yet a source change.

### Next
Construct minimal witnesses for P1 and P2 and identify which S1/S8/S12 obligations each satisfies or leaves open. Keep the live TLC run untouched.

## AB105.116R audit pass 10 — minimal P1/P2 witnesses against S1/S8/S12

No source/config/workflow modification.

### P1 witness
Establish E1 → AdmitCurrent(op X) → Revoke → Establish E2.
Expected semantic result under P1: the prior ACCEPTED admission becomes STALE before execution.

S1: preserved because stale admission cannot legitimately authorize execution.
S8: replay identity remains separate; marking stale must not change operationId/fingerprint.
S12: improves authority-epoch binding but does not by itself bind evidence/effect identity.

### P2 witness
Establish E1 → AdmitCurrent(op X) → Revoke → Establish E2 → explicit Revalidate(op X,E2) → StartOperation.
Expected semantic result: the old admission is not silently accepted under E2; an explicit revalidation step establishes the new epoch binding.

S1: preserved if StartOperation requires the revalidated admission.
S8: strongest risk is accidental identity reset; operationId/fingerprint/incarnation must remain the same unless the contract explicitly declares a new operation.
S12: preserves identity only if revalidation records the new authority epoch without erasing subject/incarnation/operation identity.

### What the witnesses prove
The essential property is common to P1 and P2:
epoch change must not silently convert old ACCEPTED admission into current authorization context.

P1 and P2 differ only in when/how the admission changes state. Therefore the minimal structural requirement is D1a (admission-time epoch), while the policy transition remains semantic UNKNOWN.

### Important non-result
These witnesses do NOT justify adding an automatic RevokeAuthority => admission=STALE guard yet. That would choose P1 over P2 without a frozen semantic decision.

### Verification scope reminder
TLC can check the chosen finite transition relation and configured invariants; it cannot choose between P1 and P2 as the intended semantics.

### Next
Audit whether current RevokeAuthority / EstablishAuthority semantics actually model a new epoch or merely reuse the same CURRENT label. If the latter, D1a needs a richer finite epoch abstraction before either P1 or P2 can be represented honestly.

## AB105.116R audit pass 11 — epoch transition semantics

Current 116R uses Epoch = {OLD, CURRENT, FUTURE, NONE}, but the executable transition relation only has:
- Init -> NONE
- EstablishAuthority -> CURRENT
- no transition that moves CURRENT to OLD or creates a distinct successor epoch.

Therefore the model currently has a label named CURRENT, not a genuine sequence of authority epochs.

Consequence:
- The previously described E1 -> revoke -> E2 witness cannot actually distinguish E1 from E2 in 116R.
- RevokeAuthority changes authority VALID -> REVOKED but leaves authorityEpoch CURRENT.
- A later EstablishAuthority returns authority to VALID while the epoch remains CURRENT.
- D1a cannot be meaningfully tested until the finite model can represent at least two distinct authority epochs.

Classification: **confirmed representation gap in the epoch abstraction**.

Minimal requirement before P1/P2 implementation:
- represent at least two distinct authority-epoch identities plus NONE;
- preserve the current/stale distinction;
- define the transition that advances the epoch on authority replacement/revocation according to the frozen semantics;
- avoid using OLD/FUTURE labels merely as cosmetic values.

No source/config/workflow change made.

This is important because TLC explores reachable states of the specified finite transition system; if E1 and E2 are not distinct states in that system, a property about cross-epoch admission cannot actually be checked. citeturn0search4turn0search5

Next: inspect AB105.111R/112R for the minimum epoch transition semantics before choosing cardinality or modifying 116R.

## AB105.116R audit pass 13 — historical artifact recovery blocked, no semantic invention

Attempted to recover the exact AB105.111R/112R source artifacts from the canonical repository using the known filenames. GitHub returned 404 for those paths on main. Therefore the exact historical epoch wording is not currently re-verified from source.

Verified from the existing continuity record:
- AB105.111R treats AUTHORITY_EPOCH as an authority-scoped correlation field.
- AB105.112R requires preservation of CURRENT vs stale authority distinctions and warns that recovery must not silently transfer current authority.
- The exact rule for when an epoch advances remains NOT_REVERIFIED in this pass.

### Consequence
The minimum epoch abstraction remains:
NONE + at least two distinct epoch identities.
But the transition that creates E2 is still UNKNOWN/PENDING.

No source/config/workflow/model change is authorized from this evidence alone.

### Methodological checkpoint
TLC checks invariants over the reachable graph produced by Init/Next and the configured finite model. If the model does not contain distinct E1/E2 states, cross-epoch properties cannot be meaningfully checked. citeturn0search12turn0search16

### Next
Recover the historical artifact by its exact persisted commit/path rather than guessing filenames. Once recovered, extract the epoch transition semantics verbatim/paraphrased into the audit record, then derive the smallest executable epoch model.

## AB105.116R audit pass 15 — construction-history closure — 2026-09-30

### Objective
Close the remaining historical question: whether AB105.113R → AB105.114R → AB105.115R introduced or preserved an executable authority-epoch advancement rule.

### Verified history
- AB105.114R commit e139a6ea6b9adf94adae6721d1874ae94d56b0b9 is directly based on AB105.112R commit 62f0e9922072891bc0f7bc1336828844c0ea7c45.
- AB105.114R is explicitly a semantic correction after the first AB105.113R artifact. Its recorded corrections concern effect observation/execution, authority-at-execution, deadlock semantics and symmetry; it does not define an epoch-advancement transition.
- AB105.115R commit 0dfa82299d0105082de6a9e59588742952a5ce1e is directly based on AB105.114R. Its documented corrections add/clarify effect origin, authority-at-execution, replay identity, freshness, STOP/fence separation, and required adversarial states. It does not define an epoch-advancement transition.
- Therefore the verified 113R→114R→115R construction history does not contain a later executable E1→E2 rule.

### Important correction
This is stronger than the earlier "historical rule not recovered" status.

Historical artifact recovery is COMPLETE.
Historical epoch-advancement rule in the recovered 111R/112R/114R/115R construction record = NOT_DEFINED.

The current 116R model's NONE→CURRENT-only epoch behavior is therefore not a hidden implementation of an older frozen rule that we failed to find. It is an explicit limitation of the current finite abstraction.

### Consequence
D1a remains a valid semantic-observability candidate for authority-scoped admission, but the model cannot honestly test cross-epoch P1/P2 until an epoch identity/advancement contract is first defined.

No arbitrary E2 transition, automatic stale transition, or revalidation action is authorized by this evidence.

### TLC status
Run 36781846063 / job 110113752493 remains IN_PROGRESS. Step 5 "Run TLC finite model" is still running; evidence upload remains pending. No PASS/FAIL result is available.

### Methodological basis
TLC systematically explores the reachable state graph of the configured finite model and checks enabled invariants there. Thus a semantic behavior absent from Init/Next cannot be verified by TLC merely because the domain names OLD/CURRENT/FUTURE. citeturn0search12turn0search13

### Result
HISTORICAL_CONSTRUCTION_AUDIT = COMPLETE
EPOCH_ADVANCEMENT_RULE = NOT_DEFINED
D1a = JUSTIFIED_AS_OBSERVABILITY_REQUIREMENT
P1 = OPEN
P2 = OPEN
MODEL_CHANGE = NOT_AUTHORIZED
TLC = IN_PROGRESS
FORMAL_PROOF = NOT_PERFORMED
IMPLEMENTATION_VERIFICATION = NOT_PERFORMED

### Next exact action
Continue the semantic audit on the remaining high-risk gaps without changing 116R: Reauthorize evidence, S11 expected-vs-observed effect representation, S12 observation/effect identity binding, and S2/S3 non-tautological invariant design. Keep the live TLC run untouched.

## AB105.116R audit pass 16 — Reauthorize evidence provenance — 2026-09-30

### Objective
Audit the highest-risk unresolved transition without changing the model: whether Reauthorize can create CURRENT/VALID authority from reconciliation alone.

### Exact current transition
Reauthorize requires only:
- reconciliation = COMPLETE
- authorityEpoch = CURRENT
and then sets authority = VALID.

It does not require:
- new authority evidence;
- a fresh authority observation;
- a changed epoch;
- an explicit revalidation/admission event;
- proof that the current authority is not a previously revoked authority.

### Minimal witness
A reachable witness can be constructed without inventing any transition:
1. EstablishAuthority.
2. SetContext.
3. AdmitCurrent.
4. StartOperation.
5. MarkUnknown.
6. EndOperation.
7. Recover -> reconstruction PARTIAL + reconciliation REQUIRED.
8. Reconcile -> reconciliation COMPLETE.
9. RevokeAuthority -> authority REVOKED, while authorityEpoch remains CURRENT.
10. Reauthorize -> authority becomes VALID.

The critical observation is step 10: no new authority-bearing evidence is consumed between REVOKED and VALID. The only enabling facts are reconciliation COMPLETE and the unchanged CURRENT epoch.

### Semantic classification

## AB105.116R audit pass 17 — S11 expected-vs-observed effect semantics — 2026-09-30

### Objective
Determine whether the current finite state can express S11 from AB105.112R without overloading UNKNOWN.

### Frozen S11 requirement
AB105.112R states: reconciliation is required where expected and observed effects differ materially.

AB105.111R separately requires EFFECT_OBSERVED, EFFECT_ABSENT_UNPROVEN, EFFECT_UNKNOWN, and PARTIAL to remain distinct. UNKNOWN is epistemic uncertainty, not a synonym for mismatch.

### Current 116R representation
Current effect fields are:
- effectOrigin
- effectState
- effectId

effectState contains NONE, OBSERVED, UNKNOWN, PARTIAL, ABSENT_UNPROVEN.

There is no explicit expected-effect identity, expected-effect state, expected-vs-observed relation, or material-mismatch predicate.

## AB105.116R audit pass 18 — S12 identity / observation binding — 2026-09-30

### Objective
Audit whether the current effect identity is sufficient to preserve the AB105.111R identity/incarnation and evidence-scoping requirements.

### Frozen historical requirement
AB105.111R defines:
- SUBJECT_IDENTITY;
- OPERATION_ID when operation-scoped;
- INCARNATION_ID when runtime-scoped;
- OBSERVATION_ID or EVENT_ID when evidence-scoped.

It also requires identity/correlation distinctions to survive finite abstraction.

### Current 116R fields
The model has:
- operationId;
- operationSubject;
- operationIncarnation;
- effectId;
- subject;
- incarnation.

But effectId is only an element of the finite Effects set. There is no explicit binding:
effectId -> operationId
effectId -> subject
effectId -> incarnation
and no separate observation/event identity.

### What is preserved
For NEXO execution, StartOperation snapshots subject/incarnation into operationSubject/operationIncarnation. ObserveNexo requires the operation to be IN_FLIGHT and blocks duplicate/conflicting admission. Therefore the operation identity/context itself is represented.

For external observations, ObserveExternal may create OBSERVED + effectId without any operation, which is compatible with the possibility that an effect is independently observed. It does not, however, establish whether that effect corresponds to a particular operation/incarnation.

### Minimal counterexample to full S12
Two executions can be represented with different operation identities while an observed effect identifier is not bound to either operation. Conversely, the same effect identifier can be selected by ObserveExternal in unrelated contexts because no uniqueness or correlation guard exists in the model.

Therefore the current model cannot express the distinction:
"effect E observed for operation O/incarnation I"
versus
"the same E observed for operation O2/incarnation I2"
as separate correlation states.

### Important semantic boundary
This does NOT prove that effectId must be operation-scoped. External effects may intentionally be operation-independent. The missing semantic question is whether S12 requires:
A. effect identity only, with operation correlation optional;
B. observation/event identity separate from effect identity, with explicit correlation when evidence is operation-scoped; or
C. every consequential effect observation to bind to operation + subject + incarnation.

The historical contract supports operation-scoped and evidence-scoped identities as distinct cases; it does not justify assuming C globally.

### Classification
S12 = PARTIALLY REPRESENTED, FULL VERIFICATION NOT POSSIBLE.

High-confidence structural conclusion:
The model needs an explicit semantic definition of what effectId means before it can claim full S12 verification.

Conditional candidate:
If effectId is an evidence/observation identifier, then it should be bound to the relevant operation/subject/incarnation when the observation is operation-scoped. If effectId is an effect identity, a separate observation/event identity may be required instead.

No second identity dimension is added yet.

### Result
S12_IDENTITY_PRESERVATION = PARTIAL
EFFECT_ID_SEMANTICS = OPEN
OBSERVATION_EVENT_ID = NOT_ADDED
MODEL_CHANGE = NOT_AUTHORIZED
TLC_LIVE_RUN = STILL_IN_PROGRESS

### Live TLC checkpoint
Run 36781846063 / job 110113752493 remains in_progress. Step 5 "Run TLC finite model" is still running; step 6 evidence upload is pending. No model-checking result is available.

### Next
Audit S2/S3 for genuinely non-tautological safety properties. Distinguish transition-local guards from state invariants and determine whether historical provenance requires additional state.

## AB105.116R audit pass 19 — S2/S3 STOP/FENCE provenance — 2026-09-30

### Objective
Separate what the current transition relation structurally guarantees from what a state invariant can independently verify.

### S2 — STOP request vs enforcement
Current transitions:
- RequestStop requires operationState=IN_FLIGHT and stop=NONE, then sets stop=REQUESTED and operationState=STOPPING.
- EnforceStop requires stop=REQUESTED, then sets stop=ENFORCED.

Therefore the current Next relation does NOT contain a direct NONE -> ENFORCED transition. A path to ENFORCED necessarily passes through REQUESTED.

Important limitation:
EnforceStop itself has no operation-state guard, but the prerequisite stop=REQUESTED was produced by RequestStop in the current model. No action currently resets stop from REQUESTED/ENFORCED to NONE.

Classification:
S2 transition ordering = STRUCTURALLY ENFORCED.
S2 dedicated state-invariant coverage = NOT CONFIGURED.
S2 historical-provenance invariant = NOT REPRESENTABLE from the current state alone without an additional provenance/phase field.

This is not a demonstrated S2 violation. The transition relation already prevents the direct silent transition. The remaining question is whether the specification requires the model to retain explicit provenance that enforcement came from a particular stop request.

### S3 — fence issuance vs enforcement
Current transitions:
- IssueFence requires fence=NONE, then sets fence=ISSUED.
- EnforceFence requires fence=ISSUED, then sets fence=ENFORCED.

Thus there is no direct NONE -> ENFORCED transition. Enforcement structurally requires the ISSUED state.

However, as with S2, a state invariant cannot reconstruct the predecessor history from the ENFORCED value alone. The current state has no field saying which issuance event justified enforcement.

Classification:
S3 transition ordering = STRUCTURALLY ENFORCED.
S3 dedicated state-invariant coverage = NOT CONFIGURED.
S3 provenance-history invariant = NOT REPRESENTABLE from current state alone.

### Critical distinction
S2/S3 should not be fixed merely by adding tautological invariants. Those would add no evidence.
Likewise, adding a provenance field solely to make the invariant syntactically expressible is not yet authorized. The semantic contract must first establish whether historical provenance itself is a required persisted state or whether transition ordering is the intended proof boundary.

### Additional S2 semantic witness
ContinueAfterRecovery can move operationState STOPPING -> IN_FLIGHT while leaving stop=ENFORCED. The current model can therefore represent stop=ENFORCED + operationState=IN_FLIGHT. This does not violate the literal ordering property, but it is a separate semantic question about what ENFORCED STOP permits after recovery. Do not conflate it with S2.

### Additional S3 semantic witness
An ENFORCED fence can coexist with IN_FLIGHT because StartOperation blocks only fence=ISSUED, not fence=ENFORCED. This is a separate fence-meaning question already preserved from earlier passes, not an S3 ordering violation.

### Result
S2_TRANSITION_ORDER = STRUCTURALLY_ENFORCED
S3_TRANSITION_ORDER = STRUCTURALLY_ENFORCED
S2_STATE_INVARIANT = NOT_CONFIGURED
S3_STATE_INVARIANT = NOT_CONFIGURED
S2/S3_PROVENANCE_REQUIREMENT = OPEN
MODEL_CHANGE = NOT_AUTHORIZED
TLC_LIVE_RUN = UNTOUCHED

### Next
Audit the remaining configured/unconfigured S1–S12 coverage as a matrix: identify exactly which properties are structurally enforced, which are represented but not verified, and which lack state representation. Then check the live TLC run again before deciding whether any model change is warranted.


## AB105.116R audit pass 20 — S1–S12 verification-coverage matrix — 2026-09-30

### Objective
Freeze the exact verification status of each safety boundary before any model change.

| Property | Current representation | Structural guard/path | Dedicated TLC invariant | Status |
|---|---|---|---|---|
| S1 current authority | authority + authorityAtExecution + authorityAtEffect | StartOperation/ObserveNexo require current VALID; release also requires VALID | Yes (2 invariants) | **PARTIALLY VERIFIED** |
| S2 STOP request→enforced | NONE/REQUESTED/ENFORCED | EnforceStop requires REQUESTED | No | **STRUCTURALLY ENFORCED; NOT INVARIANT-CHECKED** |
| S3 fence issued→enforced | NONE/ISSUED/ENFORCED | EnforceFence requires ISSUED | No | **STRUCTURALLY ENFORCED; NOT INVARIANT-CHECKED** |
| S4 successor release/exclusivity | successor/fence/exclusivity/release snapshots | ReleaseSuccessor has required gates | Yes | **CONFIGURED / CHECKED** |
| S5 observed effect ≠ authorization | effectOrigin separates external/Nexo | ObserveExternal independent; ObserveNexo has authority gates | No | **REPRESENTED; NOT VERIFIED** |
| S6 UNKNOWN ≠ absence | UNKNOWN + ABSENT_UNPROVEN | ObserveAbsent requires UNKNOWN + SUFFICIENT | No | **REPRESENTED; NOT VERIFIED** |
| S7 partial→complete | reconstruction + coverage | CompleteReconstruction requires PARTIAL + SUFFICIENT + non-UNKNOWN effect | Yes | **PARTIALLY VERIFIED** |
| S8 replay safety | opId/fingerprint/subject/incarnation + DUPLICATE/CONFLICT | Start/ObserveNexo block conflict/duplicate paths | No | **PARTIALLY REPRESENTED; NOT VERIFIED** |
| S9 recovery authority transfer | reconstruction/reconciliation/reauthorize/continue | explicit Recover→Reconcile→Reauthorize→Continue guards | No | **REPRESENTED; NOT VERIFIED** |
| S10 atomicity | required/available atomicity + release snapshots | ReleaseSuccessor gate + invariant | Yes | **CONFIGURED / CHECKED** |
| S11 expected-vs-observed mismatch | effectState/effectId only | no expected-effect relation | No | **REPRESENTATION GAP** |
| S12 identity/incarnation preservation | operation identity/context + effectId | replay/context guards; no effect binding | No | **PARTIAL REPRESENTATION** |

### Important qualification
"PARTIALLY VERIFIED" means the configured invariant checks only the encoded finite property; it does not establish the full historical S1/S7 contract.

The matrix is deliberately stricter than a simple "guard exists" classification:
- a guard is not automatically an invariant;

## AB105.116R audit pass 22 — S9 reauthorization provenance against frozen history — 2026-09-30

### Historical cross-check
AB105.111R freezes T9 as: recovery from a checkpoint with unknown prior effect -> reauthorization plus reconciliation required.
AB105.112R freezes S9 as: recovery never silently transfers current authority.
These statements establish that recovery, reconciliation, and reauthorization are distinct semantic stages. They do NOT explicitly define what evidence is sufficient to authorize the transition back to VALID.

### Current 116R
Reauthorize requires reconciliation=COMPLETE and authorityEpoch=CURRENT, then sets authority=VALID.
Therefore the model currently makes COMPLETE reconciliation + CURRENT epoch sufficient for reauthorization.

### Minimal witness significance
After authority is revoked, the current epoch remains CURRENT. Because Reauthorize does not consume a distinct authority-bearing input, the path can return to VALID without an explicit new authority establishment event.
This does not yet prove the transition is forbidden by the historical contract. It proves that the current model has chosen one unstated semantic interpretation: reconciliation completion itself is sufficient reauthorization evidence.

### Candidate semantic interpretations
A. Reconciliation-authoritative: COMPLETE reconciliation is explicitly defined to include authoritative reauthorization evidence. Current transition could be valid, but the contract must say so.
B. Separate authority evidence: reconciliation establishes effect/recovery consistency, while a distinct fresh authority evidence/event establishes VALID authority. This preserves stronger separation of concerns and would require a separate semantic input/state.
C. Explicit authority establishment only: after revocation, reauthorization cannot directly restore VALID; a normal authority-establishment transition must occur under the current/new epoch.
No choice is authorized yet.

### Strong conclusion
The confirmed issue is not simply that Reauthorize lacks a guard. The confirmed issue is missing provenance semantics for the authority transition.
Adding a guard against REVOKED alone would be insufficient: it would not explain what evidence creates VALID authority after revocation.
Likewise, changing the epoch guard alone would not solve it because 116R does not yet model epoch advancement.

### Result
S9 = REPRESENTED AS A RECOVERY SEQUENCE, BUT REAUTHORIZATION PROVENANCE = UNDEFINED.
RECONCILIATION_AS_AUTHORITY_EVIDENCE = NOT_FROZEN.
POLICIES A/B/C = OPEN.
MODEL_CHANGE = NOT_AUTHORIZED.
TLC = STILL IN_PROGRESS.

### Next
Audit S11 from the frozen T1–T10 semantics and determine the minimum expected-effect object without conflating UNKNOWN, ABSENT_UNPROVEN, or OBSERVED with mismatch.