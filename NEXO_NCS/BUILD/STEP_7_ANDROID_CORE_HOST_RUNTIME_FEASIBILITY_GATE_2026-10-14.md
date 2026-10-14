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
