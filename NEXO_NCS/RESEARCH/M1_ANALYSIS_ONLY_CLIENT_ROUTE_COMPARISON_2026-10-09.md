# NCS — M1 Analysis-Only Client Route Comparison — 2026-10-09

Status: ANALYSIS ONLY — PREFERRED CANDIDATE IDENTIFIED FOR FURTHER DESIGN; NO PLATFORM/MODEL IMPLEMENTATION SELECTED OR AUTHORIZED.

## Decision question

Which bounded implementation route is most suitable to investigate for a first Nexo M1 slice: local read-only text interaction, with no tools/effects, no durable conversation memory, no credentials, and no silent remote fallback?

This comparison does not choose the Genesis trust root and does not weaken the protected commissioning STOP.

## Candidate routes

| Route | Advantages for M1 | Principal risks / cost | Assessment |
|---|---|---|---|
| A. Dedicated Android app + embedded/local `llama.cpp` inference | Native app boundary; mature Android build guidance; model files can be read from app-private storage; GGUF model ecosystem; app can be designed without Android INTERNET permission and without remote SDKs. | Requires Android/NDK build expertise; device-specific performance/thermal/memory tests; native parser/runtime supply-chain and model licensing review; omission of INTERNET permission is helpful but does not by itself prove every data path or platform behavior. | **Preferred candidate for further analysis**, not yet selected or proven. Best fit for a dedicated phone-based Nexo client and provider/model portability. |
| B. Dedicated Android app + LiteRT-LM | Official on-device GenAI runtime with Android examples and an offline-oriented ecosystem; potential acceleration on supported hardware. | More ecosystem/runtime coupling; hardware/backend behavior varies; the existence of a demo or benchmark does not prove this device, app boundary, or no-egress properties. | Strong alternative to compare if native integration simplicity or hardware acceleration materially beats Route A. |
| C. Browser/PWA + Transformers.js/WebGPU/WASM | Fast path to a UI prototype; runs model computation in the browser; web code can be portable. | WebGPU support/performance varies; model assets may be fetched; browser caches/service workers, remote assets and browser/OS services complicate proving no egress and no persistence; less control over the full boundary. | Not preferred for the first privacy-constrained M1 slice unless the product goal changes to a disposable UI demo with no sensitive input. |

Termux/`llama.cpp` CLI is a possible personal feasibility experiment, but it is not the Nexo user-facing client boundary and must not be confused with the product implementation.

## Recommendation

Carry Route A (dedicated Android app with a local `llama.cpp`-based inference path) forward as the **preferred analysis candidate only**. Do not add it to the repository or install/build anything yet. First define the minimum client boundary and validate the practical constraints. Keep Route B as the only serious alternative unless new evidence changes the comparison; do not reopen a broad framework survey.

Why: M1 needs a controllable client boundary more than it needs a visually polished UI. A dedicated app can make network capability absence, no tools, and no conversation persistence explicit properties to test. Model portability is also more aligned with the Nexo provider-independence principle than making the interaction contract itself depend on one hosted model provider.

## Required proof before calling a prototype “local-only”

1. The actual Android package and all transitive dependencies are inventoried and pinned.
2. No Android INTERNET permission or network-capable SDK/path is present in the prototype package; any exception must be explicit and separately reviewed.
3. No remote inference fallback, retrieval, telemetry, analytics, crash upload, update check, or network-loaded code/model asset exists in the M1 runtime path.
4. Offline cold start succeeds after installation/model provisioning, with network disabled; failure remains explicit unavailable, never remote fallback.
5. Runtime/network testing corroborates the static inspection; no single test is widened into proof against all OS/device compromise.
6. Conversation prompts and responses are not written to application persistence, logs, analytics, caches or crash artifacts under the tested configuration.
7. The UI exposes only read-only text interaction; no tool invocation, credential access, durable memory, action adapter, or external-effect capability is reachable.
8. The exact tested device, OS/build, package hash, model hash/version, dependencies and test scope are recorded. Unknowns remain UNKNOWN.

These checks would support only the tested local-interaction claim. They would not establish that the OS is uncompromised, guarantee confidentiality against a malicious device, prove Genesis legitimacy, or authorize protected actions.

## Constraints and next gate

- Exact POCO X7 Pro-family device compatibility/performance has not been established by this research.
- No model, quantization, license, context size, native packaging strategy, or deployment method is selected.
- No private-device inspection, install, download, code change, dependency change, or runtime test was performed.
- A later implementation requires an explicit scope/implementation authorization after the minimum design and resource requirements are reviewed.
- Genesis P1/P2, offline currentness/revocation, recovery, protected establishment and final-effect enforcement remain UNKNOWN/STOP.

## Sources consulted

- `llama.cpp` official Android build/integration guidance: https://github.com/ggml-org/llama.cpp/blob/master/docs/android.md
- Google AI Edge LiteRT-LM overview and on-device examples: https://developers.google.com/edge/litert-lm/overview
- Transformers.js WebGPU guide: https://huggingface.co/docs/transformers.js/guides/webgpu
- Existing repository feasibility check: `NCS/STEP_7_LOCAL_ONLY_INFERENCE_REPOSITORY_FEASIBILITY_CHECK_2026-10-08.md`
- Existing M1 boundary: `NEXO_NCS/BUILD/STEP_7_M1_READ_ONLY_INTERACTION_BOUNDARY_CANDIDATE_2026-10-08.md`

External framework documentation establishes that these routes exist; it does not establish compatibility, security, offline behavior or performance on the user's device.
