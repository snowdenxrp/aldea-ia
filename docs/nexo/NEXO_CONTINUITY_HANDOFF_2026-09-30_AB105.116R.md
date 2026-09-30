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