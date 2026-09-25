# AB64 External Research Delta — 2026-09-25

## Purpose

Continue the Nexo research as active investigation rather than treating execution/persistence as a substitute for research.

## Findings

### 1. Three-valued UNKNOWN is a legitimate epistemic representation

The Stanford Encyclopedia of Philosophy documents three-valued semantics in which a third value can represent an undefined/not-yet-defined condition, and notes that different three-valued logics have different treatment of that value. Therefore the project must not silently assume that UNKNOWN has ordinary Boolean behavior; its propagation rules are part of the semantics that must be specified. cite-source:turn1search0turn1search1

### 2. Agent identity/authorization is an active real-world standards problem

NIST's February 2026 concept paper explicitly identifies open questions around agent identity metadata, authentication, authorization, least privilege, delegation, binding agent identity to human identity, auditing, and non-repudiation. This independently supports keeping identity, authority, delegation, context binding, and audit/provenance as first-class research dimensions rather than collapsing them into a single Boolean authorization flag. cite-source:turn1search24turn1search6

NIST's 2025 AI cybersecurity profile draft likewise treats AI systems as requiring their own permissions and authorization policies and highlights least privilege and privilege management over time. cite-source:turn1search25

### 3. Provenance/completeness is independently important

SLSA 1.2 defines provenance as verifiable information tracking an artifact through the moving parts involved in its production, and distinguishes inputs, resolved dependencies, builder identity, and execution metadata. It also emphasizes that provenance completeness and trustworthiness affect what can actually be verified. This is directly relevant to the project's distinction between evidence, retained support, implementation output, and verification. cite-source:turn0search1turn0search5

## Research implications

1. Keep UNKNOWN explicitly typed and propagate it conservatively; do not equate UNKNOWN with FALSE, EMPTY, or absent evidence.
2. Treat identity, authorization, delegation, binding, temporal/context changes, and audit/provenance as separate dimensions until evidence justifies a quotient.
3. Treat provenance completeness as an evidence property, not merely documentation.
4. These external sources do not prove the project's ternary protocol hypothesis. They only provide independent context supporting the research dimensions already under investigation.
5. The open protocol-specific semantics in AB61/AB62 remain unresolved.

## Exact next research/engineering step

Execute the import-safe AB63 gate in the repository-connected GitHub Actions environment. Inspect the output for semantic/modeling defects, then compare surviving candidates by lower-arity observation, FutureObs_PAA, reconstruction, and EventDAG. In parallel, continue external research on agent authorization/context binding and provenance rather than stopping at execution.

## Epistemic status

TERNARY_PAA_COLLISION=UNKNOWN
TERNARY_PROTOCOL_RESIDUAL=UNKNOWN_DUE_TO_MISSING_SEMANTICS
EVENTDAG_CLOSURE=PARTIAL
RECONSTRUCTION=BOUNDED_ONLY
SEMANTIC_FREEZE=NOT_DECLARED
FORMAL_VERIFICATION=NOT_PERFORMED
