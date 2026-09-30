# AB105.094R — canonical requirements dependency checkpoint

Date: 2026-09-30
Chain: AB105.093R -> AB105.094R

## Objective
Recover the canonical Nexo requirements boundary and determine the next unresolved core requirement without reopening already bounded evidence branches.

## Fresh primary evidence
NIST AI RMF MAP 1.6 calls for system requirements to be elicited, understood, and documented; MAP 2.2 calls for knowledge limits and intended use/oversight to be documented. NIST also describes risk management as continuous across the AI lifecycle. citeturn0search0turn0search24
NIST SP 800-37 establishes requirements traceability so that requirements are addressed through design, implementation, operations, maintenance, and disposition. citeturn0search25

## Canonical Nexo dependency map
The current evidence campaign supports the following requirement families without reopening the closed evidence branches:

R1 — Authority / STOP / fencing
Status: SEMANTICALLY DEFINED; enforcement remains implementation/provider dependent.

R2 — Identity / incarnation
Status: GENERIC CONTRACT CLOSED_WITH_BOUNDED_UNKNOWN; type-specific adapters remain implementation work.

R3 — Observation / freshness / reconciliation
Status: GENERIC CONTRACT CLOSED_WITH_BOUNDED_UNKNOWN.

R4 — Evidence dependency / common-mode
Status: GENERIC CONTRACT CLOSED_WITH_BOUNDED_UNKNOWN.

R5 — Claim / Appraisal / Decision / Effect
Status: GENERIC SEMANTIC BOUNDARY CLOSED; Decision Contract implementation not performed.

R6 — EventDAG / reconstruction
Status: GENERIC COMPLETENESS CONTRACT DEFINED; historical ternary reconstruction remains bounded/unknown.

R7 — Historical AB50–AB58 ternary compatibility
Status: BLOCKED by missing TERNARY_TRANSITION_SEMANTICS_SPEC.

R8 — Formal verification
Status: NOT PERFORMED.

R9 — Implementation/runtime verification
Status: NOT PERFORMED.

## Dependency conclusion
R7 is not a prerequisite for the generic semantic definition of R1–R6.
R8 and R9 depend on having sufficiently frozen semantics for whichever artifact is being verified, but they are not reasons to reopen generic evidence research.

Therefore the next useful core requirement is not another evidence subtype.
It is the **requirements-to-semantics traceability boundary**: every Nexo requirement must identify the semantic contracts it depends on, its evidence prerequisites, its unknown/stop behavior, and whether the requirement is recoverable from prior research or remains a future design decision.

## Required traceability tuple
REQUIREMENT_ID
REQUIREMENT_STATEMENT
SEMANTIC_CONTRACTS
EVIDENCE_DEPENDENCIES
AUTHORITY_DEPENDENCIES
UNKNOWN_BEHAVIOR
STOP_BEHAVIOR
VERIFICATION_PRECONDITIONS
IMPLEMENTATION_STATUS
HISTORICAL_DEPENDENCIES

## Anti-collapse rules
Requirement documented != requirement implemented.
Semantic contract defined != formal proof.
Formal proof != implementation correctness.
Implementation test != historical semantic recovery.
Historical compatibility UNKNOWN != generic Nexo design blocked.

## Result
The research campaign has enough evidence to stop expanding the generic evidence taxonomy.
The next phase should be a **requirements traceability/distillation pass**, not another provider-specific investigation.
This is aligned with NIST's emphasis on documented requirements, knowledge limits, continuous risk management, and traceability. citeturn0search0turn0search25

## Status
GENERIC_EVIDENCE_CAMPAIGN = CLOSED_WITH_BOUNDED_UNKNOWN
TERNARY_HISTORICAL_BRANCH = LOCALIZED_UNKNOWN/BLOCKED
REQUIREMENTS_TRACEABILITY = NEXT_CORE_REQUIREMENT
FORMAL_VERIFICATION = NOT_PERFORMED
IMPLEMENTATION = NOT_PERFORMED

## Next exact direction
AB105.095R — build the compact requirements-to-semantics dependency matrix from the canonical Nexo requirements artifacts already persisted in GitHub. Do not design new architecture. The goal is distillation: identify satisfied, partial, unknown, blocked, and not-yet-designed requirements and expose only the true remaining gaps.

Historical AB50–AB58 unresolved state remains unchanged and must not be collapsed.