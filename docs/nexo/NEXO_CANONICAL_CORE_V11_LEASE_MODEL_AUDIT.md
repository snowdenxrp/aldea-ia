# V11 Lease Model Audit — 2026-09-23

Immediate source inspection found a fundamental composition error.

## V11-A01 — lease actions are not connected to module state

AcquireLease(table,...) , ExpireLease(table,...) , and TakeoverLease(table,...) constrain a local parameter table, but Next invokes them without binding table to recovery, reconciliation, or execution.

Therefore the actions do not necessarily constrain the actual module variables. This means the apparent lease transitions are not yet transitions of the system state.

This is a structural blocker, not a cosmetic syntax issue.

## V11-A02 — the three lease domains need one explicit transition relation

The intended design is a generic lease relation, but the module must instantiate it against the actual state variables, explicitly assigning recovery', reconciliation', or execution' while all unrelated variables are UNCHANGED.

## V11-A03 — stale-owner predicate is not temporal enforcement

StaleOwnerBlocked is only a predicate. Each protected transition must carry the owner/generation/expiry guard, with a separate invariant/correspondence obligation for fencing.

## V11-A04 — generation non-negativity is not temporal monotonicity

The canonical transition obligations must establish: successful acquire/takeover => generation' = generation + 1; expiry => generation' = generation; unrelated transitions => generation' = generation; no transition may decrease generation.

## V11-A05 — ExpiryDoesNotChangeWorld is vacuous

The current property is TRUE and constrains nothing. It must be replaced by an actual effect-state relation in the integrated canonical model, or removed from the lease-only kernel.

## V11-A06 — release invalidation is incomplete

The semantic contract requires stale release authorization to become unusable when its required recovery generation/lease is no longer current. This should be represented explicitly rather than relying only on Commit guards.

## Decision

Reject V11 as a canonical formal model in its current form. Do not patch individual lines. Rebuild the lease kernel around explicit operation-scoped transition actions whose primed variables are the real module state, then compose it with the canonical effect/evidence/release model.

Status: V11 DESIGN DRAFT / REJECTED FOR FORMAL CHECKING / NOT SANY-CHECKED / NOT TLC-CHECKED.
