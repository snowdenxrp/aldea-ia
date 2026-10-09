# NCS — STEP 7: Capability-Minimal Client Boundary Adversarial Review
Date: 2026-10-08
Branch: ncs-clean-architecture
Status: P0 ADVERSARIAL DESIGN REVIEW — NO IMPLEMENTATION OR RUNTIME TEST

## 1. Review target
Attack the semantic boundary in NCS/STEP_7_CAPABILITY_MINIMAL_MOBILE_CLIENT_BOUNDARY_2026-10-08.md and the corrected local/remote contract. This review deliberately does not select a client or platform. It tests whether the proposed boundary is precise enough to guide a future implementation without hiding disclosures or adding patches.

## 2. Adversarial cases
| Attack / ambiguity | Why a naïve design fails | Required invariant / disposition | Current status |
|---|---|---|---|
| Local model silently falls back to cloud | User may believe data remains local while a provider receives it | L must have no network path for the scoped operation; unavailable local inference means HOLD, never implicit R | Requirement defined; enforcement UNKNOWN |
| “Local” wrapper calls a remote API internally | Product label hides the real data path | Classify by actual outbound data flow, not UI label, model name or marketing claim | Actual runtime path UNKNOWN |
| Voice input uses remote speech recognition | Raw audio/transcript may leave the phone before answer generation | Voice capture/transcription is a separate disclosure path; it cannot inherit L unless all processing is local and verified | Input method UNKNOWN |
| Keyboard, OS assistant, crash reporting or analytics transmits content | Main app path appears local while platform/SDK sends data elsewhere | Include OS services, keyboards, telemetry, crash reporters, diagnostics and third-party SDKs in dependency closure | Client not selected; UNKNOWN |
| Output moderation calls a remote service | Response generation appears local but a hidden output-stage disclosure occurs | Every network-capable stage is part of the disclosure graph; L blocks outbound transmission at all stages | Validator/stack UNKNOWN |
| Prompt injection asks model to switch provider or export context | Model text is treated as routing policy | Model/provider output is untrusted content and cannot select mode, recipient, fields or permission | Semantic rule defined; enforcement UNKNOWN |
| Context assembler attaches saved memory by default | “Available context” silently broadens purpose and disclosure | No persistent memory read by default; context must be purpose-bound and field-allowlisted | Client/memory path UNKNOWN |
| Sensitive prompt is marked “non-sensitive” by model confidence | Model is allowed to self-classify data for its own disclosure | Classification and authorization must not depend solely on the model/provider receiving the data | Authoritative classifier/policy UNKNOWN |
| Provider terms or retention are unknown | Sending is treated as computation with no lifecycle | R remains blocked unless provider, purpose, permitted fields, retention/training and deletion handling are known and authorized | No provider selected |
| Provider changes terms or endpoint after approval | Previous approval is assumed timeless | Material provider/endpoint/terms changes invalidate dependent disclosure authorization and require revalidation | Change detection UNKNOWN |
| Request is queued offline and sent later | User's context/consent may no longer be current | No deferred remote transmission in this slice; if later considered, it requires a separate freshness/consent contract | No queue authorized |
| Retry duplicates a disclosure | Retry is assumed harmless because it is not a device action | Disclosure is itself an effect; retries need a separate contract and must not silently broaden or duplicate disclosure | No retry mechanism authorized |
| Local cache/snapshot restores old provider permission | Historical approval is treated as current | Restored bytes are history, not current authorization; revalidate scope/currentness before any R transmission | Recovery path UNKNOWN |
| Phone is unlocked by another person | Device possession/unlock is treated as owner approval for sensitive disclosure | This low-risk answer contract does not grant broad data disclosure or constitutional authority; stronger scopes need a separately defined ceremony | Independent identity/root unresolved |
| OS/app is compromised | Client asserts its own scope checks worked | Do not claim self-attestation; define which guarantees survive compromise and which fail | No implementation evidence |
| User sees a disclosure prompt but displayed content differs from transmitted payload | Approval is not bound to the actual fields/recipient | If R is later selected, approval/presentation must bind to the exact data categories, recipient, purpose and policy version actually used | No R ceremony defined |
| User requests deletion after provider transmission | UI deletion is mistaken for remote deletion | Do not claim deletion without provider-specific authoritative evidence; retention/deletion is part of R's contract | UNKNOWN |
| Model answer states “I did not send anything” | Self-report substitutes for network evidence | Truth/status must come from actual egress enforcement/observations, not model narrative | No runtime evidence |
| Browser service worker, remote script, CDN or capture endpoint transmits data | App code review omits supply-chain/runtime network paths | Deployment and third-party code are part of the claim-relative dependency closure; L cannot be claimed until all relevant egress paths are accounted for | No Nexo client exists in inspected branch |

## 3. Root-design finding
The corrected L/R split is necessary but not sufficient for deployment assurance. A label or branch in application logic cannot prove a no-network guarantee if the app, operating system, speech stack, analytics, remote scripts, or update path can transmit data independently.

This is not justification for adding a universal egress-security layer now. It means a future concrete deployment must identify the actual network-capable components and decide which enforcement boundary can close the claim. Until that target and boundary exist, Variant L is a semantic goal, not an established capability.

Similarly, R cannot be enabled by a generic “allow cloud” boolean. Its exact data fields, recipient, purpose, current provider contract, retention/deletion rules and authorization must be bound to the transmission that actually occurs. If the final send boundary cannot enforce that binding, the design is not ready.

## 4. Relationship to constitutional trust
- Client scope enforcement does not establish the constitutional root.
- Constitutional root recognition does not guarantee that a client or OS respects a data-disclosure policy.
- Provider identity/attestation is evidence under an appraisal policy, not constitutional authority.
- A valid user request for an answer does not authorize arbitrary disclosure, memory access, or future action.
- Any critical unknown about data classification, recipient, current policy or enforcement means HOLD/UNKNOWN rather than permissive fallback.

## 5. Decision
The semantic contract survives this review only with the following limits:
1. L and R remain distinct and neither is selected.
2. All network-capable input, inference, output, telemetry and platform paths count as part of the claim.
3. No persistent memory, tools, private device reads, deferred sending or external actions are included by default.
4. R remains blocked until a data-disclosure contract and exact final-send enforcement boundary are defined.
5. L cannot be described as enforced until a concrete client and environment prove the no-egress property for the scoped path.
6. No new universal security component is introduced. The next work must be tied to an actual target and its existing enforcement capabilities.

## 6. Next action
Remain at P0. Do not write client code or choose a provider/platform from this review. The next useful action is to establish, through an explicit deployment decision, whether a concrete client target exists outside the inspected repository or whether a new client-design project is wanted. If neither is decided, preserve UNKNOWN and continue only research that can materially change the architecture. Trust root, commissioning, recovery/succession, and protected/external Nexo effects remain blocked.
