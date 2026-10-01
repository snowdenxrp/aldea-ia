
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

## AB105.116R audit pass 23 — S11 expected-vs-observed effect minimum semantics — 2026-09-30

### Frozen historical boundary
AB105.112R requires reconciliation where expected and observed effects differ materially. AB105.111R separately freezes OBSERVED, ABSENT_UNPROVEN, UNKNOWN and PARTIAL as distinct effect outcomes.

Therefore S11 cannot be implemented honestly by treating any one of these states as 'mismatch'. In particular:
- UNKNOWN means the effect outcome is not established.
- ABSENT_UNPROVEN means absence has been asserted but remains unproven.
- OBSERVED means an effect was observed.
- PARTIAL means the observed/reconstructed effect is incomplete.
None of those states, by itself, says what effect was expected or whether the difference is material.

### Current representation gap
116R contains effectOrigin, effectState and effectId, but no expected-effect object or relation.
Consequently the model cannot distinguish at least these cases:
1. expected E1, observed E1 -> no material mismatch;
2. expected E1, observed E2 -> potential material mismatch;
3. expected E1, effect UNKNOWN -> uncertainty, not mismatch;
4. expected E1, effect ABSENT_UNPROVEN -> absence claim requiring its own evidence boundary;
5. expected E1, effect PARTIAL -> incomplete result requiring reconciliation rules.

### Minimum semantic object
The smallest honest addition is not merely an expectedEffectId variable. The contract needs three meanings:
1. EXPECTED_EFFECT — what consequence the operation/decision predicts or requires;
2. EFFECT_RELATION — how the observed/reconstructed result relates to that expectation (for example MATCH, MISMATCH, PARTIAL, UNKNOWN);
3. MATERIALITY_RULE — what differences are consequential enough to require reconciliation.

An implementation can later compress these into fewer state fields if the semantics remain equivalent, but the semantic contract must distinguish them first.

### Scope question
The expected effect must be tied to the relevant decision/operation when the consequence is operation-scoped. Otherwise an unrelated observed effect could be incorrectly used to satisfy or reconcile an expectation.
However, AB105.111R also allows evidence-scoped observations that are not necessarily operation-scoped. Therefore a universal operation binding is not yet justified.

### Minimum S11 predicate
Conceptually, S11 needs a predicate of the form:
EXPECTED_DEFINED ∧ OBSERVATION_APPRAISED ∧ MATERIAL_DIFFERENCE(expected, observed) => RECONCILIATION_REQUIRED
The exact domains and relation values remain open until the expected-effect contract is frozen.

### Important non-overclaim
This pass does not authorize adding expectedEffect state to 116R. It establishes that S11 is a genuine representation gap and identifies the minimum semantic meanings required before modeling.

### Result
S11 = CONFIRMED REPRESENTATION GAP.
EXPECTED_EFFECT_SEMANTICS = REQUIRED_BEFORE_MODEL_CHANGE.
MATERIALITY_RULE = OPEN.
EFFECT_RELATION = OPEN.
MODEL_CHANGE = NOT_AUTHORIZED.
TLC_LIVE_RUN = STILL_IN_PROGRESS.

### Next
Audit the semantic definition of effectId against this S11 result and determine whether one shared identity can safely represent both effect identity and observation/event identity, or whether two identity dimensions are required.

## AB105.116R audit pass 24 — S12 effect identity vs observation/event identity — 2026-09-30

### Evidence boundary
AB105.111R explicitly separates OPERATION_ID (when operation-scoped) from OBSERVATION_ID/EVENT_ID (when evidence-scoped). It also requires SUBJECT_IDENTITY, INCARNATION_ID when runtime-scoped, and provenance/freshness/coverage.
Therefore the historical contract does not authorize treating an operation identity and an evidence identity as the same semantic object.

### Current 116R
effectId is currently the only identifier attached to an observed effect. It is selected directly from Effects and is written by both ObserveExternal and ObserveNexo.
No uniqueness, provenance, observation-event identity, or binding relation is modeled for effectId.

### Three semantic cases
A. EFFECT_IDENTITY: identifies the consequence/effect itself. Then an observation/event identity is a separate evidence object when multiple observations of the same effect are possible.
B. OBSERVATION_IDENTITY: identifies the observation/evidence record. Then the underlying effect identity must be represented separately if S11 or reconciliation needs to compare the consequence itself.
C. Combined identity: one identifier intentionally means both effect and observation. This is only safe if the contract proves that one-to-one identity is always valid; current historical evidence does not establish that.

### S11 interaction
S11 needs to compare an expected consequence with an observed/reconstructed result. That comparison is about effect semantics, while provenance concerns the evidence event that established the observation.
Therefore collapsing effect identity and observation/event identity risks conflating two different questions:
- What consequence exists or was expected?
- What evidence event established the observation?
This would make later reconciliation provenance ambiguous.

### Minimum conclusion
A single identifier is NOT yet justified as the universal identity for both concepts.
The smallest safe semantic boundary is to define EFFECT_ID separately from OBSERVATION_ID/EVENT_ID when the evidence model requires both. The observation/event identifier may remain absent for genuinely non-evidence-scoped effect state, but the contract must state when it is required.
Likewise, operation/subject/incarnation correlation should be attached conditionally when the observation is operation- or runtime-scoped, rather than imposed universally.

### Result
S12 = SEMANTIC DEFINITION GAP CONFIRMED.
EFFECT_ID_AND_OBSERVATION_ID = DISTINCT_CONCEPTS.
UNIVERSAL_COMBINED_IDENTITY = NOT_JUSTIFIED.
CONDITIONAL_CORRELATION = REQUIRED_WHEN_SCOPE_DEMANDS_IT.
MODEL_CHANGE = NOT_AUTHORIZED.
TLC_LIVE_RUN = IN_PROGRESS.

### Live TLC checkpoint
Run 36781846063 / job 110113752493 is still IN_PROGRESS. Step 5 Run TLC finite model remains in progress; step 6 evidence upload remains pending. No PASS/FAIL result exists yet.

### Next
Freeze the semantic dependency between S11 and S12, then audit epoch-bound admission (D1a) and the exact P1/P2 policy boundary before any model revision.

## AB105.116R audit pass 25 — D1a admission epoch and P1/P2 boundary — 2026-09-30

### Historical evidence
AB105.111R makes AUTHORITY_EPOCH mandatory whenever an input is authority-scoped. It defines STALE as valid identity that is outside the current freshness/epoch boundary, and T1 explicitly expects OLD authority arriving after CURRENT epoch to be STALE/rejected.
This is stronger than merely recording current authority: the admission decision must retain enough epoch information to determine whether the admitted input belongs to the current authority boundary.

### Current 116R mismatch
116R records authorityAtAdmission, but not admissionEpoch. AdmitCurrent copies the current authority value without preserving the epoch that made that input admissible.
Because EstablishAuthority only writes CURRENT and RevokeAuthority leaves the epoch CURRENT, the current model cannot represent distinct authority epochs E1 and E2. Therefore it cannot execute the historical T1 cross-epoch distinction.

### P1 vs P2
P1 = an old authority-scoped admission becomes STALE after an epoch transition.
P2 = the old input remains identifiable but must be explicitly revalidated/re-admitted under the new epoch before consequential execution.
Both preserve the common frozen rule: an epoch change must never silently convert an old admission into current authorization.
The historical artifacts establish the need for epoch-bound admission, but they do not define an executable epoch-advancement transition or select P1 versus P2.

### What is actually required before model revision
1. Define what event advances E1 -> E2 and makes E1 OLD.
2. Define whether an admitted input carries an immutable admissionEpoch.
3. Define the exact stale/revalidation rule (P1, P2, or an explicitly scoped alternative for epoch-independent inputs).
4. Define whether authorityAtAdmission remains necessary once admissionEpoch exists; do not remove it merely because it appears redundant.

### Strong conclusion
D1a = SEMANTIC OBSERVABILITY REQUIREMENT CONFIRMED.
EPOCH_ADVANCEMENT = UNDEFINED.
P1/P2 = OPEN.
NO_MODEL_CHANGE_AUTHORIZED.

### Next
Perform a dependency audit across D1a, S9, S11 and S12 to ensure the eventual model revision does not solve one boundary by collapsing another. TLC remains live until independently observed as completed.

## AB105.116R audit pass 26 — dependency closure D1a ↔ S9 ↔ S11 ↔ S12 — 2026-09-30

### Dependency graph
D1a (admission epoch) constrains which authority-scoped input may support a decision.
S9 (reauthorization provenance) constrains what evidence may restore VALID authority after recovery.
S11 (expected-vs-observed) constrains whether the recovered/observed consequence matches what was expected and whether reconciliation is required.
S12 (identity/provenance) constrains which effect and which evidence event are actually being correlated.

These are not four independent variables. They form a provenance chain:
ADMISSION CONTEXT → AUTHORITY/DECISION → EXPECTED EFFECT → OBSERVATION/EVIDENCE → RECONCILIATION → REAUTHORIZATION.

### Cross-dependency findings
1. D1a → S9: reauthorization cannot safely rely on reconciliation if the evidence used for reconciliation was admitted under an obsolete authority epoch. Reconciliation evidence must itself have a defined authority/freshness scope.
2. S12 → S11: an expected-vs-observed comparison requires enough identity/correlation to establish that the observation concerns the expected effect. Otherwise MATERIAL_DIFFERENCE can be computed against the wrong consequence.
3. S11 → S9: if reconciliation is permitted to serve as authority evidence (policy A), the reconciliation result must identify the expected effect, observed result, evidence provenance, and authority scope that justify the reauthorization. Otherwise A silently collapses effect consistency into authority authorization.
4. S12 → S9: if fresh authority evidence is required (policy B/C), that evidence needs its own evidence identity/provenance and must not be confused with an effect observation.
5. D1a → S11: an observed effect can be fresh yet still be inadmissible for a current authority-scoped decision if its authority epoch is obsolete. Freshness alone is not epoch validity.

### Critical architectural boundary
Do NOT solve D1a by simply adding admissionEpoch and then allow all later observations/reconciliation to inherit that epoch automatically. That would create false provenance inheritance.
Do NOT solve S12 by binding every effect to operationId universally. Historical semantics permit evidence-scoped observations that may not be operation-scoped.
Do NOT solve S9 by declaring reconciliation COMPLETE = authority VALID without specifying what authority-bearing evidence makes that implication valid.
Do NOT solve S11 by treating any observed effect as the expected effect merely because effectId is present.

### Minimum combined contract before model revision
The next model revision needs, at semantic level (not yet TLA+ fields):
- authority/admission epoch identity for authority-scoped decisions;
- explicit authority-evidence provenance for any transition to VALID after recovery;
- expected-effect semantics and materiality relation;
- separate effect identity vs observation/event identity where evidence requires both;
- conditional correlation to operation/subject/incarnation according to scope;
- explicit freshness, coverage, and provenance boundaries for evidence used in reconciliation.

### Closure status
D1a = CONFIRMED OBSERVABILITY GAP.
S9 = CONFIRMED PROVENANCE SEMANTICS GAP.
S11 = CONFIRMED REPRESENTATION GAP.
S12 = CONFIRMED IDENTITY/PROVENANCE SEMANTICS GAP.
These findings are mutually consistent; none authorizes a model change yet.

### Next
Perform the final pre-revision guard audit: determine which current guards can remain unchanged, which are merely candidates, and which would become invalid/insufficient after the semantic contract is frozen. TLC live run remains separate from this semantic work.

## AB105.116R audit pass 27 — pre-revision guard audit — 2026-09-30

### Classification method
Each current guard is classified without changing it: KEEP = directly consistent with frozen semantics; CANDIDATE = plausible but policy-dependent; INSUFFICIENT = cannot close the identified semantic boundary; CONFLICT-RISK = may encode an unstated assumption.

### KEEP / structurally sound
- StartOperation requires current VALID authority + CURRENT epoch + ACCEPTED/FRESH/SUFFICIENT context. This remains a necessary execution gate.
- ObserveNexo requires VALID authority at execution and current VALID authority, and blocks DUPLICATE/CONFLICT admission plus ENFORCED stop. These are useful necessary gates, but not complete S1/S8/S12 verification.
- EnforceStop requires REQUESTED before ENFORCED; EnforceFence requires ISSUED before ENFORCED. Their ordering guards remain sound.
- ReleaseSuccessor requires VALID/CURRENT authority, enforced fence, proven exclusivity, and no UNKNOWN effect. These remain necessary but are not sufficient to establish release scope.

### CANDIDATE / policy-dependent
- AdmitCurrent accepting without current VALID/CURRENT authority: may be valid for durable receipt before later appraisal, but cannot by itself mean consequential admission. Historical RECEIVED != ADMITTED and authority-scoped admission requires epoch context. Exact semantics must be frozen.
- Reauthorize from COMPLETE reconciliation + CURRENT epoch: candidate only; provenance semantics unresolved.
- ObserveAbsent from UNKNOWN + SUFFICIENT coverage: candidate only; absence evidence scope/provenance unresolved.
- Recover from any non-NONE operation state: candidate only; recovery phase semantics unresolved.
- ProveExclusivity from fence enforcement alone: candidate only; successor/participant scope unresolved.
- ReplayDuplicate/Conflict without operation-state guard: candidate only; whether replay classification is allowed after start is unresolved.

### INSUFFICIENT for known gaps
- authorityAtAdmission alone is insufficient for D1a; admissionEpoch semantics are missing.
- effectId alone is insufficient for S11/S12; expected-effect relation and observation/event identity semantics are missing.
- Reconciliation COMPLETE alone is insufficient as an explanation of reauthorization provenance.
- Current release gates do not bind release to a specific operation/effect context.

### CONFLICT-RISK
- StartOperation blocking only fence=ISSUED while allowing fence=ENFORCED is not automatically wrong, but it encodes a semantic choice that an enforced fence does not itself prohibit starting an operation. This must be explicitly classified, not silently treated as safe.
- SetContext resets admission but leaves freshness/coverage and authority snapshots intact; after semantic epoch binding this may create stale-context carryover unless the contract deliberately permits it.
- Recover can regress reconstruction from COMPLETE to PARTIAL; this may be legitimate for newly discovered missing evidence, but the contract must define whether reconstruction is monotonic.

### Revision discipline
No current guard is promoted to a final requirement merely because it looks safer. No guard is removed merely because it looks restrictive. The semantic contract must decide first; only then should the smallest model delta be derived.

### Result
PRE-REVISION GUARD AUDIT = COMPLETE.
MODEL_CHANGE = NOT_AUTHORIZED.
NEXT_REQUIRED = FREEZE_SEMANTIC CONTRACT FOR D1a/S9/S11/S12, THEN DERIVE MINIMUM REVISION.
TLC_LIVE_RUN = STILL SEPARATE FROM SEMANTIC AUDIT.

## AB105.116R audit pass 28 — semantic contract freeze boundary — 2026-09-30

### What can be frozen now
Four semantic requirements are now supported by the historical record and cross-audits:
1. D1a: authority-scoped admission must preserve the authority epoch at admission; an old admission must never silently become current after an epoch change.
2. S9: recovery/reconciliation does not by itself prove what authority evidence permits VALID after revocation; reauthorization provenance must be explicit.
3. S11: expected effect and observed/reconstructed effect are distinct concepts; material difference must be defined before reconciliation can be made authoritative.
4. S12: effect identity and observation/event identity are distinct concepts when evidence provenance requires both; operation/subject/incarnation correlation is conditional on scope.

### What must remain OPEN
- The actual epoch advancement event and exact OLD/CURRENT/FUTURE transition semantics.
- P1 versus P2 for handling an old admitted input after epoch change.
- Whether reconciliation may itself contain authority-bearing evidence (S9 policy A) or requires separate authority evidence (B/C).
- Exact expected-effect domain, relation values, and materiality rule (S11).
- Exact conditions under which an observation/event identity is mandatory and how it correlates to an effect/operation (S12).

### Important boundary
These open decisions are semantic policy, not implementation details. Choosing defaults merely to make TLC run would contaminate the model with assumptions that have not been justified by the evidence.

### Minimum revision shape — NOT YET IMPLEMENTED
Once the open semantics are decided, the likely smallest model change is additive rather than destructive:
- preserve existing authority and effect dimensions;
- add only the minimum admission-epoch/evidence/effect-relation identity needed by the frozen contracts;
- add transitions for epoch advancement and explicit authority evidence only if the chosen semantics require them;
- add invariants for the historical S1–S12 obligations that the new representation makes expressible;
- keep UNKNOWN reachable and avoid silently collapsing states.

### TLC boundary
The live TLC run remains an independent validation of the current 116R model. Its eventual result must not be used to choose unresolved semantics.

### Result
SEMANTIC CONTRACT = PARTIALLY FROZEN.
D1a/S9/S11/S12 CORE BOUNDARIES = FROZEN.
OPEN POLICY DETAILS = PRESERVED AS UNKNOWN/PENDING.
MODEL_REVISION = NOT_AUTHORIZED YET.

### Next
Before any revision, perform a compact adversarial witness inventory for each open policy so we know exactly what behavior each choice changes. Then select only semantics supported by the historical contract; otherwise retain UNKNOWN.

## AB105.116R audit pass 29 — adversarial witness inventory for open policy choices — 2026-09-30

### P1 vs P2 — old admission after epoch change
- W-P1: Establish E1 → AdmitCurrent X → epoch advances to E2 → old X is classified STALE/rejected. It cannot start under E2.
- W-P2: Establish E1 → AdmitCurrent X → epoch advances to E2 → X remains identifiable as E1 but requires explicit revalidation/re-admission under E2 before Start.
- Shared mandatory property: no silent E1→E2 authorization transfer.
- Difference: P1 is terminal rejection of the old admission; P2 preserves it as a recoverable candidate. Historical evidence establishes the shared property, not the policy choice.

### S9 — reauthorization policy A/B/C
- W-A: revoke authority → recover → reconcile COMPLETE → reconciliation itself carries authoritative evidence → VALID is restored.
- W-B: revoke authority → recover → reconcile COMPLETE → separate fresh authority evidence/event → VALID is restored.
- W-C: revoke authority → recover → reconcile COMPLETE → no fresh authority establishment → remain non-VALID until explicit authority establishment.
- Shared mandatory property: recovery/reconciliation cannot silently manufacture authority.
- Difference: A permits reconciliation to be authority-bearing; B separates evidence domains; C requires explicit authority establishment.
- Historical record does not select A/B/C.

### S11 — expected/observed/materiality
- W-MATCH: expected E1, observation E1 → no material mismatch.
- W-MISMATCH: expected E1, observation E2 → reconciliation required if materiality rule says the difference matters.
- W-UNKNOWN: expected E1, observation unknown → must not be treated as either match or mismatch.
- W-ABSENT: expected E1, absence evidence → must remain distinct from UNKNOWN and OBSERVED.
- W-PARTIAL: expected E1, partial observation → materiality may remain UNKNOWN or require reconciliation depending on coverage contract.
- Shared mandatory property: UNKNOWN, ABSENT_UNPROVEN, PARTIAL and OBSERVED remain distinct.
- Exact materiality rule is not frozen by AB105.111R/112R.

### S12 — effect vs observation/event identity
- W-EFFECT: effect E1 exists; evidence event O1 establishes observation of E1. E1 and O1 are different semantic objects.
- W-OPSCOPED: observation O1 concerns effect E1 for operation O1/op identity and required subject/incarnation.
- W-EVIDENCE-SCOPED: observation O2 is valid evidence but is not operation-scoped; forcing an operationId would create false correlation.
- W-CONFLICT: observation event O3 reports a different effect E2; identity/provenance must prevent it from being silently treated as E1.
- Shared mandatory property: evidence provenance cannot be lost by collapsing effect identity and observation identity.
- Exact mandatory correlation conditions remain OPEN.

### Cross-choice witness
A single recovery can exercise all four boundaries: old admission from E1, revocation, delayed observation with evidence identity, expected-vs-observed mismatch, and attempted reauthorization. This proves the decisions must be composed rather than selected independently.

### Decision discipline
No witness selects a policy by itself. Witnesses identify semantic consequences. Historical artifacts can justify mandatory properties; they do not justify inventing the missing policy.

### Result
OPEN-POLICY WITNESS INVENTORY = COMPLETE.
No semantic choice was made.
MODEL_CHANGE = NOT_AUTHORIZED.

### Next
Cross-check these witnesses against AB105.111R/112R frozen T1–T10 and S1–S12 one final time, looking specifically for any historical sentence that actually resolves one of the open choices. If none does, preserve the choices as UNKNOWN/PENDING.

## AB105.116R audit pass 30 — final historical cross-check + TLC result — 2026-10-01

### Historical cross-check
- AB105.111R establishes that AUTHORITY_EPOCH is required for authority-scoped input and that an old/outside-current epoch is STALE; T1 requires delayed old authority to be treated as STALE/rejected. It does NOT define an executable epoch-advancement transition or select P1 versus P2.
- AB105.112R separates recovery, reconciliation, and reauthorization and states that recovery must not silently transfer current authority. It does NOT establish whether reconciliation itself is authoritative reauthorization evidence (A), whether fresh authority evidence must be separate (B), or whether explicit authority establishment is required (C).
- AB105.111R/112R preserve OBSERVED, UNKNOWN, ABSENT_UNPROVEN, and PARTIAL as distinct states and require reconciliation when expected/observed effects differ materially, but do NOT freeze an exact expected-effect domain or materiality predicate.
- AB105.111R distinguishes OPERATION_ID (when operation-scoped) from OBSERVATION_ID/EVENT_ID (evidence-scoped), plus subject/incarnation/provenance/coverage as applicable. It does NOT impose universal operation correlation on every observation, nor define effectId as a universal substitute for observation/event identity.
- AB105.114R/115R contain no hidden epoch-advancement rule that resolves these choices.

### Final semantic classification
- P1 vs P2: UNKNOWN/PENDING; only the no-silent-epoch-transfer property is frozen.
- Reauthorization A/B/C: UNKNOWN/PENDING; provenance separation is frozen, exact authority-bearing evidence rule is not.
- S11 materiality: UNKNOWN/PENDING; state distinctions are frozen, exact materiality rule is not.
- S12 identity/correlation: UNKNOWN/PENDING; effect identity and evidence identity are not safely conflated, exact mandatory correlation scope remains open.
- Therefore: SEMANTIC CONTRACT remains PARTIALLY FROZEN. MODEL REVISION remains NOT AUTHORIZED.

### TLC finite model-checking result
Run 36781846063, job 110113752493, commit ec15fb987f79b890c6bd5ad5c957ac2633f4b3dc completed successfully.
- TLC 2026.08.11.125311.
- Model checking completed with No error has been found.
- 7,957,574,337 states generated.
- 251,910,656 distinct states found.
- 0 states left on queue.
- Complete graph depth: 31.
- Finished 2026-10-01 01:06:50 UTC; elapsed about 3h17m.
- TLC reports optimistic fingerprint collision probability .11 and actual-fingerprint estimate .004. This is TLC's collision estimate, not a proof of unbounded correctness.
- Evidence artifact: nexo-ab105-116r-tlc-evidence, artifact ID 11134199332, SHA-256 ad053fdc48b490819281000cbbf40a8eae76af6bed780d40795a719068ad4f44.

### Interpretation discipline
- This is a finite-state TLC PASS for the configured AB105.116R model and checks only the five configured properties: TypeOK, S1_ExecutionAuthority, S1_EffectAuthority, S4_ReleaseRequirements, S7_CompleteNeedsCoverage, S10_AtomicRequirement.
- It is NOT a proof of all S1–S12, not an implementation verification, not an unbounded correctness proof, and not evidence that the unresolved semantic policies are correct.
- The TLC PASS must not be used to choose P1/P2, A/B/C, S11 materiality, or S12 correlation semantics.

### Status
AB105.116R TLC = PASS (finite model, configured invariants only).
Open semantic decisions = preserved UNKNOWN/PENDING.
TLA+ model modification = NOT AUTHORIZED.
No additional backup/handoff file created.


## AB105.116R audit pass 31 — TLC evidence artifact byte-level/log cross-check — 2026-10-01

The uploaded TLC evidence artifact `nexo-ab105-116r-tlc-evidence` was retrieved and its `tlc.log` inspected directly. The terminal log independently confirms:
- `Model checking completed. No error has been found.`
- `7,957,574,337 states generated`
- `251,910,656 distinct states found`
- `0 states left on queue`
- complete state-graph depth `31`
- finished `2026-10-01 01:06:50`
- TLC fingerprint estimates: optimistic `.11`, actual-fingerprint `.004`.

This closes the evidence-integrity check for the reported finite TLC PASS. The fingerprint estimates are retained exactly as TLC evidence and are not converted into a correctness claim.

### Consequence
The current AB105.116R finite model has now passed both: (a) the GitHub Actions job/result inspection and (b) direct inspection of the uploaded TLC log artifact. No discrepancy was found.

Semantic status is unchanged: unresolved policy choices remain UNKNOWN/PENDING and no TLA+ model revision is authorized yet.


## AB105.116R audit pass 32 — Epoch/D1a historical closure check — 2026-10-01

### Scope
Performed the next semantic audit without modifying AB105.116R. Rechecked the historical epoch/admission boundary against AB105.111R and AB105.112R and searched the canonical repository for an executable epoch-advancement rule or a frozen P1/P2 choice.

### Confirmed historical facts
- AB105.111R freezes AUTHORITY_EPOCH as mandatory for authority-scoped input.
- AB105.111R defines OLD/CURRENT/FUTURE and requires an old/outside-current authority input to be STALE/rejected (T1).
- AB105.111R does NOT define an executable E1→E2 epoch-advancement transition.
- AB105.112R retains OLD/CURRENT/FUTURE as semantically distinct but also does NOT define epoch advancement.
- Canonical repository search for AUTHORITY_EPOCH E1/E2, epoch advancement, Reauthorize authorityEpoch, AB105.111R P1/P2, and admissionEpoch returned no additional historical rule resolving the gap.
- AB105.114R/115R contain no hidden epoch-advancement semantics that resolve it.

### Current 116R consequence
116R records authorityAtAdmission but does not record admissionEpoch. EstablishAuthority writes CURRENT; RevokeAuthority leaves the epoch CURRENT. Therefore 116R cannot represent distinct E1/E2 authority epochs or execute the historical T1 cross-epoch distinction.

### P1/P2 boundary
P1: old E1 admission becomes STALE/rejected after E2.
P2: old E1 admission remains identifiable as E1 but requires explicit revalidation/re-admission under E2 before consequential execution.
Historical evidence establishes only the shared mandatory property: NO SILENT E1→E2 AUTHORIZATION TRANSFER. P1 vs P2 remains UNKNOWN/PENDING.

### Classification
D1a = SEMANTIC OBSERVABILITY REQUIREMENT CONFIRMED.
EPOCH_ADVANCEMENT = UNDEFINED.
P1/P2 = UNKNOWN/PENDING.
ADMISSION_EPOCH = REQUIRED SEMANTIC INFORMATION BEFORE CONSEQUENTIAL CROSS-EPOCH ADMISSION CAN BE MODELED.
MODEL_CHANGE = NOT AUTHORIZED.

### S2/S3 follow-up clarification
Historical S2/S3 state distinctions remain represented in 116R: REQUESTED≠ENFORCED and ISSUED≠ENFORCED. RequestStop/IssueFence do not themselves imply enforcement. The unresolved gap is provenance/evidence for the transitions to ENFORCED, not a direct S2/S3 invariant counterexample. AB105.112R T4 specifically requires FENCE_ISSUED + absent enforcement evidence to remain blocked; 116R can only model this distinction indirectly because enforcement evidence is not represented separately. No new semantic choice was made.

### Dependency closure update
The audit dependency order is now confirmed as:
EPOCH → AUTHORITY PROVENANCE → ADMISSION → OPERATION → EXPECTED EFFECT → OBSERVATION → RECONCILIATION → REAUTHORIZATION.
Parallel control chain:
STOP REQUEST → ENFORCEMENT EVIDENCE → STOP ENFORCED;
FENCE ISSUE → ENFORCEMENT EVIDENCE → FENCE ENFORCED → EXCLUSIVITY EVIDENCE → EXCLUSIVITY PROVEN → SUCCESSOR RELEASE.
S9 reauthorization semantics must not be frozen before epoch and authority-evidence provenance are resolved. S11/S12 must remain separate from authority provenance.

### Continuity rule
AB105.116R remains the canonical anchor. No AB105.117R or other derived model version is authorized while the semantic audit remains open. No additional backup/handoff file is created; this pass is appended to the existing canonical handoff only.

### Next exact direction
Audit authority provenance: distinguish AUTHORITY_EVIDENCE, AUTHORITY_STATE, DECISION, and CURRENT_AUTHORITY as separate semantic roles; determine what historical evidence exists for the transition to VALID after revocation without selecting A/B/C prematurely.


## AB105.116R audit pass 33 — authority provenance / recovery-promotion historical cross-check — 2026-10-01

### Scope
Continued the authority-provenance audit after Pass 32. Cross-checked the canonical repository history around recovery authority, trust-root activation, authority epochs, revocation, and successor release. No modification to AB105.116R and no derived model version.

### Historical evidence recovered
1. An earlier exploratory recovery sketch explicitly modeled recoveryAuthorityEpoch. AcquireRecovery bound the recovery context to the then-current authorityEpoch; RevokeAuthority advanced authorityEpoch, invalidated the recovery token/owner, and cleared release authorization. This is historical evidence that recovery provenance must be bound to the authority generation that admitted it, but the sketch was exploratory and is NOT a frozen protocol or formal proof.
2. Earlier authority-foundation research distinguishes RECOVERED_STATE != AUTHORITY, VALID_SNAPSHOT != CURRENT_AUTHORITY, and SELF_SIGNED_RECOVERY != INDEPENDENT_RECOVERY. It identifies externally/pre-established recovery roots as the basis for creating a new authoritative epoch, while no-root recovery remains non-authoritative.
3. AB104.567/568 research establishes that blocked recovery requires an independent recovery authority and a protected transition; a new recovery key, witness set, backup, or local snapshot does not by itself establish current authority. If independence/uniqueness cannot be established, the safe state remains UNKNOWN/QUARANTINED.
4. AB104.563–565 establish that evidence validity, epoch validity, predecessor continuity, and current authority are distinct predicates, and that epoch/witness activation requires a protected semantic activation boundary. NEW_EPOCH != NEW_TRUST_BASIS != CURRENT_AUTHORITY.
5. AB105.098R successor-transfer research separates successor identity, authority, fencing, reconciliation, exclusivity, and release. Successor establishment/release is downstream of the authority-establishment question; it does not define the missing promotion-to-current-authority transition itself.
6. AB104.359 conflict-recovery research establishes that authentic competing recovery branches cannot be resolved by choosing the numerically larger/newer branch absent a pre-established authority relation. AUTHENTIC_BRANCH != CURRENT_AUTHORITY and MAX_REVISION != VALID_RESOLUTION.
7. AB104.506 and related authority-contract research bind protected authorization to authority epoch, revocation generation, dependency closure, fence revision and decision context. This supports treating authority evidence/provenance separately from effect reconciliation.

### Strong historical conclusion
The historical record supports a semantic chain stronger than the current 116R Reauthorize action:
RECOVERY_AUTHORITY
+ TRUST/CONTINUITY EVIDENCE
+ OLD-AUTHORITY FENCING/INVALIDATION
+ NEW AUTHORITY CONFIGURATION
+ PROTECTED ACTIVATION
+ REQUIRED RECONCILIATION/EXCLUSIVITY AS APPLICABLE
-> CURRENT_AUTHORITY

However, the exact action/evidence relation that turns that chain into authority = VALID after revocation is NOT frozen in the canonical AB105.111R/112R history. The historical recovery sketches provide candidate mechanisms but do not authorize silently importing one into 116R.

### S9 consequence
Current 116R still has: Reconcile COMPLETE AND authorityEpoch = CURRENT -> authority = VALID.
Pass 33 confirms that this is an explicit finite-model interpretation, not a historically established authority-promotion contract. The missing semantic roles remain:
- AUTHORITY_EVIDENCE
- AUTHORITY_CONFIGURATION / TRUST BASIS
- AUTHORITY_STATE
- CURRENT_AUTHORITY as the derived/applicable authorization condition
- DECISION as a separate authorization object where applicable

No A/B/C choice is made:
- A: reconciliation itself may carry authority-bearing evidence;
- B: separate fresh authority evidence establishes VALID;
- C: explicit authority-establishment transition is required after revocation.
These remain UNKNOWN/PENDING until a canonical frozen contract resolves them.

### Additional historical refinement
The old recoveryAuthorityEpoch sketch should be treated as provenance evidence only. Binding recovery to an epoch prevents silent cross-epoch reuse, but does NOT by itself prove independence, current configuration activation, exclusivity, or current authority.
RECOVERY_AUTHORITY_EPOCH_BINDING != CURRENT_AUTHORITY_PROOF.

### Status
- AUTHORITY_PROVENANCE = semantic gap confirmed; historical layers separated.
- RECOVERY_AUTHORITY_EPOCH = historical design evidence, not frozen final semantics.
- PROMOTION_TO_CURRENT_AUTHORITY = UNDEFINED / UNKNOWN.
- A/B/C = UNKNOWN/PENDING.
- P1/P2 = UNKNOWN/PENDING.
- S11 materiality = UNKNOWN/PENDING.
- S12 exact correlation scope = UNKNOWN/PENDING.
- MODEL_CHANGE = NOT AUTHORIZED.
- AB105.116R remains canonical anchor.
- No AB105.117R created.

### Next exact mission
Audit the historical authority-establishment artifacts around the recovered recoveryAuthorityEpoch path and compare their inputs against AB104.506, AB104.563–565, AB105.087–088, and AB105.111–112. The goal is to determine whether any already-frozen contract defines the missing authority-bearing evidence/activation boundary. If none does, preserve the gap as UNKNOWN rather than inventing a promotion action.

## AB105.116R audit pass 36 — authority promotion / semantic-admission boundary — 2026-10-01

Historical cross-check extended through AB104.390–403. AB104.390/401 separate evidence producer, verifier/appraisal, and authority decider; verified evidence does not automatically grant authority. AB104.401 defines a protected Z1 promotion boundary requiring claim-specific revalidation immediately before authority grant. AB104.402 establishes that required authority context must be derived from protected property/effect/policy semantics rather than solely from the claim instance. AB104.403 confirms that the schema/derivation mechanism itself is not semantic authority: requirement derivation and instance closure are separate obligations; conflicts, cycles, rollback, or missing dependencies lead to HOLD/UNKNOWN/REVALIDATE.

AB104.506 supplies the strongest historical protected-authorization binding found so far: ClaimDigest + AuthorityEpoch + RevocationGeneration + DependencyClosureDigest + FenceRevision + DecisionDigest, checked at the final protected gate. This is design evidence, not a frozen AB105 implementation contract.

Result: the missing S9 promotion relation is now narrowed to an explicit protected authority-decision boundary. The historical chain supports CURRENT_AUTHORITY_EVIDENCE / CURRENT_AUTHORITY_DECISION as distinct from appraisal, recovery reconstruction, reconciliation, and effect observation. It still does not freeze the issuer, exact decision record, activation/linearization action, or the precise mapping to authority=VALID after revocation.

No model change authorized. AB105.116R remains canonical. No AB105.117R. A/B/C UNKNOWN/PENDING. P1/P2 UNKNOWN/PENDING. Pass 36 is audit-only until persisted.

Next exact mission: trace the authority decision issuer/lifecycle and activation boundary, then test whether AB104.404+ resolves effective effect-class binding or remains upstream of authority promotion.

## AB105.116R audit pass 37 — effective effect-class boundary — 2026-10-01
Cross-check of AB104.404 found the next upstream boundary. EFFECT_CLASS cannot be caller-authoritative: DECLARED_EFFECT_CLASS and EFFECTIVE_EFFECT_CLASS must be separated. Effective class depends on protected operation semantics and, where applicable, provider capability, resource incarnation, adapter path, asynchronous/cascade behavior, participant footprint, and current policy. UNKNOWN class cannot silently default to a weaker class; a class downgrade requires independent semantic justification. Hidden protected participants make classification incomplete and therefore block a higher-authority grant unless an authoritative exclusion applies.

This reinforces the Pass 36 chain: protected semantic property/effect classification -> required context schema -> instance closure -> authority decision -> protected linearization. It does NOT close S9. No historical artifact found here freezes the exact issuer/decision record or activation action that maps current authority evidence to authority=VALID after revocation.

No model change authorized. AB105.116R remains canonical; no AB105.117R. Pass 37 is audit-only until persisted.

Next exact mission: trace EFFECT_FOOTPRINT/participant closure (AB104.405+) and separately continue tracing the issuer/lifecycle of CURRENT_AUTHORITY_DECISION; do not conflate effect classification with authority promotion.

## AB105.116R audit pass 38 — effect footprint / participant closure — 2026-10-01
AB104.405 confirms DECLARED_FOOTPRINT != EFFECTIVE/PROTECTED_FOOTPRINT. Hidden downstream databases, queues, callbacks, asynchronous workers, provider automations, fan-out, retries/redrives, cross-provider triggers, gateways, and resource-incarnation changes can expand the protected participant set. Required distinctions are DECLARED_FOOTPRINT, DISCOVERED_FOOTPRINT, OBSERVED_FOOTPRINT, PROTECTED_FOOTPRINT, and FOOTPRINT_CLOSURE_STATUS. Observed absence cannot prove footprint completeness. An unresolved protected participant yields CLOSURE_INCOMPLETE and cannot silently permit a higher-authority grant.

Important boundary: ENQUEUE != DOWNSTREAM_EFFECT; PROVIDER_ACK != DOWNSTREAM_CONFIRMATION; RETRY != proof of identical downstream topology. A dynamically discovered protected participant requires a new admission boundary or UNKNOWN/HOLD unless the parent contract already proves safe inherited authorization and identity lineage.

This strengthens the upstream chain for authority admission but does not resolve S9. Effect-footprint closure must remain separate from authority promotion. No model change authorized; AB105.116R remains canonical; no AB105.117R. Pass 38 is audit-only until persisted.

Next exact mission: AB104.406, runtime expansion and lineage across queues/callbacks/retries/fan-out/provider boundaries, while independently continuing the issuer/lifecycle trace of CURRENT_AUTHORITY_DECISION.

## AB105.116R audit pass 39 — runtime expansion / lineage — 2026-10-01
AB104.406 closes another important boundary: a protected participant discovered after the final gate cannot silently expand authority. Safe cases are limited to pre-authorized bounded dynamic expansion, a new admission boundary, or UNKNOWN/HOLD/REVALIDATE. Runtime discovery is evidence, not retroactive authorization.

Lineage must remain layered: OPERATION_ID, EFFECT_ID, ATTEMPT_ID, PARENT_LINEAGE_ID, PARTICIPANT_ID, EXECUTION_ID, FENCE_GENERATION, and RECOVERY_ATTEMPT_ID are semantically distinct. Same operation does not mean same attempt; same execution ID does not prove same attempt; trace correlation does not prove authorization or effect equivalence. Parent authorization cannot become unbounded child authority; cross-boundary inheritance must be authenticated and bounded. Resource incarnation and authority epoch remain binding dimensions.

This further constrains the protected admission context but does not close S9. In particular, no artifact here establishes the exact issuer/lifecycle of CURRENT_AUTHORITY_DECISION or the activation/linearization relation that changes authority state after revocation.

No model change authorized. AB105.116R remains canonical; no AB105.117R. Pass 39 is audit-only until persisted.

Next exact mission: AB104.407, authenticated lineage and stale-lineage rejection across duplication/reordering/replay, authority epochs, and resource incarnations; continue the independent CURRENT_AUTHORITY_DECISION issuer/lifecycle trace.

## AB105.116R audit pass 40 — authenticated lineage / replay boundary — 2026-10-01
AB104.407 separates two properties that must not collapse: VALID_LINEAGE_CORRELATION != VALID_AUTHORITY_BINDING. Trace context is correlation/observability, not authorization lineage. A protected downstream boundary needs an authenticated lineage envelope whose exact fields remain claim-specific, potentially including operation/effect/attempt/parent lineage, participant/incarnation, authority epoch, fence generation, effective effect class, footprint closure root, capability generation, policy/contract version, issuer/domain, destination and replay-prevention state.

Stale/replayed lineage must be rejected or held when safety cannot be established. Freshness alone is insufficient: epoch rollover, fence generation, resource incarnation, capability generation, footprint closure invalidation, or policy/contract changes can invalidate otherwise authentic lineage. Cross-domain handoff requires explicit inheritance binding; intermediaries that enforce or preserve the protected property become part of the relevant TCB.

This closes no S9 transition. AUTHENTICATED_LINEAGE != AUTOMATIC_AUTHORITY remains explicit. The issuer/lifecycle and activation/linearization of CURRENT_AUTHORITY_DECISION remain UNKNOWN/PENDING. No model change authorized; AB105.116R remains canonical; no AB105.117R. Pass 40 is audit-only until persisted.

Next exact mission: AB104.408, cryptographic lineage binding/key lifecycle/rotation/revocation/domain handoff, while independently tracing CURRENT_AUTHORITY_DECISION issuer and protected activation.

## AB105.116R audit pass 41 — cryptographic lineage / key lifecycle — 2026-10-01
AB104.408 establishes SIGNATURE_VALID != LINEAGE_CURRENT and KEY_POSSESSION != CURRENT_AUTHORITY. Cryptographic lineage has separate layers: message integrity, signer authentication, audience/path binding, operation/effect binding, freshness/replay binding, state-generation binding, and semantic authorization. No lower layer proves the higher layer.

Replay protection requires more than signatures: candidate combination is signed binding + unique ID/nonce + durable replay state + state-generation checks. Timestamp or nonce alone is insufficient for high-consequence protection. Key rotation introduces distinct signing-key, lineage/evidence, and authority/policy generations. Historical validity of an old signature must not be confused with current admission validity. Key compromise requires invalidating new use according to policy while preserving historical records and reconciling effects that may already have crossed the external boundary.

Cross-domain handoff requires local validation; Domain B must not inherit Domain A authority wholesale. Re-signing, lineage transformation, authorization delegation, and opaque routing create claim-specific TCB obligations. Cryptographic authenticity remains distinct from semantic authorization.

No S9 closure found. The cryptographic layer supplies authenticated evidence/binding, but still does not define the issuer/action that promotes CURRENT_AUTHORITY_DECISION to authority=VALID after revocation. No model change authorized; AB105.116R remains canonical; no AB105.117R. Pass 41 is audit-only until persisted.

Next exact mission: AB104.409, replay-state durability under partition/replication lag/failover/rollback/multi-region concurrency, while continuing the independent authority-decision issuer/activation trace.

## AB105.116R audit pass 42 — replay durability / partition / failover — 2026-10-01
AB104.409 confirms replay safety is not merely cryptographic: REPLAY_SAFETY = IDENTITY + CURRENT_STATE + DURABLE_DECISION + CONCURRENCY_CONTROL. LOCAL_REPLAY_CHECK != GLOBAL_REPLAY_EXCLUSION. A stale replica, partitioned dual admission, rollbacked replay ledger, or failover with stale epoch/fence/capability/closure state cannot silently authorize a protected effect.

Provider deduplication and ordering are bounded/provider-specific and must not be promoted to indefinite Nexo effect identity or global authority ordering. Missing replay records do not prove non-execution; consumed replay state does not prove the external effect happened; replay atomicity != external-effect atomicity. High-consequence cases may require authoritative linearization, proven strong coordination, or a provider guarantee whose semantics become part of the evidence/TCB boundary. Availability vs uniqueness is an explicit semantic trade-off, not something to hide behind generic distributed idempotency.

This strengthens the existing separation between replay admission, authority generation, and external-effect reconciliation but does not close S9. No model change authorized; AB105.116R remains canonical; no AB105.117R. Pass 42 is audit-only until persisted.

Next exact mission: AB104.410, anti-rollback/continuity of replay state across crash recovery, snapshot/backup restore, replica divergence, and authority-epoch rollover; continue independent tracing of CURRENT_AUTHORITY_DECISION issuer/activation.

## AB105.116R audit pass 43 — anti-rollback / continuity anchors — 2026-10-01
AB104.410 confirms RESTORED_STATE != CURRENT_AUTHORITY and VALID_SNAPSHOT != NON_ROLLBACK. A valid snapshot can be old; a local monotonic counter rolls back with the restored dataset and cannot prove non-rollback by itself. Security-critical replay state therefore needs independent/current continuity evidence or must remain UNKNOWN/HOLD/QUARANTINED until continuity is established.

Candidate continuity anchor fields include domain, continuity generation, authority epoch, replay-state generation, authenticated current-state root, previous-anchor reference, schema/policy versions, resource incarnation, trust/key generation, commit metadata and invalidation generation. The anchor is evidence of continuity lineage, not authority itself. Conflicting current anchors are a fork condition and must not be resolved by an assumed majority without a failure-domain/independence model. Snapshot integrity, provenance, freshness, continuity and authority remain separate predicates.

Recovery should not silently revive an old authority epoch. Candidate sequence is recovery fence -> reconcile post-snapshot uncertainty -> establish new/revalidated authority generation -> rebuild admission context. Missing post-snapshot records do not prove non-execution, and restored logical resources may represent new incarnations.

S9 remains open: continuity evidence can establish lineage of state, but AB104.410 still does not define the exact authority issuer/decision/linearization that promotes CURRENT_AUTHORITY after revocation. No model change authorized; AB105.116R remains canonical; no AB105.117R. Pass 43 is audit-only until persisted.

Next exact mission: AB104.411, compromise/equivocation/unavailability/restore of the continuity anchor itself and fork recovery; continue independent CURRENT_AUTHORITY_DECISION issuer/activation trace.