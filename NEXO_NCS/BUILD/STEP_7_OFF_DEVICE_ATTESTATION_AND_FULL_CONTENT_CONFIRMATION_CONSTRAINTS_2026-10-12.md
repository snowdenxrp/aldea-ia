# STEP 7 — Off-device Attestation and Full-Content Confirmation Constraints
Date: 2026-10-12
Branch: ncs-clean-architecture
Status: SOURCE-VERIFIED DESIGN CONSTRAINTS — CONDITIONAL PATH H ONLY — NOT IMPLEMENTED

## Why this follow-up matters
The previous Protected Confirmation note identified a possible trusted UI. Official Android documentation adds two operational constraints that materially narrow the option: (1) key-attestation validation must be performed by a separate trusted server, not on the same device being evaluated; and (2) the entire protected confirmation body must fit and be shown completely, or the transaction must abort.

## Verified official findings
1. Android Protected Confirmation is device-dependent. Android API support checks are necessary but not sufficient; presentation can fail at runtime. Failure, cancellation, interruption, overlong content, or an incomplete rendering must not yield approval.
2. The AOSP implementation guidance says Protected Confirmation is intended to preserve the integrity of displayed text and user input even when the Android kernel is compromised, but only if the relevant trusted firmware, display, input and UI implementation requirements are met. The feature can be blocked; in that case no confirmation token must be issued.
3. AOSP specifies a 6144-byte hard limit for the body including nondisplayed extra data and CBOR framing, plus a soft limit requiring the entire rendered message to fit. If the complete message does not fit, the transaction must be canceled. This means we cannot assume a full Constitution can be approved in one prompt; its actual encoded and rendered size must be checked. A short summary is not equivalent to approval of all clauses unless the binding is explicitly justified.
4. Android Key Attestation documentation explicitly instructs that the certificate chain be sent to a separate trusted server for validation, warning not to validate it on the same device because a compromised Android system could make local verification trust untrustworthy data.
5. The separate relying verifier must validate the certificate chain against an already recognized root, certificate revocation status, the trusted-confirmation authorization, the response signature, exact prompt text, and a fresh one-time request nonce. A signed response does not establish Nexo's own Genesis legitimacy by itself.

## Source references
- Android Protected Confirmation overview: https://source.android.com/docs/security/features/protected-confirmation?hl=en
- AOSP Protected Confirmation implementation constraints: https://source.android.com/docs/security/features/protected-confirmation/implementation
- Android ConfirmationPrompt API and relying-party validation: https://developer.android.com/reference/android/security/ConfirmationPrompt
- Android Key Attestation; off-device validation and certificate chain requirements: https://developer.android.com/privacy-and-security/security-key-attestation
- Android developer guide: https://developer.android.com/privacy-and-security/security-android-protected-confirmation

## Revised conditional Path H architecture
This is not a chosen implementation. If Path H is later explicitly accepted, the minimum shape would be:
1. A fixed, canonical Constitution candidate and exact narrow activation claim are frozen before the ceremony.
2. A protected prompt presents the exact approval-critical human-readable claim; if the full approved content cannot be rendered in full, stop or use a rigorously specified human-readable manifest that does not overclaim what was approved.
3. The device returns the signed confirmation response and key-attestation chain; no local Boolean such as `approved=true` is authoritative.
4. A separate, independently recognized relying verifier validates the attestation, chain/revocation, signature, trusted-confirmation authorization, exact prompt text, freshness and one-time nonce, and the binding between the prompt and the exact Constitution revision/scope.
5. A canonical state owner, distinct from the untrusted client and verifier, atomically activates exactly that revision and scope. All writes, restores, recovery, amendment and activation paths must use the same authority rules.
6. The actual final protected sink independently rejects unrecognized, stale, replayed, revoked, mismatched or unverifiable approvals. Direct bypass and crash/recovery cases are adversarially tested.
7. Raw evidence is retained for the exact device, verifier policy, content revision, nonce consumption and state transition; no evidence is fabricated during research.

## What this does and does not solve
It improves the specification of a possible human confirmation path and exposes an important requirement: off-device verification. It does not identify an already recognized server/verifier for Kevin, prove that the current device supports Protected Confirmation, create the canonical Constitution state owner, or prove final-sink complete mediation. A new server is not automatically independent merely because it is remote; its identity and trust anchor must already be recognized, and its authorization code and deployment must be protected from the candidate it verifies.

## Disposition
- Device support: UNKNOWN / NOT TESTED.
- Independent relying server/verifier: NOT IDENTIFIED / NOT ESTABLISHED.
- Genesis recognition basis: UNKNOWN / NOT ESTABLISHED.
- Canonical active-Constitution state owner: NOT ESTABLISHED.
- Production activation sink and bypass closure: UNKNOWN.
- Commissioning: STOP.
- No production source, test, workflow, APK, key, Constitution artifact, or phone/runtime state changed.