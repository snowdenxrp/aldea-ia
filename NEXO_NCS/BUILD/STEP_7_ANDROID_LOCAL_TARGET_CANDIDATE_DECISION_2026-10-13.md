# STEP 7 — Android Local Target Candidate Decision
Date: 2026-10-13
Branch: `ncs-clean-architecture`
Status: ENGINEERING TARGET SELECTED PROVISIONALLY / COMMISSIONING STOP / UNKNOWN

## Decision
Use **Android local as the first engineering target candidate** for Nexo, with the user's existing devices as possible development/presentation hardware. This decision is about where to investigate and eventually build; it is not constitutional commissioning, a trust-root selection, or permission to execute protected effects.

## Why this is the bounded choice
- It fits the user's currently available environment and avoids requiring a PC or cloud service as a prerequisite.
- It keeps initial work local and inspectable.
- It does not assume that the current phone, Android OS, app, account, Termux, or device biometrics are Nexo's authority.
- It does not select Lúmina or a cloud deployment as a Nexo runtime.

## Evidence limits from the inspected branch
- `NEXO_NCS/M1_ANDROID` is a local inference/presentation prototype; the build workflow creates a debug APK.
- The inspected M1 manifest has no INTERNET permission, and the app is not composed with Genesis recognition, canonical current-Constitution state, `executeProtectedTransition()`, or a demonstrated final protected effect sink.
- Generic protected-transition/Core contracts exist, but no production caller or deployed protected runtime path was demonstrated in the inspected source.
- Therefore, **M1 is not yet the Android Nexo Core**, and the selected target is not yet a deployable protected runtime.

## First transition remains narrow
The first future protected transition under consideration is only: recognize one exact, frozen Constitution artifact and commissioning scope as the initial canonical regime. It does not authorize missions, tools, external actions, amendments, recovery, or succession.

Before implementation, the following must be established separately:
1. Exact Constitution bytes, readable rendering, digest, version and scope.
2. A concrete owner-recognized reference/comparison channel and how its provenance avoids circular trust.
3. The verifier's own trust/integrity provenance.
4. The canonical owner of current-Constitution state and rules for conflict, rollback, revocation and recovery.
5. The actual Android entrypoint, state mutation paths and last protected boundary, with bypass closure and artifact-to-source identity.

## Human comparison / devices
The already-reviewed bounded human-comparison proposal remains a design candidate, not an implemented ceremony. A second phone can be a comparison aid only after its availability, usability, provenance and shared account/recovery dependencies are checked. Two devices, two apps, a hash, a signature or a biometric do not by themselves establish constitutional authority. Do not factory-reset a candidate phone or install new APKs merely to create an appearance of independence.

## Explicit non-actions
No code, keys, Constitution artifact, credential, APK, device, deployment, or runtime authority was changed. No tests were run. No production runtime was identified or commissioned.

## Next bounded action
Do not add another gate, registry, wrapper, store or synthetic caller. Inspect the actual Android M1 source/build boundary only to determine what would need to become the genuine Nexo Core host and what is merely UI/inference. In parallel, keep the owner-recognized comparison channel as UNKNOWN until a real candidate can be evaluated. Only after the host boundary and trust basis are concrete should implementation and adversarial tests be scoped.

## Disposition
STEP 7 remains **OPEN / STOP / UNKNOWN**. This record selects an engineering target candidate, not a root of trust or production activation.
