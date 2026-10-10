# NCS — M1 Minimal Android Client Architecture Adversarial Review — 2026-10-09

Status: DESIGN ATTACK — NO CODE/TEST EXECUTION; CLAIMS REFINED; IMPLEMENTATION STILL NOT AUTHORIZED.

## Candidate under attack

`NEXO_NCS/BUILD/M1_MINIMAL_ANDROID_CLIENT_ARCHITECTURE_AND_ASSURANCE_PLAN_2026-10-09.md`

## Attack matrix

| Attack / false inference | Result | Required constraint |
|---|---|---|
| “No INTERNET permission” means the entire phone cannot send data | REJECTED | Scope the initial claim to the app package/process and its attributable traffic. Android OS, keyboard/IME, accessibility services, other apps, backups and diagnostics remain separate domains. Do not claim device-wide no-egress. |
| The app has no network permission but launches a browser/share sheet/other app with the prompt | REJECTED | No external intents, share actions, deep links, WebView, clipboard export, or implicit handoff in M1. Test reachable UI and call paths. |
| The user types into M1, so the keyboard cannot disclose the text | REJECTED | Third-party IME is outside the app process. Do not promise the input never leaves the device. A stronger device-wide claim needs a separate keyboard/OS threat model and enforcement evidence. |
| Android saves conversation UI state or app data even when the app has no explicit database | REJECTED | Inspect saved-state restoration, backup configuration, files, cache, preferences, logs and crash tooling. Test with unique markers across force-stop/restart and inspect the tested package's artifacts. |
| Native runtime writes prompt/model diagnostics or crash traces | UNKNOWN until checked | Disable prompt/token logging and telemetry; inspect native library options and crash behavior. A source-level intention is not persistence proof. |
| Local model asset is swapped, corrupted, or parsed maliciously | NOT SOLVED by local-only | Pin source/version/license and expected hash via a separately trusted channel; verify before load; fail closed on mismatch. Treat model/parser/native-library security as a separate risk. A hash proves byte match only relative to the expected hash. |
| Missing/unsupported model triggers a remote provider fallback | REJECTED | Every error path must return unavailable. Static scan plus runtime test while online must show no app-attributable network attempt. |
| Prompt injection tells the model to read Vault, control TV, or invoke tools | REJECTED at capability boundary | No tool/effect adapter or credential API is linked into M1. Output is rendered as text only; do not parse model output as commands. |
| A library dependency has hidden network/telemetry capability | UNKNOWN until audited | Dependency and native-library inventory, pinned versions/hashes, license review and static inspection are prerequisites. Do not add a dependency because its documentation says “local.” |
| Model download is performed inside the app to ease installation | REJECTED for initial M1 | Model provisioning is a separate offline operation. No download manager, URL fetch, remote manifest or update path in the app. |
| Runtime traffic test observes no packets, so no-egress is universally proved | REJECTED | Combine manifest/dependency/source review with runtime observation; state tested device/build/network conditions. The evidence supports only bounded tested claims, not resistance to a compromised OS or all future builds. |
| Successful local inference proves Nexo's Genesis/Constitution is legitimate | REJECTED | M1 is a read-only proposal path. P1/P2 and all protected commissioning gates remain independent and blocked. |

## Refined assurance claim

The strongest honest initial target is:

> For one identified and tested Android package/build, the M1 app has no declared Android Internet capability, no intentionally included network client/remote fallback, no tools/effect path, and no designed durable conversation store; observed tests support these properties for the specified device/build and test conditions.

Do **not** shorten that to “the phone is fully private/offline” or “no data can ever leave the device.” Input-method and OS/platform failure domains remain outside this initial claim unless separately addressed.

## Minimum implementation acceptance gate

Before any M1 implementation is accepted:
1. exact package manifest shows no `INTERNET` permission and no unnecessary external components;
2. dependency/native-library inventory is complete for the shipped package;
3. model is offline-provisioned and its expected identity/hash source is documented;
4. no remote, retrieval, telemetry, analytics, update, crash-upload, share or clipboard path is present;
5. prompts/responses are not deliberately persisted; unique-marker inspection tests are defined;
6. missing/corrupt model always returns unavailable, including while network is enabled;
7. adversarial requests cannot reach tools, Vault, memory, Lúmina or external effects;
8. test report names exact package hash, device/OS, model hash, tested properties and residual UNKNOWNs;
9. the implementation remains completely separate from Genesis commissioning and protected Core authority.

## Decision

- M1 remains a useful bounded first slice, but it is not yet implemented or verified.
- The preferred design priority is strict app-process network isolation and read-only text, with no tools/effects/persistent conversation.
- Device-wide confidentiality, keyboard/IME privacy, OS integrity, local model trustworthiness and Genesis authority are explicitly outside the proven claim.
- No code, dependencies, model, installation, runtime tests, trust root, credential, ceremony or protected effect was changed or authorized.
- Next step is to present the bounded implementation scope and its resource prerequisites for explicit implementation authorization; do not silently cross from analysis to code.
