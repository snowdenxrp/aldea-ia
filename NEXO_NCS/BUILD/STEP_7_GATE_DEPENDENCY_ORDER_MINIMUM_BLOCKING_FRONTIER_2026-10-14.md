# STEP 7 — Gate dependency order and blocking frontier — 2026-10-14

Branch: ncs-clean-architecture
Status: research only; OPEN / STOP / UNKNOWN.

## Purpose
Order the existing G0–G12 commissioning gates by dependency so downstream tests are not repeated before their premises exist. This document does not waive gates or authorize implementation.

## Dependency order
1. **Exact claim and scope (G12; applicability of G10).** Define the exact activation transition, target, exclusions, and whether an external-world effect is in scope. This cannot be inferred from the current draft.
2. **Initial recognition and owner intent (G0–G2).** Establish a pre-existing basis that does not derive its authority from the candidate itself; bind review to the exact artifact, readable content and scope.
3. **Verifier provenance (G3).** Establish the verifier and appraisal policy independently of caller-supplied PASS/AUTHORIZED fields.
4. **Canonical currentness (G4, G6, G9).** Define active-branch selection, conflict ordering, revocation, recovery, succession and predecessor cutoff.
5. **Actual final protected boundary (G5, G7, G8, G12).** Name every in-scope effect-capable path and show how the last boundary enforces current authority and prevents bypass.
6. **Atomic ordering and outcomes (G5; G10 when in scope).** Prove that relevant authority changes and activation are ordered at the authoritative commit boundary. A second early check is not enough.
7. **Deployment evidence (G11).** Pin the actual artifact, configuration and target; evaluate applicable gates against the same deployment.

Research can progress in parallel, but a downstream PASS is not valid while its prerequisite is UNKNOWN.

## Current blocking frontier

### B1 — Scope is unresolved
The exact initial activation claim and exclusions have not been selected. “Store a local constitutional reference”, “enable the constitutional authority context”, and “authorize a mission/effect” are different claims. Do not silently substitute one for another.

### B2 — Initial recognition is unresolved
The owner accepted only a bounded assumption that the POCO screen faithfully presents exact content during the first ceremony. This does not select a recovery reference, verifier, key or ceremony, and does not authenticate the owner from phone possession. No canonical digest, key, signing or commissioning transcript should be created while these choices remain open.

### B3 — Currentness owner and final sink are not evidenced
The existing `persistState(expectedRevision)` is a persistence primitive, not a constitutional authority root. The Core authority gate is injected and does not prove Genesis legitimacy. Existing runtime mutation paths do not demonstrate a bypass-closed constitutional final gate. A larger revision number, another check, or wiring `effectBoundary.prepare()` without defined enforcement semantics does not close this gap.

## Gate exit evidence
- **Claim/scope:** exact transition, target, exclusions, effect class and approval-to-artifact binding.
- **Genesis/owner intent:** pre-established recognition basis and exact reviewed-content/scope binding.
- **Verifier:** independently established identity/provenance and policy; negative tests for caller-controlled trust fields.
- **Currentness:** canonical branch owner and governed amendment/revocation/recovery/succession ordering.
- **Final boundary:** complete in-scope sink/path inventory, bypass tests, revocation behavior and race evidence.
- **Outcome:** distinguish committed, stale/conflict, invalid, UNKNOWN/HOLD, and external effect unknown where relevant.
- **Deployment:** exact artifact/configuration and raw evidence for the same target and scope.

“Not reached” means prerequisites are absent; it does not mean a gate is waived or passed.

## Anti-circularity rules
1. A verifier cannot bootstrap its own trust anchor from the candidate it appraises.
2. A state store cannot appoint itself as constitutional owner.
3. A sink enforces a governed authority rule; it does not create that rule.
4. External-provider proof is required when the declared scope includes that effect. If excluded, the exclusion must be explicit and no route from this activation may cause it.
5. Owner decisions, source evidence and runtime test results remain separate evidence classes.
6. A valid signature does not prove currentness; owner review does not prove sink enforcement; a passing sink test does not prove owner intent.

## Next bounded investigation
Cross-check existing authoritative MASTER/AB/P112 records for an already-approved initial activation scope and an explicitly named canonical current-branch owner / protected sink. Do not rerun closed P112 tests. If no such approved basis exists, record it as an unresolved architectural decision rather than inventing one from silence.

## Non-actions
No gates are promoted to PASS by this document. No code/tests/keys/signatures/digest/frozen Constitution/ceremony/recovery reference/root/verifier/device/deployment/runtime authority changed. No protected effect is authorized.

**STEP 7 remains OPEN / STOP / UNKNOWN.**
