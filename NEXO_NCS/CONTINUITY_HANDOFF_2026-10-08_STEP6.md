# NEXO — CONTINUITY HANDOFF — 2026-10-08 — STEP 6

## PURPOSE
This file is the canonical resume handoff for the next chat. Recover Nexo through NCS/STATUS first. Do not reconstruct history from memory and do not repeat closed work.

## RECOVERY COMMAND
When the user says CONTINUITY or NCS:
1. Read NEXO_NCS/STATUS.md first.
2. Read the current BUILD step document.
3. Read relevant CORE/PROOF documents only as needed.
4. Preserve MASTER + CORE + BUILD + RESEARCH + PROOF + DECISIONS separation.
5. Continue from the exact pending action in STATUS.
6. Do not reopen closed steps or historical audits unless new implementation evidence creates a genuine contradiction.

## USER'S PERMANENT ARCHITECTURAL INSTRUCTIONS
- Nexo is a new, clean, coherent architecture, not V21 and not a pile of patches.
- V1–V20 are historical evidence only. Do not reuse their architecture, handlers, orchestrators, compatibility layers, or patches as the new Core.
- If implementation exposes a structural problem requiring a patch: STOP. Identify the violated assumption, redesign the root contract, prove the corrected invariant, then continue.
- Never hide uncertainty. UNKNOWN/PENDING is real state.
- Missing evidence != negative evidence.
- Crash != execution result.
- Commit conflict != external-effect absence.
- No evidence != no effect.
- Admission success != commit success.
- No retry may silently convert UNKNOWN to success.
- Provider/model proposes; Core decides authority, validation, commit, UNKNOWN and reconciliation.
- Lúmina is separate and must not become a Nexo dependency.
- Every meaningful progress block must be saved in GitHub.
- User prefers concise operational updates but complete continuity in GitHub.
- Do not invent mechanisms merely because historical research exposed a gap.
- No silent migration, no hidden UNKNOWN->PASS, no speculative transaction wrappers, run IDs, effect tombstones, deferred queues, compatibility layers, or external-effect machinery unless a current contract requires them.

## MASTER VISION
Nexo must preserve identity, memory, principles, authority, continuity and provider independence across model/device/OS/environment changes within permissions and Constitution.
Core is distinct from model, OS, device, UI and Lúmina.
Long-term master includes Constitution/Laws, Identity/Self Model, World Model, Memory Trust Layer, Epistemic/Truth Layer, Policy/Decision Layer, Authority/Permissions, Vault, Knowledge/Learning/Teaching, Skills, Tools/Software Factory, Missions, Multi-Agent, Autonomy, Metacognition, Experiments, Security/Red Team/Sandbox, Connectivity/Distributed Continuity, Resident/Multimodal, GIS/Emergency/Navigation, Repair/Snapshots/Forks/Evolution, Legacy/Successors/Chronicle, Governance/Observability/Replay, Temporal/Knowledge Graph/Open Loops/Projects/Workflows, Multiplatform/SDK/Testing/Simulation/Human Override/Disaster Recovery/Emergency Core/Self-Reconstruction/Model Engine.
Do not turn this vision list into dozens of premature modules; elevate semantic concepts only when construction requires them.

## FINAL DISTILLATION
Canonical lifecycle:
INTENT -> CLAIM/PROVENANCE -> ISOLATED WORKING SNAPSHOT -> FINAL SEMANTIC VALIDATION -> CONDITIONAL COMMIT -> RECONCILIATION

C1 Authority/STOP/Fence:
STOP REQUESTED != STOP ENFORCED; REVOCATION ISSUED != REVOCATION ENFORCED; AUTH CACHE HIT != CURRENT AUTHORITY; FENCE ISSUED != FENCE ENFORCED. Authority and target validity are independent.

C2 Identity/Incarnation:
Logical identity alone is insufficient where entities can be recreated.

C3 Claim/Provenance/Dependencies:
Claim-specific envelope contains intent, target/incarnation, authoritative reads, direct/transitive dependencies, predicate/range/aggregate dependencies, derived provenance, policy/config/logic context, causal random/time/external/provider inputs, source provenance and relevant supported revisions. Helper/cache/summary/derived values are not authority boundaries. WriteSet-only validation is rejected.

C4 Isolation:
Complete mutable candidate graph must be detached, including nexoMemory, effectJournal, nested mutable structures and event/object aliases.

C5 Final Semantic Validation:
PASS only when every applicable claim-critical condition is established. FAIL when disproven. UNKNOWN when insufficient. Admission validation is not final validation.

C6 Conditional Commit:
Existing persistState(expectedRevision) is the canonical conditional snapshot primitive. Revision conflict means STALE_CANDIDATE; it does not prove external-effect status, exactly-once, power-loss durability, universal writer fencing or dependency coverage.

C7 Outcomes:
SAFE_COMMIT | STALE_CANDIDATE | SEMANTIC_CONFLICT | AUTHORITY_STOP | UNKNOWN | RECONCILE_REQUIRED.

C8 Unknown/Reconcile:
UNKNOWN is first-class. Reconcile only when an ambiguous outcome crosses a recovery/effect boundary and available durable evidence cannot establish outcome. Never guess.

C9 External Effects:
Current inspected Lúmina handlers were not proven irreversible external effects. Future irreversible effects require operation/effect identity, durable intent/evidence, outcome/recovery semantics and UNKNOWN/RECONCILE. Do not claim exactly-once or power-loss durability without proof.

C10 Mission/Observation:
Deduplication, bounded 8-step mission admission, durable projections and reconstruction/replan are compression boundaries. Omitted candidates are NOT_FAILED/NOT_RESOLVED. Do not invent observation IDs/queues/tombstones before a concrete contract.

C11 Provider Independence:
Models propose; Core governs protected state.

C12 Evolution:
Explicit architecture/contracts; legacy is evidence/adapters only, not privileged Core orchestration.

## CONSTRUCTION DESIGN
Pipeline:
PROPOSAL -> ClaimBuilder -> AuthorityGate -> SnapshotIsolator -> CandidateExecutor -> FinalSemanticValidator -> ConditionalCommit -> OutcomeClassifier -> Reconciliation/EffectBoundary

Ownership:
- Proposal: untrusted intent, no authority/commit.
- ClaimBuilder: claim identity/provenance/dependency declaration.
- AuthorityGate: authority/STOP/revocation/fence/incarnation; no canonical mutation.
- SnapshotIsolator: deep detachment.
- CandidateExecutor: isolated mutation only; no canonical writes/effects/authority/final success.
- FinalSemanticValidator: current claim-aware semantic checks.
- ConditionalCommit: only canonical state transition owner.
- OutcomeClassifier: semantic outcome construction only.
- Reconciliation: ambiguous recovery state; consumes explicit durable evidence; can remain unresolved; never guesses.

Non-bypass invariants:
1 provider cannot call ConditionalCommit;
2 candidate cannot mutate canonical;
3 candidate cannot declare SAFE_COMMIT;
4 final validation cannot be skipped;
5 commit requires validation;
6 classifier cannot convert UNKNOWN to success;
7 reconciliation cannot invent evidence;
8 external effects cannot hide in CandidateExecutor;
9 claim provenance cannot be dropped;
10 global revision is not dependency validation;
11 legacy orchestration cannot bypass Core;
12 contradiction => evidence stop, not patch.

## CLOSED CONSTRUCTION EVIDENCE
STEP 3A isolation: runtime verified. Tests/workflow/proof are in NEXO_NCS/BUILD and PROOF.
STEP 3B protected transition: runtime verified; run 37737359129, job 113179842110, commit 634957c347d32b68b8210f7aa9d53e9b0dfea779; proof bc1b259bbdc0d6e93f143d24ff4eb885e13e6652.
STEP 3C conditional persistState: runtime verified; run 37740178286, job 113188835156, commit de859aa0b466c9aaa7818ee2c15e3f2261868cf3; proof a5e88fca26eedcd4c03e186e591bfb7b30d1ee9.
STEP 4 final semantic validation: runtime verified; run 37784767180, job 113336577540, commit 8cb6ea83dc8ba70bbbd9abfd7ff763b801720576; proof fba82c5b9c4da9b05ce67548f16d9845827fb1d8.
STEP 5 outcome classification: runtime verified; run 37785361553, job 113338604779, commit 8ac970ed60a94b33e5befd5ba93afa3bff2f27c4; proof 1f747ea4c5137c4d7cb255d443cf47f82bca7c65.
STEP 5 first failed run 37785123024 was a test-harness missing import after replacing mock classifier; corrected, rerun passed. Not a Core semantic failure.

## CURRENT STEP 6 — EXACT STATE
Design saved:
NEXO_NCS/BUILD/STEP_6_RECONCILIATION_BOUNDARY_2026-10-08.md
commit 5407cfa259b23ff0fd6f44c1a1ba880f6178bfc9

Contract:
- Reconciliation is not generic retry/transaction machinery.
- It is entered only for RECONCILE_REQUIRED.
- UNKNOWN and RECONCILE_REQUIRED remain distinct.
- Reconciler consumes explicit evidence.
- It may resolve only from evidence explicitly marked authoritative.
- It cannot invent evidence, authorize, execute, commit, or create SAFE_COMMIT.
- No new operation/effect IDs yet because no concrete external-effect contract exists in the new Core.
- If implementation needs hidden state, queues, retry protocol, new identifiers or external-effect adapter merely to appear complete: STOP and define the missing semantic contract first.

Implementation:
src/nexo/core/reconciliation.mjs
commit f1d2164777fbf44bb37d253fc6d880d9a789ee2a

Tests:
tests/nexo/reconciliation.test.mjs
commit 50d77a25cfb84bf69b211d508f487d2da8af1d9c

Workflow:
.github/workflows/nexo-step-6-reconciliation.yml
commit bfddf92d90575719390c73c0efb53764701164e0

STATUS:
commit ab0bcd40bffd180542174bc4a449766e39b3eb4c
Current state: STEP 6 implementation exists, runtime verification PENDING. Do NOT call STEP 6 closed yet.

IMPORTANT IMPLEMENTATION LIMIT:
The current minimal reconciler is intentionally only a deterministic boundary:
- case requires a boundary and optional claimId;
- evidence must be an array;
- authoritative evidence containing an outcome can resolve;
- otherwise UNRESOLVED;
- malformed case => INVALID;
- no commit/execute/authorize capability.
It currently accepts any string outcome from authoritative evidence at the implementation level; tests currently verify UNKNOWN preservation and non-authoritative evidence does not resolve. Before closure, inspect whether this needs tightening to the canonical semantic outcome set; do not silently patch without deciding from the contract.

## NEXT CHAT — EXACT INSTRUCTIONS
1. Start with NCS/STATUS.md, then STEP 6 BUILD design.
2. Verify the existing STEP 6 workflow/runtime. Do not rerun closed historical audits.
3. If runtime fails, diagnose the actual failure and fix only if it is a local implementation/test issue. If a structural patch appears necessary, STOP and redesign.
4. Create STEP 6 PROOF only after successful runtime verification.
5. Update STATUS to STEP 6 closed only after proof.
6. Then move to the next construction boundary only after checking Master + Final Distillation + Construction Design.
7. Do not invent external-effect machinery.
8. Do not add operation/effect IDs, queues, retries, tombstones, universal transactions or compatibility layers without a concrete current contract.
9. Preserve UNKNOWN/UNRESOLVED semantics.
10. Every meaningful block must be saved in GitHub.
11. Never reopen AB105.117R, TLC, old Kafka/G0 ordering audit, or sequential historical AB work unless new implementation evidence directly contradicts a frozen invariant.
12. If chat context is lost, this file plus STATUS is sufficient to resume exactly.

## DO-NOT-REPEAT
Do not rerun STEP 3A/3B/3C/4/5 except if new evidence creates a direct contradiction.
Do not reconstruct V1–V20 architecture.
Do not claim production readiness.
Do not claim exactly-once, distributed fencing, universal writer participation, power-loss durability, or external-effect correctness from the current proofs.
