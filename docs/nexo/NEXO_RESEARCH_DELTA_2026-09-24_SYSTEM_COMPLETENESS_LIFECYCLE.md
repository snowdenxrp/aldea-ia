# Nexo Research Delta — system completeness and lifecycle engineering

Date: 2026-09-24
Status: RESEARCH-ONLY

## Purpose
Before the clean Nexo architecture is designed, expand the research boundary from formal safety mechanisms to whole-system completeness: requirements, stakeholders, lifecycle, operations, maintenance, evolution, retirement, human factors, and assurance.

## External cross-check
NIST SP 800-160 Rev. 1 frames trustworthy secure systems as a systems-engineering problem across the lifecycle and emphasizes that requirements themselves must be complete, consistent, and correct; it treats security/trustworthiness as an emergent property of the system rather than an isolated subsystem. citeturn0search0turn0search48 NIST SP 800-160 Vol. 2 Rev. 1 extends this toward cyber resilience: anticipating, withstanding, recovering from, and adapting to adverse conditions. citeturn0search7 ISO/IEC/IEEE 15288:2023 provides a common framework of system life-cycle processes applicable to systems, system elements, and systems of systems. citeturn0search18 NASA's systems engineering handbook likewise treats engineering as recursive and iterative across design, development, operation, maintenance, and closeout. citeturn0search17 NIST's AI RMF organizes AI risk work around Govern, Map, Measure, and Manage and treats risk management as continuous across the AI lifecycle. citeturn0search4turn0search12

## New research questions opened
1. Requirements completeness: what classes of requirements have we not modeled yet (functional, safety, security, privacy, reliability, availability, performance, maintainability, usability, operability, explainability, governance, legal/compliance, resource/budget, environmental constraints)?
2. Stakeholder completeness: who can authorize, operate, observe, maintain, update, audit, recover, override, or terminate Nexo, and what conflicts/segregation-of-duties exist between those roles?
3. Lifecycle completeness: how do installation, bootstrap, normal operation, degradation, incident response, update, rollback, recovery, maintenance, migration, decommissioning, and archival affect invariants?
4. Operational completeness: what happens when dependencies, credentials, time, storage, network, model providers, sensors, logs, or humans become unavailable or misleading?
5. Evolution completeness: how do schema, policy, model, dependency, trust-root, hardware, and protocol changes preserve or intentionally revise invariants?
6. Human/system interaction: which assumptions about human attention, approval, interpretation, emergency action, fatigue, misunderstanding, or conflicting instructions must be explicit rather than implicit?
7. Mission completeness: how do we detect that the system is optimizing a proxy while violating the actual mission or stakeholder constraints?
8. Decommissioning completeness: what must happen to authority, credentials, secrets, memories, durable history, external effects, delegated tasks, and recovery paths when Nexo is retired?

## Important conclusion
The clean architecture should not be designed solely as a control/safety kernel. The research must establish a complete system boundary first, then determine which concerns belong inside the trusted computing/control core, which belong in supporting services, and which remain environmental assumptions.

## Research rule
Do not add these concerns to the architecture ad hoc. Research and classify them first, then feed them into the future distillation ledger.

## Status
`RESEARCHED / NEW COMPLETENESS PASS OPEN / ARCHITECTURE STILL BLOCKED`
