# NEXO CORE — FINAL DISTILLATION — 2026-10-08

## Status
CONSTRUCTION HANDOFF. This document is the distilled architectural contract from the closed research body. It is not another repository-wide audit.

AB105 remains frozen evidence. AB105.116R is the protected analytical anchor. AB105.117R is prohibited. TLC is frozen and must not be rerun.

## Architectural law
Nexo is a new Core architecture, not a patched evolution of the legacy orchestrator.

If implementation requires a structural patch to preserve a Core invariant:
STOP -> identify the violated assumption -> correct the architecture -> prove the corrected invariant -> continue.

No silent migration, invented verification, or hidden UNKNOWN->PASS conversion.

## Core lifecycle
INTENT
  -> CLAIM / PROVENANCE
  -> ISOLATED WORKING SNAPSHOT
  -> FINAL SEMANTIC VALIDATION
  -> CONDITIONAL COMMIT
  -> RECONCILIATION

The lifecycle is the protected transition boundary. Execution code does not own safety merely because it mutates the final object.

---

## Contract C1 — Authority / STOP / Fence

A transition may commit only while its authority context is valid and its STOP/fence conditions remain satisfied at final validation.

Required distinction:
- STOP REQUESTED != STOP ENFORCED
- REVOCATION ISSUED != REVOCATION ENFORCED
- AUTH CACHE HIT != CURRENT AUTHORITY
- FENCE ISSUED != FENCE ENFORCED

Authority and target validity are independent claims. Failure or UNKNOWN in either required side prevents a safe commit.

Decision:
- VALID authority + VALID target -> continue if all other contracts pass.
- Any required UNKNOWN/STALE/INVALID -> UNKNOWN/STOP/HOLD according to the transition contract.
- Never infer safety from a cached or earlier authority observation.

Ownership: the Core transition gate, not an LLM/provider and not a leaf action handler.

---

## Contract C2 — Identity / Incarnation

Every protected claim that refers to an entity, resource, agent, world object, provider, or authority-bearing actor must bind to the relevant identity/incarnation semantics.

A matching logical identifier is not sufficient when the underlying entity may have been replaced/recreated.

Identity/incarnation evidence participates in final validation whenever it can invalidate the claim.

No universal global revision is invented as a substitute for identity coverage.

---

## Contract C3 — Claim / Provenance / Dependency Envelope

A protected transition carries a claim-specific envelope describing what was actually relied upon.

Minimum semantic contents:
- intent/action;
- target and target incarnation where relevant;
- authoritative observations;
- dependencies read directly or transitively;
- predicate/range/aggregate dependencies;
- derived/helper inputs and their authoritative provenance;
- policy/config/logic context when claim-relevant;
- random/time/external/provider observations when causal;
- observation/source provenance needed for reconstruction;
- relevant versions/revisions already supported by the authoritative domain.

Rule:
A helper result, cache hit, derived value, summary, or action+target pair is not an authority boundary.

WriteSet-only validation is rejected.

The envelope is claim-specific: merely observed values that did not influence the protected outcome need not become dependencies.

If complete dependency coverage cannot be proven, the transition cannot silently become SAFE; use the declared UNKNOWN/HOLD/REVALIDATE semantics.

---

## Contract C4 — Isolated Working Snapshot

Protected candidate execution operates on an isolated mutable working graph.

Isolation must include the complete mutable candidate graph, not only obvious world/agent objects.

Known required detachment:
- nexoMemory;
- effectJournal;
- nested mutable structures reachable from the candidate;
- event/object aliases that could cross the protected boundary.

An object is not considered isolated merely because its top-level container was copied.

Candidate mutation must not mutate canonical state or another protected candidate through shared mutable references.

---

## Contract C5 — Final Semantic Validator

Before commit, the Core performs a final semantic validation against the candidate claim.

The validator rechecks, as applicable:
- authority;
- STOP/fence;
- identity/incarnation;
- claim-critical dependencies;
- predicate/range/aggregate conditions;
- relevant policy/config/logic;
- causal random/time/external/provider inputs;
- protected preconditions;
- candidate-local invariants.

Admission validation is not final validation.

A selected action is not a committed fact merely because it was previously admitted.

The validator must be claim-aware, not merely object-version-aware.

---

## Contract C6 — Conditional Commit

The canonical state transition commits through the existing cooperating-writer primitive:

persistState(expectedRevision)

Its semantic role is conservative conditional snapshot commit:
- accept only when the expected canonical revision condition holds;
- otherwise reject as a stale candidate.

Important boundary:
STATE_REVISION_CONFLICT means the candidate could not be conditionally committed against the expected canonical revision. It does NOT prove that an intended external effect did or did not occur.

persistState(expectedRevision) does not by itself prove:
- complete semantic dependency validation;
- complete writer fencing;
- exactly-once external effects;
- power-loss durability;
- universal writer compliance.

Those remain separate contracts.

---

## Contract C7 — Conflict Classification

The Core must distinguish at least:

1. SAFE_COMMIT
   Final semantic validation passed and conditional commit succeeded.

2. STALE_CANDIDATE
   Candidate no longer satisfies the required canonical conditional-commit condition.

3. SEMANTIC_CONFLICT
   Final validation found a dependency/predicate/identity/authority violation.

4. AUTHORITY_STOP
   Authority, STOP, or fence contract prevents safe continuation.

5. UNKNOWN
   The evidence is insufficient to establish whether the protected claim or effect is safe/complete.

6. RECONCILE_REQUIRED
   An ambiguous outcome crosses an external-effect or recovery boundary and cannot be resolved from available evidence.

These are semantic outcomes, not UI labels.

---

## Contract C8 — UNKNOWN / HOLD / RECONCILE

UNKNOWN is a first-class safety outcome.

Rules:
- Missing evidence is not negative evidence.
- Evicted effect evidence never means NOT_ATTEMPTED.
- Crash != execution result.
- Admission success != commit success.
- Commit conflict != external-effect absence.
- No evidence != no effect.

HOLD is used when the system can safely defer progression while preserving the claim and evidence.

RECONCILE is required when an operation crossed an effect/recovery boundary and the durable evidence cannot establish the outcome.

No retry may silently convert UNKNOWN into success.

---

## Contract C9 — External / Irreversible Effect Boundary

Current inspected Lúmina handlers are not proven to perform irreversible external effects. The Core must therefore preserve a clean boundary for future effects rather than pretending they are already exactly-once.

Any future external/irreversible effect requires explicit:
- operation identity;
- effect identity where distinct;
- durable intent/evidence semantics;
- outcome/recovery semantics;
- UNKNOWN/RECONCILE handling.

Filesystem/process/network/provider behavior must not be described as exactly-once or power-loss durable without independent proof.

---

## Contract C10 — Mission / Observation Provenance

Mission planning is not allowed to destroy claim identity silently.

Known compression boundaries:
- finding deduplication;
- bounded eight-step mission admission;
- durable mission projection;
- reconstruction/replan.

Historical eight-step bound is intentional and must not be silently removed.

However:
- omitted candidates are NOT_FAILED;
- omitted candidates are NOT_RESOLVED;
- failure-driven replan is not proof of overflow continuation;
- action+target equality is not proof of claim equivalence;
- summaries are not substitutes for causal evidence.

The redesigned mission layer must make non-admission semantics explicit when it becomes part of the Core contract.

Do not invent a new observation ID, deferred queue, or tombstone merely to patch this gap. First define the semantic contract and then choose the smallest mechanism that satisfies it.

---

## Contract C11 — Provider / Model Independence

The intelligence provider is not the authority over protected state.

Models may propose:
- intent;
- plans;
- hypotheses;
- interpretations;
- candidate actions.

The Core decides whether a proposed transition is admissible, safe, committed, UNKNOWN, or requires reconciliation.

Provider replacement must not erase identity, authority, memory, provenance, or continuity.

---

## Contract C12 — Evolution Rule

The Core must evolve by explicit architectural versioning/contracts, not silent compatibility layers.

Historical systems are evidence sources and possible adapters at the boundary; they are not allowed to dictate the internal Core model.

No legacy orchestrator is incrementally promoted into the Core through patches.

---

## Minimum ownership model

### Core Authority Gate
Owns authority, STOP, fence and identity validity at the protected transition boundary.

### Claim Builder
Owns intent + claim identity + provenance/dependency envelope.

### Snapshot Isolator
Owns complete candidate isolation and alias detachment.

### Transition Executor
Owns deterministic candidate-local mutation only.

### Final Semantic Validator
Owns final claim-aware revalidation.

### Conditional Commit Owner
Owns the single canonical conditional transition through persistState(expectedRevision).

### Outcome Classifier
Owns SAFE_COMMIT / STALE_CANDIDATE / SEMANTIC_CONFLICT / AUTHORITY_STOP / UNKNOWN / RECONCILE_REQUIRED.

### Effect Boundary
Owns future external-effect intent/identity/recovery semantics.

### Mission Layer
Owns bounded planning and admission semantics but cannot override Core safety contracts.

---

## Non-goals of this distillation

This document does NOT claim:
- complete implementation;
- complete dependency instrumentation;
- universal writer fencing;
- JMM happens-before guarantees;
- exactly-once external effects;
- power-loss durability;
- production readiness;
- that every remaining UNKNOWN has been resolved.

Those are implementation/evidence states to be handled explicitly.

## First construction target

Build only the protected-transition skeleton and its contracts/ownership boundaries.

Do NOT begin by patching the legacy orchestrator.

The first implementation must make the following path explicit:

Intent
-> ClaimEnvelope
-> IsolatedCandidate
-> FinalValidationResult
-> ConditionalCommitResult
-> ClassifiedOutcome

Any missing semantic required by these contracts is a construction blocker, not a reason to add a compatibility patch.

## Exit criterion for STEP 1

STEP 1 is complete when the Core contracts above are accepted as the minimum architectural boundary and can be mapped to concrete module ownership without requiring a legacy compatibility layer.

Then proceed to STEP 2 — CORE CONSTRUCTION DESIGN.
