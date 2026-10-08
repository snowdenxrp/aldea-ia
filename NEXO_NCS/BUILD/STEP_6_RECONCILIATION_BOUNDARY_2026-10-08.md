# NEXO — STEP 6 RECONCILIATION BOUNDARY — 2026-10-08

## Purpose

STEP 6 defines the smallest Reconciliation contract required by the Final Distillation and Construction Design. It does not implement external effects, queues, retries, operation IDs, or recovery storage.

## Architectural basis

Reconciliation exists only when an ambiguous outcome crosses a recovery/effect boundary and available durable evidence cannot establish the outcome. UNKNOWN and RECONCILE_REQUIRED are therefore not interchangeable.

Historical AB/TLC/P evidence is frozen input to the contract. No historical audit is reopened.

## Semantic distinction

UNKNOWN means the current protected claim/effect cannot be safely classified from the evidence currently available, without establishing that a recovery boundary requiring reconciliation has been crossed.

RECONCILE_REQUIRED means there is an identified recovery/effect boundary whose outcome cannot be established from available durable evidence and therefore requires a reconciliation procedure.

Neither outcome may be converted to SAFE_COMMIT merely because execution is retried or because no contrary evidence is found.

## Reconciliation ownership

Reconciliation:
- consumes an explicit ambiguous outcome plus available evidence;
- evaluates only evidence supplied through its interface;
- may return a resolved semantic state only when the supplied evidence establishes it;
- otherwise remains UNKNOWN or RECONCILE_REQUIRED;
- never invents evidence;
- never mutates canonical state directly;
- never authorizes a transition;
- never invokes CandidateExecutor or ConditionalCommit;
- never performs an external effect;
- never treats absence of evidence as proof of absence of effect.

## Minimum contract

`reconcile({ case, evidence }) -> ReconciliationResult`

The case must identify the semantic boundary that triggered reconciliation and preserve the originating claim identity when one exists.

The evidence is explicit input, not hidden global state.

The result must distinguish:
- RESOLVED — only when supplied evidence establishes the required outcome;
- UNRESOLVED — evidence remains insufficient;
- INVALID — the reconciliation case/evidence is structurally invalid.

An UNRESOLVED result must retain the semantic uncertainty. It cannot be promoted to SAFE_COMMIT by the reconciler.

## Critical invariants

1. Crash != execution result.
2. Commit conflict != external-effect absence.
3. No evidence != no effect.
4. Evicted effect evidence != NOT_ATTEMPTED.
5. A reconciliation procedure cannot manufacture completion.
6. Reconciliation cannot bypass final semantic validation or conditional commit.
7. A reconciliation result is evidence for the owning Core transition; it is not itself canonical mutation authority.
8. Claim identity/provenance must survive the reconciliation boundary.
9. If the case does not identify a genuine recovery/effect ambiguity, do not manufacture RECONCILE_REQUIRED.
10. No retry may silently turn UNKNOWN into success.

## Why no new identifiers yet

The historical record identified operation/effect identity as a future requirement for irreversible effects. This step does not invent those identifiers because no external-effect contract has yet been introduced into the new Core.

If a later concrete effect boundary requires an operation/effect identity, that requirement must be specified first and then implemented deliberately.

## Minimal implementation target

For the first implementation, build only a deterministic reconciliation boundary that:
- validates the case shape;
- preserves claim identity and boundary classification;
- accepts explicit evidence;
- returns RESOLVED only from explicitly sufficient evidence supplied by the caller;
- returns UNRESOLVED when evidence is insufficient;
- rejects malformed cases;
- has no commit, authorization, execution, retry, queue, or external-effect capability.

## Construction stop condition

If implementation requires hidden durable state, a new identifier, a queue, a retry protocol, or an external-effect adapter merely to make the basic reconciler appear complete, STOP. Define the missing semantic contract before adding the mechanism.

## Exit criterion

STEP 6 closes only after deterministic reconciliation behavior is runtime-verified and its limits are recorded. Integration into protected-transition should occur only if a concrete current outcome path requires it; do not manufacture a reconciliation path merely to exercise the module.