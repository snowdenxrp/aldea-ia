# AB60 — Explicit Repair Task
Date: 2026-09-25

## Canonical instruction
The following repairs are an EXPLICIT TASK and must not be skipped merely because the research advances to later AB checkpoints. This task exists because the same unresolved implementation/semantic gaps were identified beginning at AB56 and must now be closed systematically before broadening the search.

## Scope
Repair every unresolved item identified by the AB50–AB59 audit, without deleting, overwriting, or rewriting historical artifacts.

### 1. Recover canonical semantics
- Recover the canonical observation vocabulary and action/transition semantics from AB54 and AB56 artifacts.
- Preserve all unresolved semantics as UNKNOWN; do not invent LEASE_RENEW, RETRY, MUTATION, or RECHECK behavior.

### 2. Repair continuation legality
- Replace the current degenerate continuation model with explicit three-valued legality: TRUE / FALSE / UNKNOWN.
- UNKNOWN legality must remain an explicit epistemic branch and must never be silently converted into an empty legal-continuation set.
- Distinguish “no legal continuation established” from “continuation known illegal.”

### 3. Repair EventDAG
- Add EventDAG edges only when supported by canonical evidence.
- Preserve unresolved ordering as UNKNOWN rather than treating it as independence.
- Do not infer semantic legality merely because a topological permutation is syntactically enumerable.

### 4. Repair canonical observational quotient
- Reconstruct the canonical lower-arity observational equivalence from persisted evidence before using LowerObs equality as a collision condition.
- Treat the current AB57 lower_obs implementation as a scaffold, not as proof of the canonical quotient.

### 5. Repair UsedAdmissionContext
- Make admission-context identity discriminating at protocol level, not merely by changing validity predicates.
- Verify that the same admission context is actually the object consumed by the relevant transition/admission decision.

### 6. Repair FutureObs_PAA
- Enumerate evidenced legal post-ADMIT continuations.
- Preserve UNKNOWN continuation branches explicitly.
- Define FutureObs from the canonical observation vocabulary and continuation semantics.
- Do not treat current-ADMIT-only observation as complete future observation.

### 7. Reproducibility repair for AB55
- Search repository history/artifacts for the original AB55 interpreter source/configuration.
- If recovered, preserve it unchanged and use it to reproduce the historical counts.
- If not recovered, label the AB55 counts as historical reported bounded results and create a new separately identified interpreter reproducing or revising them; never overwrite AB55.

### 8. Complete the eight-attack gate
After repairs 1–7, rerun all eight ternary attacks through the complete gate, recording TRUE/FALSE/UNKNOWN and the exact reason/evidence for every unresolved branch.

### 9. Only then broaden enumeration
Do NOT broaden to the 286 triples / 16,302 structural skeletons as a closure claim until the complete eight-attack gate is semantically executable/reproducible. Structural enumeration may be used only as a separate bounded artifact.

## Canonical epistemic requirements
- TERNARY_MATH_GAP = FOUND remains unchanged.
- TERNARY_PROTOCOL_RESIDUAL = UNKNOWN_DUE_TO_MISSING_SEMANTICS until the repaired gate establishes otherwise.
- TERNARY_PAA_COLLISION = UNKNOWN until the complete collision test is executed.
- EVENTDAG_CLOSURE = PARTIAL until evidence-backed edges and UNKNOWN orderings are modeled.
- RECONSTRUCTION = BOUNDED_ONLY until complete FutureObs semantics are executable.
- SEMANTIC_FREEZE = NOT_DECLARED.
- FORMAL_VERIFICATION = NOT_PERFORMED.

## DO-NOT-REPEAT
- Do not redesign CONTINUITY V2.
- Do not repeat AB51 parity proof as new work.
- Do not interpret 16,302 structural skeletons as full semantic enumeration.
- Do not treat AB55 TRUE/FALSE counts as a safety score or proof.
- Do not treat AB56 definitions as executed closure.
- Do not treat AB57 harness as semantic closure.
- Do not invent missing transition semantics.
- Do not broaden before the eight-attack gate is complete.
- Do not declare semantic freeze or formal verification prematurely.

## Exact next action
Begin by recovering AB54/AB56 canonical semantic vocabulary and the AB55 source/configuration, then implement the three-valued continuation model and evidence-backed EventDAG in a NEW checkpoint. Every repair must be persisted to GitHub before the next chat boundary.

## Continuity rule
This file is an explicit task checkpoint. If the chat changes, load this file and continue from its exact next action. Historical AB50–AB59 artifacts remain immutable evidence/history.