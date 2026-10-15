# STEP 7 — Android confirmation assurance reassessment

Date: 2026-10-15  
Branch: `ncs-clean-architecture`  
Status: RESEARCH / NO DEVICE TEST / NO IMPLEMENTATION / OWNER DECISION NOT REQUESTED

## 1. Trigger and correction

The prior research documented Android Protected Confirmation as an unselected candidate. A subsequent check of current official Android documentation and AOSP source found an important qualification: the AOSP interface is marked deprecated because adoption was low and few devices support it. This changes its priority, not the cryptographic properties it was designed to provide.

Sources:
- Android Developers, Protected Confirmation: https://developer.android.com/privacy-and-security/security-android-protected-confirmation
- AOSP Protected Confirmation overview: https://source.android.com/docs/security/features/protected-confirmation
- AOSP framework interface marking it deprecated: https://android.googlesource.com/platform/prebuilts/fullsdk/sources/%2B/refs/heads/androidx-constraintlayout-release/android-35/android/security/apc/IProtectedConfirmation.java
- Android Keystore: https://developer.android.com/privacy-and-security/keystore
- Android key attestation: https://developer.android.com/privacy-and-security/security-key-attestation
- Android Key Attestation Verifier project: https://github.com/android/keyattestation

## 2. Reassessment of the three distinct properties

### Property P1 — User authenticates to the device

Android BiometricPrompt / device credential can authenticate a user to Android. A Keystore key can be configured to require authentication for every cryptographic operation. That proves an authentication condition was satisfied according to the device's security model.

It does **not** prove the user saw the exact bytes being signed, reviewed a complete Constitution, intended a constitutional ratification, or authorized a particular Nexo effect. A compromised/malicious application can potentially request an authentication-bound signing operation for its own message; the biometric dialog is not a trusted transaction display.

Official source: Android Keystore, section "Require user authentication for key use".

### Property P2 — Key material is protected and key properties are attested

Android Keystore can make key material non-exportable and may bind it to a TEE or StrongBox. Key attestation can provide evidence about the key and security level, but a relying verifier must validate the chain, trust anchor and revocation state. Android explicitly recommends sending the chain to another trusted server/device for validation rather than validating it on the potentially compromised source device.

This can support key custody and device-state claims under a defined policy. It does not establish the constitutional legitimacy of the person initially enrolled, the meaning of the signed content, currentness/revocation of Nexo authority, or final effect enforcement.

Official sources: Android Keystore; Android key attestation; Android Key Attestation Verifier.

### Property P3 — The human saw and confirmed the exact transaction/content

Android Protected Confirmation was specifically designed to provide a hardware-backed trusted UI for a short prompt and a signed confirmation response on supported devices. However:
- AOSP now marks the API deprecated due to low adoption and lack of supporting devices.
- Hardware support must be checked; Android API level alone does not imply availability.
- Only the visible prompt text is confirmed; `extraData` is not rendered and cannot be treated as human-reviewed content.
- A relying party must verify the signed response, key attestation, confirmation-required property, exact prompt text, and a fresh nonce/replay state.

Sources: Android Protected Confirmation docs and API reference; AOSP deprecation note.

Ordinary BiometricPrompt + authentication-bound Keystore keys is **not an equivalent replacement for P3**. It can gate key use on authentication but does not provide the same trusted display/input binding to the specific message.

## 3. Claim-relative option table

| Mechanism | P1: user authenticated | P2: key custody/attestation | P3: exact content confirmed in trusted UI | Current Nexo disposition |
|---|---|---|---|---|
| Ordinary app button/password | App-level signal only | No inherent guarantee | No | Insufficient for high-assurance owner intent |
| BiometricPrompt + per-operation Keystore key | Potentially yes, under device assumptions | Potentially yes; hardware level must be verified | No equivalent content binding | Could protect later key use, not solve review ceremony |
| Android Protected Confirmation | High-confidence confirmation of short visible prompt on supported devices | Can bind response to a confirmation-required key | Designed for this property, but support/deprecation risk | Research-only, not primary path |
| YubiKey PIV/FIDO alone | Depends on protocol | Can protect key material / authenticate a relying party | No trusted display of arbitrary Constitution content on the key itself | Cannot solve content presentation by itself |
| Separate signer with its own trusted display and independently verified response | Potentially, depending on design | Potentially | Possible in principle | Unspecified; would require a complete threat model and verified device/protocol, not assumed available |

## 4. The remaining architectural problem

The missing element is not merely a key or a biometric. It is an end-to-end binding among:

1. **Reviewed object** — exact, complete candidate content and scope.
2. **Human decision** — explicit decision type with a narrow, truthful meaning (review acknowledgement vs constitutional ratification).
3. **Evidence** — signed record binding decision, candidate identity, freshness/challenge, and signer identity.
4. **Verifier** — a component outside the untrusted record producer that validates the signature, key/attestation provenance, challenge freshness, policy and revocation.
5. **State owner** — a defined place that stores/reports the non-authoritative Scope A record with honest corruption, conflict, rollback and uncertain-commit semantics.
6. **Effect boundary** — a separately demonstrated final sink that requires recognized current authority before any protected effect; Scope A evidence must not itself authorize effects.

No selected option presently closes this entire chain. These are separate gates, not features that can be combined by assumption.

## 5. Recommended disposition and next investigation

1. Downgrade Android Protected Confirmation from a prospective lead to an optional capability only if actual target support and lifecycle viability are demonstrated. Do not build around it.
2. Do not claim BiometricPrompt + Keystore as an equivalent substitute; it lacks trusted confirmation of the signed message.
3. Do not test/install an APK just to query support yet: the project has no selected Android Core host and no implemented confirmation protocol, so such a result would answer only one hardware-capability question while leaving the architecture unchanged.
4. The next high-value design task is to specify the minimum acceptance contract for the reviewed-object / owner-decision / verifier chain and identify whether any existing trust domain can satisfy it without self-verification. If none can, report that no viable bootstrap path is currently evidenced and keep STOP rather than inventing a signer, service, server, or trust root.
5. Keep Scope A strictly non-authoritative; do not connect it to mission planning, `executeAction()`, protected transitions, or external effects.

## 6. Non-actions and status

No device support check was performed. No app, key, attestation, signature, digest, Constitution freeze, owner review/ratification event, verifier, host, persistence owner, code, test, dependency, APK or deployment was created or changed.

**STEP 7 remains OPEN / STOP / UNKNOWN. No commissioning and no protected effects.**
