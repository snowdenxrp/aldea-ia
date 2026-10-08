# NCS STEP 7 — Legacy dedupe boundary inspection — 2026-10-08

## Status
EVIDENCE CLOSED — legacy orchestration inspected; no legacy modification authorized.

## Scope
Inspect `src/nexo/orchestrator.js` only against the frozen STEP 7 ObservationEnvelope / claim-specific equivalence contract. This is an evidence pass, not an integration.

## Observed legacy behavior
`buildNexoMission()`:
- collects findings and injects `source`;
- maps finding code to an action;
- derives target from `finding.agent` or `finding.resource`;
- deduplicates before mission-step creation using:
  `action + "|" + target + "|" + finding.action.name`;
- discards the finding after the first matching key;
- creates mission steps containing action/target/reason/source and execution metadata;
- caps the persisted step list at 8.

`recordNexoPlan()` in `src/assistants/memory.js` persists only step-level fields:
`id, action, target, status, dependsOn`, plus mission metadata. It does not persist the original observation code, source, causal inputs, freshness, derived provenance, or explanatory evidence.

## Contract comparison
This legacy key is not a claim-specific equivalence predicate.

It can collapse two observations that share action/target/action-name while differing in:
- finding code;
- producer/source;
- observed value;
- causal inputs;
- freshness/temporal validity;
- target incarnation/version;
- derived causal provenance.

For `NEGATIVE_RESOURCE`, the current concrete contract explicitly requires resource identity, incarnation/version, observed value semantics, freshness/temporal validity, and claim-critical dependencies. The legacy key establishes none of those equivalence dimensions.

Therefore:
- legacy dedupe cannot be promoted to ObservationEnvelope equivalence;
- a dedupe hit cannot be interpreted as EQUIVALENT;
- omission from the bounded mission cannot be interpreted as FAILED/RESOLVED/COMMITTED/RETRIED;
- reconstructing from the legacy persisted mission cannot recover the dropped observation claim/provenance.

## Important boundary
The existing `missionId`, `generatedAt`, execution `idempotencyKey`, or memory reconstruction fields are not promoted to observation identity. Doing so would invent a semantic identity mechanism without a current contract.

## Decision
No modification to `buildNexoMission()` or `recordNexoPlan()` is made in this evidence step.

The correct construction surface remains the handoff:
ObservationEnvelope -> claim-specific equivalence/admission decision -> MissionCandidate -> admitted candidate graph.

If a future implementation requires changing the legacy dedupe behavior, it must first define the new Core contract and prove that the legacy behavior is no longer an authority boundary. It must not patch the legacy key into a pseudo-equivalence function.

## Remaining UNKNOWN
The repository does not yet establish a durable observation identity/provenance carrier for every production finding. This remains an explicit contract gap.

## Do not repeat
- Do not reopen the closed 8-step admission semantics.
- Do not invent observation IDs, queues, retries, tombstones, transaction wrappers, or compatibility layers.
- Do not integrate legacy orchestration into the new Core merely to make tests pass.
