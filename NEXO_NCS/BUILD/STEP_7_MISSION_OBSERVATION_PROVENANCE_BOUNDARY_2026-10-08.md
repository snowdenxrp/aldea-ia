# NEXO NCS — STEP 7: MISSION / OBSERVATION PROVENANCE BOUNDARY
Date: 2026-10-08
Status: DESIGN READY — IMPLEMENTATION NOT STARTED

## Why STEP 7 exists

STEP 6 closed the reconciliation boundary without manufacturing an integration path.

The next construction surface is the mission/provider boundary because the final distillation explicitly identifies mission/finding provenance compression as a known architectural issue, while the protected Core lifecycle is already defined and runtime-verified in its component boundaries.

STEP 7 is therefore NOT an external-effect implementation and NOT a legacy-orchestrator migration. It defines the minimum semantic boundary by which observations/proposals can enter mission planning without silently losing claim-critical provenance.

## Evidence basis — MASTER + AB + P

### MASTER / final distillation constraints

The Core requires:
- claim-specific provenance and dependency envelopes;
- preservation of causal evidence through compression/reconstruction;
- model/provider proposals without authority or commit rights;
- explicit treatment of the historical bounded mission admission;
- omitted candidates are NOT_FAILED and NOT_RESOLVED;
- no invented observation IDs, deferred queues or tombstones merely to patch a gap.

### AB evidence

Historical AB research established:
- WriteSet-only validation is insufficient;
- helper/cache/derived values can hide causal dependencies;
- authority generation, operation identity, observation version, resource version and incarnation are distinct concepts;
- UNKNOWN must not be collapsed into failure or success;
- admission/acceptance is distinct from commit/effect;
- historical mission/finding compression must preserve semantic identity rather than relying on action+target equality.

AB105 remains frozen evidence. No historical AB audit is reopened by STEP 7.

### P / P112 evidence

P112 recovered concrete current-code boundaries:
- finding deduplication can collapse distinct observations when causal dimensions are not equivalent;
- severity-based selection can act as an implicit claim-selection policy;
- the intentional eight-step bound truncates the executable/persisted mission;
- pre-cap objective/dependency calculations can differ from the admitted post-cap graph;
- candidates excluded by the bound are neither demonstrated failed nor resolved;
- current production assistant findings lack a demonstrated durable raw report identity;
- failure-driven replan does not prove continuation semantics for non-admitted candidates;
- existing run/sample identity must be exhausted before inventing a new identity mechanism.

These findings are design evidence, not permission to copy the old mission architecture into Core.

## STEP 7 semantic contract

### 1. Proposal remains untrusted

Mission/provider output enters the boundary as proposal/observation input.

It has:
- no authority;
- no commit rights;
- no ability to mutate canonical state;
- no ability to declare SAFE_COMMIT.

### 2. Observation provenance must survive planning

For every observation that can influence an admitted claim, the boundary must preserve the causal identity needed to distinguish semantically different observations.

At minimum, when applicable:
- source/producer;
- target/incarnation;
- observation inputs;
- freshness/version context;
- predicate/range/aggregate scope;
- derived provenance;
- action/payload;
- relevant policy/config/logic context;
- existing observation/run/sample identity if one is actually present.

Action+target equality alone is not semantic equivalence.

### 3. Deduplication is not proof of equivalence

A dedupe key may compress only observations whose claim-critical dimensions are established equivalent under the current contract.

If equivalence cannot be established, the boundary must not silently discard one observation merely because a coarse key matches.

No new identity mechanism is introduced in STEP 7 solely to solve this. If existing evidence is insufficient, the state remains an explicit contract gap.

### 4. Bounded admission is a semantic boundary

The historical eight-step bound is intentional and is NOT removed.

STEP 7 must distinguish:
- observed;
- admitted;
- not admitted by budget.

Not-admitted does NOT mean:
- failed;
- resolved;
- committed;
- retried.

The contract must preserve enough provenance to allow the redesigned system to define what happens next without pretending omission was resolution.

STEP 7 does not invent a deferred queue or continuation cursor.

### 5. Objective/dependency graph consistency

Any objective/dependency representation used by the mission layer must refer to the same admitted semantic graph that execution will consume, or explicitly represent the distinction.

The Core must not allow a planner to claim an objective/dependency relationship that disappears merely because a later compression boundary truncates the executable graph.

### 6. Core safety remains outside mission authority

Mission planning may select/propose candidates.

It may not:
- authorize;
- final-validate;
- commit;
- reconcile;
- override STOP/fence/identity;
- convert UNKNOWN to success.

The protected transition remains the sole safety boundary.

## Minimum boundary objects

STEP 7 design requires only semantic shapes, not premature infrastructure:

- ObservationEnvelope
  - source/provenance;
  - causal inputs;
  - target/incarnation when applicable;
  - claim-relevant freshness/version information;
  - derived provenance;
  - proposed action/payload.

- MissionCandidate
  - ObservationEnvelope;
  - candidate claim reference;
  - explicit admission status.

- AdmissionResult
  - ADMITTED;
  - NOT_ADMITTED;
  - INVALID / UNKNOWN where evidence is insufficient to classify safely.

The exact fields and identity mechanism must be finalized only from existing repository evidence during implementation.

## Non-bypass invariants

1. Provider cannot commit.
2. Mission planner cannot authorize.
3. Mission planner cannot final-validate.
4. Dedupe cannot silently erase claim-critical provenance.
5. Budget truncation cannot become FAILED/RESOLVED by implication.
6. Objective/dependency data cannot describe a graph different from the admitted executable graph without explicit semantics.
7. UNKNOWN cannot become PASS through planning.
8. No global revision substitutes for claim-specific provenance.
9. No legacy orchestrator becomes the privileged Core path.
10. A structural conflict with these invariants triggers STOP and redesign, not a patch.

## Non-goals

STEP 7 does NOT:
- implement external-effect identity;
- implement retries;
- create deferred queues;
- create tombstones;
- invent runId/sampleId/observationId;
- integrate the legacy orchestrator;
- claim exactly-once;
- claim durable observation recovery;
- prove complete dependency instrumentation;
- change the historical eight-step budget.

## Runtime exit criterion

STEP 7 may close only after focused runtime tests demonstrate:
1. provider proposals remain non-authoritative;
2. claim-critical provenance survives the observation-to-candidate boundary;
3. coarse dedupe cannot silently collapse demonstrably distinct causal observations;
4. NOT_ADMITTED remains distinct from FAILED/RESOLVED;
5. the admitted objective/dependency graph is the graph execution is allowed to consume;
6. mission output cannot bypass protected-transition safety contracts.

If implementation requires an invented identity, queue, retry protocol, tombstone, transaction wrapper, or legacy compatibility patch merely to pass these tests, STOP and revise the semantic contract first.

## Epistemic limits

STEP 7 will not claim:
- complete production observation identity;
- complete dependency closure;
- exactly-once execution;
- power-loss durability;
- universal writer participation;
- distributed fencing;
- production readiness.

Those require separate evidence/contracts.

## Next exact action

Before implementation:
1. recover existing observation/run/sample identity candidates from current code/tests;
2. map the minimum provenance envelope against the existing Core ClaimEnvelope;
3. define whether ObservationEnvelope and ClaimEnvelope should be separate semantic objects or one boundary representation;
4. only then implement the smallest contract required by the evidence.

No historical AB/TLC/Kafka audit is reopened.
