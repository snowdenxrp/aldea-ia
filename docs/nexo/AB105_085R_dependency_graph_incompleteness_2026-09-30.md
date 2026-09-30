# AB105.085R — dependency-graph incompleteness and bounded independence

Date: 2026-09-30
Chain: AB105.084R -> AB105.085R

## Objective
Test whether UNKNOWN_INDEPENDENCE must always force UNKNOWN/STOP, or whether a decision policy may safely operate with incomplete dependency information.

## Fresh primary evidence
RFC 9334 does not equate the number of Evidence records with independent trust. It models trust through Attester, Verifier, Endorser, Reference Value Provider, trust anchors, and appraisal policies, and explicitly requires implementers to evaluate emergent risk when roles/components are combined. citeturn0search0turn0search24
RFC 9334 also states that the Relying Party trusts the Verifier and the Relying Party Owner's appraisal policy; changing or compromising those trust dependencies can affect the resulting decision. Therefore an incomplete dependency graph can materially change the assurance of an evidence set. citeturn0search0

## Adversarial result
UNKNOWN_INDEPENDENCE cannot be treated as INDEPENDENT by default.
However, UNKNOWN_INDEPENDENCE does not universally require a global STOP for every decision.
The correct boundary is the consuming decision's assurance requirement.

## Normative rule
For each decision class define an EVIDENCE_ASSURANCE_REQUIREMENT:
- REQUIRED_DEPENDENCY_PROPERTIES
- MINIMUM_INDEPENDENCE_LEVEL
- ACCEPTABLE_UNKNOWN_DEPENDENCIES
- MAXIMUM_COMMON_MODE_EXPOSURE
- CONSEQUENCE_IF_WRONG
- FAIL_STATE

If the missing dependency could invalidate the required assurance, result = UNKNOWN/STOP.
If the missing dependency is outside the decision's declared assurance boundary, the evidence may remain usable but the unresolved dependency must be preserved.

Therefore:
UNKNOWN_DEPENDENCY != AUTOMATIC_GLOBAL_STOP
UNKNOWN_DEPENDENCY != AUTOMATIC_INDEPENDENCE

Instead:
UNKNOWN_DEPENDENCY + HIGH_ASSURANCE_REQUIREMENT -> UNKNOWN/STOP
UNKNOWN_DEPENDENCY + EXPLICITLY_BOUNDED_LOW_ASSURANCE_USE -> ALLOW_WITH_BOUNDED_UNKNOWN

## Critical restriction
The low-assurance path must never silently upgrade the evidence to independent or high-assurance evidence.
Any downstream decision consuming it inherits the bounded assurance state unless a new appraisal establishes stronger independence.

## Dependency completeness states
COMPLETE
PARTIAL
UNKNOWN
CONFLICTING

Independence states remain:
INDEPENDENT
CORRELATED
UNKNOWN_INDEPENDENCE

These are separate dimensions. A PARTIAL dependency graph can still contain explicitly proven independent edges, while leaving other edges UNKNOWN.

## STOP semantics
STOP should be attached to the decision/effect that requires unavailable assurance, not used to erase the underlying evidence.
Example:
- telemetry collection may continue despite UNKNOWN_INDEPENDENCE;
- a destructive external action requiring independent corroboration may become UNKNOWN/STOP.

This preserves observability while protecting consequential effects.

## Adversarial cases
1. Two sources share an unknown provider root -> cannot count as independent.
2. Low-risk informational decision with unknown dependency -> may proceed only if policy explicitly permits bounded assurance.
3. High-impact external effect with unknown dependency -> UNKNOWN/STOP.
4. One independent root plus one unknown source -> independent evidence remains usable; unknown source cannot increase the independence count.
5. Dependency graph incomplete only for irrelevant metadata -> no automatic STOP.
6. Common root discovered after decision -> prior appraisal must be revisited if that dependency was decision-relevant.
7. Dependency graph changes but observations remain unchanged -> evidence history stays immutable; appraisal may change.
8. Same source with different storage destinations -> still correlated.
9. Different verifiers sharing policy/reference roots -> independence remains unproven.
10. No dependency metadata at all -> UNKNOWN_INDEPENDENCE, never inferred independence.

## Result
No new evidence primitive is required.
The dependency graph needs an explicit completeness dimension and the decision contract needs an assurance requirement.
Unknown dependency is therefore handled by the consuming decision policy rather than converted into a universal binary rule.

## Status
EVIDENCE_COMMON_MODE_GENERIC_BRANCH = CLOSED_WITH_BOUNDED_UNKNOWN
EVIDENCE_DEPENDENCY_COMPLETENESS = NORMATIVELY_DEFINED
UNKNOWN_INDEPENDENCE_HANDLING = RISK/ASSURANCE_BOUNDED

Combined with AB105.083R, reconciliation now has two separate questions:
1. Are observations compatible?
2. Are their trust/dependency paths sufficiently independent for this decision?

## Next exact direction
AB105.086R — perform the small integration checkpoint for Observation Freshness + Conflict/Reconciliation + Common-Mode Dependency, then determine whether this evidence-layer cluster is closed and return to the remaining Nexo core requirements rather than expanding the branch indefinitely.

Historical AB50–AB58 unresolved state remains unchanged and must not be collapsed.