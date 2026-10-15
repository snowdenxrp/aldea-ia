# STEP 7 — Android Protected Confirmation candidate research

Date: 2026-10-15  
Branch: `ncs-clean-architecture`  
Status: RESEARCH ONLY / CANDIDATE NOT SELECTED / NO DEVICE TEST OR IMPLEMENTATION

## 1. Why this was investigated

The current Scope A host threat-model decision is still open: is a self-reported local review record acceptable only as a convenience, or must the owner-intent event have a stronger independent presentation/confirmation path?

Existing research already ruled out treating a normal Android app, Android Keystore alone, Termux, Javet permissions, a second phone, or a YubiKey alone as the complete bootstrap solution. This targeted research checks one distinct Android capability not previously documented in the current STEP 7 chain: **Android Protected Confirmation**.

This is not a fresh broad host survey and does not reopen closed source/persistence audits.

## 2. Official platform evidence

Android's official developer documentation states that, on *supported* devices running Android 9/API 28 or newer, Protected Confirmation can display a short statement in a hardware-protected Trusted UI and produce a signed confirmation response. The relevant API is `android.security.ConfirmationPrompt`; `ConfirmationPrompt.isSupported(context)` reports whether the device supports the feature. Android explicitly says support is hardware-dependent and may not be available on every device.

Sources:
- Android Developers, Protected Confirmation: https://developer.android.com/privacy-and-security/security-android-protected-confirmation
- Android API reference, `ConfirmationPrompt`: https://developer.android.com/reference/android/security/ConfirmationPrompt
- AOSP implementation and threat considerations: https://source.android.com/docs/security/features/protected-confirmation/implementation
- AOSP feature overview: https://source.android.com/docs/security/features/protected-confirmation

The official implementation guidance says the Trusted UI is designed to protect the prompt's display/input integrity even if the Android kernel is compromised, but only when the device's relevant firmware/display/input components satisfy the required conditions. If the prompt cannot be securely presented, no confirmation token should be issued. The implementation guidance also requires the message to be shown in full; the body has a 6144-byte hard limit and a stricter screen-fit constraint.

## 3. What this could improve for Nexo

A future, bounded Scope A ceremony could potentially use a protected prompt for a short statement such as: the owner is acknowledging a review event for one specifically identified draft candidate, for review-record purposes only, not ratifying the Constitution, not establishing current authority, and not authorizing missions or effects.

If correctly implemented and supported, the hardware-protected prompt could improve confidence that the owner saw and approved that *short prompt text*, even if Android's ordinary framework/kernel were compromised. A key configured to require Protected Confirmation can sign the confirmation response. This is a materially different property from an ordinary app button or a generic biometric prompt.

This is a candidate for human-intent binding, not a root of constitutional legitimacy.

## 4. Critical limits — no claim inflation

1. **It does not display the full Constitution by itself.** The constitutional draft is much longer than a short transaction prompt and remains a mutable, non-canonical draft. Protected Confirmation must not be used as a substitute for reading the complete candidate.
2. **Only the prompt text is confirmed.** Android's documentation explicitly warns that extra data is not rendered to the user. A digest, candidate identifier or scope placed only in extra data must not be described as something the owner saw or approved. Any content/scope binding must be represented and verified correctly in the confirmed prompt text and the signed response.
3. **A hash does not prove the human reviewed matching content.** The exact candidate locator, displayed content and approval meaning must still be reconciled. A prompt that merely says “Approve” or displays an opaque value the owner cannot relate to the reviewed candidate is insufficient.
4. **A relying-party/verifier path is still required.** The documented secure workflow requires signature and attestation-chain verification, confirmation-required key properties, and replay/new-request checks. If the same untrusted app both generates and accepts its own result without a justified verifier, this does not establish independent verification.
5. **It does not establish initial constitutional legitimacy or currentness.** It cannot choose the legitimate Genesis basis, canonical Constitution branch, revocation/recovery/succession rules, or the final protected-effect sink.
6. **Device support is unknown.** Android 16/API 36 alone does not prove the POCO X7 Pro exposes Protected Confirmation. No authoritative per-device support evidence was found in this bounded search. The API can report support at runtime, but this repository has no Android Core host that currently calls it.
7. **No permission to build or install is inferred.** No diagnostic APK/app, key, attestation, signature, digest, device change or test was created or performed.

## 5. Claim-relative disposition

| Claim | Potential contribution | Still not established |
|---|---|---|
| Owner saw/approved a short, explicit review statement | Potentially stronger than an ordinary app prompt if the device feature is supported and correctly implemented | That the prompt corresponds to the complete candidate actually reviewed, unless the binding is designed and checked |
| Key custody/signing | Hardware-backed confirmation-required key may bind a signature to the confirmed response | Legitimate initial key enrollment, verifier trust, constitutional authority or currentness |
| Scope A local review record | Possible component of a narrowly bounded ceremony | Actual local persistence owner, truthful read/write behavior, replay/rollback semantics, and no-effect call graph |
| Constitution Authority Context (Scope B) | No direct authority by itself | Genesis legitimacy, canonical currentness, revocation/recovery/succession and protected enforcement |
| Mission/protected effect (Scope C) | No direct authorization | Actual final sink, current authority, bypass closure and runtime evidence |

## 6. Recommended next gate

Carry Android Protected Confirmation as an **unselected candidate** for the narrow owner-intent portion of Scope A. Do not select Javet or another runtime on the strength of this finding.

Before any implementation or device test, the design must specify:
- the exact short statement and its non-authoritative meaning;
- how the complete candidate review is bound to the candidate locator and scope;
- how the signed confirmation response and attestation are verified outside any component that could simply self-assert success;
- nonce/replay and candidate-substitution handling;
- the outcome if the feature is unsupported, interrupted, unavailable due to accessibility services, or the prompt does not fit;
- the local record's actual host/write owner and its no-effect boundary.

If support or independent verification cannot be established, the assurance claim must be reduced explicitly to a self-reported convenience record or remain UNKNOWN/STOP. Do not silently fall back to an ordinary prompt while claiming Protected Confirmation assurance.

## 7. Non-actions and status

No device support was assumed; no feature check was run. No key, signature, digest, review event, canonical Constitution, verifier, Android runtime, APK, code, test, dependency, device configuration, deployment or protected effect was changed or created.

**STEP 7 remains OPEN / STOP / UNKNOWN. No commissioning and no protected effects.**
