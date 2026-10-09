# NCS — STEP 7: Read-Only Mobile Interaction Claim/Effect Contract
Date: 2026-10-08
Branch: ncs-clean-architecture
Status: P0 DESIGN ONLY — PROPOSAL FOR REVIEW; NOT IMPLEMENTED; NO RUNTIME CLAIM

## 1. Bounded slice
First interaction under analysis: Kevin submits a simple, non-sensitive question to Nexo through the cellphone and Nexo returns an answer in the same interaction surface.

This contract must distinguish two mutually exclusive deployment variants because local inference and remote inference have different data-flow effects:

- **Variant L — local-only answer:** uses only the current request and explicitly permitted non-sensitive context. It reads no device sensors, files, notifications, contacts, location, credentials, other applications, or protected Nexo state; it invokes no tools, makes no network request, changes no settings, writes no persistent memory, and causes no external effect. This is the only variant covered by the strict no-external-disclosure claim.
- **Variant R — remote-provider answer:** sends some request/context data outside the phone to a model/provider. That transmission is an external data-disclosure effect even if the user only asked a question and no device setting changes. It is NOT covered by Variant L and must have a separate, explicit data-disclosure contract specifying permitted fields, sensitive-data rules, recipient/provider, retention/training handling, transport, authorization, and behavior when those facts cannot be established.

Neither variant is selected. The exact UI, voice path, model/provider, network route, local storage, and phone platform remain UNKNOWN. This distinction corrects the previous ambiguity: “read-only” must not be used to hide an outbound disclosure.

## 2. Claim and effect contract
**Claim IDs (document-local labels only):**
- `MOBILE_LOCAL_ANSWER_V0` — strict local-only variant.
- `MOBILE_REMOTE_ANSWER_V0` — separate variant requiring an explicit external data-disclosure contract; not currently specified or authorized.

**User intent:** receive an informational answer to the current non-sensitive question.

**Permitted effect for Variant L:** present a response in the active interaction surface, with no network transmission or other external effect.

**Variant R additional effect:** transmit a bounded subset of request/context data to a selected remote provider. The exact data, recipient, terms, authorization, and retention behavior must be specified before this variant can be evaluated. It cannot inherit Variant L's “no external disclosure” claim.

**Prohibited effects in Variant L:** any device/system change, network request, external communication, external query/tool invocation, protected-state read, credential use, authority transition, persistent memory write, or action on another target. Variant R remains blocked until its separate disclosure contract is defined and authorized.

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
3. **Scope and data-flow gate:** classify the request, the context needed, and the selected execution variant. Variant L must reject any path that needs network/provider access, protected reads, tools, or writes. Variant R must not proceed until a separate disclosure policy has authorized the exact data fields and recipient. Missing or contradictory classification means hold/refuse.
4. **Answer generation:** a model may propose text but is not an authority source. In Variant L it must execute locally without outbound transmission. In Variant R the provider request itself is a separately governed disclosure effect. Model confidence, fluent text, or a claim that a tool was used is not evidence of authorization or occurrence.
5. **Output validation:** enforce output policy and avoid exposing secrets or unsupported private context. The validator's actual independence and bypass resistance are UNKNOWN until a deployment is chosen.
6. **Presentation:** the client displays/speaks the response. UI/API acceptance proves at most that the presentation path accepted or emitted content; it does not prove the user heard, read, understood, or believed it.
7. **Evidence recording:** for this low-risk slice, do not create persistent memory or a durable security audit event by default. If diagnostics are later required, define minimization, retention, access and integrity separately; never log credentials or sensitive prompt content by default.

## 4. Security properties required by the contract
- **No authority escalation:** model/provider output cannot change policy, permissions, Constitution, root, recovery, succession, or tool availability.
- **No hidden side effect (Variant L):** the path has no tool, network action, protected-state read, or persistent-write capability. If the chosen implementation cannot enforce this boundary, the strict local-only claim is not proven.
- **Explicit disclosure (Variant R):** provider transmission is not silently treated as harmless computation. Only a separately specified and authorized disclosure contract may permit it; absent required provider/data-flow facts, hold rather than send.
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
| Local model unavailable in Variant L | Report inability; do not silently route the prompt to a remote provider | Fallback design UNKNOWN |
| Remote provider unavailable in Variant R | Report inability; do not change provider or disclose data to another provider without separately authorized policy | Fallback/portability policy UNKNOWN |
| Offline state | Variant L may answer only if a local model is actually available; Variant R cannot transmit and must hold/report inability | Deployment behavior UNKNOWN |
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
- **Disclosure evidence (Variant R only):** the exact approved data categories, recipient/provider, and transmission outcome. A network request or provider response is not by itself proof that the disclosure was authorized.
- **Truth evidence:** independent sources supporting a factual answer, if a later use case requires verification. This minimal slice does not establish truth merely by presenting an answer.

No runtime evidence is claimed. A document, commit, test design, UI response, or model self-report is not proof that all bypass paths are closed.

## 7. Explicit unknowns / blockers
- Client UI and input method (text vs voice): UNKNOWN.
- Exact phone model, OS/version, security patch and integrity properties: UNKNOWN.
- Local vs remote execution variant: NOT SELECTED.
- If Variant R is considered later: exact provider, data fields transmitted, recipient, retention/training policy, transport, authorization and fallback behavior: UNKNOWN and BLOCKING.
- Actual scope/data-flow gate, output validator, capability isolation and bypass resistance: UNKNOWN.
- Whether any existing client can enforce Variant L without tools, network access, private-state reads or persistence: UNKNOWN.
- Evidence source for actual presentation: UNKNOWN.
- Threats that remain if the phone/OS or client process is compromised: UNKNOWN.

Do not fill these gaps by assuming standard mobile permissions or biometric unlock are sufficient. Resolve them against a selected, verified deployment.

## 8. Acceptance gate before any implementation
This slice may be considered implementation-ready only after:
1. a concrete client and deployment path are selected;
2. the owner/design explicitly chooses Variant L or separately specifies Variant R's disclosure contract;
3. for Variant L, the no-tools/no-network/no-private-reads/no-writes boundary is enforced rather than merely described;
4. for Variant R, the exact data/recipient/retention/authorization boundary is specified and enforced before any transmission;
5. all alternate paths that could violate the chosen boundary are enumerated and tested;
6. model/provider output is unable to widen scope or alter authority;
7. tests cover ambiguous scope, prompt injection, provider failure, offline operation, stale context, crashes, attempted side effects and, for Variant R, unauthorized or excessive disclosure;
8. test evidence is tied to exact commit, workflow run/job, artifact/log and interpretation;
9. the result is accurately limited to this interaction variant, not generalized to Nexo as a whole.

If satisfying the gate requires adding a patch or wrapper around a fundamentally over-privileged execution design, STOP and redesign the root boundary.

## 9. Next action
Build the concrete dependency/bypass graph only after a real client/deployment path is identified. Until then, this remains a semantic contract. Keep Variant L and Variant R distinct; do not call remote inference “read-only” without an explicit data-disclosure contract. After a target is selected, adversarially test whether its chosen boundary is enforceable. Do not select a provider, phone authenticator, trust root, or privileged API by implication; do not implement protected authority or external effects.
