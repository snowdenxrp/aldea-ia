# NCS — M1 Staged Implementation Plan and Build-Prerequisite Check — 2026-10-09

Status: PROTOTYPE ROUTE SELECTED BY OWNER; IMPLEMENTATION MAY PROCEED WITHIN THE BOUNDED M1 SCOPE. NO DEVICE INSTALL OR DEVICE MODIFICATION PERFORMED. NO GENESIS/PROTECTED COMMISSIONING.

## Owner decision and scope

Kevin delegated the technical route and explicitly said to proceed with the prototype if that is the recommended safer route. This is treated as authorization to develop the bounded M1 prototype in the NCS branch, not as authorization for destructive phone changes, bootloader unlock/root/firmware changes, credentials, trust-root selection, or protected commissioning.

Chosen route: a dedicated Android app shell with local `llama.cpp` inference, text-only/read-only behavior, no remote fallback, no app Internet permission, no tools/effects, no Lúmina simulation, no Vault, and no durable conversation memory. It remains a prototype and does not become a Genesis authority or trust root.

## Environment inspection — observed, not inferred

The available build container was inspected on 2026-10-09:
- Java runtime/compiler present: OpenJDK 21.0.12.1.
- CMake 3.31.6, Ninja 1.12.1, Node.js 22.16.0 and Git 2.47.3 present.
- No `gradle`, `adb`, Android SDK, Android NDK, `ANDROID_HOME`, `ANDROID_SDK_ROOT`, or `ANDROID_NDK_HOME` found in PATH/environment or common inspected directories.
- The repository is accessed through the GitHub connector; there is no local checkout mounted in the build container.
- Therefore this environment cannot currently claim it built an APK, installed it, or tested it on Kevin's phone. A pinned GitHub Actions Android build can be used to obtain a reproducible build result after the project files and workflow exist; that still does not equal device/runtime verification.

## Upstream Android feasibility

Official upstream `llama.cpp` documentation describes an Android Studio GUI example at `examples/llama.android` and an Android NDK/CMake path:
- https://github.com/ggml-org/llama.cpp/blob/master/docs/android.md
- https://github.com/ggml-org/llama.cpp/tree/master/examples/llama.android

The inspected upstream Android example currently uses Android Gradle Plugin 8.13.2, Kotlin 2.3.0, compile/target SDK 36, min SDK 33, NDK 29.0.13113456, and CMake 3.31.6. Its sample app enables Android backup and includes a DataStore dependency; those choices are NOT to be copied blindly into M1 because the M1 contract excludes conversation persistence and unnecessary dependencies. Upstream master is mutable; implementation must pin a specific commit SHA and record it rather than build from floating master.

The current repository `package.json` is a Node.js/Lúmina-oriented project and has no Android app module. Existing `src/nexo/runtime.js` imports the simulation adapter and assistant-memory/persistence path; M1 must not reuse that execution path.

## Stages and gates

### Stage 0 — bounded repository preparation
- Create a separate Android project subtree under NCS, not inside or coupled to the existing simulation runtime.
- Record exact upstream `llama.cpp` commit SHA, licenses, transitive dependencies, native libraries and build tools.
- Pin Gradle wrapper, Android Gradle Plugin, Kotlin, SDK/NDK/CMake and GitHub Actions runner/toolchain assumptions.
- Add CI that builds only the M1 APK and produces a build report/artifact. No model is embedded in the APK and no credentials/secrets are required.
- Reject unpinned `master`, unreviewed binary artifacts, network-enabled dependencies, and hidden model download paths.

### Stage 1 — smallest buildable Android shell
- Single screen; request text field, submit, response display and explicit unavailable/error state.
- No navigation to external apps, share intents, WebView, clipboard export, account, telemetry, analytics, crash upload, background agent, or tools.
- Manifest has no `INTERNET` permission and no unnecessary exported components.
- Disable app backup/data extraction and avoid saved-state restoration of prompts/responses.
- The initial shell may report “local model not installed” until a separately reviewed inference integration is present; never fake a generated response.

### Stage 2 — local inference integration
- Integrate a pinned, reviewed upstream `llama.cpp` Android binding/native library.
- Model is separately provisioned offline, not downloaded in-app. The first model is not selected until license, provenance, expected hash, memory/size, and device compatibility are checked.
- Model path is app-private; request/response live only in process memory; no durable history or prompt/token logs.
- Missing/corrupt/unsupported model, initialization failure or memory exhaustion -> explicit unavailable; never switch to a remote provider.
- Model output is untrusted text and cannot be parsed as commands.

### Stage 3 — static assurance and CI
- Inspect merged manifest, dependency graph, native libraries, exported components, backup configuration, logs and error paths.
- Scan source and packaged artifacts for network clients, remote URLs, telemetry, update paths, external intents, clipboard/sharing, tool/effect and protected-Core reachability.
- Run focused unit tests for the request/response boundary and fail-closed model states.
- Produce APK hash, source commit, upstream runtime pin, toolchain versions, dependency/license inventory, and build/test results.

### Stage 4 — device test, only after APK review
- Before installation, present the APK identity/hash, permissions, storage requirements, risks, and rollback/uninstall steps.
- Install only a debug/test build after checking the actual device Android API, ABI, available storage/RAM and thermal behavior.
- Runtime tests: local generation, offline behavior, missing/corrupt model failure, app-attributable network observation, unique-marker persistence inspection across force-stop/restart, and adversarial prompts requesting tools/effects.
- Device installation is a separate action from code development. Do not claim it happened until there is direct evidence.
- Do not unlock bootloader, root, flash firmware, weaken security, or wipe data merely to make M1 build. If a later device modification is proposed, explain exact purpose, risks, reversibility and proof limits first.

## Initial model/device assumptions

- Candidate device family in prior NCS context: POCO X7 Pro family; exact SKU, Android version/API, ABI, free storage, memory pressure, and current security state have not been inspected in this session and remain UNKNOWN.
- Do not choose a model size/quantization from device-family name alone. First confirm actual device/API/ABI and then select a small permissively licensed candidate with verifiable provenance and acceptable resource needs.
- A file hash proves equality to a separately trusted expected digest, not that the model is safe, high-quality, or authoritative.
- A package without `INTERNET` can support a package-level network-capability claim; it does not prove the entire phone or third-party keyboard/OS is offline or private.

## Exit criteria for calling M1 a working prototype

All of the following are required:
1. Pinned source and toolchain; reproducible CI build succeeds.
2. Final APK manifest contains no `INTERNET` permission and no unnecessary exported entry points.
3. Audited dependency/native-library inventory and licenses.
4. Local inference uses the pinned runtime and separately provisioned model.
5. No remote fallback; missing/corrupt model fails closed.
6. No designed durable prompt/response store, backup, logging, telemetry or external handoff.
7. Tests support text-only behavior and no tool/effect/Core/Genesis path.
8. Device test report names exact package/APK hash, device/OS, model hash, tested conditions and remaining UNKNOWNs.
9. Explicit statement that M1 success does not pass Step 7 trust gate or establish Genesis legitimacy.

## Current decision

- 🟢 Route: dedicated Android + local `llama.cpp`, selected as the bounded prototype path.
- 🟢 Owner authorized prototype development within this scope.
- 🔵 Next work: create the isolated Android project and pinned CI build, then review build evidence before model/device installation.
- 🔴 Not yet established: APK build, model choice/provenance, device compatibility, runtime no-egress/no-persistence claims, Genesis/P1/P2/P4/P5/P6.
- UNKNOWN/STOP remains for protected commissioning.
