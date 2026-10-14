# STEP 7 — Existing authority-owner and effect-boundary cross-check — 2026-10-14

Status: SOURCE CROSS-CHECK / DESIGN ONLY. STEP 7 remains OPEN / STOP / UNKNOWN.
Branch: ncs-clean-architecture.

## Question
Do existing MASTER/AB/P/P112 and NCS records already designate (a) the exact approved initial activation scope, and (b) a legitimate canonical constitutional current-branch owner plus actual protected sink?

## Evidence reviewed
- `NEXO_NCS/BUILD/STEP_7_TRUST_FUNCTION_ROOT_ROLE_MAP_2026-10-08.md` — existing SHA at review: `b93a2fd8e730d54bbe43493db137dc1b4d13d964`.
- `docs/nexo/AB104.429_OFFLINE_REVOCATION_PROPAGATION_STALE_AUTHORIZATION_2026-10-01.md` — `22da577662b5c877f8c24aa6a1e09cc52ef66aad`.
- `docs/nexo/AB104.446_ROOT_ENROLLMENT_DEENROLLMENT_RECOVERY_GOVERNANCE_2026-09-26.md` — `ebe95e11fda70a14c636cf06403776a8dd0923ee`.
- `docs/nexo/AB104.571_RECOVERY_FINAL_COMMIT_TOCTOU_2026-09-27.md` — `24dbfd8729cd2e2a9cf1fc54d566c9b03ebb642e`.
- `docs/nexo/NEXO_G-A14-01_EFFECT_PATH_COVERAGE_EQUIVALENT_BOUNDARIES_RESEARCH_V1_2026-09-24.md` — `2e6298ef8041a043b787ba738c18a95c86fd66b7`.
- Current STEP 7 activation lifecycle, owner-recognition proposal, scope traceability map and commissioning acceptance matrix.

## Findings

### F1 — The role map already answers the semantic decomposition question
No new universal GenesisRoot or generic trust registry is needed. The role map distinguishes constitutional governance, policy authority, identity, integrity, appraisal, recovery, succession/ordering, enforcement/resource boundary and continuity/history. It explicitly says that initial recognition and real protected enforcement remain unimplemented/unproven.

### F2 — AB104.429 already answers the offline-currentness constraint
Authenticity, a valid signature, cache freshness, receipt of a revocation, and current authorization are different claims. If the protected resource lacks current revocation state, a trusted anti-rollback checkpoint, an explicitly bounded-staleness policy, or a resource-side fence, immediate revocation prevention cannot be claimed. The final boundary must bind currentness to admission/effect or remain UNKNOWN/HOLD.

### F3 — AB104.446 already answers root lifecycle and recovery governance
Enrollment/de-enrollment are authority transitions, not ordinary configuration changes. An enrolled root cannot authorize itself; valid signatures do not resolve conflicting root sets; recovery cannot lower its own threshold or promote itself to ordinary governance. This does not identify which initial Nexo basis is legitimate.

### F4 — AB104.571 already answers the TOCTOU design pattern
A final check followed by a separate commit is insufficient. The authoritative commit must conditionally bind the validated dependency snapshot and authority/fence generations. This is design research, not evidence that Nexo has such a production owner or atomic boundary.

### F5 — G-A14-01 already answers gateway versus multiple sinks
There is no universal requirement for one gateway. The requirement is complete mediation: every safety-relevant effect path must be impossible, denied, or protected by a semantically equivalent boundary. Preferred routing is not enforcement. The concrete Nexo runtime sink inventory and bypass closure remain unproven.

### F6 — Exact scope and legitimate current-branch owner are still unresolved
The source set contains contracts and research for how these functions must behave, but it does not select an exact owner-approved initial activation claim/scope, nor name a legitimate canonical owner that decides which Constitution branch is current and binds that decision to every final protected effect. `persistState(expectedRevision)` remains a cooperating-writer persistence primitive, not a constitutional root.

## Consequence: do not repeat or broaden research
The next uncertainty is not “which generic root architecture exists?” or “how does TOCTOU work?” Those are already researched. The remaining minimum frontier is:

1. **Owner-governed scope:** name the exact initial activation transition and explicit exclusions. Do not infer it from draft language.
2. **Authority owner:** identify the already-governed rule and enforcement owner that may recognize the initial basis and designate the current constitutional branch. If no pre-established basis exists, say so; do not manufacture one in code.
3. **Concrete sink:** once the exact effect is named, trace all code paths that can produce it and determine whether any existing boundary actually enforces current authority. No general bypass-closed claim without this inventory.

These are not invitations to create three new components. They are questions to answer from existing authority and source evidence first.

## Decision boundary
The owner has accepted only the bounded POCO presentation assumption for the first ceremony. That is not approval of the activation scope, a verifier, a recovery reference, a key, a root family, or a final sink. Do not convert it into broader ratification.

## Non-actions and disposition
No source code or tests changed or ran. No closed P112 audit rerun. No keys/signatures/digest/frozen Constitution/ceremony/recovery reference/root/verifier/device/deployment/runtime authority created or selected. No protected effect authorized.

**STEP 7 remains OPEN / STOP / UNKNOWN.**
