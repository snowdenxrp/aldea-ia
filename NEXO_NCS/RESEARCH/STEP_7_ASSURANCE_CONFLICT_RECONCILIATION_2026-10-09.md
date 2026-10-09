# NCS STEP 7 — Assurance / Contradictory Verification Reconciliation
Date: 2026-10-09
Status: RESEARCH-ONLY RECONCILIATION — NO NEW CONTRACT OR IMPLEMENTATION

## Question
How should Nexo represent multiple verification results with different assurance levels, shared/unknown dependencies, conflicting claims, and different freshness/coverage, without selecting by majority, recency, arrival order, or model preference?

## Canonical evidence inspected
Current NCS branch `ncs-clean-architecture`:
- `NEXO_NCS/STATUS.md`, read-back SHA `3cc8b743c5994c83549edbc8714dadc81e67e910`.
- `NEXO_NCS/BUILD/STEP_7_EVIDENCE_MAPPING_2026-10-08.md`, read-back SHA `bba96577b015016f4d062c2dc9212db1368057d4`.
- `NEXO_NCS/BUILD/STEP_7_PROTECTED_POLICY_CONTEXT_EVIDENCE_BOUNDARY_2026-10-08.md`, SHA `8670f7e19c4a8285c00b49eac4d4a635cdfd2abc`.
- `NEXO_NCS/BUILD/STEP_7_PROTECTED_POLICY_CONTEXT_EVIDENCE_BOUNDARY_ATTACK_2026-10-08.md`, SHA `3efe404bb9ce3ce5b61e0ed61815b847ac593445`.
- `NEXO_NCS/PROOF/STEP_4_RUNTIME_VERIFICATION_2026-10-08.md`, SHA `47c8eadb5ad5bf0e24779d4f8611f6773ef1aaeb`.
- Current Core files `src/nexo/core/contracts.mjs`, `src/nexo/core/observation.mjs`, `src/nexo/core/reconciliation.mjs` were inspected in the same session; see existing evidence mapping and status for their scope.

Historical AB/P evidence:
- `docs/nexo/AB105_082R_observation_freshness_contract_2026-09-30.md`, SHA `16500e3c9bfc5d5b3ae4c7df2b6844b352d12c2a`.
- `docs/nexo/AB105_083R_observation_conflict_reconciliation_2026-09-30.md`, SHA `4c09af782e81ac3db61763feb5af226993cca9dd`.
- `docs/nexo/AB105_084R_evidence_common_mode_dependency_2026-09-30.md`, SHA `d92516825e823313a6d7336bbfd37eaf192896f7`.
- `docs/nexo/AB105_085R_dependency_graph_incompleteness_2026-09-30.md`, SHA `da8e6e5772e11d7d9822759a7307b21f3704ca09`.
- `docs/nexo/AB105_086R_evidence_layer_integration_checkpoint_2026-09-30.md`, SHA `6c99ab41e5c087885f35af668ab4de66165068ba`.
- `docs/nexo/NEXO_CONTINUITY_CHECKPOINT_2026-09-26_AB104.251.md`, SHA `b7b3999613a1636c5ab40310dbbf182eb0cb59a5`.
- `docs/nexo/NEXO_TCB_COMPOSITION_MULTIPLE_TRUST_FOUNDATIONS_COMMON_MODE_ASSURANCE_AUTHORITY_RESEARCH_V1_2026-09-24.md`, SHA `bbd458aca11907039bcf912c1576fbbd1e575eed`.
- `docs/nexo/AB104_946R_provider_key_conflict_unknown_effect_audit_2026-09-29.md`, SHA `1b3d62f0389bf6d37b43e33a2be79ee54a84b3dd`.

## Finding: the generic semantic question is already closed
AB105.082R–.086R explicitly integrated three independent appraisal dimensions:
1. Freshness: FRESH / STALE / UNKNOWN_FRESHNESS.
2. Compatibility: COMPATIBLE / STATE_TRANSITION / CONFLICT / UNKNOWN.
3. Dependency: INDEPENDENT / CORRELATED / UNKNOWN_INDEPENDENCE.

They must not be collapsed into one confidence number or a single truth flag. No dimension upgrades another. Appraisal is derived from immutable observations; it does not rewrite source evidence. The consuming Claim/Decision contract defines the assurance required for its purpose. If missing dependency information could invalidate that assurance, the affected consequential decision remains UNKNOWN/STOP. Bounded low-assurance use is possible only when explicitly allowed by the applicable policy, and the evidence must not be promoted to stronger assurance downstream.

AB104.251 independently states that contradictory admissible claims must not be resolved by timestamp, arrival order, majority count, or local preference; they remain CONFLICT/QUARANTINED until authority/lineage rules determine admissibility. Quorum is protocol-specific, not a generic truth multiplier.

The TCB-composition research adds that assurance is claim-relative, multiple roots do not imply independence, unknown common-mode overlap blocks stronger composition, and assurance does not create authority. AB104.946R further confirms that a provider-level parameter conflict is not an oracle for whether an external effect committed or failed.

**Conclusion:** No new generic evidence primitive, assurance score, confidence field, quorum engine, winner-selection rule, memory schema, or universal trust layer is justified. Reopening the AB105.082R–.086R generic branch would violate its explicit research stop rule absent a concrete new requirement or primary-source contradiction.

## NCS implementation boundary — keep design and runtime separate
Current NCS has:
- observation-side evidence/provenance transport;
- ClaimEnvelope fields for evidence and dependencies;
- validation outcomes PASS/FAIL/UNKNOWN;
- deterministic reconciliation of explicitly authoritative supplied evidence;
- a protected PolicyContext evidence-boundary design and adversarial analysis.

These are bounded contracts. They do not by themselves establish that an evidence source is legitimate, prove complete dependency closure, establish current constitutional authority, or prove real-world external-effect enforcement. STEP 6 specifically documents that it accepts the authoritative evidence item's outcome as supplied by the owning caller; it does not itself define the root authority/evidence establishment mechanism. STEP 4/6 test evidence is not production safety proof.

The current protected PolicyContext boundary already rejects provider self-attestation, caller-supplied trust labels, scope/dependency laundering, circular resolver trust, and stale binding reuse at the semantic level. The source says implementation is not authorized and its root prerequisites remain unresolved. Do not add `trusted`, `verified`, `assuranceScore`, or similar fields as a substitute for protected evidence establishment.

## Reconciled attack matrix

| Attack | Canonical resolution | NCS status / limitation |
|---|---|---|
| More records from the same source counted as independent | AB105.084R/086R: dependency-aware appraisal; count paths, not records | Generic semantics closed; concrete dependency graph/producer evidence is claim-specific |
| Unknown dependency treated as independent | AB105.085R: UNKNOWN_INDEPENDENCE stays distinct; decision policy scopes consequence | Do not infer independence; low-assurance use needs an explicit applicable policy |
| Newest timestamp automatically wins | AB105.082R/083R/086R: timestamp is not causality or truth | No global latest-wins rule |
| Two valid overlapping incompatible observations | AB105.083R/086R: preserve both and derive CONFLICT unless supported transition/compatibility evidence resolves it | Conflict is not proof either record is invalid |
| Historical evidence mistaken for current state/authority | AB105.082R + AB104.946R + TCB composition | Freshness, authority, world state and effect outcome remain separate claims |
| Assurance result silently becomes authority | TCB composition + NCS protected-evidence boundary | Authority remains separate and P1/P2 root prerequisites block protected establishment |
| Model chooses a winner | MASTER/NCS policy-outside-model invariant; protected evidence-boundary attack | Model may propose analysis, not grant authority or select a winner absent a governed decision contract |
| Appraisal mutates original evidence | AB105.083R/086R event-sourcing rule | Derived appraisal must remain separate from immutable observation history |
| Strong result for one scope reused for a wider scope | AB105.086R coverage invariant + NCS policy-context scope binding | No scope widening without new appraisal/evidence |
| Missing required evidence becomes PASS | NCS STEP 4/6 contract: missing/non-authoritative evidence -> UNKNOWN | Runtime tests prove only their bounded contract, not deployed source legitimacy |

## Cross-effect / future-countereffect review
- **Benefit of new abstraction:** none identified; existing AB and NCS contracts already own the generic semantics.
- **Risk of adding one:** duplicate assurance taxonomies, inconsistent freshness/dependency/conflict labels, accidental truth ranking, provider lock-in, and a false implication that schema fields establish source legitimacy.
- **Structural root cause not solved by a field:** legitimacy and sufficiency of evidence must be established at the protected boundary for the exact claim and scope. That boundary depends on unresolved Genesis recognition / owner-content binding and eventual concrete deployment evidence.
- **Future integration condition:** when a concrete claim is selected, map its required freshness, compatibility, dependency completeness, scope, authority and effect-state evidence to existing contracts. If the requirement is already covered, reuse it. If a real contradiction is found, stop and redesign the root semantics before implementation.

## Decision
- Generic evidence appraisal / contradictory-verification semantics: **RECOVERED AND CLOSED AT GENERIC RESEARCH LEVEL**.
- New generic abstraction or schema: **NOT JUSTIFIED**.
- Existing NCS runtime contract verification: **bounded to the recorded tests and code paths**.
- Protected source legitimacy, deployment closure and root authority: **UNKNOWN/STOP**.
- No code, tests, frozen AB105/TLC/Kafka probes, authority decision, commissioning, credentials, protected activation or external effect was created or authorized.

## Follow-up source reconciliation (2026-10-09)
The proposed follow-up source check was completed against current branch code and existing P112/NCS evidence:
- `src/assistants/squad.js` SHA `6d9b9bdfbabf79c8924033c72046f056806d9918`: current specialist findings carry claim-class-specific fields, but no common report/run/sample identity is attached to each finding. Examples include NEGATIVE_RESOURCE(resource type, amount), EXPLORER_STALLED(agent id, area/region counts), and render findings whose predicate originates in an external `renderProbe`.
- `src/nexo/orchestrator.js` SHA `973d3d5406c5cab16fb49529d94e07a1557c3111`: producer source is injected; action/target/reason/source and selected metadata are carried live; dedupe uses `action|target|finding.action.name`, not claim equivalence.
- `src/assistants/memory.js` SHA `c70f246a85e8c513b8f746d7de237f881b0de91c`: durable `recordNexoPlan` stores mission metadata plus step id/action/target/status/dependencies. It does not retain the original finding/provenance envelope. `reconstructNexoMission` cannot reconstruct fields never persisted.
- `NEXO_CONTINUITY/P112_FINDING_EVIDENCE_PROVENANCE_CLASSIFICATION_AUDIT_V1_2026-10-07.md` SHA `037e28f6f9997955deee9cdf6f7d0d5d02e0646d`, `P112_MISSION_CLAIM_COMPRESSION_DEDUPLICATION_AUDIT_V1` SHA `0f257026f24fbf8da4880fb2f558ed99371aabad`, `P112_DEDUP_COLLISION_SEMANTICS_AUDIT_V2` SHA `d9675ca04c3e50d56e5071af619244b675d15ba6`, and current NCS evidence mapping already record this same two-stage provenance-loss boundary and its claim-specific distinctions.
- Existing NCS `ObservationEnvelope → MissionCandidate` contract preserves the provenance actually available and explicitly retains UNKNOWN when required identity, incarnation, freshness, or dependencies are absent. It does not promise durable persistence or integrate the legacy orchestrator.

Result: this check confirms an already-owned gap; it does not discover a new one. Do not duplicate the P112 audit, invent observation/run/sample IDs, change the legacy serializer, or claim the old path is integrated into NCS. The gap remains relevant historical evidence, while the new Core remains a separate design/implementation boundary.

## Decision after follow-up
- Generic assurance/conflict semantics: already closed at the AB105.082R–.086R research layer.
- Observation-to-mission provenance loss in the legacy path: already documented and owned by the current NCS STEP 7 evidence mapping and P112 audits.
- Current NCS transport contract: preserves available evidence, but does not establish missing producer identity or durable raw observation recovery.
- No further generic contract, memory subsystem, EventDAG, identity primitive, persistence mechanism, or legacy integration is justified by this source pass.
- STEP 7 Genesis trust-root P1/P2 and protected evidence-establishment gates remain UNKNOWN/STOP.

## Next exact action
Do not repeat the now-closed generic evidence branch or the already-audited legacy provenance-loss path. The next action must be selected from a concrete unresolved NCS requirement that is independent of P1/P2 and has a canonical owner; if none is supported by current MASTER + AB + P/P112 evidence, hold rather than manufacture progress. Any future proposal must first state its claim/use case, canonical owner, required evidence, dependency/assurance conditions, failure behavior, verification method, and why existing contracts do not already cover it.
