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


## 2026-10-12 research result — the bootstrap boundary cannot be removed by choosing a format

### Finding

The initial trust problem is not solved by choosing PDF versus paper, a hash versus a signature, a local key versus a QR code, or TUF versus another update framework. Those mechanisms can bind bytes, authenticate a signer relative to a recognized key, preserve continuity, or detect rollback. None can derive the legitimacy of the first authority solely from data supplied by the authority candidate itself when that candidate is allowed to control all inputs and the verifier.

This is the bootstrap constraint for STEP 7: under a threat model where the commissioning host may be compromised, at least one premise must sit outside that host's control. It can be (a) a previously recognized external basis plus an enforcement path that trusts it, or (b) an explicitly accepted assumption that the relevant presentation/approval environment is honest for the bounded ceremony. If neither premise is available, the honest result is STOP, not a more elaborate local protocol.

### What established standards contribute — and what they do not

- RFC 6024 says that at least one trust-anchor manager must be established for each trust-anchor store during initial configuration; traditionally the initial anchor is checked out-of-band. It also recognizes the operational problem of relying on out-of-band checks. That means out-of-band establishment can later be reduced, but not waved away at initial setup. https://www.rfc-editor.org/rfc/rfc6024.html
- RFC 9334 distinguishes the Attester, Verifier and Relying Party. The Relying Party needs a trust relationship with the Verifier; a signed appraisal is not self-authenticating authorization. https://www.rfc-editor.org/rfc/rfc9334.html
- TUF's client begins with trusted root keys already provisioned, then uses threshold signatures, sequential root rotation, expiry and rollback/freeze checks to preserve the established trust chain. It is an excellent model for later root continuity, not a solution for selecting Nexo's first legitimate root. https://theupdateframework.github.io/specification/v1.0.36/
- Android Verified Boot establishes integrity properties for covered platform components under the device's boot trust chain. It does not prove that a user-approved Nexo Constitution is the one the app consumes, nor does it enforce authorization at arbitrary app-level effect sinks. https://source.android.com/docs/security/features/verifiedboot/verified-boot

### Concrete implications for the current owner workflow

1. A PDF created on the current unverified client is a draft/content artifact, not an independent trust root.
2. Printing that same PDF later adds a physical copy and improves human inspection, but it does not retroactively make its origin independent. It can serve as an external comparison reference only if Kevin can establish what exact bytes/content it represents and why the reference path is trustworthy for the threat model.
3. A second device is not automatically independent. Its provisioning, account/cloud sync, recovery, admin, update and display/submission paths must be considered.
4. A generated key/signature only proves control of that key and integrity of signed bytes relative to a recognized public key. It does not itself prove that Kevin selected the key, saw the same content, intended the scope, or that authority has not been revoked.
5. The existing Android Verified Boot state is useful platform evidence but cannot replace the missing Nexo-specific recognition and enforcement chain.
6. TUF-like continuity can be a later subsystem only after a legitimate initial root has been recognized; importing TUF now would not close Genesis.

### Smallest defensible decision boundary

No hardware purchase or provider choice is justified yet. The engineering can continue without one by specifying contracts and testing synthetic attack cases, but the real protected activation cannot be implemented honestly until one of two conditions is grounded:

- **Independent basis available:** identify an already-recognized external reference/authority and a verifier/final boundary that the commissioning candidate cannot rewrite or bypass; then bind the exact Constitution and narrow scope to it.
- **No independent basis available:** keep protected commissioning STOP, and only later consider Path H if Kevin explicitly accepts a narrowly described environmental assumption for a limited initial ceremony. General desire to build Nexo is not consent to assume a potentially compromised presentation host is honest.

These conditions are not equivalent. Path H can support a limited commissioning claim under its accepted assumptions; it must not be described as resistant to compromise of the assumed-honest host. Path O can offer stronger independence only when the external basis and enforcement are demonstrated, not merely named.

### Current next action

Continue non-circular source and adversarial analysis; do not create actual commissioning keys, hashes, challenges, signatures, or final Constitution bytes while the canonical content/scope and recognition premise are unresolved. The next decisive evidence must be an actual recognized reference/deployment basis or an explicit owner decision on a bounded Path H assumption. No repository-only algorithm can supply that missing real-world premise.

**Disposition remains:** Genesis UNKNOWN; initial recognition NOT ESTABLISHED; canonical active-Constitution owner NOT ESTABLISHED; production final enforcement/bypass closure UNKNOWN; protected commissioning STOP.


## 2026-10-12 targeted Android confirmation research — conditional Path H only

Android Protected Confirmation is a possible bounded human-presentation component, not a Genesis root. On supported devices, its hardware-protected Trusted UI can confirm a specific displayed prompt. Support is device-dependent: the Android API exposes `ConfirmationPrompt.isSupported(context)`, and a prompt can still be unavailable at runtime.

The relying verifier must validate the key attestation chain, the `TRUSTED_CONFIRMATION_REQUIRED` authorization, the signature, the exact returned `promptText`, and a fresh single-use nonce. The user's approval applies only to the displayed prompt text. `extraData` is included in the signed response but is not shown to the user, so Constitution bytes, digest, revision, or scope placed only in `extraData` must not be treated as approved. Android also warns that Protected Confirmation is not a general secure confidentiality channel.

Sources:
- AOSP Protected Confirmation: https://source.android.google.cn/docs/security/features/protected-confirmation?hl=en
- Android ConfirmationPrompt API: https://developer.android.com/reference/android/security/ConfirmationPrompt
- Android guide (Spanish): https://developer.android.google.cn/privacy-and-security/security-android-protected-confirmation?hl=es

Implications:
1. It may reduce a narrowly defined presentation-integrity assumption if Kevin later explicitly accepts bounded Path H and a legitimate relying verifier is independently recognized.
2. It does not select the first legitimate Genesis root, authenticate the relying verifier by itself, establish canonical active-Constitution ownership, or close any bypass path to the actual activation sink.
3. Current phone support is UNKNOWN / NOT TESTED. No app/device probe or APK change was made.
4. Do not implement this as a new layer before proving the exact prompt-to-Constitution-byte/scope binding and identifying the actual verifier and activation target.

Research record: [STEP_7_ANDROID_PROTECTED_CONFIRMATION_CONDITIONAL_PATH_H_RESEARCH_2026-10-12.md](https://github.com/snowdenxrp/aldea-ia/blob/ncs-clean-architecture/NEXO_NCS/BUILD/STEP_7_ANDROID_PROTECTED_CONFIRMATION_CONDITIONAL_PATH_H_RESEARCH_2026-10-12.md).

Disposition unchanged: Genesis basis/verifier legitimacy UNKNOWN; canonical active-Constitution owner absent; final enforcement/bypass closure UNKNOWN; protected commissioning STOP. No production code or tests changed.
