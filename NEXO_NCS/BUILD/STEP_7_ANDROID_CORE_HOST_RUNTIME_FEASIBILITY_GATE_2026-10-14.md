# STEP 7 — Android Core Host Runtime Feasibility Gate
Date: 2026-10-14
Branch: `ncs-clean-architecture`
Status: SOURCE-BASED FEASIBILITY CHECK / NO IMPLEMENTATION AUTHORIZED

## Question
Can the existing Nexo Core semantic modules be hosted inside Android without silently creating a second, divergent implementation of constitutional authority?

## Evidence inspected
- `package.json`, blob `a9bc2306543d34808f3b5f6ac1ec2d588f77ca14`: project is Node.js ESM (`"type": "module"`); scripts invoke Node.js. No dependency or script declares an Android-embedded JavaScript runtime.
- `src/nexo/core/contracts.mjs`, blob `294eb400e9685788f7dd084a28a838b69d0323c7`: semantic contracts are JavaScript modules and use JavaScript built-ins including `structuredClone`, `WeakSet`, `Object.values`, and `Object.freeze`.
- `src/nexo/core/ownership.mjs`, blob `c7f9e2671e5735bd6cf85c86bf283bec58aeea7f`: capability-separated ports exist, but missing ports fail with `NOT_IMPLEMENTED`; this is a contract surface, not a deployed host.
- `src/nexo/core/protected-transition.mjs`, blob `00a4fa069f3ef0b843ecc5d280bb686f21be1bcd`: transition logic is asynchronous ESM and depends on injected ports. It validates a caller-provided authority result's shape/status but cannot authenticate the authority producer by itself. On semantic PASS it calls `conditionalCommit.commit(candidate)`; it does not invoke `effectBoundary.prepare()`.
- `NEXO_NCS/M1_ANDROID/app/build.gradle.kts`: Android dependencies are the local `llama-lib` project and Kotlin coroutines; no JavaScript runtime is declared.
- `NEXO_NCS/M1_ANDROID/README.md`: M1 explicitly does not import the existing Node.js/Lúmina simulation runtime and is not constitutional authority or a protected-action engine.

## Findings
1. There is no demonstrated Android host for the existing ESM Core in this branch.
2. The current Core modules are not yet a complete Android host: the ports that would connect recognized authority, canonical state, and real enforcement remain missing/unproven.
3. Merely embedding the same JavaScript files would not establish trust-root provenance, canonical Constitution currentness, a legitimate state owner, a final protected sink, or bypass closure.
4. A Kotlin rewrite now would create a second implementation of security-sensitive semantics before there is a reference runtime/contract test boundary capable of proving equivalence.
5. Running Node.js manually in Termux is useful for local engineering experiments but is not, by itself, a packaged Android host or a protected production boundary. The Termux environment, app lifecycle, filesystem, and invocation path would need separate trust and enforcement analysis.
6. Putting authority decisions in M1's Activity/UI callbacks is rejected: the current app is an inference/presentation client and UI-mediated approval can be bypassed unless a real protected sink enforces the decision.

## Decision
- Keep the existing JavaScript Core as the sole semantic source of truth for now.
- Do not port the Core to Kotlin, add an embedded runtime, add a new Android service, or change M1 in this pass.
- Do not treat Termux, the Android app, Android Keystore, a biometric prompt, or a successful Node test as the constitutional root.
- Continue design/research until the runtime-host question and the separate trust/enforcement prerequisites can be evaluated without inventing a production sink.

## Next bounded task
Compare only Android-host options capable of executing or faithfully packaging the existing ESM semantics, with explicit checks for:
- ESM/module support and `structuredClone`/object semantics;
- reproducible/pinned runtime and dependency supply chain;
- separation of presentation/UI from authority-bearing code;
- durable canonical-state ownership and update/recovery behavior;
- whether the real final protected operation is actually mediated;
- test parity against the existing Node contract tests.

This comparison must not select an option merely because it is easy to embed. If no option meets the requirements without duplicating authority semantics or inventing a sink, keep the host unresolved and commissioning STOP.

## Non-actions
Read-only source inspection only. No code, tests, keys, Constitution, APK, device, deployment, or runtime authority changed. No tests were run.

## Disposition
STEP 7 remains **OPEN / STOP / UNKNOWN**. This record advances the Android host feasibility investigation only; it does not authorize commissioning or implementation.

## Targeted Android host-option comparison — 2026-10-14

This addendum completes the bounded option comparison using vendor/project documentation. It is a research result, not an owner-approved host selection or implementation authorization.

### Option 1 — Javet with embedded Node.js mode: lead candidate, not selected

Official Javet 5.0.11 documentation lists Android artifacts for Node.js mode and V8 mode, supports Android arm64, documents Node.js ESM module execution, and notes 16 KB page-size support from v4.1.4. Its Node.js API exposes a Permission Model with explicit filesystem read/write allowlists and restrictions for child processes, workers and WASI.

Sources:
- Android installation and ABI support: https://www.caoccao.com/Javet/tutorial/basic/installation.html
- ESM/module behavior: https://www.caoccao.com/Javet/reference/resource_management/modularization.html
- Node permission flags: https://www.caoccao.com/Javet/reference/javadoc/com/caoccao/javet/interop/options/NodeFlags.html

Why it is promising: the existing Core is Node.js ESM and relies on JavaScript runtime semantics including `structuredClone`; Node mode offers the closest compatibility path without rewriting the Core in Kotlin.

Risks/conditions:
- Node mode adds a larger capability surface than pure ECMAScript. Permission Model must be enabled and verified; filesystem read access must be limited to the packaged Core module tree, filesystem writes must not be broadly enabled, and child process/worker/WASI permissions must remain unavailable unless a separately reviewed requirement exists.
- Native libraries and runtime version must be pinned; APK size, memory, startup, arm64 loading, 16 KB page compatibility and Android lifecycle must be tested on CI and the target device.
- A permission model is defense in depth, not a constitutional authority root or proof that the final protected sink is mediated.
- No authority-bearing decision may be placed in UI callbacks; only narrow host ports should cross the JavaScript/native boundary.

### Option 2 — Javet V8 mode: narrower engine surface, higher parity burden

Javet documents V8 mode as distinct from Node.js mode and supports ESM with a custom module resolver. Its security guidance recommends V8 mode for malicious scripts and notes that Java interop proxies should only be enabled for trusted scripts.

Sources:
- Node.js mode vs V8 mode: https://www.caoccao.com/Javet/tutorial/basic/node_js_mode_and_v8_mode.html
- ESM/module resolver: https://www.caoccao.com/Javet/reference/resource_management/modularization.html
- Security guidance: https://www.caoccao.com/Javet/reference/tips/best_practices.html

Why it is not selected yet: the current Core contract evidence includes `structuredClone`; the bare V8 mode's availability/semantics for this global and the exact module graph must be verified, not assumed. A hand-written clone shim would be unacceptable unless parity is proved. Custom ESM resolution also becomes part of the trusted host boundary.

### Option 3 — QuickJS Android bindings: not the lead candidate

The OpenQuickJS Android repository documents a self-maintained JNI binding and script evaluation, but the reviewed material does not establish drop-in parity for the current Core's ESM graph, `structuredClone` semantics and async contracts. Selecting it would require a larger compatibility proof before it could host the existing Core.

Source: https://github.com/OpenQuickJS/quickjs-android

### Option 4 — GraalJS on Android ART: not supported by current evidence

GraalJS documents embedding on compatible JVMs and lists officially supported standalone platforms as Linux, macOS and Windows. The reviewed official material does not establish Android ART as a supported deployment target. An older Android issue also reports integration problems; that issue alone is not decisive, but there is no basis to select GraalJS for this target now.

Sources:
- Official GraalJS project/platform information: https://github.com/oracle/graaljs
- Historical Android integration issue (context only): https://github.com/oracle/graaljs/issues/514

## Recommendation and next gate

**Carry Javet Node.js mode forward as the lead candidate for a controlled feasibility prototype, but do not select or integrate it yet.** It appears to minimize semantic divergence from the existing Node ESM Core. The next proof must be a CI-only, non-APK parity experiment that:
1. pins the exact Javet Android artifact/runtime versions and verifies supply-chain provenance;
2. loads the exact current Core ESM modules and runs the existing Core contract tests or an explicitly mapped parity subset;
3. verifies `structuredClone`, Promise/async behavior, module resolution and error semantics against Node.js;
4. enables the Node Permission Model and proves filesystem read is confined to the packaged Core directory, with writes/child process/workers/WASI unavailable;
5. confirms no Java/Kotlin reflection or general-purpose host capability is exposed to Core;
6. produces reproducible logs and records failures as UNKNOWN/STOP rather than adapting semantics to force a pass.

Only after that evidence should a separately reviewed Android host/storage design be proposed. This does not identify the constitutional current-state owner or protected final sink, and it does not unblock scope A implementation by itself.

## Disposition

Host choice remains **UNSELECTED / UNKNOWN**. Javet Node mode is a research lead only. No Gradle dependency, JavaScript runtime, Android service, code, tests, APK, keys, Constitution, deployment or runtime authority changed. STEP 7 remains **OPEN / STOP / UNKNOWN**.

