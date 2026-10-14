# STEP 7 — Activation scope and gate applicability matrix — 2026-10-14

Branch: `ncs-clean-architecture`
Status: DECISION SUPPORT ONLY — NO SCOPE SELECTED — OPEN / STOP / UNKNOWN

## Purpose and evidence reused

This matrix applies existing obligations to the three scope distinctions already identified in the gate dependency order, lifecycle obligations, concrete execution-path crosswalk, and mutation-boundary source trace. It does not create a new authority contract, select a scope for the owner, designate a source function as the final sink, or authorize implementation.

Reused:
- `STEP_7_GATE_DEPENDENCY_ORDER_MINIMUM_BLOCKING_FRONTIER_2026-10-14.md`
- `STEP_7_PROTECTED_ACTIVATION_LIFECYCLE_LINEARIZATION_OBLIGATIONS_2026-10-14.md`
- `STEP_7_CONCRETE_EXECUTION_PATH_CROSSWALK_2026-10-14.md`
- `STEP_7_CONCRETE_MUTATION_BOUNDARY_SOURCE_TRACE_2026-10-14.md`
- Existing P112 evidence for simulation mutation and `persistState(expectedRevision)`.

No closed audit was rerun; no source or tests were changed or run.

## Scope alternatives and consequence

| Candidate initial claim | What it would mean | Minimum in-scope effect | What it would NOT authorize | Additional proof obligations before implementation |
|---|---|---|---|---|
| A. Register a local constitutional reference | Record that a specific reviewed artifact/reference is the candidate to be considered; it is not yet established as current constitutional authority | A bounded local record operation only, if its exact target and failure semantics are specified | It does not establish the artifact as legitimate/current, create an Authority Context, authorize a mission, or permit other protected effects | Exact record target; source/provenance of the record; distinction between candidate/reference and canonical authority; handling of missing/corrupt/default state; exact no-effect/commit evidence; no route from this operation to mission/effect execution |
| B. Establish Constitution Authority Context | Recognize a bounded authority context from a pre-established basis and determine the applicable Constitution/currentness dependencies | An internal authority-context transition; whether this itself changes canonical state must be stated explicitly | It does not grant blanket mission permission or authorize external-world effects | Initial-recognition basis; exact reviewed artifact/content/scope binding; verifier provenance; canonical current-branch owner; amendment/revocation/recovery/succession ordering; atomic currentness relationship; actual boundary that prevents caller-controlled authority fields |
| C. Authorize a mission or protected effect | Admit one exact mission/effect under a recognized, current constitutional context | The named mutation or external effect and its declared postconditions | It does not authorize unrelated effects, general execution, or future missions by implication | All B obligations plus exact action/target/WriteSet/dependencies; complete in-scope path inventory; last enforcement boundary; alternate-path/bypass tests; commit/effect ordering; outcome/reconciliation evidence; deployment-pinned runtime proof |

## Gate applicability by scope

Legend: **Required** = must be resolved for that claim; **Conditional** = required if the declared target or its causal paths include the relevant effect; **Not granted** = scope excludes it and no indirect route may cause it. No gate is passed merely by selecting a narrower scope.

| Existing gate family | A. Local reference | B. Authority Context | C. Mission/effect |
|---|---|---|---|
| G12 exact claim, target, exclusions | Required | Required | Required |
| G0–G2 initial recognition and owner intent | Required for what the record claims; must not overstate it as authority | Required in full | Required in full, bound to exact effect |
| G3 verifier provenance | Required if verification/authority status is asserted; otherwise reference remains explicitly unverified | Required | Required |
| G4/G6/G9 currentness, revocation, recovery, succession | Must distinguish reference candidate from current authority; full authority currentness cannot be implied | Required | Required |
| G5/G7/G8 final boundary and bypass closure | Required for the local record operation and to prove it cannot trigger excluded effects | Required for all paths that can establish/use this context | Required for every in-scope mutation/effect path |
| G10 ordering / external-effect proof | Conditional; only if the operation has such causal effects | Conditional on actual scope and paths | Required whenever the declared mission/effect depends on it |
| G11 deployment evidence | Required for the exact deployed reference-recording target before calling it operationally proven | Required for the actual deployed authority boundary | Required for the same effect target, configuration and deployment |

## Hard constraints common to all options

1. A selected scope is an owner-intent decision, not cryptographic recognition, Constitution freeze, commissioning, or runtime proof.
2. A hash/signature/key, `AUTHORIZED` field, state revision, recovered/default state, or device possession cannot substitute for the applicable legitimacy/currentness/boundary obligations.
3. Ordinary `loadState()` fallback/default behavior cannot be interpreted as a verified empty canonical constitutional state.
4. `persistState(expectedRevision)` may be reused for its documented conditional snapshot persistence among cooperating writers; it is not itself the constitutional authority owner and does not prove authority dependencies are atomically covered.
5. The observed `executeAction()` mutation path is shared by ordinary simulation and Nexo/Lúmina paths. It is not owner-designated as the initial STEP 7 sink. Do not insert a generic gate there or gate all `tick()` by inference.
6. If a selected claim cannot name its real target and every causal path capable of producing its claimed effect, keep implementation blocked.
7. Missing prerequisites remain UNKNOWN/HOLD; narrower scope does not waive applicable gates.

## Decision still required

Choose, revise, or reject A, B, or C as the **initial activation claim**. This document intentionally makes no choice on the owner's behalf. The owner may also define a narrower/different claim, but it must specify the exact target and what it expressly cannot cause.

After a scope decision:
- record it as scope/intent only;
- re-use the existing contracts to derive the exact applicable obligations;
- inspect only the newly relevant source path/evidence;
- do not write implementation until canonical authority ownership and the applicable final boundary are concretely identified.

## Non-actions

No source/tests changed or ran. No keys, signatures, digest, Constitution freeze, ceremony, recovery reference, verifier, device, deployment, or runtime authority changed. No protected effect authorized.

**STEP 7 remains OPEN / STOP / UNKNOWN.**
