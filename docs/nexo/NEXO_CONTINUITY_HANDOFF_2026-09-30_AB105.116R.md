
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