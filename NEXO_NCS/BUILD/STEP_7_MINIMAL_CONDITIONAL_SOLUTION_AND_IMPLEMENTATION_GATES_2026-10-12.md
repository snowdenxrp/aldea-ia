# STEP 7 — Minimal Conditional Solution and Implementation Gates
Date: 2026-10-12
Branch: ncs-clean-architecture
Status: DESIGN SYNTHESIS — NOT IMPLEMENTED — PROTECTED COMMISSIONING STOP

## Purpose

Turn the existing STEP 7 contracts and 2026-10-12 source review into one minimal, conditional engineering route. This document is not a new trust abstraction and does not select a physical root, device, provider, credential, or commissioning channel.

## Result in one sentence

The smallest defensible route is: independently recognize the exact initial Constitution and bounded scope; verify that recognition through a verifier whose legitimacy does not depend on the candidate being commissioned; establish one canonical active-Constitution state through a single protected transition; and mediate every operation that could change that state at its actual final enforcement point. If any prerequisite is UNKNOWN, activation remains STOP.

## What the branch proves today

1. `executeProtectedTransition()` is a generic orchestration function. Its injected `authorityGate.check()` result is structurally validated, but the function does not authenticate the producer or independently establish that producer's legitimacy.
2. `createCorePorts()` exposes `effectBoundary.prepare`, but defaults it to NOT_IMPLEMENTED. The inspected protected transition does not call it.
3. The conditional-commit adapter forwards a candidate state to a supplied `persistState` function. The focused integration test targets simulation/world-state JSON, not a deployed constitutional activation or Android/device effect.
4. Bounded repository search found the transition used in focused tests and integration tests, not an identified production consumer. This is a bounded search result, not proof about all possible external or dynamic consumers.
5. No source-backed Genesis verifier, independently recognized initial root, canonical active-Constitution state owner, production verifier-to-Core composition, or final effect sink with bypass closure has been established in the reviewed branch.

Therefore, adding an effect-boundary call, creating a local Constitution file, or constructing an Authority Context from caller input would not close STEP 7. Those changes could make the code look more complete while leaving the trust cycle intact.

## Minimal route, in dependency order

### Gate 0 — Freeze the claim

Define the initial commissioning claim as exactly one thing: recognize one exact initial Constitution revision, version, context, and explicitly bounded scope as the current constitutional regime.

This does not authorize policies, missions, tool admission, provider actions, device control, external effects, amendments, root rotation, recovery, delegation, autonomous operation, or succession.

Required evidence: canonical content/scope definition and a clear list of excluded authority.

### Gate 1 — Establish the recognition basis

The initial basis must be recognizable independently of the uncommissioned candidate. Record its provenance, dependency/failure domains, exact-content binding, and the assumptions under which Kevin recognizes it.

A PDF, printout, hash, QR code, signature, Git commit, app label, local key, or second display is not independently trusted merely because it exists. A separate device is useful only if its source, administration, account/recovery, and update dependencies do not silently reintroduce the same compromised origin.

If no valid independent reference exists yet, keep the reference-creation workflow in preparation only. Do not invent real commissioning bytes, keys, challenges, or approval records.

### Gate 2 — Separate verification from authorization

The verifier must validate the exact content/context, approval intent, freshness, replay resistance, currentness/revocation, and recovery/rollback conditions required by the accepted threat model.

Its trust anchor and verification rules must already be recognized under that model; a verifier cannot prove its own legitimacy by returning AUTHORIZED. The relying Core must separately decide whether the verified claim grants this exact, narrow transition.

A cryptographic signature can establish that a key signed particular bytes. It cannot alone establish that the key was legitimately selected, that Kevin approved the displayed content, or that the approval remains current.

### Gate 3 — Establish one canonical active-Constitution owner

Only after Gates 0–2 are satisfied should implementation introduce the smallest state owner that can establish the initial constitutional regime. It must define:
- the sole canonical current revision/context;
- the transition that establishes it;
- the ordering and conflict behavior for concurrent or conflicting candidates;
- durable behavior across crash, restart, rollback, backup, and restore;
- how invalidation/revocation and unknown currentness prevent promotion;
- how state can be inspected without allowing inspection data to rewrite authority.

A recovered snapshot may provide data for reconciliation; it must not silently restore authority by itself. Multiple incompatible active contexts, uncertain persistence, or unknown ordering must produce UNKNOWN/STOP.

### Gate 4 — Enforce at the real last boundary

Before coding an effect adapter, identify the actual operation and the final resource/state that can be changed. Then enumerate every reachable path to that resource and show that each path passes through the same enforceable authorization boundary.

The current simulation persistence adapter is not evidence of a production device-control boundary. Do not wire a ceremonial `effectBoundary.prepare` call until its target, enforcement semantics, and final linearization point are real and defined.

If the first protected operation is only constitutional-state activation, name and test that exact canonical state mutation as the target. Do not claim this also protects future Android, TV, provider, or physical effects; each later effect class requires its own target-specific mediation proof.

### Gate 5 — Adversarial proof

Use synthetic fixtures to test component semantics, clearly labeled as synthetic. Required negative cases:
- caller injects a fabricated AUTHORIZED result;
- verifier/root absent, replaced, or unrecognized;
- displayed Constitution differs from submitted bytes, version, or scope;
- approval replay, stale challenge, revoked authority, or unknown currentness;
- conflicting active revisions, rollback, or restored snapshots;
- crash before/during/after state activation;
- direct bypass of Core to the protected state/resource;
- target identity or scope differs from the approved claim.

For every denied/unknown case, assert both the terminal result and that the protected target was not changed. Positive tests must use an explicitly controlled test trust root and prove only the stated test scope; they are not evidence that the real Genesis root has been established.

## Evidence standard

A gate is not closed by a design document or a passing synthetic unit test alone. Each closure must identify:
- the exact source and commit;
- the relevant caller/consumer and target;
- raw test output or artifact and the tested revision;
- the attack condition and expected result;
- the observed target state before and after;
- the scope of the claim and any assumptions still excluded.

No proof of the final target or all entry points means complete mediation remains UNKNOWN.

## External grounding

- IETF RATS Architecture (RFC 9334): separates evidence, verifier appraisal, and relying-party decision; a verifier result does not automatically confer application authorization. https://www.rfc-editor.org/rfc/rfc9334.html
- RFC 6024, Trust Anchor Management Requirements: trust anchors require recognized establishment and lifecycle management; initial trust is not created by the object that wants to be trusted. https://www.rfc-editor.org/rfc/rfc6024.html
- The Update Framework (TUF), current specification: root continuity, threshold signatures, version checks, expiry, rollback/freeze resistance, and key rotation after a trusted root already exists. It does not decide who legitimately chose Nexo's first root. https://github.com/theupdateframework/specification/blob/master/tuf-spec.md
- Android Verified Boot: verifies covered platform code/data and supports rollback protection under the device's boot trust model; it is not Nexo constitutional approval or proof of complete mediation for an app. https://source.android.com/docs/security/features/verifiedboot/verified-boot
- NIST SP 800-53 Rev. 5 AC-3: access enforcement is a control objective, not proof that a specific Nexo deployment implements it. https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final

## Current disposition

- Exact initial Constitution content/scope: not frozen as a commissioning artifact.
- Independent recognition basis and verifier legitimacy: UNKNOWN / NOT ESTABLISHED.
- Canonical active-Constitution owner and production composition: NOT ESTABLISHED.
- Real protected target, final enforcement point, and bypass closure: UNKNOWN.
- Protected commissioning: STOP.
- Safe work that can continue: source review, design refinement, and synthetic adversarial tests that do not claim Genesis trust.
- No production code, tests, workflow, APK, key, Constitution artifact, or phone/runtime state is changed by this design synthesis.
