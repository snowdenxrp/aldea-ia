# M0 — Recovery contract required before runtime re-entry
Date: 2026-10-18

## Decision
Do not implement recovery by merely forwarding a `reconcile` callback into `executeNexoStep()`. Source trace shows that a blocked terminal step is rejected by `beginNexoStep()`, and `commitRuntimeOutcome()` treats that blocked step as immutable. A callback-only patch would not create a correct durable recovery transition.

## Existing PG-009 contract used
`docs/nexo/PG-009_RECOVERY_RESTART_FENCING_2026-09-24.md` already specifies:
- restart is not release and does not establish authority;
- unresolved remote effects remain UNKNOWN; local absence cannot prove NO_EFFECT;
- a new operation ID cannot bypass unresolved duplicate/effect controls;
- same-operation retry preserves operation/effect identity;
- a changed plan must explicitly retire/link the old prepared operation;
- reconciliation is bound to the exact effect and requires operation_id, effect_id/effect_key, reconciliation owner/generation/lease-fence, authority epoch, observed state, freshness, evidence provenance/dependency closure, target/resource identity, precondition fingerprint, and policy/invariant/dependency versions.

This is reuse of existing project research, not a new external research pass.

## Runtime gap
- `executeNexoStep()` has no reconciliation input.
- `beginNexoStep()` rejects terminal steps, including the blocked step created by EFFECT_OUTCOME_UNKNOWN.
- `commitRuntimeOutcome()` returns early for an already terminal blocked step.
- Memory records attempts as one authoritative attempt per mission/step; recovery must not overwrite that original attempt.
- Adapter-level prepared retention is now covered at both adapter and memory-normalization boundaries, but retention alone does not resolve the effect.

## Required minimal design before implementation
1. Recovery admission identifies the original persisted prepared entry and original idempotency key; it cannot accept a caller-supplied replacement key.
2. Reconciliation result has three semantic classes, independent of generic mission status:
   - verified effect completed;
   - verified effect absent (the only class that can authorize a safe retry/replan decision, subject to current policy/preconditions);
   - unresolved/invalid/stale evidence, which stays blocked/UNKNOWN.
3. The reconciliation record must bind to the exact PG-009 fields above. Missing authority/fence/provenance inputs must fail closed; do not fabricate them or imply that a callback is an authority source.
4. Preserve the original failed/blocked attempt as immutable history. Store reconciliation as a distinct linked record; only a verified state may inform a later mission transition.
5. SAME_OPERATION_RETRY preserves the original effect identity. REPLAN_SAME_MISSION must explicitly retire/link the prepared operation before a new semantic operation is admitted. NEW_OPERATION is only for a genuinely different semantic effect and cannot bypass unresolved causal dependencies.
6. Add an integrated regression across execute → UNKNOWN → memory normalization/persistence → reconstruction → reconciliation → recovery decision, asserting no second handler call on UNKNOWN and no new key until resolution.
7. Until a real authority/fence and provenance boundary exists, this remains a non-authoritative simulation contract; protected effects stay STOP.

## Verification context
The prepared-effect retention change is verified on source/test head `dd4e8fd88e8d22040b2593af82bbe7f724fa04bf`:
- Mission admission/restart continuity [39087886377](https://github.com/snowdenxrp/aldea-ia/actions/runs/39087886377) — PASS.
- STEP 4 [39087886365](https://github.com/snowdenxrp/aldea-ia/actions/runs/39087886365) — PASS.
- STEP 5 [39087886450](https://github.com/snowdenxrp/aldea-ia/actions/runs/39087886450) — PASS.

These runs verify bounded retention regressions, not the integrated recovery path.

## Gate
STEP 7 remains OPEN / STOP / UNKNOWN. Protected effects remain STOP. No claim of legitimate owner authority or production protected-path closure is made.
