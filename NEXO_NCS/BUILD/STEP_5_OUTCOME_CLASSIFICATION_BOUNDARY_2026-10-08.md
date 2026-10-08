# NEXO — STEP 5 OUTCOME CLASSIFICATION BOUNDARY — 2026-10-08

## Purpose

STEP 4 establishes the semantic validation boundary. STEP 5 gives the already-required OutcomeClassifier a concrete, minimal semantic contract.

This step does not add reconciliation machinery or external-effect execution.

## Architectural basis

The classifier is constrained by Final Distillation C7, C8, the Construction Design ownership model, the existing protected-transition composition, and historical AB/P evidence. Historical AB/TLC evidence is used only as an invariant source; no historical audit is reopened.

## Allowed terminal outcomes

The classifier may emit only:
- SAFE_COMMIT
- STALE_CANDIDATE
- SEMANTIC_CONFLICT
- AUTHORITY_STOP
- UNKNOWN
- RECONCILE_REQUIRED

The returned outcome must preserve the requested semantic kind. A classifier cannot reinterpret UNKNOWN as SAFE_COMMIT.

## Contract

classify({ kind, reasons, evidence }) -> Outcome

Required:
1. kind is one of the six canonical outcomes.
2. reasons and evidence are immutable result metadata.
3. No outcome may be synthesized from a boolean success flag.
4. The classifier does not execute, commit, retry, reconcile, or mutate canonical state.
5. The classifier does not invent evidence.
6. UNKNOWN remains UNKNOWN.
7. RECONCILE_REQUIRED remains distinct from UNKNOWN.
8. SAFE_COMMIT is a label for an already-established safe commit result; the classifier cannot establish commit safety itself.

## Ownership

OutcomeClassifier owns semantic result construction and normalization only. It has no provider access, canonical state access, ConditionalCommit access, EffectBoundary access, or Reconciliation authority.

## Minimal implementation

Implement a deterministic classifier factory with strict canonical outcome validation, immutable reasons/evidence, rejection of unknown outcome kinds, preservation of requested outcome kind, and no hidden conversion of UNKNOWN/RECONCILE_REQUIRED.

## Tests

Verify all six canonical outcomes, UNKNOWN preservation, RECONCILE_REQUIRED preservation, SAFE_COMMIT preservation, invalid-kind rejection, immutable metadata, and absence of commit/reconciliation capability.

## Explicit non-goals

Do not add retry logic, reconciliation logic, operation IDs, effect identities, queues, transaction wrappers, external effects, or legacy adapters.

## Exit criterion

STEP 5 closes when deterministic implementation exists, protected-transition tests use the real classifier, GitHub runtime verification passes, and proof states exact scope/limits.

If implementation reveals that SAFE_COMMIT can be produced without an independently established commit result, STOP and redesign the transition contract rather than patching the classifier.
