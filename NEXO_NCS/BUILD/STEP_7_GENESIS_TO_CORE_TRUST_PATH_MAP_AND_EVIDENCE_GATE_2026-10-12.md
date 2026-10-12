# NCS STEP 7 — Genesis-to-Core Trust Path Map and Evidence Gate — 2026-10-12

Status: SOURCE-INSPECTED GAP MAP — DESIGN ONLY — PROTECTED COMMISSIONING STOP

## Purpose

Record the smallest current trust/control path from a recognized Genesis basis to a protected transition, using only source inspected on branch `ncs-clean-architecture`. This document does not implement or authorize constitutional activation.

## Evidence-backed path

| Edge | Existing source evidence | Status | What is not established |
|---|---|---|---|
| 1. Independently recognized basis → Genesis verifier | `STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md` defines semantics only; no source-backed Genesis verifier identified in this review. | UNKNOWN / NOT IMPLEMENTED IN EVIDENCE | Recognized root, verifier provenance, currentness, revocation, succession/recovery. |
| 2. Genesis result → Constitution Authority Context | `STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md` says context must be established from an already-recognized foundation, not caller claims. No production establishment owner/path identified in reviewed source. | UNKNOWN / NOT IMPLEMENTED IN EVIDENCE | Core-owned active Constitution state and protected establishment provenance. |
| 3. Exact Constitution/context + explicit owner approval → content-bound claim | `createClaimEnvelope()` in `src/nexo/core/contracts.mjs` structurally creates a claim; it does not authenticate who approved it or bind that approval to an independently established active Constitution. | STRUCTURAL CARRIER ONLY | Protected approval owner, exact-byte/rendering binding, scope and fresh challenge/anti-replay. |
| 4. Freshness/currentness/lifecycle → authority decision | `src/nexo/core/protected-transition.mjs` calls injected `ports.authorityGate.check(claim)`; `src/nexo/core/ownership.mjs` defaults missing gate to `NEXO_CORE_CONTRACT_NOT_IMPLEMENTED`. | PORT EXISTS; TRUSTED IMPLEMENTATION UNKNOWN | Legitimate gate provenance, stale/revoked-root behavior, lifecycle and recovery enforcement. |
| 5. Authority decision → protected transition | `executeProtectedTransition()` stops on supplied STOP/UNKNOWN and proceeds for a valid status of AUTHORIZED. | GENERIC COMPOSITION EXISTS | A caller/injected gate returning AUTHORIZED is not, by itself, evidence of legitimate authority or production wiring. |
| 6. Transition commit → actual final effect boundary | The transition uses `conditionalCommit.commit(candidate)`; `createCorePorts()` exposes `effectBoundary.prepare`, but the inspected transition does not call it. | APP-STATE COMMIT ONLY; FINAL EFFECT UNKNOWN | No demonstrated last boundary for constitutional commissioning or external/physical effects; no bypass-closure evidence. |
| 7. Missing/invalid/unknown trust → enforced no-transition | Focused tests pass for absent gate implementation and STOP/UNKNOWN outcomes at this generic composition boundary. | COMPONENT TEST EVIDENCE ONLY | Does not establish production composition, deployed-device behavior, or that every protected effect is mediated. |

## Current proof boundary

Verified in this review:
- The contracts for Genesis Trust Foundation, bootstrap composition, and Core Constitution Authority Context exist as design candidates.
- The generic protected-transition composition and injected authority-gate port exist in source.
- A missing authority-gate implementation fails closed in the focused test; CI reported PASS for the focused protected-transition workflow after the test addition.
- The final-semantic-validator fixtures were aligned to the current typed PolicyContext contract; CI reported PASS for that focused test after the fixture update.

Not verified:
- Any independently recognized Genesis root or deployed Genesis verifier.
- Any production consumer/composition connecting Genesis → active Constitution Authority Context → trusted AuthorityGate.
- A protected owner approval bound to exact constitutional bytes/rendering and commissioning scope.
- A last protected effect boundary, complete mediation, bypass closure, Android/device deployment, or constitutional activation.

## Architectural decision

Do not add a wrapper, root registry, alternate authority constructor, self-generated key/hash, or caller-provided `AUTHORIZED` value to fill these gaps. That would move or disguise the missing root instead of solving it.

Continue safe work by treating the gaps as separate proof obligations. Before implementation of a new authority mechanism, identify an existing concrete consumer and its intended protected effect target; otherwise keep the item as UNKNOWN rather than inventing a new abstraction.

## Next bounded action

Inspect the exact production call graph and existing consumers of `executeProtectedTransition()`, `resolvePolicyContext()`, and `effectBoundary.prepare` only as needed to establish whether a real protected effect target already exists. If none is present in source, record the deployment target as an explicit unresolved decision; do not manufacture one. Do not rerun frozen AB/TLC/Kafka/P112 investigations.

## Disposition

Step 7 safe engineering continues. Genesis Trust Foundation = UNKNOWN. Core Constitution Authority Context = NOT ESTABLISHED. Legitimate AuthorityGate composition = NOT ESTABLISHED. Final protected effect boundary = UNKNOWN. Protected constitutional commissioning = STOP.
