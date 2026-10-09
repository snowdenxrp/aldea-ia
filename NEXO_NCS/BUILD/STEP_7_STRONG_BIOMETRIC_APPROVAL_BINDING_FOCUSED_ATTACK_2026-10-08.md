# NEXO NCS — Focused Attack on Strong Biometric Approval Binding
Date: 2026-10-08
Status: DESIGN REVIEW ONLY — NO IMPLEMENTATION

## Scope
Attack only the prioritized candidate: fresh Android app-level BIOMETRIC_STRONG authentication, preferably fingerprint when the actual device exposes it at Class 3 strength, paired with an authentication-per-use protected cryptographic operation. This does not reopen broad device research or select a genesis root.

## Candidate claim under attack
“Kevin approved this exact commissioning/constitutional action now.”

A biometric success alone proves only that the platform accepted an enrolled authenticator under its policy. It does not by itself prove the action shown was the action signed, that the enrolled biometric belongs to Kevin rather than another enrolled person, that the app/OS is uncompromised, or that protected Core enforces the result.

## Attack cases and required disposition

1. **Ordinary screen unlock reused as approval**
   - Attack: a phone was unlocked earlier, then a different or malicious action is presented.
   - Required: reject screen-unlocked state as approval. Require fresh operation-level authentication for the exact action.

2. **Challenge/action substitution**
   - Attack: authenticate one benign string, then submit a different Constitution, commissioning context, or command.
   - Required: cryptographic operation must cover a canonical, unambiguous representation of action + Constitution identity/version/hash + commissioning context + fresh challenge + intended scope. Any mismatch => INVALID; absent canonicalization/binding => UNKNOWN/STOP.

3. **Replay**
   - Attack: reuse an old proof for a later commissioning attempt or a different device/session.
   - Required: challenge freshness and one-time consumption must be defined by a protected verifier. If no trustworthy freshness/consumption authority exists, replay resistance is not established; do not claim success.

4. **Weak face or class ambiguity**
   - Attack: a modality called “face unlock” is accepted despite not supporting operation-bound keys at Class 3.
   - Required: check the platform's declared authenticator class and the actual key properties, not the modality label. If only Class 2/1 is available for the needed path, STOP; no downgrade.

5. **Silent credential fallback**
   - Attack: PIN/pattern/password is accepted but recorded as if fingerprint biometric succeeded.
   - Required: the candidate contract must name the accepted authenticator type and verify the returned authentication type where supported. For this first candidate, device-credential fallback is not silently equivalent; any fallback needs a separate explicit policy decision.

6. **Biometric enrollment changes / key invalidation**
   - Attack: a new fingerprint/face is enrolled, the device is restored, or the key becomes invalid, but old approval authority remains active.
   - Required: define invalidation/re-enrollment and explicit re-establishment behavior. Unknown lifecycle state => UNKNOWN/STOP. Do not silently recreate a key with the same authority.

7. **Multiple enrolled biometrics**
   - Attack: another person whose biometric is enrolled on the device authorizes an action.
   - Required: platform authentication generally proves an enrolled authenticator, not a unique civil identity or which human the owner intended. The deployment assumption must account for who can enroll biometrics. If that cannot be governed/evidenced, the claim “Kevin specifically approved” is not established.

8. **Compromised presentation or app**
   - Attack: overlay/malware manipulates the action displayed or the app routes the biometric result to another action.
   - Required: exact action binding helps against substitution but does not prove a trustworthy display or uncompromised OS. Presentation integrity and verifier enforcement remain separate, unresolved trust requirements.

9. **Compromised OS / key isolation overclaim**
   - Attack: architecture assumes all devices implement secure hardware-backed isolation identically.
   - Required: establish the actual device's relevant properties and hardware-backed key attestation if required by the chosen threat model. Without verifiable evidence, classify the property UNKNOWN. Do not infer it from Android brand/version alone.

10. **Core trusts app self-report**
    - Attack: the app sends a boolean such as biometricSuccess=true or a self-asserted “protected” source.
    - Required: protected Core must verify evidence through an independently justified path. An app flag or its own signature does not manufacture genesis authority. This is the current architectural blocker.

11. **Proof valid, authority stale or revoked**
    - Attack: a technically valid biometric proof remains accepted after channel revocation, recovery, policy change, or commissioning cancellation.
    - Required: define currentness, revocation, recovery, and policy epoch/fencing under an established protected authority. Until then, proof does not establish current authority.

12. **Biometric success treated as enforcement**
    - Attack: successful authentication is mistaken for proof that every privileged writer/effect path is gated.
    - Required: separate authorization evidence from enforcement evidence. Missing path coverage or bypass evidence => UNKNOWN/STOP.

## Result
The candidate can improve local human re-authentication, but it cannot solve the root problem alone. Its viable narrow claim is conditional on a justified prior enrollment, trustworthy exact-action presentation/binding, freshness and lifecycle governance, and a protected verifier/enforcement path. Those prerequisites are not currently demonstrated by the repository.

## Decision
- Candidate remains prioritized for design evaluation only.
- Fingerprint is preferred only if the actual authenticator is Class 3 / BIOMETRIC_STRONG and the operation-bound key path is supported; otherwise stop rather than downgrade.
- Strong face may be considered later under the same measured requirements; modality label alone is not a security property.
- No implementation, key generation, enrollment, ceremony, activation, production effect, or new generic trust layer is authorized.
- Genesis Trust Foundation and Constitution Authority Context remain BLOCKED/UNKNOWN. The next meaningful prerequisite is not more biometric edge cases: it is the already identified independently justified establishment/verifier basis that lets protected Core trust and enforce the exact bound claim.
