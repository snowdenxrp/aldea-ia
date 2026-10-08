# STEP 7 — Recommended Recognition and Step-Up Model
Date: 2026-10-08
Status: RECOMMENDATION FOR ARCHITECTURAL REVIEW; NOT A FINAL ROOT/CHANNEL SELECTION; NO IMPLEMENTATION AUTHORIZED

## Recommendation
Adopt a layered, risk-adaptive interaction model rather than choosing a single universal recognition method:
1. **Natural recognition** (voice and optional local face/platform signals where available) supports low-friction interaction, not root authority.
2. **A cryptographic authenticator** (preferably device-bound or platform passkey/WebAuthn where its trust boundary and lifecycle are acceptable) is the leading candidate for strong routine step-up; this is a research preference, not a vendor/platform decision.
3. **A memorized password/passphrase or keyword** remains an explicitly bounded fallback, not a universal master key. Spoken secrets are recordable/replayable and must not be labeled replay-resistant.
4. **Action-bound confirmation** for consequential actions must bind the exact action, target, material parameters, context, freshness and current authority/policy epoch, and must be displayed through a verifier/UI whose trust boundary is analyzed.
5. **Root authority, Constitution, credential enrollment/replacement, recovery, delegation and succession** require a distinct high-assurance commissioning/governance ceremony. Everyday recognition cannot authorize these transitions.
6. **Safe failure and recovery**: contradictory or stale evidence, suspected spoof/coercion, uncertain revocation/currentness, compromised verifier/UI, or unknown authority means UNKNOWN/STOP for protected effects; no silent fallback to a weaker channel. Recovery must not silently grant the new device the old authority.
7. **Privacy by design**: prefer local biometric matching that unlocks a credential; do not make centralized raw biometric templates a Core dependency without a separately justified threat/privacy case.
8. **Independence is proven, not counted**: two modalities do not create independent factors if they share a compromised device, OS, provider, enrollment authority, recovery account or control plane.

## Why this is the recommended direction
- It matches Kevin's expressed preference for natural, automatic interaction and additional passwords/keywords/credentials when necessary.
- It separates convenience signals from authority and from consent to a specific action.
- It keeps the design extensible across devices/providers without assuming all platforms expose the same sensors or assurance.
- It is consistent with MASTER's gates, dependency closure and fail-closed UNKNOWN/CONFLICT/UNTRUSTED rule, and AB's separation between requested/observed/enforced STOP and revocation.
- NIST SP 800-63B (SP 800-63-4) provides useful definitions for replay resistance and authentication intent: https://pages.nist.gov/800-63-4/sp800-63b.html
- FIDO/WebAuthn offers a candidate mechanism for phishing-resistant challenge-response and verifier/domain binding when correctly deployed: https://fidoalliance.org/specifications/
- Neither standard establishes Nexo's legitimate genesis root, Constitution authority, succession, cross-device revocation or recovery.

## Risks and limits
- Voice/face recognition can be spoofed or share a compromised capture/OS boundary; it cannot be a sole high-consequence authorization factor.
- A password/passphrase is not replay-resistant and can be phished, copied or coerced. A spoken keyword is not a stronger category merely because it is a keyword.
- Platform authenticators depend on enrollment, verifier, update, synchronization, recovery and portability assumptions; these must be explicit and tested.
- Step-up confirmation is unsafe if malware can replace the action shown to the user or replay approval against a different target.
- Strong authentication does not itself prove current authorization, external effect, or that a STOP/revocation has been enforced across all incarnations.
- Too many prompts degrade usability; too few create authority risk. Policy must be explicit and action-specific, not an opaque global score or model intuition.

## What remains undecided
- Actual genesis/root legitimacy basis and commissioning ceremony.
- Accepted authenticator(s), device/OS/sensor trust boundaries and supported platform profiles.
- Exact action/risk taxonomy and evidence/freshness rules.
- Independent approval UI/channel and how it binds the displayed transaction to the executed transaction.
- Offline revocation/currentness behavior, credential lifecycle, device loss/recovery, portability and provider exit.
- Coercion handling, accessibility alternatives and privacy retention rules.
- No implementation, activation or production security claim is authorized by this recommendation.

## Required adversarial review before implementation
At minimum test:
1. recorded/replayed or synthetic voice; face presentation attack; sensor/OS compromise;
2. spoken keyword replay, passphrase phishing/guessing and fallback downgrade;
3. substitution of target/amount/recipient/parameters between prompt, approval and execution;
4. approval replay, stale epoch, delayed confirmation, duplicate request and cross-device replay;
5. authorization cached before revocation, offline device, missed revocation, restored pre-STOP checkpoint;
6. compromised candidate UI/verifier, shared provider/account/control plane, update compromise;
7. coercion, accessibility fallback, lost/stolen authenticator, recovery-account compromise;
8. provider migration/exit, credential replacement, delegated authority and succession;
9. exact-action confirmation succeeds but external effect is ambiguous; require reconciliation, never infer success;
10. unknown dependency or contradictory evidence: ensure protected action cannot proceed.

## Next exact action
Recover and map the canonical P/P112 material relevant to human binding, credential lifecycle, revocation, recovery and dependency closure; distinguish direct evidence from analogy. Then derive the minimum action-bound confirmation contract and attack it. The genesis legitimacy gap and future-countereffects gate remain blocking. Do not implement until the contract survives review and the evidence layers are reconciled.
