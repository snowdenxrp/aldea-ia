# STEP 7 — Android M1 Source Boundary Inspection
Date: 2026-10-13
Branch: `ncs-clean-architecture`
Status: READ-ONLY SOURCE INSPECTION / TARGET HOST NOT YET SUITABLE / COMMISSIONING STOP

## Exact source pins inspected
- `NEXO_NCS/M1_ANDROID/README.md` — blob `70cf0abc5b8902035da7ed67de823ba39c03937b`
- `NEXO_NCS/M1_ANDROID/app/src/main/AndroidManifest.xml` — blob `b4bc8281df05460724d775b8a97da924c6a4ea0d`
- `NEXO_NCS/M1_ANDROID/app/src/main/kotlin/org/nexo/m1/MainActivity.kt` — blob `ce22225a8661a4afa2e7eb1f6b65dfb1b3db26b0`
- `NEXO_NCS/M1_ANDROID/app/build.gradle.kts` — blob `5b9006127bfb890431a0cc8cb3e7abd489ad0fdf`
- `.github/workflows/nexo-m1-android-build.yml` — inspected on this branch; workflow builds `assembleDebug`, asserts pinned llama.cpp/log policy and absence of INTERNET permission, then uploads APK and evidence.

## Observed behavior
- The Android application is a single-screen local conversation client using the native `llama.cpp` binding.
- Source application ID is `org.nexo.m1`, version `0.2.0-prototype`, minimum SDK 33, target SDK 36.
- The manifest intentionally omits `android.permission.INTERNET`, disables Android backup, and sets cleartext traffic false.
- The app imports a named GGUF model, checks a size ceiling and expected SHA-256, stores the model in app-private storage, and loads it for local inference.
- Prompts/responses are held in memory; the README states no durable chat history.
- The Activity is directly responsible for UI state, model selection/import, integrity checks, model load and prompt submission. No Nexo Core import, Genesis enrollment, Constitution Authority Context, protected transition, Vault, tool route or effect sink is present.
- The build workflow produces a debug APK; its success would not prove installation identity, user authority or protected runtime enforcement.

## Architectural conclusion
M1 is useful as a possible **presentation/inference client**, but the inspected source does not justify treating its current `MainActivity` as the constitutional Core or protected enforcement boundary. Grafting Genesis or protected authority into UI callbacks would make the client both the claimant and an authority consumer without establishing verifier provenance or complete mediation.

Do not extend the Activity with a token, approval flag, key, registry, store, or extra gate. Do not assume the existing Node.js Core can execute inside this Android app: this inspection found no such composition.

## What must be resolved before implementation
1. Identify the concrete Android-side owner of canonical initial-Constitution state and its allowed mutation paths.
2. Specify how the existing Core semantic contracts will be hosted or faithfully implemented on Android without creating a second competing authority implementation.
3. Identify the real final protected operation to mediate. If no protected effect exists in the first commissioning scope, state that scope explicitly rather than inventing a sink.
4. Establish the owner-recognized exact-content comparison channel and verifier provenance independently of this client.
5. Only then design the smallest host boundary and adversarial tests, including UI/client bypass attempts and stale/conflicting Constitution state.

## Non-actions
Read-only inspection only. No code or tests changed or ran; no APK was built/installed; no device, key, Constitution, deployment or runtime authority changed.

## Disposition
Android local remains the provisional engineering target. M1 is not yet Nexo Core. Genesis, verifier provenance, canonical current-Constitution state owner, protected sink and bypass closure remain UNKNOWN/NOT ESTABLISHED. STEP 7 remains OPEN / STOP / UNKNOWN.
