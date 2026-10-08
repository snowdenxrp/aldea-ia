# NEXO — STRICT PROJECT RULE: MASTER + AB + P EVIDENCE INTEGRATION
Date: 2026-10-08
Status: ACTIVE / NON-NEGOTIABLE

## Decision

Before defining, changing, or advancing any Nexo architectural construction boundary, the project MUST explicitly use the three evidence layers together:

- **MASTER** — the consolidated principles, decisions, invariants and architectural direction that Nexo must preserve.
- **AB** — demonstrated historical evidence, failures, boundary distinctions and frozen findings. Closed AB work is consulted as evidence; it is not replayed merely for completeness.
- **P / P112 and related research** — research evidence, cross-checks, hypotheses and unresolved gaps that can materially affect the design.

NCS then converts only sufficiently supported conclusions into new Core contracts and construction steps.

## Mandatory reasoning chain

**MASTER → what must be preserved**  
**AB → what was demonstrated / what must not be repeated or violated**  
**P → what research evidence changes or constrains the design**  
**NCS → the minimum explicit contract that construction may implement**

If all three layers converge on an architectural conclusion, that conclusion MUST be reflected in the new Nexo design.

If the layers contradict one another, construction MUST STOP at the contradiction. The contradiction must be investigated and resolved or explicitly preserved as UNKNOWN/PENDING. It MUST NOT be hidden with a patch, compatibility layer, assumption, or silent migration.

## Non-bypass rules

1. No construction step may be defined from intuition alone when relevant MASTER/AB/P evidence exists.
2. Historical AB findings must not be treated as disposable just because the old architecture is being replaced.
3. Research findings must not be copied mechanically into Core; they must first be translated into an explicit semantic contract.
4. A logical possibility is not evidence; an old document is not an executed test; absence of evidence is not evidence of absence.
5. Closed audits remain closed unless new construction evidence directly contradicts a frozen invariant or creates a genuine unresolved dependency.
6. No new mechanism (IDs, queues, retries, tombstones, transaction wrappers, fencing machinery, external-effect protocol, etc.) may be invented merely to satisfy this rule.
7. The new architecture remains clean and coherent: historical evidence informs the design but does not become legacy architecture or a pile of patches.

## Required checkpoint

Every meaningful architecture/construction decision must record, where applicable:
- MASTER constraint preserved;
- AB evidence used;
- P research used;
- resulting NCS contract;
- remaining UNKNOWN/PENDING;
- exact reason the evidence is sufficient to proceed.

## Relationship to existing NCS rules

This decision reinforces, and does not replace, the existing separation:
MASTER = architectural truth;
CORE = contracts/invariants;
BUILD = construction;
RESEARCH = historical evidence;
PROOF = verified runtime evidence;
DECISIONS = closed decisions;
STATUS = operational resume point.

This rule is permanent for the Nexo project unless an explicit later architectural decision supersedes it with new evidence.
