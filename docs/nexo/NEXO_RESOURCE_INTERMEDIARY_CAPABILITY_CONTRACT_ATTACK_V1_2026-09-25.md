# NEXO — RESOURCE/INTERMEDIARY CAPABILITY CONTRACT ATTACK V1
Date: 2026-09-25
Status: RESEARCH / CLEAN ARCHITECTURE PRECONDITION. No V21 implementation.

## Contract
Each protected effect must declare a capability class for its resource boundary and may claim only properties supported by that class.

R0: no reliable fencing and no reliable reconciliation. Allowed: durable local intent/history and protected control decision. Not allowed: proof of external non-execution, exclusive ownership, or exactly-once.
R1: effect identity/idempotency lookup or reliable reconciliation, but no stale-owner fencing. Allowed: safer retry/reconciliation and effect identity tracking. Not allowed: proof that an obsolete owner cannot act.
R2: effect identity plus resource/intermediary conditional fence. Allowed: stale-owner rejection at the protected effect boundary, subject to documented atomicity. Not automatically allowed: cross-resource atomicity or proof of remote cancellation.
R3: provider transaction spans all relevant participants with documented atomicity/isolation/durability. Allowed: stronger multi-resource claims, but only for the exact transaction scope and documented failure semantics.

## Attack results
A. R0 + delayed stale owner: impossible to prove stale external write rejection. Result remains UNKNOWN/HOLD.
B. R0 + timeout after dispatch: timeout is UNKNOWN, never ABSENT.
C. R1 + duplicate retry: effect identity may allow reconciliation/deduplication, but stale-owner exclusion is not proven.
D. R1 + resource replacement: replacement can sever continuity; reconciliation must bind resource_incarnation.
E. R2 + stale owner: stale generation is rejected only if every protected mutation path atomically enforces the fence.
F. R2 + STOP race: STOP must invalidate the admission/fence context; owner generation alone leaves a STOP race.
G. R2 + resource replacement: old fence must not be accepted by the new incarnation unless continuity is established.
H. R2 + intermediary crash after admission: if dispatch status is unknown, recovery must reconcile; do not infer absence.
I. R3 + A confirmed/B unknown: aggregate can be resolved only if the transaction actually covers both participants and its outcome is authoritative.
J. R3 + side effect outside transaction: that side effect uses its own capability class.

## Mandatory capability contract fields
resource_id; resource_incarnation; capability_class; fence_scope; fence_generation; effect_identity; idempotency_semantics; transaction_scope; atomicity_claim; durability_claim; reconciliation_method; STOP_binding; replacement_semantics; timeout_semantics; retry_semantics; evidence_requirements; bypass_paths; failure/escalation state.

## New invariants
RC1 A claim cannot exceed the declared resource capability class.
RC2 Every protected mutation path must enforce the declared fence or be classified outside the guarantee.
RC3 Fence scope must cover the resource actually mutated.
RC4 Resource incarnation mismatch invalidates pending authorization unless continuity is proven.
RC5 STOP context bound to admission must be valid at the final protected boundary.
RC6 Timeout/connection loss after possible dispatch yields UNKNOWN unless authoritative evidence proves outcome.
RC7 R1 idempotency does not imply stale-owner exclusion.
RC8 R2 fencing does not imply multi-resource atomicity.
RC9 R3 claims are limited to documented transaction scope.
RC10 A bypass path can invalidate a fencing claim; architecture must inventory and control bypasses.
RC11 Recovery must reacquire current authority and reconcile unresolved effects.
RC12 Compensation/retry are distinct protected effects and cannot erase prior participant history.

## Repair decision
Capability class becomes part of the effect binding, not merely documentation. An effect without explicit capability classification is not eligible for strong protected-effect claims. The architecture must distinguish CONTROL_ADMITTED, EFFECT_FENCED, EFFECT_ATTEMPTED, OUTCOME_CONFIRMED, OUTCOME_REJECTED, and OUTCOME_UNKNOWN and never infer a later state from an earlier one.

## Evidence
Official etcd documentation describes atomic compare-guarded transactions and states that locks protect etcd keys while external resources require their own version validation. PostgreSQL documents advisory locks as application-defined coordination mechanisms whose enforcement is up to the application.

## Architecture consequence
No executor integration yet. The next architecture step must model capability/fence contracts explicitly and inventory bypass paths before implementation.

## Historical residuals preserved
AB50→AB58 remain unchanged: TERNARY_MATH_GAP FOUND; TERNARY_PROTOCOL_RESIDUAL UNKNOWN_DUE_TO_MISSING_SEMANTICS; TERNARY_PAA_COLLISION UNKNOWN; EVENTDAG_CLOSURE PARTIAL; RECONSTRUCTION BOUNDED_ONLY; SEMANTIC_FREEZE NOT_DECLARED; FORMAL_VERIFICATION/IMPLEMENTATION_NOT_PERFORMED.

## DO-NOT-REPEAT
Do not promote R0/R1 into R2 by assumption. Do not infer stale-owner exclusion from a lease or advisory lock. Do not treat idempotency as fencing. Do not treat resource replacement as continuity. Do not collapse UNKNOWN. Do not claim R3 atomicity outside its transaction scope. Do not implement V21. Do not claim CI/test PASS without fresh evidence.

## NEXT EXACT ACTION
Inventory concrete current Nexo/Lúmina effect paths and map each to RC1-RC12, identifying every bypass path and the minimum contract needed before any execution-owner implementation.