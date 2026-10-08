# STEP 7 — Recognition Design Cross-Check Against MASTER and AB
Date: 2026-10-08
Status: PARTIAL CROSS-CHECK; P/P112 CONVERGENCE NOT YET ESTABLISHED; NO IMPLEMENTATION AUTHORIZED

## Scope
Check the user-approved experience direction (natural recognition plus optional password/passphrase/keyword/credential when needed) against the canonical MASTER and recovered AB invariants. This does not select a trust root or authentication mechanism.

## MASTER constraints recovered
Source: `docs/nexo/NEXO_MASTER_ARCHITECTURE_2026-09-23.md` (branch `ncs-clean-architecture`, blob `78872e9c86bac2738de9ab49f6f3d35a075c8bcf`).
- Authentication/integrity/provenance do not by themselves establish semantic truth.
- Cognition ≠ authority ≠ execution ≠ verification.
- Protected transition requires applicable gates for identity, authority, capability, policy, evidence/trust, freshness, anti-replay, risk/assurance, and dependency closure.
- UNKNOWN/CONFLICT/UNTRUSTED at a critical gate means deny/hold/revalidate/restrict; never permissive fallback.
- Lower-assurance, tainted, stale or unknown evidence cannot elevate itself.
- Independence is claim- and failure-mode-relative; inspect source, verifier, keys, hardware/software, provider, network, operator, control plane and failure domains.
- External data does not create authority; evidence must bind scope, provenance, freshness, independence and verification.
- Stop conditions remain outside the model.

## AB constraints recovered
Source: `docs/nexo/NEXO_GLOBAL_AUDIT_109_STOP_REVOCATION_AUTHORITY_RETENTION_2026-09-28.md` (branch `ncs-clean-architecture`, blob `d12e38511ba2759db61cd81f2242eba5012a82ad`).
- STOP is not merely a message delivered to the model; enforcement and authority revocation must be outside model cooperation.
- STOP requested/observed/enforced are distinct; local enforcement is not external-effect enforcement.
- Revocation issued/observed/enforced everywhere are distinct.
- Authorization cache hit is not current authority; old credential is not current authority.
- A stopped incarnation is not proof that other incarnations stopped; recovery from a pre-STOP checkpoint is not current authorization.
- Consequence for recognition: a successful face/voice/keyword/credential check at one device or time cannot be treated as durable proof of current authority on every device or for later actions. Currentness, scope, revocation, epoch and enforcement remain separate.

## Independent standards cross-check
- NIST SP 800-63B (SP 800-63-4) defines replay resistance and authentication intent; memorized secrets are not replay-resistant by themselves, and a passive face observation may not demonstrate intent. https://pages.nist.gov/800-63-4/sp800-63b.html
- FIDO/WebAuthn challenge-response and verifier/domain binding can reduce phishing risk when correctly deployed. https://fidoalliance.org/specifications/
- These sources support the method-level distinction; they do not decide Nexo's initial legitimate owner binding, Constitution authority, succession, revocation semantics or recovery.

## P/P112 integration status
The targeted GitHub repository searches in this pass did not return P112 artifacts specific to recognition, passphrases, biometric replay or action-bound confirmation. This is a retrieval limitation, **not evidence that P/P112 contains no relevant work**. Do not mark the three-layer integration complete until P112 is recovered from its canonical research index/handoff and cross-checked. If it cannot be located, record the gap and continue without claiming convergence.

## Reconciled candidate invariants
1. Recognition confidence is evidence only; it cannot independently create identity binding, authority, capability or permission.
2. A credential check must be scoped to a subject, authenticator, context, freshness interval and current authority state.
3. Action confirmation must bind exact action, target, material parameters, context and policy/authority epoch; no generic “yes” token may be reinterpreted for another action.
4. The confirmation verifier and UI are part of the trusted boundary. Cryptographic integrity of a prompt/token does not prove that the user saw or understood the intended action.
5. A keyword/passphrase is a memorized secret and, when spoken, travels through a recordable channel; it is not a replay-resistant substitute for challenge-response.
6. Biometric matching should be local to a trusted authenticator where feasible; do not export/store reusable raw biometric templates in Nexo core without a separately justified design.
7. Independent factors/channels count as independent only relative to the attack and their shared enrollment, device, OS, provider, network, update and recovery dependencies.
8. Stale/unknown revocation, conflicting signals, suspected coercion, compromised UI/verifier, or uncertain authority produces UNKNOWN/STOP for protected actions, not silent downgrade.
9. Recovery, enrollment, genesis commissioning, routine recognition, step-up confirmation, credential replacement and succession remain distinct transitions.
10. This UX direction does not resolve the independently recognizable genesis trust basis. Trust Foundation/Constitution Authority Context and activation remain blocked.

## Next exact action
Recover the canonical P/P112 cross-reference for authentication, human binding, confirmation, credential lifecycle, and recovery; then derive and adversarially test the minimum action-bound confirmation contract against MASTER + AB + P/P112. Required attack cases: prompt/target substitution, replay, delayed approval, stale epoch, cached authorization after revocation, shared dependencies, compromised candidate UI/verifier, coerced approval, device loss/recovery, offline revocation, cross-device replay and provider migration. Do not implement until the contract and future-countereffects gate pass.
