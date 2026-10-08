# NEXO NCS — STATUS

## Current phase
CONSTRUCTION — STEP 7 MISSION / OBSERVATION PROVENANCE BOUNDARY

## Closed / runtime verified
- STEP 3A isolation: runtime verified.
- STEP 3B protected-transition composition: runtime verified.
- STEP 3C canonical persistState conditional commit integration: runtime verified.
- STEP 4 final semantic validation: runtime verified in GitHub Actions.
- STEP 5 outcome classification: runtime verified in GitHub Actions (run 37785361553).
- STEP 6 reconciliation boundary: runtime verified in GitHub Actions (run 37813930630).

## STEP 4 verified evidence
- Workflow run: 37784767180
- Job: 113336577540
- Commit: 8cb6ea83dc8ba70bbbd9abfd7ff763b801720576
- Node.js: 22.23.3
- Conclusion: success.

Verified semantics include claim identity, target/incarnation binding, required authoritativeReads/dependencies/predicateDependencies/causalInputs, authoritative evidence boundaries, UNKNOWN for missing/non-authoritative evidence, FAIL for disproven conditions, and policyContext matching.

## Not claimed
Current NCS runtime verification does not prove distributed fencing, universal writer participation, external-effect correctness, exactly-once, power-loss durability, or production safety.

## STEP 5 verified evidence
- Workflow run: 37785361553
- Job: 113338604779
- Commit: 8ac970ed60a94b33e5befd5ba93afa3bff2f27c4
- Conclusion: success.
- Proof: NEXO_NCS/PROOF/STEP_5_RUNTIME_VERIFICATION_2026-10-08.md

## STEP 6 verified evidence
- Workflow run: 37813930630
- Job: 113437564891
- Head commit: 838d0538963be1735a57a744280ec842e848ae79
- Node.js: 22.23.3
- Conclusion: success.
- Runtime command: `node tests/nexo/reconciliation.test.mjs`
- Runtime output: `NEXO STEP 6 reconciliation contract tests: PASS`
- Proof: NEXO_NCS/PROOF/STEP_6_RUNTIME_VERIFICATION_2026-10-08.md

The verified boundary distinguishes UNKNOWN from RECONCILE_REQUIRED, resolves only from explicitly authoritative evidence, remains unresolved when evidence is insufficient, and has no commit, authorization, execution, retry, queue, or external-effect capability.

The implementation accepts the authoritative evidence item's outcome as supplied by the owning caller. STEP 6 does not define a new canonical outcome vocabulary; this is recorded as a contract limit, not treated as a defect.

## STEP 6 closure
STEP 6 exit criterion is satisfied: deterministic reconciliation behavior is runtime-verified and its limits are recorded.

No integration into protected-transition is manufactured because no concrete current outcome path requires reconciliation.

## Next action
Proceed to the next construction step only after reading the current BUILD/STATUS contract. Do not reopen closed STEP 3A/3B/3C/4/5 or historical AB/TLC/Kafka audits unless new implementation evidence directly contradicts a frozen invariant.

## Do-not-repeat
No V1–V20 code reuse as architecture. No AB105.117R. No historical TLC/Kafka rerun. No speculative transaction wrappers, run IDs, effect tombstones, deferred queues, compatibility layers, or external-effect machinery without a current construction contract requiring them.

## Permanent evidence-integration rule
Before defining or advancing any architectural construction boundary, use **MASTER + AB + P** together:
- MASTER = what must be preserved.
- AB = what was demonstrated, including failures and frozen distinctions.
- P/P112 = research evidence, cross-checks and gaps that can change/constrain design.
- NCS = translate only sufficiently supported conclusions into explicit contracts.

If the three layers converge, the conclusion must be reflected in the new architecture. If they contradict, STOP and investigate; never hide the contradiction with a patch, assumption, compatibility layer or silent migration.

Decision record: NEXO_NCS/DECISIONS/MASTER_AB_P_EVIDENCE_INTEGRATION_RULE_2026-10-08.md
Rule commit: 565e26dc072145bc0db47edb197721af3cfa9b11

## STEP 7 — mission / observation provenance boundary
- Design contract: `NEXO_NCS/BUILD/STEP_7_MISSION_OBSERVATION_PROVENANCE_BOUNDARY_2026-10-08.md`
- Design commit: 78f8672a40f756d7e9acd2708092003dde6a4715
- Status: DESIGN EVIDENCE CLOSED; MINIMUM CONTRACT IMPLEMENTED; BASE RUNTIME TEST REPORTED PASS.
- Basis: MASTER/final distillation + frozen AB evidence + P/P112 evidence + repository mapping.
- Evidence mapping: NEXO_NCS/BUILD/STEP_7_EVIDENCE_MAPPING_2026-10-08.md
- Decision: NEXO_NCS/DECISIONS/STEP_7_OBSERVATION_CLAIM_SEPARATION_2026-10-08.md
- Recovered identity: no production runId/reportId/sampleId/executionId attached to findings; missionId is post-admission; generatedAt is not observation identity; stateRevision is not attached to observations.
- Current boundary: specialist reports -> findings -> buildNexoMission -> mission -> persistence. recordNexoPlan() drops original finding code/source/reason/message/evidence.
- Design conclusion: keep ObservationEnvelope separate from protected ClaimEnvelope; MissionCandidate transports provenance between them.
- No observation ID is invented. Missing identity remains an explicit contract gap.
- Scope: preserve claim-critical observation provenance through mission planning, define explicit NOT_ADMITTED semantics, prevent coarse dedupe from silently collapsing distinct causal observations, and keep mission/provider authority separate from protected-transition safety.
- Explicitly NOT introduced: observation/run IDs, deferred queues, retries, tombstones, transaction wrappers, external-effect machinery, legacy compatibility layers.
- Minimum contract: NEXO_NCS/BUILD/STEP_7_MINIMUM_OBSERVATION_ENVELOPE_CONTRACT_2026-10-08.md
- Evidence basis: MASTER + frozen AB + P/P112 + actual producer shapes.
- Decision: ObservationEnvelope is producer-side evidence; MissionCandidate transports it through planning; existing ClaimEnvelope remains the protected claim boundary.
- No observation ID is invented. Missing claim-critical provenance remains explicit and claim-specific UNKNOWN/INVALID classification is not guessed globally.
- STEP 7 STOP condition: if implementation requires an invented mechanism merely to make the boundary pass, stop and redesign the semantic contract.

### STEP 7 implementation checkpoint — 2026-10-08
- 🟢 Minimum ObservationEnvelope/MissionCandidate contract: `src/nexo/core/observation.mjs`, commit `f43f65b5a6937f86a9c0d2584f9e7764b3b73aba`.
- 🟢 Focused base tests: `tests/nexo/observation.test.mjs`.
- 🟢 Manual-dispatch workflow: `.github/workflows/nexo-step-7-observation-contract.yml`.
- 🟢 Test-harness immutability assertion corrected in commit `baeac44f9b0e0d35d356c3235a957c0bdcd308ad`.
- 🟢 User manually reran the workflow after the correction and reported PASS.
- 🟢 Runtime proof recorded: `NEXO_NCS/PROOF/STEP_7_RUNTIME_VERIFICATION_2026-10-08.md`, commit `b70ca05680ea449509b92be415af92a46c2d266f`.
- 🔵 The GitHub connector cannot independently retrieve the manual workflow_dispatch run in this session; no run/job ID is invented.
- 🟢 Focused semantic provenance tests added in `tests/nexo/step-7-provenance.test.mjs`, commit `db6bdc9852cef24b8eaa2aa448242e19520cdfda`.
- 🟢 Focused semantic workflow added at `.github/workflows/nexo-step-7-semantic-provenance.yml`, commit `b3f13478fc99a265298c221a46bf4917456fc5fc`.
- 🟢 User manually executed the focused workflow and reported PASS.
- 🟢 Semantic runtime proof recorded: `NEXO_NCS/PROOF/STEP_7_SEMANTIC_PROVENANCE_RUNTIME_2026-10-08.md`, commit `9016e182fa8ac8dd5df971c890640f99690082a1`.
- 🔵 The GitHub connector cannot independently retrieve the manual workflow_dispatch run in this session; no run/job ID is invented.
- Next exact action: inspect the actual legacy `buildNexoMission()` deduplication boundary against the frozen STEP 7 contract before any integration. Do not modify legacy orchestration yet. No invented observation IDs, queues, retries, tombstones, or external-effect machinery.

## STEP 7 current semantic checkpoint — claim-specific equivalence
- 🟢 Evidence checkpoint recorded: `NEXO_NCS/BUILD/STEP_7_CLAIM_SPECIFIC_EQUIVALENCE_MATRIX_2026-10-08.md`, commit `c684da2b5055e7a1926999daea6bf0bbdd936c63`.
- 🟢 Universal observation equivalence is explicitly rejected.
- 🟢 Equivalence must be claim-specific and require all claim-critical causal dimensions to be established as equivalent.
- 🔵 Current production findings do not universally provide target/incarnation, freshness/version, temporal-window, aggregate-scope, or complete dependency identity.
- Therefore missing dimensions remain UNKNOWN; no silent dedupe and no fabricated observation identity.
- The 8-step bounded admission semantics are already CLOSED and must not be reopened.
- Next exact action: select one concrete finding-to-claim mapping and define/test its smallest equivalence predicate from existing evidence. Do not generalize until that concrete contract is proven.

## STEP 7 concrete claim checkpoint — NEGATIVE_RESOURCE
- 🟢 Concrete mapping defined in `NEXO_NCS/BUILD/STEP_7_NEGATIVE_RESOURCE_EQUIVALENCE_2026-10-08.md`, commit `9f4d1e6f2257230366aa9b35f4cd76314009c5ac`.
- Finding: `NEGATIVE_RESOURCE`; observed fields: producer/code/resource type/amount.
- Legacy action mapping `repair_resource_state` is evidence only; no legacy integration.
- Minimum equivalence requires resource identity, incarnation/version, observed value semantics, freshness/temporal validity, and any claim-critical authoritative dependencies.
- Current producer does not establish all of those dimensions.
- Therefore identical available fields remain UNKNOWN for equivalence; differing resource/value can establish non-equivalence.
- No identity/timestamp/queue/retry/tombstone mechanism is invented.
- Next exact action: focused semantic test of this concrete predicate using only existing evidence. If the test requires fabricated missing dimensions, STOP and redesign the root observation contract.

## STEP 7 equivalence implementation checkpoint — NEGATIVE_RESOURCE
- 🟢 Claim-specific evaluator added: `src/nexo/core/observation-equivalence.mjs`, commit `3407146ef60b88a85fcecad687de0df3024ed1c8`.
- 🟢 Semantics: NON_EQUIVALENT only when an observed claim-critical difference is established; UNKNOWN when required dimensions are missing; EQUIVALENT is reachable only when the evaluator has all required dimensions.
- 🟢 Focused test corrected to use only currently available producer evidence: `tests/nexo/step-7-negative-resource-equivalence.test.mjs`, commit `8ee7172b3ff5cde0cfad272715b7e524889b73d5`.
- 🟢 The test deliberately does NOT fabricate resource incarnation/version/freshness to force EQUIVALENT.
- 🟢 Runtime workflow added: `.github/workflows/nexo-step-7-negative-resource-equivalence.yml`, commit `9bceda233326b3c0064f2486caf0ceef517fcd95`.
- 🔵 Runtime PASS is not yet independently established in this checkpoint.
- Next exact action: manually dispatch the focused workflow and record the result. If the test fails because the evaluator assumes evidence not present in the producer contract, STOP and revisit the root contract rather than patching.

## STEP 7 correction checkpoint — provenance absence
- 🟢 Review found a semantic edge case in the evaluator: empty `derivedProvenance` must mean absence of causal evidence, not equivalence.
- 🟢 Corrected evaluator commit: `561bb62287ef4fc7546f3889f5b8437b126fbd18`.
- 🟢 Corrected focused test commit: `0e435bdec4db1c64c269f3d2e6d4c18a3a8211c4`.
- 🟢 Test-output placement corrected: PASS is emitted only after every assertion, commit `f3021b6a556f0344b7ddaf27a49b9052518f0d3b`.
- 🟢 Added source-difference non-equivalence coverage.
- 🟢 User manually executed the focused NEGATIVE_RESOURCE equivalence workflow after the final test-harness correction and reported PASS.
- 🔵 The GitHub connector cannot independently retrieve that manual workflow_dispatch run in this session; no run/job ID is invented.
- The architectural rule remains: missing causal evidence => UNKNOWN, never silently equivalent.
- 🟢 Focused NEGATIVE_RESOURCE workflow was manually executed by the user and reported PASS; this closes the current runtime checkpoint without inventing a run ID.
- 🟢 Legacy dedupe boundary inspected in `NEXO_NCS/BUILD/STEP_7_LEGACY_DEDUPE_BOUNDARY_INSPECTION_2026-10-08.md`, commit `2d1aa53517a62d716c4854a6d139c0403c92c291`.
- Finding: legacy `action|target|action.name` dedupe is not claim-specific equivalence and drops claim-critical observation dimensions; it remains evidence only and is not modified.
- Next exact action: define the smallest Core handoff contract from ObservationEnvelope to MissionCandidate/admission for one concrete finding, without changing legacy orchestration.

- 🟢 Minimal ObservationEnvelope → MissionCandidate handoff contract defined: `NEXO_NCS/BUILD/STEP_7_OBSERVATION_TO_MISSION_CANDIDATE_HANDOFF_2026-10-08.md`, commit `42bcc910ef6de4fc14e4dc0705a85317717e4c40`.
- 🟢 Handoff test strengthened so UNKNOWN admission explicitly retains the complete ObservationEnvelope and exposes no authority, commit `0c75cd3d4aa84a0b5dd329e0b26b2b244f775550`.
- The handoff is transport-only: observation evidence, claim proposal, admission state, and admission evidence remain separate; no legacy integration or new identity mechanism.

## NCS OPERATING STRUCTURE — PERMANENT
NEXO_NCS is the continuity mechanism, not a replacement for the architecture itself.

The canonical seven-layer separation is:
- MASTER — what Nexo must be / vision and permanent direction.
- CORE — fundamental architecture, contracts and invariants.
- BUILD — current construction.
- RESEARCH — historical knowledge and investigations.
- DECISIONS — closed architectural decisions.
- PROOF — evidence and runtime verification.
- STATUS — exact operational continuation point.

### Sole resume gate
**STATUS is the only operational entry point for resuming work.**

New chat / continuation flow:
**STATUS → MASTER/CORE → BUILD → work**

RESEARCH and PROOF are consulted only when evidence is needed for the current construction decision. Historical material is not automatically replayed.

V1–V20, AB/TLC/Kafka/G0 and related historical investigations are evidence, not dependencies of the new Nexo architecture. Historical files are not moved, deleted, rewritten, or mixed into current construction merely for organization.

When a new chat begins with **NCS**, recover the current STATUS and resume from its exact next action. Do not infer a historical step from memory when STATUS already defines the operational checkpoint.

This separation exists specifically to prevent historical research volume from becoming operational continuity or contaminating the clean new architecture.
