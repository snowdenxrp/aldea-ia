# STEP 7 — Trust Function / Root Role Map — 2026-10-08

Status: P0 ARCHITECTURE RESEARCH / SEMANTIC MAP — NO PHYSICAL ROOT SELECTED — IMPLEMENTATION STOP RETAINED

## Purpose

Map existing trust functions and their canonical contract owners before selecting a physical trust mechanism or defining another implementation layer. This document consolidates the current NCS root contract, bootstrap composition contract, Constitution Authority Context contract, MASTER + AB + P integration rule, and historical AB/P findings. It is a role map, not proof that any role is implemented or independently enforced.

## Evidence integration

- MASTER invariant chain: TRUST ANCHOR → IDENTITY → AUTHORITY → CAPABILITY → POLICY → WORLD REVALIDATION → EXECUTION → VERIFICATION.
- NCS root gate: `STEP_7_TRUST_FOUNDATION_ROOT_CONTRACT_AND_RECOGNITION_GATE_2026-10-08.md`.
- NCS bootstrap composition: `STEP_7_MINIMUM_BOOTSTRAP_COMPOSITION_CONTRACT_2026-10-08.md`.
- NCS constitutional context: `STEP_7_MINIMUM_CORE_CONSTITUTION_AUTHORITY_CONTEXT_CONTRACT_2026-10-08.md`.
- NCS research: `STEP_7_DEEP_TRUST_RATS_RECOVERY_CONSOLIDATION_2026-10-08.md`; RATS and NIST SP 800-193 inform role separation but do not select Nexo's authority.
- Historical AB: AB104.446 (root enrollment/de-enrollment/recovery governance), AB104.429 (offline revocation/currentness), AB104.401 (evidence-to-authority promotion), AB104.571 (recovery final-gate/TOCTOU), GLOBAL AUDIT 109 (STOP/revocation/enforcement distinction).
- Historical constitutional research: root trust-anchor ordering, succession/multi-anchor governance, offline recovery and common-mode/failure-domain analysis.
- Permanent rule: MASTER + AB + P/P112 must be cross-checked before advancing a construction boundary. Closed historical probes are evidence, not a reason to rerun them.

## Role map

| Semantic role | Canonical existing owner / evidence | Authority it may establish | Independence and current gap |
|---|---|---|---|
| Governance / constitutional trust | Root Recognition Gate; Minimum Core Constitution Authority Context; historical constitutional ordering and succession research | Which constitutional regime is recognized for a bounded authority domain | Must not authenticate itself or derive sole authority from a disputed transition. Independent initial recognition and real protected enforcement remain unimplemented/unproven. |
| Integrity / measurement | Root Gate dependency/integrity obligations; historical protected-boundary and platform research | Integrity/measurement claims for the components and scope actually measured | A measurement result is evidence, not governance authority. No platform/hardware or measured-boot mechanism is selected; measurement's trust anchor and appraisal policy remain dependencies. |
| Identity / attestation | RATS separation in Deep Trust research; AB104.401 evidence-to-authority boundary | Attribution or attestation of a subject/component under an identified appraisal basis | Identity and attestation do not establish current constitutional authority or permission. Verifier, trust-anchor configuration, freshness, and relying-party policy must remain distinct. No production identity root is established. |
| Appraisal / evidence verification | RATS Verifier/Appraisal Policy; existing claim/evidence contracts; STEP 4 semantic validation evidence | A scoped appraisal result about evidence under a known policy and freshness context | Appraisal result cannot authorize itself or substitute for the relying party's governed decision. Current policy-owner/authority establishment is a separate unresolved protected boundary. |
| Recovery | Historical AB104.446, AB104.452, AB104.571; constitutional recovery research; root gate recovery obligations | Only the bounded recovery capabilities already authorized by a previously established rule | Recovery authority is not constitutional authority. A recovery mechanism cannot appoint itself successor, rewrite governance, or treat a restored snapshot as current. A fully established independent recovery basis is not evidenced. |
| Succession / root replacement | Owner authority/succession cross-check; constitutional succession research; root gate transition-safety obligations | An explicitly governed transfer from predecessor to successor for a stated scope | Requires pre-established ordering, predecessor cutoff at the enforcement boundary, descendant invalidation/revalidation, conflict handling, and observed enforcement. No successor becomes current by certificate, age, calendar, snapshot or self-assertion alone. |
| Update / root lifecycle | AB104.446 root enrollment/de-enrollment; NIST SP 800-193 role distinction; root gate | Authorized update, enrollment, rotation, de-enrollment or replacement under an already recognized basis | Root lifecycle changes are authority transitions, not ordinary configuration edits. The update mechanism cannot be its own sole authorizer. No universal update root is selected. |
| Data protection / key protection | Existing Vault and credential principles in MASTER; root and recovery research | Confidentiality/integrity of protected material within its defined scope | Possession of a protected key or encrypted data does not prove current authority. KMS, operator, firmware, backup and recovery dependencies must be included when claim-relevant. Exact implementation remains unselected. |
| Bootstrap composition / independence | Minimum Bootstrap Composition Contract; constitutional multi-anchor and common-mode research | Only the explicitly named Genesis Trust Foundation claim(s) under a specified composition rule | No implicit quorum, majority, timestamp, score, provider order or fallback. Multiple nodes/keys are not independent if they share a material failure domain. Do not build a generic trust registry or independence engine. |
| Final enforcement / effect boundary | GLOBAL AUDIT 109; G-A14-01 protected gateway research; AB104.429; effect-path closure research | Whether a particular protected effect is actually blocked, admitted or enforced at its last controllable boundary | Authentication, revocation request, STOP request, local cache invalidation or internal state change alone is not enforcement proof. The last effect boundary and bypass closure are deployment-specific and not yet demonstrated for Nexo generally. |
| Continuity / historical evidence | MASTER + AB/P evidence integration rule; NCS STATUS/PROOF separation; historical event/provenance contracts | What was observed, decided, tested, superseded or remains unknown | Historical provenance must be preserved without granting present authority. A commit, snapshot, hash, epoch or valid signature alone does not prove currentness. |

## Required separations

1. Trust anchor configuration is distinct from evidence, endorsement, attestation, verifier appraisal, relying-party authorization and execution.
2. Governance, integrity/measurement, identity/attestation, recovery/succession, update and data protection are distinct semantic roles. A physical component may support multiple roles only if the claim-specific threat model explicitly accepts the resulting common-mode dependency.
3. A role is not a device, key, vendor, process, package or API name. Choosing a physical mechanism is a later deployment decision and must not be implied by this map.
4. Root identity/integrity is distinct from root currentness; currentness is distinct from revocation propagation; both are distinct from enforcement at each protected resource.
5. Cryptographic authenticity and historical provenance do not establish non-equivocation, current authority, informed human approval or external effect.
6. Recovery is not succession. Succession is not routine key rotation. Key rotation is not proof of predecessor cutoff.
7. Identity recognition is not authentication; authentication is not authorization; authorization is not effect enforcement.

## Claim-relative independence rule

For each proposed trust claim, record only the dependencies whose compromise could invalidate that claim, including where applicable:
- key and trust-anchor provisioning;
- firmware, hardware, host/hypervisor and update supply chain;
- provider, operator, organization and administrative control;
- verifier and appraisal policy;
- storage, backup, restore and currentness mechanism;
- recovery/succession authority;
- network/replication/witness path;
- final enforcement point and any bypass path.

Two sources count as independent only with respect to a specified failure mode when the relevant dependencies and compromise controls demonstrate that independence. Different keys, accounts, devices, organizations or nodes do not by themselves prove independence. Unknown critical dependencies keep the claim UNKNOWN.

## Contract ownership and uncovered work

Already represented and to be reused rather than duplicated:
- Root identity/scope, independent recognition, integrity, currentness, revocation/recovery, dependency closure, transition safety, rollback resistance, failure-domain declaration and bounded result: Root Recognition Gate.
- Scoped combination, independence requirements, dependency closure, validity/order context and no implicit selector: Minimum Bootstrap Composition Contract.
- Constitutional regime recognition and anti-self-attestation: Minimum Core Constitution Authority Context Contract.
- Revocation propagation, stale/offline authorization and resource-relative effectiveness: AB104.429.
- Enrollment/de-enrollment, root lifecycle races, dependency invalidation and emergency-mode separation: AB104.446.
- Successor/predecessor cutoff, authority retention, STOP≠enforcement and effect-boundary claims: historical constitutional succession research and GLOBAL AUDIT 109.
- Mandatory evidence convergence and contradiction STOP: MASTER + AB + P Evidence Integration Rule.

Still unresolved (not to be filled by invention):
1. The concrete initial provisioning/recognition ceremony and its enforcing boundary.
2. The selected deployment/failure model and which physical dependencies can be trusted independently.
3. How currentness/revocation is established for offline devices under each protected effect's allowed staleness.
4. The real recovery and succession basis, including what remains enforceable if a root or provider is compromised.
5. The last enforceable boundary for each target device/service and evidence that no bypass exists.
6. Which roles may share a physical mechanism in the actual target deployment.
7. The concrete owner-governed succession questions recorded in the owner-authority cross-check; no answer is inferred here.

## Decision

- Do NOT create one universal GenesisRoot or a generic trust/independence/quorum engine.
- Do NOT select immutable provisioning, mutable predecessor-root, hardware/platform, or multi-root/threshold as the winner from this map.
- Do NOT implement Constitution Authority Context, root enrollment/rotation, recovery execution or protected commissioning yet.
- Continue P0 research by inventorying concrete deployment claims and failure domains, then compare candidate recognition families against this role map. Only after the deployment assumptions and independent enforcement boundary are explicit may the smallest formal transition model be considered.
- Any contradiction with MASTER, frozen AB evidence, or P/P112 evidence requires STOP and investigation; no patch, silent migration or invented fallback.

## Evidence status

This document is a cross-referenced semantic synthesis of existing repository research/contracts. It is not a runtime proof, implementation claim, owner succession decision, physical-root selection, or production-safety claim.
