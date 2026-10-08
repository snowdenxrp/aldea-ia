# NCS STEP 7 — Smallest authoritative inputs for bounded admission
Date: 2026-10-08

## Status
PENDING — repository evidence is sufficient to define the input classes, but insufficient to derive a legitimate admission policy or authoritative selection rule.

## Scope
This does not reopen the closed 8-step semantics. It asks only what information must be authoritative for one bounded admission decision.

## MASTER
Admission is distinct from observation, equivalence, authority, validation, commit, execution, resolution and retry.
Provider/model output is proposal/evidence, not protected authority.
Claim-critical provenance must survive compression.
UNKNOWN must remain UNKNOWN.
No invented identity/queue/retry/tombstone/compatibility mechanism.

## AB
Historical evidence establishes:
- action+target equality is not semantic claim equivalence;
- admission/acceptance is distinct from commit/effect;
- severity-based selection can become an implicit policy;
- bounded selection can omit candidates without proving failure/resolution;
- derived/helper/cache values cannot be treated as complete authority boundaries;
- claim-specific dependencies matter.

## P/P112
Current repository evidence shows:
- production findings provide evidence/proposals, but not a demonstrated authoritative admission policy;
- legacy buildNexoMission sorts by severity before dedupe and then applies the historical eight-step bound;
- severity ordering is observable legacy behavior, but is not proven as the correct new-Core admission contract;
- current producer fields are insufficient to prove universal observation equivalence;
- current assistant reports do not expose a demonstrated durable run/report/sample identity;
- current mission persistence is a projection and loses claim-critical observation provenance.

## Candidate authoritative input classes
A bounded admission decision minimally needs distinguishable inputs from these semantic classes:

1. Candidate set — the candidate observations/claim proposals being considered. This is not an identity mechanism; it is the decision input.
2. Claim-specific evidence — evidence/provenance needed to determine eligibility under the claim's own semantics. Missing claim-critical evidence remains UNKNOWN.
3. Explicit admission policy/context — the rule that says which eligible candidates may enter the bounded mission set. Relevant policy/config/logic context must be explicit when it can affect the decision.
4. Bound — the historical bounded capacity is 8 and remains closed. The bound limits admission; it does not itself explain which candidates are selected.
5. Selection relation — an explicit authoritative rule for resolving competition when eligible candidates exceed the bound. Legacy severity ordering exists, but is not proven as the new-Core semantic rule.

These are minimum semantic categories, not an approved field schema.

## Not authoritative by itself
- provider/model confidence;
- action+target dedupe equality;
- observation existence;
- equivalence UNKNOWN;
- legacy missionId;
- generatedAt;
- execution idempotencyKey;
- global stateRevision;
- severity without an explicit policy defining its authority and semantics.

## Current decision
The repository does not currently justify implementing ADMITTED/NOT_ADMITTED from ObservationEnvelope alone.
The smallest defensible new-Core contract is to carry the candidate, claim-specific evidence, an explicit admission decision when one exists, and the evidence/context supporting that decision; otherwise preserve UNKNOWN/PENDING.
Do not manufacture a selection policy from legacy severity sorting.

## Future-countereffect analysis

### Severity-as-policy
Current benefit: deterministic legacy prioritization exists.
Future risk: severity becomes accidental universal scheduling authority and couples admission to producer-specific labels.
Contradiction risk: treating it as authoritative without proof would violate separation between observation evidence and explicit admission policy.
Evolution cost: future providers may use different severity semantics, making replacement a compatibility problem.

### Global stateRevision as admission proof
Current benefit: simple snapshot freshness signal.
Future risk: false confidence that all claim dependencies are covered.
Contradiction: established claim-specific dependency/provenance rules reject it as a universal semantic fence.
Evolution cost: later dependency-aware validation would have to undo the shortcut.

### Observation equality as admission dedupe
Current benefit: reduces candidate count.
Future risk: collapses distinct causal observations and changes which claims reach the bound.
Contradiction: violates claim-specific equivalence and UNKNOWN semantics.
Evolution cost: adding missing causal dimensions later changes historical equivalence behavior.

### Legacy mission metadata as identity
Current benefit: readily available lifecycle fields.
Future risk: binds pre-admission observations to post-admission identifiers.
Contradiction: observation identity and mission identity are distinct semantic layers.
Evolution cost: provider/device/run changes become constrained by legacy identifiers.

## Result
No admission policy is implemented in this checkpoint.
The architectural boundary is explicit:
Observation evidence + claim-specific evidence + explicit admission policy/context + bounded selection rule -> admission decision.
Only the first two evidence categories are concretely present today. The explicit authoritative selection policy remains PENDING.
If repository evidence cannot establish that policy without inventing semantics, preserve PENDING and move the unresolved decision into final Core distillation rather than patching legacy orchestration.