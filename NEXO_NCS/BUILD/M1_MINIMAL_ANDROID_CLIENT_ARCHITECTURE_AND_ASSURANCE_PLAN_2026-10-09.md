# NCS — M1 Minimal Android Client Architecture and Assurance Plan — 2026-10-09

Status: ANALYSIS-ONLY DESIGN — NOT IMPLEMENTED, NOT DEVICE-VERIFIED, NO IMPLEMENTATION AUTHORIZATION IMPLIED.

## Purpose and hard boundary

Define the smallest useful candidate for M1: a user asks a question and receives a locally generated, read-only text response. M1 must not invoke protected actions, tools, Lúmina simulation, durable Nexo memory, Vault credentials, mission orchestration, network retrieval, remote inference, or Genesis/Constitution commissioning.

This is a product-client boundary, not a new universal inference framework.

## Minimal component layout

1. **Android interaction shell (Kotlin candidate)**  
   Displays a single conversation view, accepts one user request, shows generated output and explicit unavailable/uncertain states. No action buttons, tool catalog, mission scheduler, background agent, external intents, or cloud account requirement.

2. **Ephemeral interaction boundary**  
   Holds only the current request and response in process memory. It has no persistence API and cannot access the existing assistant-memory functions. Closing/restarting the process loses the conversation by design. No analytics, prompt logging, crash-upload SDK, clipboard export, or conversation backup is part of M1.

3. **Local inference adapter (native `llama.cpp` candidate)**  
   Receives text and a bounded generation configuration; returns text or a typed unavailable/error result. It has no Nexo authority, Core commit, effect-adapter, network, file-write, or tool capability. Treat all model output as untrusted content. The adapter must not import `src/nexo/runtime.js`, `simulation-adapter.js`, or `../assistants/memory.js`.

4. **Model provisioning / integrity boundary**  
   Model acquisition is outside M1 inference. For the first prototype, prefer an offline-provisioned model asset over in-app downloading. Record model identity, license, exact file hash, provenance and tested configuration. Load from app-private read-only storage where feasible. A matching hash establishes byte identity relative to a trusted expected hash; it does not establish model quality, safety, provenance, or authority. Corrupt/missing/incompatible model => explicit unavailable, never remote fallback.

5. **Network capability denial**  
   Candidate package should omit Android `INTERNET` permission and all network-capable SDKs. Do not use WebView, URL loaders, remote retrieval, telemetry, analytics, remote configuration, automatic updates, or external intents. Static package inspection and runtime/network observation are both required before claiming the app itself is network-isolated.

6. **OS and input-method boundary**  
   The Android OS, keyboard/IME, accessibility services, clipboard, backups, screenshots, device diagnostics, and other apps are outside the app process and may form separate data-disclosure paths. “The app has no network permission” does not prove that the whole device never transmits anything or that a third-party keyboard cannot process input. Any stronger privacy claim must specify these assumptions and test/mitigate them rather than silently widening the claim.

## Trust and capability graph

`User input → ephemeral request → local inference adapter → ephemeral response → display`

There is no outgoing edge to:
- Core protected-transition/commit path;
- effect adapter, external device or tool;
- Vault or credential store;
- durable memory or conversation history;
- Lúmina simulation/assistant state;
- remote model/provider, retrieval, telemetry or update service.

If the implementation requires any of these edges, it is no longer this M1 slice and requires a new scoped design review.

## Required failure semantics

- Model missing, corrupt, unsupported, or out of memory: return unavailable; no permissive success or remote fallback.
- Device offline: M1 remains usable if the local runtime/model are present; otherwise explicit unavailable.
- Native library/model initialization failure: no UI assertion that the model is ready.
- Prompt or response persistence detected: STOP the no-persistence claim and inspect the root cause.
- Any attempt to invoke a tool/effect or reach protected Core: reject as out of scope; no hidden bridge.
- Contradictory/unsupported model answer: present as generated content, not verified fact.
- Any untested OS/IME/diagnostic disclosure path remains UNKNOWN.

## Assurance plan (design only)

| Claim | Static check | Runtime check | Honest scope |
|---|---|---|---|
| App has no direct network capability | Inspect merged manifest for absence of `INTERNET`; inventory all dependencies and native libraries; scan for sockets/URL clients | Test with network enabled and disabled; inspect app-attributable traffic using an external capture/controlled network where feasible | Does not prove the OS or other apps never transmit data |
| No remote fallback | Inspect all model initialization/error paths and dependencies; prohibit remote URLs and alternate providers | Missing/corrupt model while online must return unavailable and produce no app-attributable network request | Only the tested build/configuration |
| No durable conversation memory | Inspect code, manifest, backup configuration, logs and crash tooling | Send a unique marker, terminate/restart, inspect app files/cache/logs/diagnostics and backup behavior | OS-level diagnostics and third-party IME remain separate assumptions unless tested |
| No tool/effect capability | Inspect dependency graph and reachable call graph; ensure no effect adapter/intent/action routes | Adversarial prompt asks to control TV, read Vault, persist memory, or call a tool; verify response remains text-only and no side effect occurs | Test coverage does not prove all possible OS compromise absent broader assurance |
| Local inference works | Pin build/runtime/model hashes and supported device assumptions | Cold start, generation, repeated prompts, memory/thermal observation, model corruption/missing-model failure | Exact tested device/OS/model only |
| M1 is separate from Genesis authority | Source/call-graph check: no commissioning/root enrollment/authority grant path | Attempts to frame model output as authority remain plain text; no protected path is reachable | Does not pass or resolve Step 7 trust gate |

## Threats not solved by M1

- A compromised Android OS, boot chain, keyboard/IME, accessibility service, or physical device can observe or alter interaction.
- Local model output can be false, manipulative, unsafe, or prompt-injected; it is not an authority source.
- A model binary/hash alone does not establish trusted origin unless the expected digest and acquisition path are independently grounded.
- Device compromise and local UI substitution are not resolved by an app-level network restriction.
- This design does not solve wake-word detection, voice identity, hands-free operation, cross-device continuity, memory, autonomy, TV control, recovery, or protected commissioning.

## Recommendation and next gate

Keep this as the minimum M1 design candidate. Before implementation, review whether Kevin wants the first prototype to prioritize (a) strict app-process network isolation, (b) ease of installation, or (c) broader hands-free capability; this design intentionally prioritizes a small, auditable read-only slice and strict network denial over convenience.

No code, dependency, model, platform installation, device inspection, runtime test, credential, trust root, commissioning, or protected effect was changed or authorized by this analysis.
