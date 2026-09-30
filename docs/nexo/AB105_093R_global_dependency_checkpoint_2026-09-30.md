# AB105.093R — global dependency checkpoint and research-sprawl boundary

Date: 2026-09-30
Chain: AB105.092R -> AB105.093R

## Objective
Perform a compact dependency checkpoint across the recently closed evidence cluster and the historical ternary branch, then identify whether another unresolved Nexo core requirement is justified. The purpose is to prevent research expansion without a concrete dependency.

## Fresh primary evidence
NIST AI RMF MAP 2.2 requires documenting an AI system's knowledge limits and how outputs may be used and overseen; MEASURE 2.6 calls for evaluation of safety risks, including whether the system can fail safely beyond its knowledge limits. citeturn0search24turn0search26
NIST SP 800-30 treats incomplete knowledge and unrecognized dependencies as sources of uncertainty and says that uncertainty should be communicated in the assessment result. It also notes that evaluation effort should be considered in relation to the decision context. citeturn0search25

## Dependency checkpoint
### CLOSED / bounded
- Observation freshness and recheck.
- Observation conflict/reconciliation.
- Evidence dependency/common-mode analysis.
- Dependency completeness and bounded UNKNOWN independence.
- Claim/Appraisal/Decision/Effect semantic separation.
- Generic Decision Contract.
- Generic replay/idempotency boundary.
- Generic authority epoch/freshness boundary.
- Generic STOP/fencing semantics.
- Physical-incarnation evidence taxonomy.
- Configuration/drift evidence taxonomy.
- Generic EventDAG reconstruction completeness contract.

### OPEN only because of historical evidence
- TERNARY_TRANSITION_SEMANTICS_SPEC.
- FutureObs_PAA historical compatibility.
- Historical EventDAG unique reconstruction.
- Formal verification of the historical ternary protocol.
- Implementation verification of that historical protocol.

### NOT a blocker for generic Nexo design
The historical ternary branch is not a prerequisite for defining the provider-independent Claim/Evidence/Decision/Authority model, provided any dependency on historical semantics is explicitly marked UNKNOWN/BLOCKED.

## Dependency propagation rule
Every core requirement receives:
- REQUIRED_ARTIFACTS
- DEPENDENCY_STATUS
- CLAIM_SCOPE
- CONSEQUENCE_IF_UNKNOWN
- ALTERNATIVE_EVIDENCE_PATH

UNKNOWN is propagated only when the unresolved artifact lies on the correctness path of that requirement.
A complete independent branch cannot silently repair an UNKNOWN dependency.
Conversely, a localized UNKNOWN cannot globally block unrelated requirements.

## Research-sprawl gate
Open a new research branch only if at least one is true:
1. a concrete Nexo requirement is currently BLOCKED;
2. a primary source contradicts an existing closed semantic;
3. an implementation/test artifact exposes a missing invariant;
4. a dependency audit shows a supposedly independent requirement actually depends on an unresolved artifact.

Otherwise: record the boundary and move on.

## Global result
The current evidence campaign has reached a stable semantic boundary.
The evidence layer is closed with bounded unknowns.
The historical ternary branch is localized and explicitly blocked by a missing semantic artifact.
No generic evidence branch should be reopened merely to make the historical branch feel complete.

## Status
GLOBAL_EVIDENCE_DEPENDENCY_CHECKPOINT = PASSED_WITH_BOUNDED_UNKNOWN
GENERIC_EVIDENCE_LAYER = CLOSED
GENERIC_DECISION_LAYER = CLOSED_AT_SEMANTIC_LEVEL
HISTORICAL_TERNARY_BRANCH = CLOSED_WITH_EXPLICIT_UNKNOWN_BOUNDARY
RESEARCH_SPRAWL_GATE = ACTIVE
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.094R — recover the canonical Nexo requirements ledger and identify the highest-priority unresolved core requirement outside the closed evidence cluster and localized ternary dependency. Do not invent a new branch from the research side alone.

Historical AB50–AB58 unresolved state remains unchanged and must not be collapsed.