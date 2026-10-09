# NCS — STEP 7: Read-Only Mobile Interaction Claim/Effect Contract
Date: 2026-10-08
Branch: ncs-clean-architecture
Status: P0 DESIGN ONLY — PROPOSAL FOR REVIEW; NOT IMPLEMENTED; NO RUNTIME CLAIM

## 1. Bounded slice
First interaction under analysis: Kevin submits a simple, non-sensitive question to Nexo through the cellphone and Nexo returns an answer in the same interaction surface.

For this first slice, the answer may use only the request itself and explicitly supplied, non-sensitive conversational context. It does not read device sensors, files, notifications, contacts, location, credentials, other applications, or protected Nexo state; it does not invoke tools, change settings, send communications, control another device, or cause any other external side effect.

This is a deliberately narrow design slice, not a claim that such a Nexo mobile implementation currently exists. Exact UI, voice path, model/provider, network route, local storage, and phone platform remain UNKNOWN.

## 2. Claim and effect contract
**Claim ID (document-local label only):** `MOBILE_READ_ONLY_ANSWER_V0`

**User intent:** receive an informational answer to the current non-sensitive question.

**Permitted effect:** present a response to the user in the active interaction surface.

**Prohibited effects in this slice:** any device/system change, external communication, external query/tool invocation, protected-state read, credential use, authority transition, persistent memory write, or action on another target.

**Required authority:** the request may authorize answering the question, but it does not authorize any excluded effect. The Constitution and policy remain above the model; the model cannot grant itself capabilities or widen the request.

**Target:** the current interaction surface only. Exact surface is UNKNOWN until a concrete client is selected.

**Freshness/scope:** bind the response to the current request and the bounded context made available for this request. Do not treat a prior approval, prior session, model output, or cached permission as authorization for a different action.

**Outcome vocabulary:**
- `ANSWER_PRESENTED`: a response was observed in the active UI/audio output path; this says nothing about truth or correctness.
- `REFUSED_OR_HELD`: no answer was produced because policy, scope, safety, or required context blocked it.
- `UNKNOWN`: the system cannot establish which outcome occurred.
- `INVALID_SCOPE`: the request or proposed operation crosses this slice's permitted boundary.

Do not equate answer presentation with factual correctness, user comprehension, or authorization for later actions.

## 3. End-to-end path and trust boundaries
1. **Intent capture:** text/voice input is captured by a not-yet-selected client. Voice recognition, if later used, is transcription evidence—not by itself proof of speaker identity or constitutional authority.
2. **Request normalization:** create an ephemeral request representation from the current input and only the context explicitly permitted for this slice. Request identity/format is not yet an implementation contract; do not invent a production ID.
3. **Scope gate:** classify whether the request can be answered without protected reads, tools, external access, memory writes, or other effects. If classification is missing, contradictory, or proposes a capability outside the slice, hold/refuse rather than silently widening scope.
4. **Answer generation:** a model/provider may propose text, but is not an authority source. Model confidence, fluent text, or a claim that a tool was used is not evidence that an operation was authorized or occurred.
5. **Output validation:** enforce output policy and avoid exposing secrets or unsupported private context. The validator's actual independence and bypass resistance are UNKNOWN until a deployment is chosen.
6. **Presentation:** the client displays/speaks the response. UI/API acceptance proves at most that the presentation path accepted or emitted content; it does not prove the user heard, read, understood, or believed it.
7. **Evidence recording:** for this low-risk slice, do not create persistent memory or a durable security audit event by default. If diagnostics are later required, define minimization, retention, access and integrity separately; never log credentials or sensitive prompt content by default.

## 4. Security properties required by the contract
- **No authority escalation:** model/provider output cannot change policy, permissions, Constitution, root, recovery, succession, or tool availability.
- **No hidden side effect:** the answer path has no tool, network action, protected-state read, or persistent-write capability in this slice. If the chosen implementation cannot enforce this capability boundary, this slice is not proven read-only.
- **Least context:** supply only information needed to answer. Context availability is not permission to disclose it.
- **Request separation:** content from the user, retrieved context, model output, and policy decisions remain distinguishable; text in the prompt cannot override policy or become an authority instruction merely by phrasing.
- **Fail closed on scope ambiguity:** if the request might require an excluded action, do not silently perform it. Explain the limitation or request a separately governed interaction.
- **No implied approval:** asking a question or receiving an answer cannot be reused as consent for a later consequential action.
- **Provider replacement:** a different model/provider may change answer quality, but must not gain extra authority or capabilities as a consequence.
- **Honest status:** distinguish generated content, successfully presented content, and verified facts. A model's assertion that an action occurred is not effect evidence.

## 5. Failure cases and required behavior
| Failure / adversarial condition | Required behavior | Evidence status |
|---|---|---|
| Speech transcription mishears a request | Answer only within the captured text's safe scope; clarify when ambiguity changes meaning | Platform behavior UNKNOWN |
| User prompt asks to read private files or control a device | Hold/refuse in this slice; require a separately specified capability contract | Requirement defined; enforcement UNKNOWN |
| Model proposes a tool call or says it used a tool | No tool exists in this slice; reject out-of-scope operation | Runtime enforcement UNKNOWN |
| Prompt injection appears in supplied context | Treat it as content, not policy or authority | Mechanism UNKNOWN |
| Model/provider unavailable | Report inability; do not fall back to a more privileged path | Fallback design UNKNOWN |
| Offline state | Only answer from current request and explicitly permitted local context; no claim of current external state | Deployment behavior UNKNOWN |
| Stale conversation context | Do not use it as current authorization or verified state | Context policy UNKNOWN |
| Client crashes before output | Outcome UNKNOWN unless the presentation boundary provides authoritative evidence | Reconciliation not needed/defined for this slice |
| Output API returns success but screen/audio was not perceived | Report only the observable presentation stage, not user perception | User perception cannot be inferred |
| App or OS compromised | Do not claim this endpoint can prove its own integrity; guarantees depend on a separately analyzed trust boundary | UNKNOWN |

## 6. Evidence taxonomy for this slice
Keep these categories separate:
- **Intent evidence:** the input captured by the client. It may be ambiguous or spoofed.
- **Scope/decision evidence:** the policy result for the proposed operation. It does not prove enforcement.
- **Enforcement evidence:** evidence that excluded tools, reads, writes and side-effect paths were actually unavailable or blocked. This requires implementation-specific testing and is currently UNKNOWN.
- **Presentation evidence:** evidence that the client emitted/displayed the response. It does not prove truth, comprehension, or downstream effect.
- **Truth evidence:** independent sources supporting a factual answer, if a later use case requires verification. This minimal slice does not establish truth merely by presenting an answer.

No runtime evidence is claimed. A document, commit, test design, UI response, or model self-report is not proof that all bypass paths are closed.

## 7. Explicit unknowns / blockers
- Client UI and input method (text vs voice): UNKNOWN.
- Exact phone model, OS/version, security patch and integrity properties: UNKNOWN.
- Local vs remote model/provider and network dependencies: UNKNOWN.
- Actual scope gate, output validator, capability isolation and bypass resistance: UNKNOWN.
- Whether any existing client can truly operate without tools, external access, private-state reads or persistence: UNKNOWN.
- Evidence source for actual presentation: UNKNOWN.
- Threats that remain if the phone/OS or client process is compromised: UNKNOWN.

Do not fill these gaps by assuming standard mobile permissions or biometric unlock are sufficient. Resolve them against a selected, verified deployment.

## 8. Acceptance gate before any implementation
This slice may be considered implementation-ready only after:
1. a concrete client and deployment path are selected;
2. the no-tools/no-private-reads/no-writes boundary is enforced rather than merely described;
3. all alternate paths that could violate the boundary are enumerated and tested;
4. model/provider output is unable to widen scope or alter authority;
5. tests cover ambiguous scope, prompt injection, provider failure, offline operation, stale context, crashes, and attempted side effects;
6. test evidence is tied to exact commit, workflow run/job, artifact/log and interpretation;
7. the result is accurately limited to this read-only slice, not generalized to Nexo as a whole.

If satisfying the gate requires adding a patch or wrapper around a fundamentally over-privileged execution design, STOP and redesign the root boundary.

## 9. Next action
Build the concrete dependency/bypass graph for the selected client path using actual repository code or a specifically chosen target. Until a real client/deployment is identified, this remains a semantic contract. After the graph, adversarially test whether the proposed no-side-effect boundary is enforceable. Do not select a provider, phone authenticator, trust root, or privileged API by implication; do not implement protected authority or external effects.
