# STEP 7 — Requirement-to-Canonical-Owner Traceability Matrix — 2026-10-11

Status: P0 source traceability; no implementation or protected activation authorized.

## Purpose
Reuse existing canonical owners instead of adding duplicate trust abstractions. This matrix traces the commissioning/authority/succession requirements found in the recovered owner decision and adversarial cross-check to the document that owns each semantic responsibility.

## Traceability matrix

| Requirement / claim | Canonical owner | Current state | Boundary / gap |
|---|---|---|---|
| Who is the initial human constitutional authority | `NEXO_NCS/DECISIONS/STEP_7_COMMISSIONING_AND_SUCCESSION_SEMANTIC_RULE_2026-10-08.md` | 🟢 ACCEPTED | Kevin alone; do not reopen or ask again. |
| Initial commissioning must rest on the owner's authorization | Same semantic decision; interpreted alongside `NEXO_NCS/RESEARCH/STEP_7_OWNER_AUTHORITY_AND_SUCCESSION_ADVERSARIAL_REVIEW_2026-10-08.md` | 🟢 NORMATIVE RULE ACCEPTED | Technical authentication of that authorization remains unimplemented. |
| Bind approval to exact Constitution/content/version, action, scope and context | `NEXO_NCS/RESEARCH/STEP_7_OWNER_AUTHORITY_SUCCESSION_ENFORCEMENT_CROSSCHECK_2026-10-08.md`; semantic boundary in commissioning/succession decision | 🔵 CONTRACT REQUIREMENT | Trusted presentation, canonical binding, freshness and atomic consumption need mechanism-specific specification and evidence. |
| Independent basis for recognizing first authority; prevent circular bootstrap | `NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`; `NEXO_NCS/BUILD/STEP_7_MINIMUM_BOOTSTRAP_COMPOSITION_CONTRACT_2026-10-08.md` | 🔴 NO IMPLEMENTED BASIS DEMONSTRATED | Contracts define requirements, not the legitimate physical/deployment basis. Do not choose a root from these schemas alone. |
| Constitution identity/context recognized by Core only after trust foundation exists | `NEXO_NCS/BUILD/STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md`; gate `NEXO_NCS/BUILD/STEP_7_CONSTITUTION_AUTHORITY_CONTEXT_FUTURE_COUNTEREFFECTS_GATE_2026-10-08.md` | 🔴 BLOCKED | Downstream of the missing protected trust foundation; no constructor/carrier may simulate establishment. |
| Role separation and claim-specific dependency/failure-domain closure | `NEXO_NCS/BUILD/STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md`; `NEXO_NCS/BUILD/STEP_7_INDEPENDENCE_FAILURE_DOMAIN_CONTRACT_ATTACK_2026-10-08.md` | 🟢 SEMANTIC RULES CONSOLIDATED; 🔵 DEPLOYMENT CLOSURE OPEN | No generic independence engine or universal GenesisRoot. Unknown dependency closure remains UNKNOWN. |
| Owner authorization cannot be replayed, substituted, reused across contexts, or accepted from model/provider assertion | `NEXO_NCS/RESEARCH/STEP_7_OWNER_AUTHORITY_AND_SUCCESSION_ADVERSARIAL_REVIEW_2026-10-08.md` and enforcement cross-check | 🔵 REQUIRED; NOT RUNTIME VERIFIED | Later tests/model must bind presentation and committed action, reject stale/replayed approvals, and consume authorization safely. |
| Final effect boundary enforces authority/fence without bypass | `NEXO_NCS/RESEARCH/STEP_7_OWNER_AUTHORITY_SUCCESSION_ENFORCEMENT_CROSSCHECK_2026-10-08.md` plus role-map Enforcement / Resource Boundary row | 🔴 DEPLOYMENT BOUNDARY NOT PROVEN | Authentication correctness does not prove protected-effect enforcement or global predecessor cutoff. |
| Currentness, revocation, compromise, offline validity | `NEXO_NCS/BUILD/STEP_7_MINIMUM_GENESIS_TRUST_FOUNDATION_CONTRACT_2026-10-08.md`; commissioning/succession semantic decision; existing AB constraints referenced by role map | 🔵 CONTRACT REQUIREMENTS; 🔴 CONCRETE SOURCE/BOUNDS OPEN | Signature/hash/epoch/snapshot do not prove current authority; no invented universal TTL. |
| Recovery must not self-promote or become a second Constitution | `docs/nexo/NEXO_HUMAN_EMERGENCY_RECOVERY_SECOND_CONSTITUTION_ATTACK_V1_2026-09-24.md`; role map; Genesis contract | 🟢 SEMANTIC INVARIANT | Actual recovery implementation and independent recovery basis remain absent/unproven. |
| Intended successor is not current authority | Owner-approved commissioning/succession decision and adversarial review | 🟢 ACCEPTED INTENT / NO PRESENT AUTHORITY | Do not infer delegation or activation from family relation, age, calendar or stored data. |
| Future succession trigger, evidence, eligibility, acceptance, dispute/fallback and predecessor cutoff | Owner-approved decision + enforcement cross-check | 🔵 OPEN GOVERNANCE REQUIREMENTS | Must be specified in advance before transfer; do not invent answers or ask as if initial authority were undecided. |
| Conflicting successors and ordering | Bootstrap Composition Contract; Trust Function / Root Role Map; human emergency/second-constitution attack; enforcement cross-check | 🟢 UNKNOWN/STOP RULE; 🔵 DEPLOYMENT-SPECIFIC RULE OPEN | No timestamp/epoch/availability/majority winner unless a prior legitimate constitutional rule establishes it. |
| Distinguish request, authorization, execution, enforcement and observed effect | Enforcement cross-check; MASTER/AB global STOP and revocation invariants; role map | 🟢 SEMANTIC INVARIANT; 🔴 NO NEW RUNTIME CLAIM | Missing evidence remains UNKNOWN; STOP requested is not STOP enforced. |
| Commissioning/root change/succession replay and retry identity | Enforcement cross-check references existing operation identity/idempotency principles | 🔵 EXISTING-OWNER REUSE REQUIRED | No second identity mechanism; first audit existing contract ownership before specifying details. |

## Conclusions from the matrix
1. **No duplicate trust abstraction is needed.** The semantic owners already exist for owner legitimacy, genesis basis, bootstrap composition, constitutional context, role/failure-domain analysis, emergency recovery and enforcement.
2. **Normative legitimacy is not the current gap.** The owner-approved decision closes who may initially authorize commissioning: Kevin. His daughter is the intended future successor but has no current authority.
3. **The current hard stop is technical recognition and enforcement.** No independently established, deployment-specific basis has been demonstrated that can authenticate the owner's commissioning act, bind it to the exact Constitution/context, establish currentness/revocation, and enforce the resulting boundary without circular trust.
4. **Succession is a separate future governance gap.** Intended successor is recorded, but trigger/evidence/eligibility/acceptance/dispute/fallback/predecessor cutoff remain open. Do not merge this into the first-authority problem.
5. **No contradiction found in the sources read.** Existing contracts are mutually aligned on separation of legitimacy from authentication, recovery from succession, and authorization from enforcement. The gap is in concrete establishment/deployment assumptions, not a missing field or registry.

## Exact next action
Create the minimum deployment/failure-claim inventory needed to compare the already-permitted commissioning mechanism families against the owner's local-first, provider-independent Nexo goal. For each candidate, state what it can establish, what independent basis it relies on, its common-mode dependencies, currentness/revocation limits, recovery/loss behavior, final effect boundary, and failure state. Do not select a physical mechanism until the deployment assumptions are explicit; do not implement anything yet.

## Evidence boundary
This is document traceability and semantic reconciliation. No runtime test, formal model run, commissioning ceremony, cryptographic verification, or effect-boundary enforcement test is claimed.
