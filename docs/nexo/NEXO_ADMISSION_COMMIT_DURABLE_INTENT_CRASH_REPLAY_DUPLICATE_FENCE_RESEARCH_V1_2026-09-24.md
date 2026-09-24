# NEXO — ADMISSION COMMIT / DURABLE INTENT / CRASH / REPLAY / DUPLICATE / FENCE — 2026-09-24

Status: RESEARCH / CLEAN-ARCHITECTURE DESIGN. No V21 implementation. No SANY/TLC execution. No correctness claim.

## Research question
After protected admission linearizes, what happens if the process crashes before durable intent, fence activation, or external execution is fully recorded?

Critical semantic chain:
ADMISSION_LINEARIZED → DURABLE_INTENT → FENCE_ACTIVATION → EXECUTION → OBSERVATION

## External cross-checks
AWS Durable Execution documents that replay/retry can execute an operation more than once, that at-least-once retry semantics are safe only for idempotent operations, and that at-most-once semantics per retry still do not mean exactly once across an entire workflow. citeturn0search2turn0search13 AWS Well-Architected likewise treats idempotency as a mechanism for making repeated requests produce the same effect and notes that exactly-once behavior is difficult in distributed systems. citeturn0search3turn0search26
TLA+ formal methods separate high-level specifications from lower-level implementations through refinement mappings; the implementation must be shown to implement the higher-level behavior rather than merely having similarly named states. citeturn0search25turn0search14

## Core result
There is no single boolean ADMITTED.

ADMISSION_LINEARIZED != DURABLE_INTENT
DURABLE_INTENT != FENCE_ACTIVE
FENCE_ACTIVE != EXTERNAL_ATTEMPT
EXTERNAL_ATTEMPT != EXTERNAL_SUCCESS
EXTERNAL_SUCCESS != LOCAL_OBSERVATION

A crash can leave any combination consistent with the evidence. Recovery must reconstruct a set of possible states rather than infer one from a missing record.

## Canonical crash window
Current context C42 → protected admission linearizes → process crashes.
Possible worlds include: admission committed with no external attempt; request reached provider but no effect; external effect occurred; provider retained autonomous continuation; effect occurred but local intent was lost; durable intent exists but execution did not occur; old process continued externally; replay submits again.

Forbidden inferences:
NO_DURABLE_INTENT does not imply NO_EFFECT.
DURABLE_INTENT does not imply EFFECT_OCCURRED.
ADMISSION_LINEARIZED does not imply EXTERNAL_SUCCESS.

Correct unresolved state may be EXTERNAL_EFFECT_UNKNOWN.

## Admission and durable intent
Architecture candidates remain open: one protected atomic transition; durable intent before execution; an equivalent fence/token protocol; or another mechanism with the same abstract semantics.
The architecture must define crash semantics before selecting a storage technology.

Candidate rule: protected external execution may begin only if corresponding admission intent is durably recoverable OR an equivalent resource-side identity/fence protocol guarantees safe recovery when local intent is missing.

## Stable identity and replay
ExternalEffectIdentity should bind logical effect identity, identity domain, semantic target, effect class, resource incarnation and provider contract where applicable.
AttemptIdentity remains separate.
Same effect identity does not grant permission to execute again. Replay requires current authority, fence, context, dependency closure and interaction validity.

## Idempotency boundary
A provider idempotency contract must define identity scope, lifetime, collision behavior, durability, resource incarnation, semantic equality, replay behavior and expiry.
AWS explicitly distinguishes at-least-once retry from at-most-once-per-retry and notes that neither alone means exactly once across an entire workflow. citeturn0search2

Therefore Nexo must not treat an idempotency key as universal exactly-once authority.

## Fence activation race
ADMISSION_LINEARIZED → crash → FENCE_NOT_ACTIVE.
The recovery process cannot assume the old process stopped. It may still have network connections, provider execution, cached capability, queued work or autonomous continuation.
Recovery fence must therefore be independently established before normal release.

## Replay semantics
REPLAY is not CONTINUE_FROM_LAST_LINE.
Candidate semantic sequence:
RECONSTRUCT → RECONCILE → REVALIDATE → NEW_PROTECTED_TRANSITION

An old checkpoint may describe history, but it does not restore historical authority.

## Control commit vs effect commit
This round strengthens the earlier distinction:
CONTROL_COMMIT = authoritative internal transition becomes current/durable.
EFFECT_COMMIT = external provider/resource reaches its effect-class-specific commit boundary.
They may be causally related but are not the same event.

Possible states include:
ControlCommit + EffectCommit.
ControlCommit + no EffectCommit.
No observable ControlCommit + EffectCommit.
ControlCommit + EffectCommit + no local observation.

The last two are central crash-recovery cases.

## New object: ControlCommit
Candidate fields: commit_id, operation/effect/attempt identity, coordination domain, pre-state, post-state, authority context, invalidation generation, scope/closure versions, fence set, linearization reference, durability proof, crash semantics and replay semantics.

## New object: EffectCommit
Candidate fields: external_effect_identity, attempt_id, provider_execution_id, resource_incarnation, effect class, provider commit semantics, commit evidence, observation generation, causal/order context, freshness and reconciliation status.
EffectCommit is not created merely because Nexo requested an effect. It requires provider/resource evidence appropriate to that effect class.

## New object: ReplayDecision
Candidate fields: effect_id, unresolved attempts, uncertainty set, current context, idempotency contract, provider history, resource incarnation, interaction graph, current fence, retry/compensation policy, claim requirements, decision, justification/evidence and protected decision linearization.
Possible decisions: REPLAY, RECONCILE, COMPENSATE, HOLD, QUARANTINE.

## Candidate invariants INV-ADR-01..32
01 Admission linearization is distinct from durable intent.
02 Durable intent is distinct from external effect.
03 Missing durable intent does not prove no effect.
04 Durable intent does not prove effect occurred.
05 Admission does not prove external success.
06 External success does not imply local observation.
07 Protected execution requires durable intent or equivalent replay-safe protocol.
08 Effect identity survives replay only within its defined identity domain.
09 Replay never inherits authority merely from historical admission.
10 Retry requires current context.
11 Idempotency contract must be explicit and provider-scoped.
12 Idempotency does not imply exactly once across a workflow.
13 Duplicate submission and duplicate effect are distinct claims.
14 Provider execution identity requires explicit mapping to Nexo effect identity.
15 Crash recovery reconstructs possible worlds; it does not guess missing history.
16 Fence requested is distinct from fence enforced.
17 Fence enforced is distinct from fence verified.
18 Recovery must not restore historical authority.
19 Replay is a new protected transition.
20 Replay cannot skip reconciliation when prior effect is UNKNOWN.
21 ControlCommit is distinct from EffectCommit.
22 EffectCommit requires claim-adequate external evidence.
23 Control idempotency does not guarantee effect idempotency.
24 Repeated durable delivery cannot create duplicate authoritative state transitions.
25 Provider continuation remains in effect-path closure.
26 Recovery must account for autonomous provider continuation.
27 Resource incarnation is part of effect identity/binding where required.
28 Stale process restart cannot reuse old execution authority.
29 Replay decision requires current STOP/recovery/invalidation state.
30 UNKNOWN replay is not automatically admissible.
31 Compensation/replay choices must be evaluated over joint uncertainty.
32 Strong no-duplicate/no-effect claims require evidence adequate to that exact property.

## Formal model direction
Candidate abstract states: ADMISSION_NONE, ADMISSION_LINEARIZED, INTENT_DURABLE, FENCE_PENDING, FENCE_ENFORCED, FENCE_VERIFIED, EXTERNAL_ATTEMPTED, EXTERNAL_COMMIT_UNKNOWN, EXTERNAL_COMMIT_CONFIRMED, OBSERVATION_RECORDED, RECONCILED.

Crash can occur between any states.

Candidate safety: EXECUTE_EXTERNAL(e) requires INTENT_DURABLE(e) or an equivalent replay-safe protocol.
Candidate recovery: RESTORE requires a new recovery context and current authority validation.
Candidate replay: REPLAY requires current context, current fence and acceptable reconciliation status.
Candidate no-duplicate claim requires provider/resource history adequate to that exact claim.

## Refinement obligation
The formal model must eventually prove that the concrete implementation preserves these abstract distinctions. TLA+ explicitly uses refinement mappings to show that a lower-level specification implements a higher-level specification. citeturn0search25

The future verification target is therefore not merely whether the implementation contains ControlCommit/EffectCommit objects, but whether concrete crash/retry interleavings refine the abstract semantics.

## Major architectural consequence
The protected chain becomes:
REQUEST → ADMISSION_CHECK → ADMISSION_LINEARIZATION → CONTROL_COMMIT → DURABLE_INTENT → FENCE_ACTIVATION → ENFORCEMENT_VERIFICATION → EXTERNAL_ATTEMPT → EFFECT_COMMIT → OBSERVATION → RECONCILIATION → CLAIM_RECOMPUTATION

Not every effect class must necessarily use identical mechanisms, but these semantic distinctions must remain explicit.

## Remaining gaps
G-ADR-01 exact atomicity/equivalence between admission and durable intent.
G-ADR-02 external effect identity/idempotency contracts by effect class.
G-ADR-03 provider-specific effect-commit semantics.
G-ADR-04 resource-side fence implementation.
G-ADR-05 crash/replay model completeness.
G-ADR-06 formal ControlCommit/EffectCommit refinement.
G-ADR-07 duplicate-effect fault injection.
G-ADR-08 stale-process restart testing.
G-ADR-09 queue/provider continuation testing.
G-ADR-10 actual TLC/SANY execution.
G-ADR-11 implementation refinement.
G-ADR-12 long-duration replay/idempotency expiry testing.

## Conclusion
Recovery cannot simply continue from the last known step.
It must reconstruct what is known, what is unknown, what may still exist externally, what authority is current and what effect identity/fence remains valid.

CONTROL_COMMIT != EFFECT_COMMIT
DURABLE_INTENT != WORLD_EFFECT

## Next attack
CONTROL COMMIT / EFFECT COMMIT CROSS-DOMAIN ATOMICITY + PROVIDER ACK AMBIGUITY + EXTERNAL COMMIT BEFORE LOCAL RECORDING + RECONCILIATION.
Question: can a universal abstract contract describe the boundary where the external world commits before Nexo can durably observe that commit, without pretending that a distributed transaction exists where it does not?