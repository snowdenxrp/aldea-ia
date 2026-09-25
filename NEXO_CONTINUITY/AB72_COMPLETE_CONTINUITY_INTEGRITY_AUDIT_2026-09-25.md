# AB72 — COMPLETE CONTINUITY INTEGRITY AUDIT: PRE-AB50 THROUGH AB71
Date: 2026-09-25
Repository: snowdenxrp/aldea-ia
Branch: main
Status: AUDIT RESULT / RESEARCH-INTEGRITY RECORD

## 0. Audit mandate

This audit was initiated because AB71 exposed a real partial-persistence failure mode: an artifact and one canonical-state update persisted while three canonical updates were blocked. The purpose here is therefore broader than checking the numbered AB chain. The audit covers:

- historical research before AB50;
- V1–V20 and PG-009/G-A14 lineage;
- the AB49 -> AB71 research chain;
- formal/TLA+ artifacts;
- executable research interpreters and runners;
- repository workflows;
- canonical continuity documents;
- research-to-architecture contamination risk;
- epistemic status preservation;
- chat-boundary continuity risk.

This audit does NOT rewrite historical artifacts and does NOT promote any research result.

## 1. Method

Evidence was reconstructed from the GitHub repository itself:

1. repository tree and persisted artifact inventory;
2. commit chronology across the pre-AB50, AB50–AB71 ranges;
3. commit-to-commit comparisons at the AB49→AB58 frontier;
4. direct reading of representative research artifacts;
5. direct reading of formal/TLA+ drafts and their audits;
6. direct reading of executable Nexo evaluator/checker code and AB61 research code;
7. direct reading of workflow configuration;
8. cross-check of continuity documents against actual HEAD/history;
9. external reproducibility/provenance research to validate the audit criteria.

The audit uses the following evidence chain:

ARTIFACT → CLAIM/STATUS → CANONICAL STATE → NEXT OBLIGATION → EXECUTION/VERIFICATION EVIDENCE → READ-BACK/ANCESTRY.

A missing edge is recorded as a continuity defect or UNKNOWN rather than inferred.

## 2. Executive result

### 2.1 Pre-AB50 research was not lost from GitHub

The repository contains the major pre-AB50 research lineage, including:

- V1–V20 canonical-core iterations and audits;
- A01–A14 clean-architecture research;
- PG-009 research and formalization;
- G-A14-01 research;
- abstraction/closure/hypergraph research;
- retention/compaction/reconstruction research;
- concurrency, recovery, fencing, external-effect, evidence and dependency work.

The V1–V20 re-audit explicitly preserves the historical models as immutable lineage and reclassifies them into CARRY_FORWARD / REWORK / REJECTED / HISTORICAL_ONLY / OPEN. It explicitly rejects treating old PASS/model results as current verification.

Therefore there is no evidence of a GitHub-level deletion of the pre-AB50 research lineage.

### 2.2 However, pre-AB50 continuity cannot be proven gap-free

This is the most important historical finding.

Before Continuity V2, persistence was heterogeneous. The repository contains many research commits, audit commits, index commits and continuity/checkpoint commits, but there was not yet a uniform atomic contract requiring every substantive round to update all canonical continuity documents and then perform a read-back verification.

Consequently:

PRE-AB50_GITHUB_LINEAGE = SUBSTANTIALLY_RECONSTRUCTABLE
PRE-AB50_CHAT_TO_GITHUB_COMPLETENESS = UNKNOWN
PRE-AB50_ATOMIC_PERSISTENCE = NOT_ESTABLISHED

This means we must NOT claim that no chat-only work was ever lost before the V2 mechanism existed. GitHub can prove what survived; it cannot prove that nothing existed only in a chat and disappeared.

### 2.3 V1–V20 semantic contamination was substantially controlled

The V1–V20 re-audit is a strong corrective layer. It explicitly states that:

- historical models remain immutable;
- model existence is not implementation verification;
- abstract total order is not implementation linearizability;
- lease is coordination, not authority or world truth;
- logged/observed/verified/world truth are distinct;
- TLC/SANY execution remains a separate evidence category;
- historical PASS does not override a current OPEN dependency.

This substantially reduces the risk that early experimental code silently became the final architecture.

### 2.4 AB50→AB70 is mostly reconstructable and contains explicit epistemic corrections

AB52 is a confirmed example of a temporary overstrong conditional result followed by AB53 reconciliation. The stronger AB52 read-closure result was not allowed to replace the conservative UNKNOWN status because the underlying executable transition semantics were incomplete.

AB55 is reproducible: AB61 later recovered the exact original source and reproduced all eight historical result tuples. This closes historical AB55 result provenance/reproduction, not the protocol claim.

AB57/58 exposed implementation gaps rather than hiding them.

AB65 explicitly records that no gate output was persisted and therefore execution was NOT VERIFIED.

AB66–AB70 preserve the separation between research, candidate semantics and architecture.

### 2.5 AB71 is a real partial-persistence defect

AB71 artifact persisted.
AB71 NEXT_ACTIONS update persisted.
AB71 CURRENT_STATE / RESEARCH_LEDGER / OPEN_PROBLEMS updates were blocked.

Therefore the AB71 continuity checkpoint is PARTIAL, not VERIFIED.

This is a confirmed defect, not a hypothetical one.

## 3. Pre-AB50 audit findings

### P01 — Historical V1–V20 lineage exists

Evidence:
- V1–V20 audit artifacts exist in docs/nexo.
- NEXO_RESEARCH_LINEAGE_AND_OPEN_GAPS_V1 records the chronological lineage.
- NEXO_V1_V20_REAUDIT_NORMALIZED_SEMANTICS_V1 explicitly reconciles the historical mechanisms without rewriting them.

Status: VERIFIED at repository-lineage level.

### P02 — Early formal models were not silently treated as verified

Evidence:
- V8 audit explicitly records toolchain limitations.
- AB36C states the TLA+ draft was NOT syntactically validated and no TLC verification was claimed.
- The continuity storage/verification record explicitly prohibits labeling SANY/TLC verified without actual execution.

Status: VERIFIED.

### P03 — Early architecture "closure" language was qualified

A14 uses CLOSED_DESIGN for semantic contracts while separately marking implementation, SANY/TLC, fault injection and runtime correspondence as OPEN/NOT_PROVEN. The final architecture-from-requirements audit explicitly says architecture remains blocked.

Status: VERIFIED with a documentation-risk note: the word CLOSED is locally stronger than the later DESIGNED→SPECIFIED→IMPLEMENTED→TESTED→FORMALLY_CHECKED→INTEGRATED→VERIFIED vocabulary. Later audits explicitly corrected this interpretation.

### P04 — Old implementation/formal correspondence was not accepted as equivalence

The current formal correspondence checker explicitly returns formally_equivalent=False and reports mapping/coverage gaps rather than treating schema correspondence as proof.

Status: VERIFIED.

### P05 — Old Nexo evaluator is non-authoritative

src/nexo/dependency_closure_evaluator.py explicitly declares itself analysis-only, cannot grant authority or execute effects, and has a conservative assurance ceiling. It produces an evaluator result, not a safety certification.

Status: VERIFIED.

### P06 — Old canonical models were deliberately demoted to historical-only

The V1–V20 re-audit explicitly classifies the concrete models as HISTORICAL_ONLY and rejects shortcuts such as:
- sequence counter => linearizability;
- TLA atomic action => implementation atomicity;
- formal correspondence by names => equivalence;
- checker PASS => runtime correctness.

Status: VERIFIED.

### P07 — Pre-AB50 continuity was not uniformly atomic

The historical sequence contains many separate research/audit/index/continuity commits, but no evidence was found of the later V2 contract being applied uniformly to every earlier round.

Status: CONFIRMED PROCESS GAP / historical UNKNOWN for chat-only completeness.

## 4. AB49→AB71 chain audit

### AB49
Artifact persisted.
AB50 follows directly as the next research artifact.
Status: VERIFIED lineage transition.

### AB50
Artifact persisted at d9d6ae59574e43af7d75891208189864aeb7798c.
Status: VERIFIED as research artifact.
Important boundary: specification, not execution.

### AB51
Direct child of AB50 at d9252fca819b47659bebbf4a36b4cb2473963bed.
Status: VERIFIED lineage.
Important result: mathematical ternary non-reconstructibility, explicitly not a P_AA collision.

### AB52
Two artifacts exist. The stronger read-closure result was conditional.
AB53 subsequently reconciled the epistemic status.
Status: VERIFIED WITH CORRECTION PRESERVED.
No history overwrite detected.

### AB53
Explicitly downgraded the protocol result to UNKNOWN_DUE_TO_MISSING_SEMANTICS.
Status: VERIFIED corrective reconciliation.

### AB54
Normalized transition semantics and preserved UNKNOWN cells.
Status: VERIFIED research specification.

### AB55
Research interpreter and result artifact persisted.
Later AB61 recovered the exact original source and reproduced all eight historical tuples.
Status: HISTORICAL EXECUTION REPRODUCED; protocol closure NOT ESTABLISHED.

### AB56
Introduced FutureObs_PAA, reconstruction and EventDAG criteria.
Status: VERIFIED specification/frontier, not complete execution.

### AB57
Executable harness persisted.
Later AB58 found concrete implementation gaps.
Status: PARTIAL_RESEARCH_HARNESS; correctly not promoted.

### AB58
Code-level semantic audit persisted.
Status: VERIFIED audit; no research closure.

### AB59
Deep audit preserved AB50–AB58 limitations and DO-NOT-REPEAT rules.
Status: VERIFIED.

### AB60
Explicit repair task persisted.
Status: VERIFIED.

### AB61
Semantic repair interpreter plus exact AB55 reproduction persisted.
Status: VERIFIED for the stated bounded reproduction and repair scaffolding.
Protocol semantics remain open.

### AB62
Gate runner persisted.
No real gate output was claimed.
Status: VERIFIED artifact; execution NOT VERIFIED.

### AB63
Import-safe runner and archival workflow persisted.
Workflow was under NEXO_CONTINUITY rather than .github/workflows.
Status: VERIFIED archival artifact; not a discoverable GitHub Actions workflow.

### AB64
External research delta persisted and citations later normalized.
Status: VERIFIED research/provenance correction.

### AB65
Repository-root .github/workflows/ab65-gate.yml was created.
The workflow is correctly located for GitHub Actions discovery.
No AB65 gate output was persisted.
Status: VERIFIED infrastructure; EXECUTION NOT VERIFIED.

### AB66
Research/architecture separation persisted.
Status: VERIFIED process/epistemic gate.
Important hard constraint:
NO_INTEGRATED_NEXO_ASSEMBLY_BEFORE_RESEARCH_ARCHITECTURE_GATE=TRUE.

### AB67
External research on epistemic successors and observational equivalence persisted.
Status: VERIFIED research.

### AB68
External formalism comparison persisted.
Status: VERIFIED research; no representation selected.

### AB69
UNKNOWN/nondeterminism/known-empty distinction persisted.
Status: VERIFIED candidate semantics; not architecture.

### AB70
FutureObs algebra and counterexamples persisted.
Status: VERIFIED research candidate; successor completeness remains open.

### AB71
Artifact persisted at bf08d317f9b778bdec271f92485a8f0bf1c29a35.
NEXT_ACTIONS update persisted at f90ce04b881f05b68564ccaa7ee407e72e1be127.
Three canonical updates were blocked.
Status: PARTIAL — NOT A VERIFIED CONTINUITY CHECKPOINT.

## 5. Code audit

### C01 — AB55 source
The original bounded interpreter was recovered and reproduced by AB61.
Historical result provenance is therefore strong.

### C02 — AB57 harness
Code inspection established:
- FutureObs_PAA initially degenerates to immediate ADMIT observation;
- continuation UNKNOWN was omitted rather than represented;
- EventDAG predecessor evidence was absent;
- UsedAdmissionContext discrimination was insufficient under current mutations;
- lower_obs contained implementation history fields not yet justified as canonical observation.

AB58 correctly recorded these as implementation-boundary defects.

### C03 — AB61 repair interpreter
Code inspection confirms explicit:
- TRUE/FALSE/UNKNOWN continuation legality;
- FORCED/INDEPENDENT/UNKNOWN order status;
- immutable UsedAdmissionContext capture;
- explicit observation vocabulary;
- UNKNOWN for unsupported semantic dimensions.

This is a meaningful semantic repair, but it remains a research harness.

### C04 — AB62/63/65 runners
The runners address import/registration and repository execution mechanics. These changes do not prove the semantic model.

AB65's workflow is correctly placed under .github/workflows, but no output artifact exists, so the semantic gate has not been verified by CI execution.

### C05 — Current src/nexo
The current production-tree Nexo evaluator/checker is explicitly non-authoritative and not formally equivalent. AB66 further blocks accidental promotion of research harnesses into integrated architecture.

Status: contamination risk currently controlled, not eliminated forever.

## 6. Continuity-document audit

### D01 — CURRENT_STATE is stale relative to main

CURRENT_STATE still declares AB56 as the verified research frontier and contains no AB71 state integration.

This is expected from the known partial-persistence event, but it means CURRENT_STATE must not be treated as a complete description of current HEAD until repaired.

Status: CONFIRMED DOCUMENTATION GAP.

### D02 — NEXT_ACTIONS is newer than CURRENT_STATE

NEXT_ACTIONS contains AB70 obligations and the AB71 next-action persistence, but the four-document canonical state is not atomically synchronized.

Status: CONFIRMED PARTIAL CHECKPOINT.

### D03 — RESEARCH_LEDGER stops before AB71

The ledger contains AB70 as its latest research entry. AB71 is not fully integrated into it.

Status: CONFIRMED GAP.

### D04 — OPEN_PROBLEMS stops before AB71

The open-problem document contains AB70 obligations but not a verified AB71 checkpoint.

Status: CONFIRMED GAP.

### D05 — EVIDENCE_INDEX is materially stale

EVIDENCE_INDEX currently lists only AB50 and AB51 as primary persisted evidence even though AB52–AB71 artifacts are present and referenced elsewhere.

Status: CONFIRMED DOCUMENTATION GAP.

### D06 — CONTINUITY_PROTOCOL has a stale header

The header says "Current verified frontier: AB51", while a later amendment explicitly says this is stale and AB56 was the frontier at that time.

Status: CONFIRMED DOCUMENTATION INCONSISTENCY. The later amendment prevents silent misinterpretation, but the header itself remains stale.

### D07 — CONTINUITY_V2 successfully records the process safeguard but cannot prove historical chat completeness

The V2 handoff is useful as a forward control. It does not retroactively prove that all pre-V2 chat work was persisted.

Status: VERIFIED safeguard; historical completeness UNKNOWN.

## 7. Chat-boundary audit

The repository proves that at least one chat-limit continuity problem existed and was subsequently addressed with Continuity V2.

The repository does NOT provide a cryptographic record of every ChatGPT message or a guarantee that every prior chat-only thought was committed.

Therefore the correct historical statement is:

CHAT_ONLY_LOSS_BEFORE_V2 = UNKNOWN
GITHUB_PERSISTED_LINEAGE = SUBSTANTIALLY_RECONSTRUCTABLE
AB71_PARTIAL_PERSISTENCE = VERIFIED

No claim stronger than this is justified.

## 8. Research-integrity cross-check

Current research-integrity literature supports the audit criteria used here:

- computational reproducibility benefits from integrating code, results, documentation and version history;
- provenance should allow an artifact/result to be traced to its inputs and production process;
- version control provides history but does not by itself encode every semantic dependency or execution environment;
- reproducibility requires enough procedural and environmental information to reconstruct the computation.

These principles are consistent with the need for artifact/state/obligation/provenance linkage rather than relying on a chat summary alone.

## 9. Final defect inventory

D-HIST-01 — Pre-V2 chat-only completeness cannot be proven.
D-PRE-01 — Historical persistence contract was not uniformly atomic before V2.
D-AB71-01 — AB71 canonical state persistence is partial.
D-CURRENT-01 — CURRENT_STATE is stale at AB56 relative to main.
D-LEDGER-01 — RESEARCH_LEDGER lacks AB71.
D-OPEN-01 — OPEN_PROBLEMS lacks AB71.
D-EVID-01 — EVIDENCE_INDEX is stale and incomplete.
D-PROTOCOL-01 — CONTINUITY_PROTOCOL header remains stale at AB51.
D-EXEC-01 — AB65 gate execution output is absent; execution remains NOT_VERIFIED.
D-SEM-01 — FutureObs successor completeness remains unresolved.
D-QUOT-01 — Canonical quotient congruence remains unresolved.
D-ARCH-01 — Integrated architecture remains blocked by AB66.

## 10. What is NOT a defect

N-01 — Historical AB52 stronger result being preserved and then downgraded in AB53 is correct epistemic behavior.
N-02 — Historical AB55 code/result remaining immutable is correct.
N-03 — TLA+ drafts being unverified is not a defect when explicitly recorded as such.
N-04 — UNKNOWN remaining open is not a defect.
N-05 — Experimental code remaining outside integrated Nexo is correct under AB66.
N-06 — Old architecture artifacts remaining in the repository is correct because they are historical lineage.

## 11. Dependency impact

The continuity defects affect confidence in the *resume mechanism*, not automatically the underlying scientific claims.

No AB50–AB70 research conclusion is invalidated solely by the continuity-document defects.

However, any claim whose only evidence existed in a missing chat segment must remain UNKNOWN until repository evidence is recovered.

No current semantic result should be upgraded because of this audit.

## 12. Required repair order

1. Persist this AB72 audit artifact.
2. Repair canonical documentation inconsistencies without rewriting historical artifacts:
   - CURRENT_STATE;
   - NEXT_ACTIONS;
   - RESEARCH_LEDGER;
   - OPEN_PROBLEMS;
   - EVIDENCE_INDEX;
   - CONTINUITY_PROTOCOL header/clarification.
3. Verify each write by read-back.
4. Verify the resulting Git ancestry and exact HEAD.
5. Mark the continuity checkpoint VERIFIED only if every required repair is present and readable.
6. If any write fails, mark the checkpoint PARTIAL and stop claiming completeness.
7. After continuity repair, resume research at the successor-completeness problem; do not jump directly to a new implementation.

## 13. Do-not-repeat

- Do not redo AB50/51 mathematics merely because pre-V2 continuity was less granular.
- Do not reinterpret AB52 as proof.
- Do not treat AB55 counts as protocol proof.
- Do not treat AB57/58 as semantic closure.
- Do not claim AB65 execution without output evidence.
- Do not collapse UNKNOWN into known-empty or unchanged state.
- Do not treat implementation history fields as canonical observations without evidence.
- Do not assemble integrated Nexo before AB66's architecture gate.
- Do not rewrite historical artifacts to make continuity appear cleaner.

## 14. Audit conclusion

CONTINUITY_INTEGRITY = PARTIAL_UNTIL_REPAIR

The historical GitHub research lineage is substantially intact, and the pre-AB50 semantic lineage has already undergone a significant reconciliation audit. But a stronger statement — "there were no gaps across any prior chat boundary" — is not supported by the evidence.

The confirmed AB71 partial-write event proves that continuity can fail at the persistence layer. The correct response is not to distrust the research wholesale; it is to repair the canonical continuity graph, preserve every UNKNOWN, and make future checkpoints atomically verifiable.

No new P_AA semantic conclusion is established by AB72.
