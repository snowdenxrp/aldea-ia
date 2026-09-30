# AB105.092R — dependency audit of the closed ternary branch

Date: 2026-09-30
Chain: AB105.091R -> AB105.092R

## Objective
Determine which current Nexo semantic requirements actually depend on the missing TERNARY_TRANSITION_SEMANTICS_SPEC, and which can proceed independently without silently assuming the missing semantics.

## Fresh primary evidence
NIST SP 800-30 states that uncertainty arises from incomplete knowledge and unrecognized dependencies, and that the uncertainty should be communicated in the risk-assessment result rather than hidden. It also recognizes that the amount of evaluation justified can depend on the stage and decision context. citeturn0search25turn0search11
NIST AI RMF distinguishes mapping knowledge limits, measuring trustworthiness, and managing risk; it also calls for documenting system knowledge limits and intended use/oversight. This supports treating an unresolved dependency as an explicit boundary rather than allowing it to silently contaminate unrelated decisions. citeturn0search3turn0search24

## Dependency classification
### Directly blocked by the missing ternary artifact
- Any claim that requires exact semantics of the historical FutureObs_PAA transition relation.
- Any formal proof that the historical ternary EventDAG has unique terminal reconstruction.
- Any implementation claiming compatibility with the unresolved AB50–AB58 ternary protocol.
- Any decision whose correctness explicitly depends on resolving the missing ternary transition cases.

### Not directly blocked
- Observation identity/provenance contracts.
- Freshness and recheck semantics.
- Evidence conflict/reconciliation semantics.
- Evidence dependency/common-mode analysis.
- Generic Claim/Appraisal/Decision/Effect separation.
- Generic authorization freshness/revocation boundaries.
- Generic operation/idempotency/replay boundaries.
- Generic STOP/fencing semantics.
- Physical-incarnation and configuration/drift evidence contracts.
- Provider-independent Nexo requirement analysis, provided no claim is made about the unresolved historical ternary protocol.

### Conditionally dependent
- EventDAG reconstruction framework: generic completeness contract can proceed, but historical ternary compatibility remains UNKNOWN.
- Decision Contract: can proceed generically, but any decision requiring the historical ternary result must inherit UNKNOWN/STOP.
- Formal verification plan: can be designed, but the unresolved semantic specification must be an explicit prerequisite for verification of that branch.

## Dependency rule
Define a dependency edge:
REQUIREMENT -> EVIDENCE/SEMANTIC_ARTIFACT

with states:
SATISFIED
PARTIAL
UNKNOWN
BLOCKED
NOT_APPLICABLE.

An UNKNOWN dependency does not globally block the system.
It blocks only claims/decisions whose correctness predicate depends materially on that dependency.

## Adversarial checks
1. Generic freshness proof does not require the missing ternary table -> NOT_BLOCKED.
2. Generic STOP contract does not require the missing ternary table -> NOT_BLOCKED.
3. Historical EventDAG terminal uniqueness does require the table -> BLOCKED.
4. A future Nexo implementation may use ternary UNKNOWN semantics without claiming historical AB50–AB58 compatibility -> NOT_BLOCKED, provided the new semantics are explicitly specified as new design, not recovered history.
5. Reusing historical labels to imply recovered semantics -> BLOCKED/forbidden.
6. A decision combines independent current evidence with unresolved historical ternary evidence -> the current evidence may remain valid, but the decision must mark the unresolved dependency if that evidence is decision-relevant.

## Key anti-collapse rule
UNKNOWN dependency is local to the claims that consume it.
Do not propagate it as a global system failure.
Do not erase it from a dependent claim.
Do not convert it into SATISFIED merely because another evidence branch is complete.

## Result
The missing ternary semantic artifact is a **localized dependency**, not a blocker for the entire Nexo evidence/decision architecture.
This materially reduces research scope: the closed evidence-layer cluster and generic Decision Contract can stand independently.
The historical AB50–AB58 compatibility/formal-verification branch remains blocked until the missing semantic artifact is recovered or explicitly re-specified as a new protocol.

## Status
TERNARY_SEMANTIC_ARTIFACT = MISSING
TERNARY_DEPENDENCY_SCOPE = LOCALIZED
GENERIC_EVIDENCE_LAYER = NOT_BLOCKED
GENERIC_DECISION_CONTRACT = NOT_BLOCKED
HISTORICAL_TERNARY_COMPATIBILITY = BLOCKED
HISTORICAL_FORMAL_VERIFICATION = BLOCKED
UNKNOWN_PROPAGATION = CLAIM/DECISION_SCOPED

## Anti-infinite-research rule
No further generic evidence research should be opened merely because the ternary artifact is missing.
Reopen only if a concrete Nexo requirement is shown to depend on it or primary historical evidence containing the missing semantics is found.

## Next exact direction
AB105.093R — perform a compact global dependency checkpoint across the recently closed evidence cluster and the historical ternary branch, then identify the next unresolved Nexo core requirement outside these already-bounded branches. The goal is to prevent research sprawl.

Historical AB50–AB58 unresolved state remains unchanged and must not be collapsed.