# STEP 7 — Phone-only Build and Validation Plan — 2026-10-09

Status: OPERATIONAL PLAN ONLY — ANDROID PHONE IS THE ONLY USER-REPORTED AVAILABLE HOST; EXACT DEVICE IDENTITY NOT YET VERIFIED

## Decision

Lack of a PC is not an architectural blocker for Nexo. It changes the development workflow and some test capabilities, not the semantic requirements of the architecture.

User reports that the only currently available device is a mobile phone. This is a user-provided availability fact, not a verified hardware identity or a platform security assessment. Do not infer model, SoC, Android version, bootloader state, StrongBox/TEE support, key-attestation support, or verified-boot evidence from the generic fact "Android phone".

## Work that can continue from a phone

1. Architecture, invariants, threat models, contracts, adversarial review, and decision records.
2. Repository documentation and source changes through GitHub tools/browser.
3. Review of code, diffs, workflow definitions, logs and artifacts that are accessible through repository/CI interfaces.
4. Cloud/hosted development for tasks that need a shell, compiler, test runner or build environment. GitHub documents Codespaces as a browser-accessible development environment; exact availability, billing, quotas, and usability on the user's phone must be checked before relying on it.
5. Manual review and selected on-device experiments after the exact phone and experiment's safety requirements are known.

## Work that must not be falsely claimed as solved by phone access

- Hardware-backed trust-root establishment or independent Genesis recognition.
- Full local protected-Core bypass closure.
- StrongBox/TEE availability or key-attestation correctness.
- Secure boot/bootloader properties without exact-device evidence.
- Offline revocation/currentness, stale-evidence bounds, recovery independence, or succession.
- Android app behavior on every supported version/device.
- Runtime PASS based only on a document, static review, or a successful remote compile.

The existing six blocking premises remain UNKNOWN. No implementation/commissioning gate is relaxed by the absence of a PC.

## Recommended workflow

### Phase 0 — Confirm the actual device facts, read-only

Ask the user to report only:
- exact phone brand and model as shown in Settings → About phone;
- Android version;
- Android security update date;
- build number only if needed for the exact platform documentation.

Do not request an IMEI, serial number, phone number, Google account, screenshots containing personal data, credential, unlock PIN, password, recovery phrase, biometric sample, or INE image. If the user sends a screenshot, ask them to crop/redact identifiers first.

Google's Android Help documents the Android version, security update level, and build number in Settings → About phone → Android version (menu wording can vary by manufacturer): https://support.google.com/android/answer/7680439?hl=en-pg

No Developer Options, USB debugging, bootloader unlocking, rooting, firmware flashing, or security-setting change is required just to identify the model/version.

### Phase 1 — Keep architecture work independent of device choice

Continue LCORE-1, Genesis and authority contracts at the semantic level. Do not make a platform-specific assumption a prerequisite of the semantic Core. Platform-specific evidence belongs in a bounded implementation adapter only after the claim and threat model justify it; do not invent that adapter before the exact claim requires it.

### Phase 2 — Use the existing repository/CI first

Prefer existing repository actions and tests when they can provide valid evidence. Record the exact commit, workflow run, job, artifacts and scope. A successful test on a hosted runner establishes only what that test actually exercised; it does not prove the user's phone, Genesis legitimacy, or runtime security.

For larger source-edit/build tasks, GitHub Codespaces is a possible browser-based option: https://docs.github.com/en/codespaces/developing-in-a-codespace/developing-in-a-codespace
It is optional, not assumed active, free, available, or required. Do not create a paid environment without explicit user choice.

### Phase 3 — Exact-device capability investigation

Once model/version are known, inspect official documentation for that exact device family and Android build. Then separate:
- documented capability;
- capability exposed by the device;
- evidence obtained in a specific test;
- independently validated claim;
- unresolved assumptions.

Only run a device test when it is non-destructive, clearly scoped, and cannot commission Nexo or grant authority. Do not enroll real credentials or create a Genesis root as part of capability reconnaissance.

### Phase 4 — Validation tiers

Label each result with the actual tier:
1. **DESIGN REVIEW** — semantic analysis only.
2. **SOURCE/STATIC CHECK** — source/schema constraints checked.
3. **HOSTED TEST** — named tests executed on a named CI environment.
4. **DEVICE TEST** — named test actually executed on the exact phone/build.
5. **INDEPENDENT SECURITY EVIDENCE** — evidence and verifier independently establish a bounded platform claim under a named threat model.
6. **GENESIS/CONSTITUTIONAL RECOGNITION** — separate legitimacy and governance question; never implied by tiers 1–5.

A result may not be promoted to a higher tier by naming, a green badge, signature, hash, provider statement, or successful build alone.

## Consequences and future-countereffects

- No-PC pressure must not force the current phone to become Nexo's permanent trust root.
- No hosted environment may become a hidden governance authority or sole recovery dependency.
- Do not require a paid cloud IDE merely to continue design work.
- Do not equate ability to edit/build an app with ability to validate secure boot or Genesis legitimacy.
- Do not add an architecture patch because the current device lacks a feature; first determine whether that feature is truly required by a claim-specific threat model.
- If a later physical test truly requires equipment not available, mark only that test PENDING and continue independent work; do not mislabel the entire project blocked.

## Current status and next action

- Phone-only availability: USER-REPORTED.
- Exact make/model/version/security patch: UNKNOWN.
- No platform selected as Genesis root.
- No credential or device secret requested.
- No commissioning or activation authorized.
- NCS remains UNKNOWN/STOP at the Genesis establishment boundary.

**Next action:** ask for the phone brand/model and Android version from Settings → About phone (text only). Use those facts to investigate the exact platform capabilities and limits; do not enable developer settings or perform security-sensitive changes.
