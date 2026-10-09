# STEP 7 — Pre-commissioning Design Frontier — 2026-10-09

Status: RESEARCH / DESIGN-ORDER NOTE ONLY — NO GOVERNANCE DECISION, NO TRUST-ROOT SELECTION, NO IMPLEMENTATION.

## Purpose

Continue useful Nexo design work without forcing the unresolved P1 initial Genesis recognition or P2 owner-to-content/scope ceremony decisions. “Not ready to commission” does not mean “cannot design”; it means design outputs must remain proposals and must not be represented as the currently governing Constitution.

This note is a work-order boundary, not a new trust contract or a new abstraction.

## Evidence cross-check

This note reuses, without replacing:

- `STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md`: a Constitution Authority Context must be established from an already-recognized trust foundation; caller-supplied fields cannot establish themselves.
- `STEP_7_MINIMUM_CONSTITUTION_TO_POLICY_AUTHORITY_BINDING_CONTRACT_2026-10-08.md`: constitutional identity, policy identity, authority domain, applicability, validity, dependencies and establishment provenance remain distinct.
- `STEP_7_MINIMUM_BOOTSTRAP_COMPOSITION_CONTRACT_2026-10-08.md`: evidence composition can establish only the exact Genesis claim(s) covered by a governed rule; it does not automatically establish Constitution, Policy or execution authority.
- `STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_FUTURE_COUNTEREFFECTS_GATE_2026-10-08.md`: do not implement a protected-looking context while no implemented, recognized trust foundation exists.
- `STEP_7_LCORE_1_BLOCKING_PREMISES_RESOLUTION_MAP_2026-10-09.md` and `STEP_7_P1_P2_GOVERNANCE_READINESS_REVIEW_2026-10-09.md`: P1/P2 remain unresolved; P3–P6 remain partly or wholly dependent on the eventual concrete deployment and governance decisions.
- MASTER + AB + P/P112 evidence-integration and future-countereffect rules: historical evidence constrains design but does not create current authority; new mechanisms require demonstrated need and a countereffect review.

## Safe design frontier while uncommissioned

### Work that can proceed as proposal-only design

1. **Constitution content inventory:** enumerate the rule domains a future Constitution must address, trace each to an existing MASTER/AB/P source, and label it RECOVERED, EXTENSION, CONFLICT, or UNKNOWN. Do not silently promote an extension to a settled rule.
2. **Authority-domain inventory:** identify where authority questions arise (governance, trust-root lifecycle, identity attribution, capabilities, policy binding, execution/effects, verification, recovery, amendment) without yet choosing concrete permissions or a root mechanism.
3. **Semantic separation review:** ensure identity, authentication, intent, constitutional approval, policy binding, capability, execution permission, and external-effect evidence are not collapsed into one “authorized” flag.
4. **Amendment/change questions:** record what must be distinguished between a proposed amendment, reviewed content, approved amendment, established current regime, and dependent policies that must be revalidated. Do not invent an amendment protocol or infer current authority from a version/epoch.
5. **Human-readable meaning vs canonical content:** define the review questions that a later content-binding design must answer: exact bytes/version/hash, a comprehensible rendering of those bytes, scope included/excluded, freshness, and evidence that the reviewed content is the content bound to the approval. A hash alone does not prove comprehension or legitimate authority.
6. **Failure semantics:** preserve UNKNOWN/HOLD/STOP when governing status, currentness, dependencies, scope or provenance cannot be established. Do not add permissive fallback for usability.
7. **Traceability and attack review:** link every candidate rule to its evidence and counterexamples; mark unsupported choices as owner decisions or deployment-dependent questions.

### Work that remains blocked

- Selecting or recognizing the first Genesis basis.
- Selecting a root family, credential, ceremony, witness/quorum or trust assumption.
- Treating this handset or any UI/local file/new key as a proven trust root.
- Declaring any proposal to be the current governing Constitution.
- Implementing the Constitution Authority Context before its prerequisite trust foundation exists.
- Choosing offline stale windows, revocation enforcement, protected deployment boundary, recovery root or succession process without their governing and deployment evidence.
- Key generation, credential/biometric enrollment, commissioning, activation, protected-Core deployment or external effects.

## Non-negotiable review tests for every future content proposal

- **Self-authorization test:** does the proposal claim authority to establish or amend its own authority?
- **Identity/intent test:** does evidence that identifies/authenticates someone get mistaken for proof they knowingly approved this exact content and scope?
- **Scope-laundering test:** can a mission, policy, model, provider or caller widen the Constitution's authority domain?
- **Currentness test:** can a historical signature, snapshot, version, epoch or cache be mistaken for current authority?
- **Dependency/correlation test:** are sources called independent despite a shared material failure domain?
- **Amendment/recovery test:** can a recovery or update path replace constitutional authority by authorizing itself?
- **Effect-boundary test:** does constitutional recognition get mistaken for permission to execute or proof that an external effect was enforced?
- **Future-countereffect test:** does the proposal introduce a global registry, generic ceremony engine, quorum mechanism, universal priority, compatibility path or other mechanism without a current, evidence-backed need?

A failed or unanswerable test is recorded as a gap; it is not solved by adding a field, wrapper or hidden fallback.

## Design status

- P1 independent Genesis recognition: UNKNOWN / blocking.
- P2 owner-to-exact-content/scope binding: UNKNOWN / blocking.
- P3 platform/dependency closure: partially inventoried; deployment evidence UNKNOWN.
- P4 offline currentness/revocation: UNKNOWN / blocking.
- P5 deployed protected establishment/bypass boundary: NOT ESTABLISHED.
- P6 independently governed recovery/replacement: UNKNOWN / blocking.
- Existing semantic contracts remain the source of truth for their covered boundaries. This note does not alter them.
- No new trust abstraction, authority root, governance decision or runtime capability is introduced.

## Next exact action

Create a proposal-only **Constitution Content Inventory and Provenance Matrix** from existing MASTER, AB and P/P112 material. For each candidate rule, record: exact source, epistemic class (RECOVERED / EXTENSION / CONFLICT / UNKNOWN), authority domain, dependencies, countereffects, unresolved owner decisions, and whether it can be designed before commissioning. First search for existing inventories and reuse them; do not duplicate settled material or write a replacement Constitution. If source evidence conflicts, stop on that item and preserve the conflict explicitly.

Until P1 and P2 are resolved under an explicitly accepted governance basis, all resulting content remains a draft proposal—not the governing Constitution.