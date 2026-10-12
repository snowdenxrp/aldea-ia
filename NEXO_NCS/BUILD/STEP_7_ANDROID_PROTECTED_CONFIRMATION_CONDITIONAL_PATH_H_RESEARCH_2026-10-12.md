# STEP 7 — Android Protected Confirmation as a Conditional Human-Ceremony Component
Date: 2026-10-12
Branch: ncs-clean-architecture
Status: RESEARCH FINDING — CANDIDATE ONLY — NOT IMPLEMENTED — COMMISSIONING STOP

## Question
Can Android Protected Confirmation provide a stronger human approval/presentation path for the first narrow Nexo Constitution commissioning ceremony, without becoming Nexo's Genesis root or hiding a new architectural patch?

## Finding
Potentially, but only as a narrowly scoped transaction-confirmation component inside Path H, and only if the actual device supports it and an independently recognized relying verifier checks the resulting attestation/signature. It is not a complete STEP 7 solution and does not remove the initial-trust bootstrap problem.

Official Android documentation says Protected Confirmation uses a hardware-protected Trusted UI to show a prompt and produce a cryptographic confirmation statement, on supported devices. The API explicitly exposes ConfirmationPrompt.isSupported(context); support is not implied merely by Android API level. A prompt may still fail to display, including under some accessibility-service conditions. The current Nexo phone's support has not been checked, and no APK/device probe was performed.

Sources:
- Android Open Source Project, Protected Confirmation: https://source.android.google.cn/docs/security/features/protected-confirmation?hl=en
- Android ConfirmationPrompt API: https://developer.android.com/reference/android/security/ConfirmationPrompt
- Android developer guide (Spanish): https://developer.android.google.cn/privacy-and-security/security-android-protected-confirmation?hl=es

## Security properties it can contribute
If all prerequisites are independently checked, the mechanism can provide evidence that:
1. A supported hardware-protected confirmation UI presented a specific promptText.
2. The user accepted that displayed text.
3. A key with the required trusted-confirmation authorization signed the confirmation response.
4. A fresh nonce/extraData links the response to a particular request and helps reject replay, provided the relying verifier tracks and consumes the nonce correctly.

The relying verifier must validate the signature and attestation chain, validate the required TRUSTED_CONFIRMATION_REQUIRED property, check freshness/replay, and compare the returned promptText against the exact expected text. Android's extraData is returned in the signed response but is not itself shown to or approved by the user. Never infer that arbitrary Constitution bytes, a digest, a version, or a scope placed only in extraData were approved.

## Critical limits for Nexo STEP 7
- Not Genesis: Android attestation is meaningful relative to a recognized attestation root and policy. It does not decide who legitimately selected Nexo's first Constitution or who is the initial constitutional authority.
- Not a relying verifier: the Nexo verifier still needs an independently recognized trust basis and must not be replaceable by the uncommissioned candidate.
- Not canonical state ownership: the API does not establish a single current Constitution Authority Context, durable revision/epoch, revocation/currentness rules, or recovery semantics.
- Not complete mediation: the API does not prove that every route to the constitutional state or any later Android/TV/provider/physical effect passes through the same enforcement point.
- Not a general secure information channel: Android documentation warns not to treat Protected Confirmation as a confidentiality channel.
- Not guaranteed on this phone: the exact device capability and behavior are UNKNOWN until queried and tested. isSupported() is a capability check, not proof of correct integration or deployment.
- Prompt semantics matter: the user approves only the rendered promptText. If the Constitution is too long to review meaningfully in that UI, signing a short summary or hash does not mean the user read and approved all underlying clauses. A deterministic, human-comprehensible mapping from prompt to exact bytes and scope would have to be justified, not assumed.
- Same-host compromise remains relevant: even a trusted display can improve presentation integrity, but if the uncommissioned host also chooses the prompt, expected transaction, verifier, public-key trust policy, and final state update, it cannot independently prove that the first authority was legitimate.

## Minimal conditional use, if later justified
Do not implement yet. First identify the exact commissioning claim and the independently recognized relying verifier. If Path H is later explicitly accepted by Kevin under a bounded threat model, evaluate this only as one component:

1. Freeze exact Constitution revision and scope; do not authorize anything else.
2. Deterministically derive a short prompt that explicitly names the narrow action, revision identifier, and scope; do not put approval-critical facts only in extraData.
3. Generate a fresh verifier-controlled nonce for this specific ceremony.
4. On the actual device, query support and invoke Protected Confirmation; if unsupported, unavailable, canceled, or ambiguous, fail closed.
5. Have a relying verifier outside the untrusted candidate validate attestation, key authorization, signature, exact prompt text, nonce freshness, one-time use, and the exact Constitution bytes/scope bound by the protocol.
6. Only then could a separate canonical state owner perform one narrow activation transition. The activation sink must reject direct calls, stale/replayed responses, conflicting revisions, and restore/rollback paths that bypass the same rule.
7. Retain raw device capability result, attestation chain, signed confirmation response, verifier decision, state transition record, and adversarial test output. Do not store or fabricate real commissioning evidence during research.

Even if all seven steps were implemented, the claim would be limited to that tested device, verifier, Constitution revision, and activation sink. It would not prove future effect paths.

## Decision
This is a potentially useful improvement to the human-presentation component of Path H, not an independent Path O root and not a closure of STEP 7. It may reduce one presentation-integrity assumption only after real device support and the relying verifier are established. It cannot replace the missing independently recognized bootstrap basis or final protected-state enforcement.

Current disposition remains:
- Genesis basis/verifier legitimacy: UNKNOWN / NOT ESTABLISHED.
- Current device Protected Confirmation support: UNKNOWN / NOT TESTED.
- Canonical active-Constitution owner: NOT ESTABLISHED.
- Production composition and final enforcement/bypass closure: UNKNOWN.
- Protected commissioning: STOP.
- No production code, test, workflow, APK, key, Constitution artifact, or phone/runtime state changed by this research.
