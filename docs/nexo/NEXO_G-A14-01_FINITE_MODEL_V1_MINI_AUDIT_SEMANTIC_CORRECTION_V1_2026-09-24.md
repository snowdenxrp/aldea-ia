# NEXO G-A14-01 — Finite Model V1 Mini-Audit and Semantic Correction V1 — 2026-09-24

Status: MODEL AUDIT / REDESIGN REQUIRED
SANY/TLC: NOT RUN

## 1. Result

The first finite model draft was deliberately attacked before execution. Static semantic inspection exposed a more important issue than a simple syntax problem:

The Boolean admission state conflates two different concepts:

1. historical fact that a protected admission was committed;
2. current permission for execution to proceed.

Those concepts must not be represented by one predicate.

## 2. Counterexample discovered during model inspection

### STOP after admission

Sequence:

ADMIT
→ STOP_REQUEST

The model retains admitted = TRUE while stopStatus becomes BLOCKING.

If the invariant is interpreted as:

stopStatus = BLOCKING => ~admitted

then the model rejects a perfectly meaningful state in which an admission happened historically but current execution is now blocked.

Therefore that invariant is incorrectly formulated for the chosen state representation.

The safety property actually needed is closer to:

CURRENT_EXECUTION_ENABLED => NOT StopBlocking

or:

EXECUTION_ADMIT_CURRENT => NOT StopBlocking

Historical admission may remain true while STOP blocks subsequent execution.

## 3. Currentness after admission

The same issue appears with currentness:

ADMIT under currentness VALID
→ LoseCurrentness

Historical admission remains a fact, but it is no longer sufficient to authorize current execution.

Therefore:

ADMITTED != CURRENTLY_EXECUTABLE

A separate derived predicate is required, such as:

ExecutionEligible ==
  admitted
  /\ current authority
  /\ current fence
  /\ current safety context
  /\ currentness valid
  /\ STOP clear
  /\ recovery conditions valid

## 4. Fence takeover

Similarly:

A acquires fence
→ A admits
→ B acquires newer fence

The historical admission by A need not disappear.

What must become false is A's ability to continue protected execution.

Therefore:

AdmissionRecord != CurrentExecutionAuthority

The model needs actor-bound admission context and an execution-boundary revalidation action.

## 5. Revocation

The same distinction applies to revocation:

AUTHORITY_VALID
→ ADMIT
→ REVOKE

The historical admission record remains useful for audit/reconciliation, but the actor must no longer be allowed to create a new protected effect.

Thus revocation invalidates current executability, not necessarily historical admission.

## 6. Consequence for the minimum-domain hypothesis

This does NOT enlarge the protected semantic kernel.

Instead it sharpens it.

The minimum domain needs:
- durable admission identity/history;
- current authority;
- current fence;
- current STOP relation;
- current safety context;
- currentness;
- recovery state.

The model must represent both:
- committed admission history;
- current derived execution eligibility.

## 7. New semantic distinction

Canonical distinction for V2:

ADMISSION_COMMITTED
!=
EXECUTION_ELIGIBLE
!=
EFFECT_COMPLETED

And also:

EFFECT_UNKNOWN
!=
EFFECT_NOT_APPLIED

This is consistent with the earlier architecture rule that local admission/commit does not establish external-world truth.

## 8. V2 required variables

Replace Boolean admitted with at least:

admissionStatus:
NONE / COMMITTED / QUARANTINED

admissionActor:
A / B / NONE

admissionFence:
protected fence at admission

admissionAuthorityEpoch:
authority epoch at admission

admissionContext:
context accepted at admission

executionEligible:
DERIVED, not independently writable

The derived predicate must revalidate current state against the admission record.

## 9. Required V2 safety properties

S1:
ExecutionEligible implies current authority.

S2:
ExecutionEligible implies current fence matches the admission fence.

S3:
ExecutionEligible implies STOP is non-blocking.

S4:
ExecutionEligible implies currentness is valid.

S5:
ExecutionEligible implies the admission context remains current.

S6:
Decommissioned identity cannot be ExecutionEligible.

S7:
Historical admission survives STOP/revocation/currentness loss as history but cannot authorize new protected execution.

S8:
UNKNOWN effect identity survives retry and cannot be replaced by a new logical operation.

S9:
Recovery cannot become ExecutionEligible without explicit release conditions.

S10:
Target/effect binding is immutable for an existing admission.

## 10. Important methodological result

This is exactly the type of error the finite-model phase was intended to expose.

No architectural conclusion is being upgraded to PROVEN.

The model has produced a semantic correction before any checker run.

That is preferable to running an incorrectly abstracted model and treating a clean result as evidence.

## 11. Status

V1 model: AUDITED / SEMANTIC CORRECTION REQUIRED.
Finite model correctness: NOT READY FOR TLC.
Minimum semantic kernel: DESIGN REFINED.
Admission/current-execution distinction: REQUIRED.
SANY/TLC: NOT RUN.
Implementation: NOT STARTED.
Architecture-build gate: CLOSED.

Next:
Build V2 with admission history separated from current execution eligibility, stale actor observations, explicit admission fence/context/authority epochs, UNKNOWN retry identity, bounded compaction floor and VersionSet activation.
