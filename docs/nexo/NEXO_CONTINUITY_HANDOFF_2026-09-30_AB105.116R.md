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
