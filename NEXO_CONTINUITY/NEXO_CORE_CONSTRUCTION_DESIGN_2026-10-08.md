# NEXO CORE — CONSTRUCTION DESIGN — 2026-10-08

## Status
STEP 2 of the construction handoff. This is a design contract, not implementation.

## Design rule
No legacy orchestrator patching. No compatibility layer inside the Core. Each module has one semantic owner. Cross-module behavior is expressed through explicit contracts.

## Core boundary

PROPOSAL
  -> ClaimBuilder
  -> AuthorityGate
  -> SnapshotIsolator
  -> CandidateExecutor
  -> FinalSemanticValidator
  -> ConditionalCommit
  -> OutcomeClassifier
  -> Reconciliation / EffectBoundary

The order is intentional. Execution cannot bypass final validation or conditional commit.

## Module ownership

### 1. Proposal Boundary
Accepts model/provider/application proposals.
Owns no authority and no commit rights.
Output is untrusted intent.

### 2. ClaimBuilder
Builds the claim envelope from the proposed intent and authoritative observations.
Owns claim identity, causal provenance and dependency declaration.
Must distinguish authoritative inputs from explanatory metadata.

### 3. AuthorityGate
Owns authority, STOP, revocation/fence and identity/incarnation checks that must hold before protected work.
It may reject or HOLD; it does not mutate canonical state.

### 4. SnapshotIsolator
Creates the protected working candidate.
Owns deep detachment of mutable reachable state required by the claim.
Canonical state remains read-only from the candidate's perspective.
No alias to mutable canonical memory/journal/event structures may cross the boundary.

### 5. CandidateExecutor
Mutates only the isolated candidate.
No canonical writes.
No external irreversible effects.
No authority decisions.
No final success declaration.

### 6. FinalSemanticValidator
Re-evaluates the actual claim against current authoritative conditions and the candidate result.
Owns final dependency/predicate/identity/authority/policy/random/time/external-input checks.
Must produce an explicit validation result; absence of evidence is not PASS.

### 7. ConditionalCommit
Owns the canonical conditional commit using the established expected-revision primitive.
It is the only Core owner allowed to transition canonical state.
A revision conflict is STALE_CANDIDATE, not proof of external-effect absence.

### 8. EffectBoundary
Separated from candidate commit.
Future irreversible/external effects require explicit operation/effect identity and UNKNOWN/RECONCILE semantics.
No exactly-once claim without separate evidence.

### 9. OutcomeClassifier
Maps validated/commit/recovery evidence to semantic outcomes:
SAFE_COMMIT, STALE_CANDIDATE, SEMANTIC_CONFLICT, AUTHORITY_STOP, UNKNOWN, RECONCILE_REQUIRED.

### 10. Reconciliation
Owns ambiguous recovery state.
It never guesses an outcome to make the system appear complete.
It consumes durable evidence and can remain UNKNOWN.

## Contract objects

### ClaimEnvelope
Contains, semantically:
- claim/intent identity;
- action;
- target + incarnation where relevant;
- authoritative reads;
- transitive dependencies;
- predicate/range/aggregate dependencies;
- derived provenance;
- policy/config/logic versions when causal;
- random/time/external/provider observations when causal;
- source/observation provenance required for reconstruction.

### Candidate
Contains:
- isolated mutable working graph;
- claim envelope;
- candidate-local mutations;
- no canonical references that permit mutation leakage.

### ValidationResult
Must be explicit:
- PASS only when every required condition is established;
- FAIL when a required condition is disproven;
- UNKNOWN when evidence is insufficient.

It must carry reasons/evidence references sufficient for classification.

### CommitResult
Must distinguish:
- committed;
- conditional conflict;
- commit failure/unknown where evidence cannot establish the canonical outcome.

Never infer external-effect status from canonical commit status.

### Outcome
A semantic union, not a boolean:
SAFE_COMMIT | STALE_CANDIDATE | SEMANTIC_CONFLICT | AUTHORITY_STOP | UNKNOWN | RECONCILE_REQUIRED.

## Non-bypass invariants

1. Provider cannot call ConditionalCommit directly.
2. CandidateExecutor cannot mutate canonical state.
3. CandidateExecutor cannot declare SAFE_COMMIT.
4. FinalSemanticValidator cannot be skipped for protected transitions.
5. ConditionalCommit cannot accept a candidate without the required validation result.
6. OutcomeClassifier cannot convert UNKNOWN to success.
7. Reconciliation cannot invent missing evidence.
8. External effects cannot be hidden inside CandidateExecutor.
9. Claim-critical provenance cannot be dropped between modules.
10. No module may use a global revision as a substitute for dependency validation.
11. Legacy orchestration code cannot become a privileged bypass around the Core boundary.
12. Any contradiction with an invariant causes an evidence stop, not a local patch.

## State machine

PROPOSED
 -> CLAIMED
 -> AUTHORIZED
 -> ISOLATED
 -> EXECUTED_CANDIDATE
 -> VALIDATED
 -> COMMITTING
 -> COMMITTED
 -> SAFE_COMMIT

Failure/uncertainty exits:
- AUTHORITY_STOP
- SEMANTIC_CONFLICT
- STALE_CANDIDATE
- UNKNOWN
- RECONCILE_REQUIRED

No transition from UNKNOWN directly to SAFE_COMMIT.

## Design decision: no universal transaction wrapper

The Core does not introduce a generic "transaction" abstraction merely to make the architecture look safe.

The protected transition is defined semantically by claim + isolated candidate + final validation + conditional commit. A broader transaction mechanism may later be justified only by demonstrated requirements.

## Design decision: no invented identifiers yet

Do not invent runId/sampleId/deferred queues/effect tombstones solely because historical Lúmina evidence exposed gaps.

First establish the new Core contracts. Mechanisms are added only when a concrete contract requires them.

## Construction order

A. Define immutable contract types and semantic result unions.
B. Define module interfaces and ownership boundaries.
C. Implement candidate isolation.
D. Implement final semantic validation skeleton.
E. Wire conditional canonical commit.
F. Add outcome classification and reconciliation.
G. Only then integrate mission/provider layers.

## First implementation gate

Before any mission/provider integration, prove with focused tests that:
- canonical state cannot be mutated through a candidate alias;
- final validation is mandatory;
- stale expected revision cannot commit;
- UNKNOWN cannot become SAFE_COMMIT;
- provider proposals have no commit authority;
- external effects have no hidden execution path.

## Explicit UNKNOWNs

This design does not yet claim:
- complete dependency instrumentation for every future domain;
- universal writer compliance;
- exactly-once external effects;
- power-loss durability;
- JMM happens-before guarantees;
- production readiness.

Those remain explicit evidence/implementation states.

## Exit criterion

STEP 2 closes only when these ownership boundaries can be implemented without introducing a structural patch to the architecture.

Next: STEP 3 — contract skeleton implementation, beginning with the protected-transition core and tests, not the legacy orchestrator.
