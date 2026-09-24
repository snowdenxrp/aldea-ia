# NEXO — CANONICAL CONTINUITY INDEX

## Purpose
This index is the primary recovery entry point for the entire Nexo architecture, research, infrastructure design, decisions, invariants, threat analysis, assurance model, and future work.
It exists specifically to prevent loss of accumulated Nexo work across conversations, sessions, model changes, or context loss.

## Recovery rule
When asked to "retoma Nexo", "continúa Nexo", or equivalent:
1. Locate this index first.
2. Read the current canonical architecture.
3. Read the research/continuity log.
4. Identify the current open Property Gap.
5. Preserve all established distinctions, invariants, decisions and unresolved questions.
6. Continue from the recorded next research point.
7. Never rebuild from approximate conversational memory when the canonical artifacts are available.
8. If new evidence contradicts existing architecture, create a governed revision rather than silently overwriting history.
9. Save important architectural changes back into this repository.

## Canonical artifacts
1. Master architecture: docs/nexo/NEXO_MASTER_ARCHITECTURE_2026-09-23.md
2. Research continuity log: docs/nexo/NEXO_RESEARCH_CONTINUITY_LOG_2026-09-23.md
3. Preservation addendum: docs/nexo/NEXO_MASTER_PRESERVATION_ADDENDUM_2026-09-23.md
4. PG-009 research dossier: docs/nexo/PG-009_SEMANTIC_DATA_MIGRATION_INTEGRITY_2026-09-23.md

## Current state
- PG-001 Complete Mediation: architecturally closed.
- PG-002 Request/State Binding / TOCTOU: architecturally closed.
- PG-003 Sink Integrity / Effect Authenticity: architecturally closed; implementation/integration verification remains.
- PG-004 Independent Verification: architecturally closed; implementation/failure-domain testing remains.
- PG-005 Meta-verification: architecturally closed.
- PG-006 Bootstrap / First Trust: architecturally closed.
- PG-007 Continuity Across Change: architecturally closed.
- PG-008 Partial Update / Atomicity: architecturally closed.
- PG-009 Semantic/Data Migration Integrity: OPEN.

## Canonical workflow
INVESTIGATE → ANALYZE → CONTRAST → RESTRUCTURE/BUILD → VERIFY → SAVE

## Preservation principle
The objective is not merely to preserve summaries. Preserve the accumulated INFRASTRUCTURE MODEL:
- architectural layers; contracts; state machines; trust boundaries; authority model; capability model; delegation rules;
- evidence/provenance model; memory model; world model; verification model; governance model; transaction model;
- resource arbitration; distributed recovery; root of trust; bootstrap; continuity; update/rollback model;
- monitoring; adversarial monitoring; threat graph; assurance cases; property gaps; formal invariants;
- test obligations; unresolved assumptions; failure modes; recovery procedures; research conclusions;
- source/evidence dependencies; implementation status.
A future summary must never replace the detailed architecture.

## Research preservation rule
Research findings are not disposable conversation text. For each important research round, preserve:
- question investigated
- sources/evidence considered
- relevant findings
- contradictions/limitations
- architectural interpretation
- changes made
- invariants added/modified
- tests required
- unresolved uncertainty
- next research point.

## Implementation distinction
Architecturally designed does not mean implemented. Implemented does not mean verified.
Track explicit status such as CONCEPTUAL, DESIGNED, IMPLEMENTED, UNIT_TESTED, PROPERTY_TESTED, ADVERSARIAL_TESTED, FAULT_INJECTED, RECOVERY_TESTED, WORLD_VERIFIED, ADMITTED.

## History rule
Never erase an old architectural decision merely to make the current document look clean. Preserve revision history through Git commits and explicit version/date information.

## Recovery invariant
Loss of conversational context must not imply loss of Nexo's accumulated architecture.

## Current PG-009 research result
Schema compatibility is not semantic compatibility. Nexo now requires a Semantic Migration Contract, explicit semantic mappings, preservation of epistemic/provenance/authority/temporal meaning, differential and property testing, explicit information-loss handling, and post-migration verification. PG-009 remains OPEN.

## Next action
Continue PG-009 research with formal semantic equivalence, deterministic upcaster chains, migration crash recovery, checkpoint/memory migration, policy/authority compatibility, automated semantic diffing, golden fixtures, differential replay, and migration-specific clean recovery. Save every material advance.