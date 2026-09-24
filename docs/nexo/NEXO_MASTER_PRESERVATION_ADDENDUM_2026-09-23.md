# NEXO — MASTER PRESERVATION ADDENDUM
Date: 2026-09-23/24
Purpose: preserve recovered Nexo context that must not be lost between conversations.

## 1. Product vision
Nexo is conceived primarily as a personal assistant comparable in usability to ChatGPT, resident on the user's device, with a local-first architecture and privacy as a core property. Resilience, emergency, continuity, recovery and legacy modes are secondary/temporary operating modes, not the default identity of the product.

## 2. Core architectural vision
Nexo Core is independent of operating system, model provider and user interface.
The platform uses adapters to support different OS/runtime/UI environments.
The architecture is intended to remain stable while models, interfaces, tools and specialized capabilities evolve.

Primary cognitive loop:
OBSERVE → UNDERSTAND → PLAN → ACT → VERIFY → LEARN → ADAPT

Critical separation:
INFORMATION ≠ INSTRUCTION ≠ PERMISSION ≠ AUTHORITY ≠ ACTION

Model output is never authority and cannot directly produce protected effects.

## 3. Persistent substrate
Nexo's continuity must not depend on one model or one conversation.
Important substrate includes:
- governed memory tiers
- Chronicle / durable history
- mission state
- world model
- identity/continuity lineage
- skills/tools registry
- Vault and protected secrets
- versioned artifacts
- checkpoints
- backups/recovery
- assurance/evaluation records
- governance/constitution
- research records.

Chronicle is the durable history of Kevin and Nexo where appropriate, subject to privacy/data-governance rules. It is distinct from ordinary memory and cannot be treated as universal truth.

## 4. Modularity and extensibility
Nexo can acquire tools and specialized capabilities without reconstructing the Core.
Planned/specialized agent roles include architecture, coding, QA, security, memory, research, education, multimodal, hardware, compatibility, resilience, emergency, UX, audit and governance.
Agents remain subordinate to the same authority, capability, evidence, goal, resource and verification controls.

SDK/extensibility is part of the long-term architecture.
Tool Registry governs available tools and their provenance, capabilities, interfaces and admission status.

## 5. Local-first / offline / resident operation
Local-first/offline capability is an architectural objective for privacy and resilience.
A resident interface and wake-word concept ("Nexo") were discussed.
Offline operation never bypasses the authority and safety architecture: critical autonomy remains bounded by pre-authorized offline policy, expiry, resource limits and isolation.

## 6. Security and integrity vision
Verification is not a final cosmetic step. It is a first-class architecture layer.
Integrity covers at minimum:
- functionality
- memory integrity
- security
- coherence
- performance
- continuity
- identity.
Testing includes automation, telemetry/health, anomaly detection, resilience testing, sandbox/gemelo environments, authorized red teaming, and a durable error → cause → solution → prevention record.

## 7. Sandbox / test laboratory
Sandboxing is defense-in-depth, not a substitute for authorization.
Lúmina is the simulation/laboratory environment for testing autonomous behaviors, multi-agent interaction, planning, learning, world modeling and safety controls.
Real-world effects remain separately governed.

## 8. Autonomy and self-improvement
Nexo is intended to have meaningful autonomy, but autonomy is structurally bounded.
Self-improvement follows:
OBSERVATION → EVIDENCE → CANDIDATE → EVALUATION → ADMISSION → DEPLOYMENT
Learning may improve knowledge, strategies, skills or model components according to risk tier.
It cannot silently create authority, weaken controls, modify the immutable constitution or self-approve critical changes.

## 9. Governance / Constitution
A protected Constitution defines immutable safety/authority constraints, amendment procedures, emergency containment, governance and transition gates.
Governance cannot silently redefine its own authority through the same mechanism it governs.
Emergency authority is principally for STOP/FENCE/REVOKE/ISOLATE/QUARANTINE, not unrestricted execution.

## 10. Continuity / persistence / succession
Modes previously conceptualized:
NORMAL, RESILIENCE, EMERGENCY, CONTINUITY, RECOVERY, LEGACY.
These modes have bounded authority and explicit transitions.

Multigenerational inheritance is conceptually distinct from backup.
A successor/fork does not automatically inherit Nexo's operational identity or authority.
Continuity requires protected identity lineage, authorized transition, attestation, state migration, invariant preservation and a new authority epoch where appropriate.

Forks, snapshots and rollbacks are governed transitions; rollback is not time travel and cannot resurrect revoked authority.

## 11. Human relationship and agency
The architecture includes a durable human-authority boundary: human approval is bounded, authenticated and bound to the exact operation/parameters/authority epoch/expiry. It is not a universal bypass.
The system should preserve user agency rather than silently deciding on the user's behalf.

## 12. Research already consolidated
The master architecture and research log contain the detailed work through PG-008, including:
- authority/capability/delegation
- evidence/provenance/taint
- verification and meta-verification
- world model and causal reasoning
- external-world effects and reconciliation
- transactions and partial execution
- resources and arbitration
- distributed partitions/recovery
- root of trust/bootstrap
- human governance
- privacy and memory sovereignty
- long-term memory/forgetting
- collective/multi-agent safety
- monitoring and anti-monitor-gaming
- deception resistance
- adversarial evaluation
- supply chain/change control
- formal assurance
- complete mediation
- request/state binding
- sink integrity
- independent verification
- verifier/policy/reference integrity
- continuity across change
- partial update/atomicity.

## 13. Current open research point
PG-009 — Semantic/Data Migration Integrity.

Question:
Can a new version interpret historical data differently even when no bits are corrupted?

Required investigation:
schema evolution, event/history semantics, database migration, checkpoint/memory migration, temporal semantics, epistemic semantics, policy semantics, Semantic Migration Contract, preservation invariants, golden/differential/round-trip/metamorphic/negative tests and adversarial migration attacks.

## 14. Preservation rule
This addendum is supplementary to the canonical master architecture; it must not replace it.
When future research adds or contradicts any item:
INVESTIGATE → ANALYZE → CONTRAST → RESTRUCTURE/BUILD → VERIFY → SAVE
and preserve the historical change through Git.

The goal is to preserve the complete accumulated Nexo infrastructure and research, not merely a summary.
