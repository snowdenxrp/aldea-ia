# P112 — REMAINING SHARED-DOMAIN MUTATION AUDIT — 2026-10-07

## Structures / land / production
- buildShelter consumes agent inventory and creates world structure, assigns home, changes safety; its eligibility depends on inventory and construction technology.
- farm consumes wood and fertile_land, creates farm, changes safety; daily production also changes farm food and land quality.
- harvest changes farm food and agent inventory.
- craftTool changes inventory and toolmaking skill; useTool changes tool durability and inventory.
- Therefore production/build predicates span agent inventory, skills, technology, land, structures and daily writers. No single demonstrated token covers this closure.

## Knowledge / discovery / memory
- learnFromEvidence mutates agent knowledge, confidence and evidence history.
- remember/trimMemories changes memory contents and therefore can affect future decision scoring.
- relationship and discovery paths can create or modify knowledge/action availability.
- No knowledge, memory, or discovery revision token is demonstrated.
- A token covering only final physical WriteSet would miss admission dependencies that influence action selection.

## Technology / institutions / research
- advanceTechnology, propagateCulture, teachSpecialization and research update agent knowledge/skills/culture and world research state based on other agents and relationships.
- Institution formation depends on recent cooperation, trades, shelters and alive-agent population; institution norms then change daily.
- Commons actions mutate both agent inventory/needs and world commons.
- No demonstrated common revision/fence covers these cross-domain dependencies.

## Important new bypass
A dependency can be changed by a daily society transition without the selected action's executor being involved. Conversely, an action can change knowledge/relationships/memory after the physical effect. Therefore a future protected transition must account for both pre-admission readers and post-selection mutation writers where those changes affect protected claims.

## Research cross-check
PostgreSQL's serializable model explicitly treats read/write dependencies and predicate/range effects as relevant to anomaly detection, rather than relying only on final written rows. This is conceptual corroboration, not evidence about Nexo. cite: PostgreSQL transaction isolation documentation.

## Status
GREEN: remaining domains audited at code-path level.
GREEN: cross-domain bypasses confirmed.
BLUE: exact token partition and authoritative ownership remain OPEN.
No implementation performed.

## Exact next
Build the writer-to-token coverage matrix for all audited domains and classify each candidate as:
A) existing token with demonstrated complete writer coverage;
B) existing token but incomplete coverage;
C) missing token/dependency representation.
Then identify the smallest defensible partition without introducing a global transaction by assumption.
