# NCS — STEP 7: Capability-Minimal Mobile Client Boundary
Date: 2026-10-08
Branch: ncs-clean-architecture
Status: P0 DESIGN PROPOSAL ONLY — NOT IMPLEMENTED; NO DEPLOYMENT OR SECURITY CLAIM

## 1. Purpose and source alignment
Define the minimum semantic boundary a future Nexo phone client would need, without selecting a UI framework, operating system API, model/provider, verifier, or trust root.

Cross-check basis:
- MASTER: NEXO_MASTER_ARCHITECTURE_2026-09-23.md — claim-relative trust/dependency closure, provider independence, privacy/data sovereignty and purpose-bound memory capabilities.
- AB: AB104.401 evidence-to-authority separation; AB104.443/AB104.444 provider/vendor trust-boundary and total-compromise findings; GLOBAL AUDIT 109 STOP/revocation/enforcement distinction. Reuse existing evidence; do not rerun frozen probes.
- P/P112: STEP 7 trust-function/root-role map and the existing MASTER + AB + P/P112 integration rule.
- NCS: the corrected local-versus-remote interaction contract and source inspection showing no current Nexo mobile client in the inspected branch.

This document proposes roles, not a new universal trust registry or execution framework. Existing canonical owners remain authoritative for their domains.

## 2. Two variants; no silent route switching
### L — Local-only answer
- The current request and explicitly permitted, non-sensitive context remain on the device.
- No network call, remote model, tool, protected-state read, device sensor/file read, persistent memory write, or external effect is in scope.
- If local inference or safe processing is unavailable, report inability/hold. Never silently send the request to a remote provider.
- Feasibility is UNKNOWN until a real client, local model, isolation boundary, and no-network enforcement are identified and tested.

### R — Remote-provider answer
- Sending any request/context to a provider is a data-disclosure effect, even when no device setting changes.
- This variant remains BLOCKED until a separate policy identifies the exact permitted data categories, recipient/provider, purpose, transport, retention/training handling, deletion/retention obligations, authorization, and behavior when any required fact is unknown.
- Provider output has no authority to change Constitution, permissions, tool availability, memory access, or future routing policy.
- A provider change cannot silently widen the data scope. If the approved disclosure conditions are not met, do not send.
- No provider or remote-processing policy is selected by this document.

## 3. Semantic roles and authority boundaries
1. **Input/presentation surface — untrusted input/output.** Captures the current user request and presents a response. Text or speech recognition is not constitutional identity proof. The client must not claim the user heard/read/understood an output merely because an API accepted it.
2. **Request/context assembler — least-context transport.** Supplies only the fields allowed for the selected variant and purpose. It has no authority to invent identity, consent, freshness, or missing facts.
3. **Variant/data-flow gate — outside model control.** Determines whether L or R is permitted for this request. Model output cannot select R, add data fields, or override the gate. If policy/context is missing or contradictory, hold.
4. **Inference adapter — untrusted proposal source.** A local model in L or an approved remote provider in R may propose answer content. It cannot grant itself capabilities, choose privileged tools, change policy, or make claims of authority.
5. **Output policy boundary — claim-relative validator.** Checks whether the proposed response stays within the permitted purpose and output rules. Its actual enforcement independence is UNKNOWN until a concrete implementation is chosen. A second function/module alone does not prove independent enforcement.
6. **Presenter — observed-output boundary.** Emits text/audio to the active surface. Evidence can support only the stage actually observed; it cannot establish factual truth or user comprehension.
7. **Memory boundary — absent by default in this slice.** No persistent memory read/write is available in L or R unless a separate purpose-bound capability is defined and authorized. Context availability is not permission to reuse or disclose it.
8. **Tool/device/external-action boundary — absent by default.** No tool registry, OS-control adapter, device-control API, message sender, purchase path, credential vault, or external-effect gateway is exposed to this interaction slice.
9. **Telemetry/audit boundary — minimized by default.** No raw prompt or secret logging by default. Any retained evidence needs a separate purpose, access, minimization, retention, integrity and deletion contract; do not invent logging merely to make the design appear auditable.

## 4. Claim-specific dependency/failure graph
| Dependency / failure domain | Variant L consequence | Variant R consequence | Current status |
|---|---|---|---|
| Phone/client integrity | A compromised client may bypass local scope rules; no self-attestation claim | May also leak data or alter the remote request | UNKNOWN |
| OS/privileged services | May observe/alter input/output or bypass app-level restrictions | May observe/alter data before transmission | UNKNOWN |
| Local model/runtime | Unavailable or compromised local inference may prevent a trustworthy answer; no automatic remote fallback | Not applicable to provider inference, but local preprocessing may still be a dependency | UNKNOWN |
| Provider/model | No provider dependency permitted | Provider receives approved data and may be unavailable, compromised, or change behavior | L: none; R: not selected |
| Data/context assembler | Excess context violates least-context contract | Excess context becomes disclosure | UNKNOWN |
| Policy/data-flow gate | Must actually prevent all network/tools/private reads/writes | Must actually enforce approved recipient and exact data scope before transmission | UNKNOWN |
| Network/transport | No network call in L | Transport and recipient identity are critical disclosure dependencies | L: none; R: UNKNOWN |
| Memory/storage | No persistent memory access in this slice | Same; provider retention is separately governed | UNKNOWN |
| Output presentation | API success is not proof of user perception | Same | UNKNOWN |
| Recovery/device replacement | Must not turn replacement into authority or imply continuity | Must not silently restore remote disclosure permissions | UNKNOWN |

## 5. Failure semantics
- Missing policy, ambiguous mode, unknown recipient, or conflicting data classification → HOLD/REFUSE; never default to remote transmission.
- Loss of trust or weaker evidence cannot increase autonomy, data scope, or provider access.
- An answer request is not consent to read private data, access microphone/camera/location beyond the input operation, save memory, or execute a future action.
- Prompt content and model output are data, not instructions with authority to change this boundary.
- Provider availability is not permission. Retry, fallback, provider migration, and alternate endpoints cannot silently broaden disclosure.
- Phone unlock/biometric success may be a platform signal if later justified; it is not a universal Nexo authorization and does not solve independent root recognition.
- If the client or OS is compromised, do not claim the phone can independently prove that it followed its own restrictions.

## 6. What this boundary deliberately does not decide
- Whether first deployment uses L or R.
- Whether a usable local model can run on the target phone.
- Phone make/model, OS version, app framework, trusted execution/attestation features, or update path.
- Provider identity, data-retention terms, network protocol, or remote-processing jurisdiction.
- The physical trust root, independent recognition ceremony, Constitution Authority Context, recovery, succession, or protected authority mechanism.
- Any tool, device-control, credential, external-effect, or persistent-memory capability.

These are separate decisions. Do not fill them from convenience, an app user-agent, or a model recommendation.

## 7. Acceptance gate before implementation
1. Select an actual client/deployment target and state the threat model for client and OS compromise.
2. Explicitly choose L or specify R's separate disclosure contract; no automatic mode switching.
3. Enumerate every code path and dependency capable of network transmission, private-state access, persistence, tool invocation, or output presentation.
4. Prove by source inspection and adversarial tests that excluded capabilities are not reachable through alternate paths.
5. Test prompt injection, ambiguous scope, stale context, model/provider failure, offline operation, restart, output-policy bypass, and unauthorized disclosure attempts.
6. Tie each test claim to exact source/build, run/job, raw output and interpretation; no test plan or commit alone counts as runtime evidence.
7. Preserve the independent constitutional trust-root gate. Passing the read-only client gate does not activate Constitution authority or authorize consequential effects.

If the intended security claim cannot be enforced without wrapping an over-privileged root design, stop and redesign the capability boundary rather than adding another patch.

## 8. Next action
Continue P0 with a source-grounded capability/bypass inventory only after an actual client target is selected. Until then, retain this as a semantic boundary proposal. Do not implement the client, select a provider/platform/root, or enable protected operations. Keep Lúmina and its repository-write capture endpoint outside this Nexo design.
