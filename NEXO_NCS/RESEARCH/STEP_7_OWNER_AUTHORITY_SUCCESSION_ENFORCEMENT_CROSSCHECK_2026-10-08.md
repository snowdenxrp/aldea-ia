# NCS STEP 7 — Cross-Check: Owner Authority, Succession and Enforcement Boundary
Date: 2026-10-08
Status: P0 research; no implementation, no runtime validation.

## Inputs cross-checked
- Canonical NCS trust role map: `NEXO_NCS/BUILD/STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md`.
- Owner-approved semantic decision: `NEXO_NCS/DECISIONS/STEP_7_COMMISSIONING_AND_SUCCESSION_SEMANTIC_RULE_2026-10-08.md`.
- New owner authority adversarial review: `NEXO_NCS/RESEARCH/STEP_7_OWNER_AUTHORITY_AND_SUCCESSION_ADVERSARIAL_REVIEW_2026-10-08.md`.
- Historical constitutional anchor/succession/recovery research (2026-09-24), especially `NEXO_CONSTITUTIONAL_TRUST_ANCHOR_SUCCESSION_PROVENANCE_RECOVERY_RESEARCH_V1` and `NEXO_HUMAN_EMERGENCY_RECOVERY_SECOND_CONSTITUTION_ATTACK_V1`.
- Formal-methods reference: Lamport et al., *Specifying and Verifying Systems With TLA+*, which explains using explicit state/transition specifications to find design errors in concurrent/distributed systems. Reference: https://lamport.org/pubs/spec-and-verifying.pdf. This is methodology support, not proof of Nexo.

## Reconciliation: no new root abstraction
The existing role map already distinguishes Constitutional/Governance Root, Recovery Root, Succession/Ordering, Enforcement/Resource Boundary and Continuity/History. The old research already states that anchor currentness cannot be established solely by artifacts whose meaning depends on that same anchor, and that a successor cannot become current merely from a valid certificate or restored history. Do not add another generic root, trust registry, universal quorum, or authority layer.

## Contract requirements retained as necessary
1. **Authority provenance:** every protected authorization must be attributable to the currently governed authority and the exact scope/action; model-generated text, memory and provider assertions are never authority.
2. **Exact-context binding:** bind approval to the exact Constitution/policy identity and content, action, target, scope and relevant context; no reuse across versions or operations.
3. **Freshness and atomic consumption:** reject replay, stale approval and duplicate consumption; this is a protocol property to specify/test, not a new trust root.
4. **Protected presentation:** authorization must not be considered informed approval if the user-facing trusted presentation and committed operation can diverge. If presentation integrity is not established, protected action remains blocked.
5. **Final enforcement boundary:** define the last component capable of producing each protected effect and show that it enforces the authorization/fence without a bypass. Correct authentication alone is insufficient.
6. **Currentness and predecessor fencing:** root changes/succession must be ordered by the pre-established governance relation; before successor authority is released, predecessor authority must be cut off over the claimed scope and enforcement observed. If some offline incarnation cannot be fenced, do not claim universal cutoff; keep its protected effects unavailable until revalidated.
7. **Descendant invalidation/revalidation:** after root/Constitution/authority change, re-evaluate dependent credentials, policy claims, cached permissions, continuations, checkpoints and pending operations. Preserve historical provenance but do not let it confer current authority.
8. **Conflict and late evidence:** conflicting branches, delayed callbacks, uncertain ordering or late evidence must not silently select a winner. Keep conflicting histories, quarantine protected transitions and revalidate against the governed rule.
9. **Recovery non-amplification:** recovery may restore only its pre-authorized bounded capability; it cannot appoint itself as successor, rewrite the Constitution or certify its own currentness.
10. **No self-authorized emergency Constitution:** emergency/containment paths cannot expand into new constitutional authority without an independently authorized transition already allowed by the Constitution.
11. **Idempotent transition identity:** a single commissioning/root-change/succession intent must not execute twice under retries, crashes or reconciliation. Reuse existing operation identity/idempotency principles; do not add a second mechanism.
12. **Fail-closed result semantics:** distinguish requested, accepted, executed, enforced and externally observed. Missing evidence is UNKNOWN, not success. A STOP request is not enforcement proof.
13. **Future successor boundary:** the daughter is an intended successor, not current authority. Eligibility, evidence, ceremony, dispute handling, predecessor cutoff and activation are separate gates; no automatic transfer based solely on age, calendar or one document.
14. **Privacy and minimization:** succession evidence must be limited to what the pre-established rule requires; do not build a broad family/biometric data collection system as a shortcut to legitimacy.

## What is testable versus normative
### Mechanism properties (later test/model candidates)
- replay/cross-context rejection and atomic challenge consumption;
- stale approval rejection at the final effect boundary;
- races between succession and in-flight operations;
- idempotency under retry/crash;
- restoration of old checkpoints cannot restore current authority;
- revocation/fencing behavior across replicas and offline incarnations;
- no bypass around the final enforcement boundary;
- conflict/late-evidence behavior remains UNKNOWN/quarantined;
- dependent-claim invalidation/revalidation after root transition.

These are candidate properties only. They are not tested here. Formal state-machine modeling can explore concurrency and transition races, but a model result only applies to its stated assumptions and does not prove deployment behavior.

### Owner-governance questions still open before any future transfer
- What exact event qualifies as the succession trigger, and what evidence standard establishes it?
- What conditions must be met before the daughter is eligible to assume authority, beyond mere age?
- What trusted ceremony establishes her informed acceptance and authenticator binding?
- How are disputes or ambiguous evidence resolved under rules authorized in advance?
- What fallback is permitted if the planned successor cannot or does not assume authority?

These are not resolved by cryptography or technical research. Do not invent the answers now; they need to be specified before any real succession, while the owner can still authorize the rules. This document does not ask the owner to decide them immediately and does not grant the daughter current authority.

## Result
- No architecture change and no new root mechanism required by this cross-check.
- The open problem is an enforcement/evidence contract and later verification, not a missing decorative layer.
- P0 only. P1 isolation criteria remain unmet; protected activation and root operations remain blocked.
- Frozen AB/TLC/Kafka probes must not be rerun absent a new material risk or changed premise.
- No TLA+/TLC/TLAPS model or runtime test was run by this document.

## Next exact action
Update the NCS status with this cross-check and continue P0 by checking whether any existing contract already owns each listed requirement. If a requirement is already represented, link/reuse it rather than copying it. Only after that inventory should we define the smallest formal transition model for commissioning/root change/succession, with explicit assumptions and counterexamples, and separately review whether a model run is authorized and useful.
