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
