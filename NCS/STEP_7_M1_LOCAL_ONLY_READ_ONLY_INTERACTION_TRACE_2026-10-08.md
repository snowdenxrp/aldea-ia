# NCS — STEP 7: M1 Local-Only Read-Only Interaction Trace
Date: 2026-10-08
Branch: ncs-clean-architecture
Status: P0 CLAIM/EFFECT TRACE — DESIGN ONLY; NOT IMPLEMENTED OR RUNTIME VERIFIED

## 1. Purpose and scope

This is the end-to-end trace for the first candidate effect family M1 (read-only interaction) from `NCS/STEP_7_PRIMARY_MOBILE_DEVICE_CONTROL_SLICE_2026-10-08.md`.

This document does not select a production deployment mode. It analyzes Variant L (strict local-only) as the conservative reference path because it does not disclose the request to a remote model/provider. Variant L feasibility remains UNKNOWN until a concrete client, local inference path, and enforceable no-egress boundary are identified and tested. Variant R remains separately blocked by its external-disclosure contract.

In-scope: receive one request, process only the current request and explicitly permitted transient context, produce an answer, and present it. No persistent memory, remote inference, voice recognition, tools, sensors, file reads, network access, device control, credential use, or other external effect is included.

Out-of-scope: proving constitutional identity, enrolling or rotating a trust root, recovery/succession, protected-state changes, cross-device continuity, implementation, and deployment.

## 2. Claim and effect definition

**Claim:** For one request, the client presents an answer derived only from that request and the explicitly allowed local processing/context, without transmitting request content or context outside the device and without exercising any protected capability.

**Target:** The current presentation surface on the selected phone. Exact hardware, OS, app/runtime and local model remain UNKNOWN.

**Allowed effect:** Render an answer locally in the active interaction surface.

**Forbidden effects:** Any outbound disclosure; silent remote speech-to-text; remote inference, moderation or classification; analytics/telemetry/crash reporting containing request or answer content; automatic memory attachment; tool/device/file/sensor access; persistent state mutation; queued network send; provider switching; and any protected or external action.

**Authority:** This is an interaction scope, not constitutional authority to perform consequential actions. Device possession, unlock, biometric success, an app session, model output, or cached permission does not expand the scope.

**Evidence limit:** A UI rendering result can support that content was presented to the app's rendering surface. It does not prove the user read, heard, understood, or accepted it.

## 3. End-to-end path and trust boundaries

1. **Request capture.** Accept one explicit request from the selected input surface. Treat text, attachments, speech transcripts, metadata, and embedded instructions as untrusted input. This slice assumes text input only; speech/audio is excluded until its full processing path is known.
2. **Scope normalization.** Identify the request as M1 and Variant L before any inference. The model/provider must not choose the variant, add permitted fields, or widen scope. If the request requires a tool, protected read, external lookup, memory, or other excluded capability, hold and explain the limitation rather than silently expanding the path.
3. **Context assembly.** Supply only the current request and explicitly approved, non-persistent transient context. No saved memory or credentials are read. Missing provenance or uncertain classification must not be resolved by asking the model that will receive the data to authorize its own access.
4. **Egress boundary.** The entire request-to-answer execution path must be unable to transmit request/context content to any network recipient, including through indirect platform services, SDKs, keyboards, diagnostics, crash reporters, analytics, moderation, or hidden fallback. A UI label or declared “local” mode is not evidence of no egress. If this cannot be established for the selected target, Variant L is not proven and the operation must not be represented as private/local-only.
5. **Inference.** Use a local inference implementation only if one is later selected and verified. Treat generated content as an untrusted proposal. It cannot grant capabilities, change policy, read memory, route remotely, or cause an action.
6. **Output check.** Apply only the checks required for this claim and this client. A checker cannot retroactively make a disclosed request local-only. If output handling requires a remote service, that path violates Variant L.
7. **Presentation.** Render the answer in the local surface. Do not equate a successful render/API return with human receipt or understanding. Presentation metadata must not silently include sensitive prompt/answer content in telemetry.
8. **Termination.** End the request without queueing it for later remote delivery or adding persistent memory. A future feature that stores history is a separate state-changing capability and needs its own contract.

## 4. Decision table

| Condition | Required outcome | What must not happen |
|---|---|---|
| All in-scope prerequisites are established | May produce and locally present an answer | No implicit extra capability |
| Local model/runtime unavailable | HOLD / report unavailable | No cloud fallback |
| Egress graph incomplete or any hidden sender unresolved | UNKNOWN / do not claim Variant L | No assumption that “local” label is sufficient |
| Request needs web, tool, memory, sensor, file or device access | Decline/hold this M1 path | No capability expansion by model instruction |
| Policy/context missing or contradictory | UNKNOWN / HOLD | No inference-based authorization |
| OS/keyboard/SDK path may transmit prompt content | Variant L not established; hold or use an explicitly separate, authorized mode | No silent disclosure |
| App/process or privileged OS compromise is in scope but no independent enforcement exists | State guarantee as UNKNOWN | No self-attestation claim from the compromised component |
| Output is generated but not rendered | No presentation claim | No claim that user saw it |
| Render/API reports success | Claim only local surface presentation, if that evidence is trustworthy | No claim of human understanding |
| Offline request later reconnects | No deferred send for this slice | No stale/implicit authorization |

## 5. Claim/evidence separation

The following are distinct and must not be collapsed:

- **Input accepted** does not prove that input stayed local.
- **Local model invoked** does not prove the complete dependency graph had no network egress.
- **No network call observed in one test** does not prove all code paths/platform services cannot disclose data.
- **Policy says Variant L** does not prove enforcement.
- **Authorization requested or approved** does not prove enforcement at the last relevant boundary.
- **Output produced** does not prove output presented.
- **Output presented** does not prove the human read/heard/understood it.
- **STOP requested** does not prove all paths are stopped.
- **Permission revoked in one component** does not prove every dependent path enforces revocation.

A runtime claim must name the target/build, code and dependency versions, execution conditions, observable egress boundary, raw logs/artifacts, and the exact claim those artifacts support. Missing any essential evidence leaves the corresponding claim UNKNOWN/PENDING, not passed.

## 6. Failure and adversarial cases that block closure

1. Remote speech recognition or transcription before the local path begins.
2. Hidden network calls from model wrappers, output moderation, telemetry, analytics, crash reporting, diagnostics, keyboard/OS assistant, or third-party SDK.
3. A provider/model update that changes behavior or adds a remote dependency without invalidating the prior claim.
4. Prompt injection that asks the model to export context, switch route, attach memory, or invoke a tool.
5. Offline queue/retry that sends the prompt after the original interaction.
6. A compromised app claiming its own egress restrictions are intact without independent evidence.
7. Incomplete dependency inventory, unknown endpoint, opaque SDK, or unavailable raw artifact.
8. An output check that itself discloses the prompt or generated answer.
9. A “consent” UI that describes the interaction as local while any content-bearing path is remote.
10. Treating missing telemetry as proof that no disclosure occurred.

Any unresolved egress path prevents a local-only assurance claim. Do not repair this by adding a generic wrapper or another abstraction layer; revise the claim or select a target where the relevant boundary can be enforced and evidenced.

## 7. Required evidence before implementation readiness

- Exact client target and build identity.
- Complete dependency and content-bearing egress graph for the complete input-to-presentation path, including platform and third-party components.
- Explicit Variant L policy and a demonstrable enforcement boundary outside model control.
- Evidence that failure of local inference causes HOLD, not remote fallback.
- Evidence that excluded capabilities (network, persistent memory, tools, sensors/files, protected state and external effects) are absent or denied for this slice.
- Raw, reproducible test artifacts for allowed and denied cases, including offline, restart, failure, update and adversarial routing requests.
- Defined compromise limits: which guarantees do and do not survive app or OS compromise.
- Claim-specific acceptance criteria and reviewer sign-off.

No evidence in this document satisfies those runtime requirements.

## 8. Existing research integration

- **MASTER:** preserve provider independence, privacy/data sovereignty, and purpose-bound memory access; do not let a model or vendor become the policy authority.
- **AB:** retain the evidence/authority distinction and the GLOBAL-AUDIT-109 distinction between STOP requested and enforced, revocation issued and enforced, cached authorization and current authority, and fence issuance and enforcement.
- **P/P112:** keep trust functions and their dependencies distinct; include platform/SDK paths in the claim-relative dependency closure.
- **NCS:** reuse the existing corrected L/R interaction contract, primary mobile slice, capability-minimal boundary, trust-family comparison and adversarial review. This trace adds no new trust root or universal framework and does not reopen frozen AB/TLC/Kafka probes.

## 9. Result and next action

**Design result:** M1/Variant L is a coherent candidate claim only if “local-only” describes the complete request-to-presentation data flow, not merely the inference engine. Feasibility and enforcement remain UNKNOWN.

**Next action:** do not create more generic layers. Determine whether an external Nexo prototype exists or explicitly authorize a new client-design project. If no prototype exists and the project is authorized, identify the concrete target and dependency/effect graph before implementation. Do not select Variant R, a provider, platform, root, commissioning flow, recovery/succession policy, or protected effect by implication.

No code was changed. No client was implemented, no network/effect path was executed, and no runtime test or exploit attempt was performed.
