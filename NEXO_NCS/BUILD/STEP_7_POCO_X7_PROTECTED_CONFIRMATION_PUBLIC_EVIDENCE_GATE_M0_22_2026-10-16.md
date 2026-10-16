# STEP 7 — POCO X7 Pro Protected Confirmation Support: Public-Evidence Gate (M0.22)

Date: 2026-10-16  
Branch: `ncs-clean-architecture`  
Status: PUBLIC-SOURCE REVIEW ONLY / DEVICE CAPABILITY UNKNOWN / NO DEVICE TEST  
STEP 7: OPEN / STOP / UNKNOWN. Direction B / L2 remains the objective.

## Question

Can authoritative public vendor/platform documentation establish that the user's POCO X7 Pro (model 2412DPC0AG / codename rodin, Android 16) implements Android Protected Confirmation, without installing an app or operating the device?

## Evidence examined

1. **Android API reference — `ConfirmationPrompt`**  
   https://developer.android.com/reference/android/security/ConfirmationPrompt  
   It explicitly defines `isSupported(context)` as the runtime capability check and says dedicated hardware support is required and may not be available. It also warns that presentation can still fail even when the predicate returns true, including when accessibility services are active. Therefore Android API level or OS version alone is not a support proof.

2. **Android developer guidance — Protected Confirmation**  
   https://developer.android.com/privacy-and-security/security-android-protected-confirmation  
   The relying party must check the signature and attestation chain, the `TRUSTED_CONFIRMATION_REQUIRED` flag, nonce/extraData freshness, and exact `promptText`. The documentation states only `promptText` was actually confirmed; extraData is not rendered. The flow therefore cannot treat an opaque digest or hidden extraData as proof the user reviewed the underlying Constitution.

3. **Android Open Source Project implementation guide**  
   https://source.android.com/docs/security/features/protected-confirmation  
   The capability uses a hardware-protected Trusted UI and KeyMint support in the TEE. It is available only on supported devices, even though the feature is defined for Android 9+.

4. **POCO/Xiaomi official product FAQ**  
   https://www.mi.com/mx/support/faq/details/KA-909269/  
   The public FAQ identifies the product and SoC but the reviewed material does not state support for Android Protected Confirmation, `ConfirmationUI`, `TRUSTED_CONFIRMATION_REQUIRED`, or `ConfirmationPrompt.isSupported()`. Absence from a product FAQ is not evidence the capability is absent; it leaves the claim unestablished.

## Result

**UNKNOWN — no authoritative public evidence found that establishes POCO X7 Pro Protected Confirmation support.** This is not a negative finding that the device lacks the feature. The documented runtime predicate is the direct capability test; a positive result would still need a separate end-to-end confirmation/attestation verification exercise before any trust claim could be made.

No test app, APK, key, attestation challenge, prompt, signature, or device-side command was run. No user authorization for device testing is inferred from “continúa.” This review therefore does not cross into device operation.

## Architecture implications

- Android 16, verified boot green, SoC family, ordinary hardware-backed key attestation, and a third-party device list are not substitutes for the runtime Protected Confirmation capability check.
- If a later bounded test is explicitly authorized, its first claim must be only `ConfirmationPrompt.isSupported(context)` for the actual installed build and relevant conditions. A `true` value is a capability indicator, not proof of correct attestation, prompt binding, Constitution review, Genesis legitimacy, currentness, or final-effect enforcement.
- If false, unavailable, or inconclusive, record unsupported/UNKNOWN for this path and do not silently substitute a normal Android dialog, biometric prompt, or generic hardware key as an equivalent trust property.
- Even if the feature is supported, the short prompt is not the full Constitution. The architecture still needs a canonical human-comprehensible scope representation and an independently justified relying party/verifier; the Constitution and scope must not be approved merely because a digest was signed.
- No fallback to L1 is authorized. No device/key/host/verifier/recognition mechanism has been selected.

## Next exact action

The public-source path has reached its limit for device capability. Do not repeat broad searches or infer support. The only direct way to settle this narrow fact is an explicitly authorized, minimal capability test on the actual device, followed separately by a review of what attestation evidence can be independently verified. Do not generate/enroll a signing key or bind any approval to the test. If the user does not authorize that device test, retain UNKNOWN and continue work on the independent canonical-scope/verifier requirements that do not depend on this feature.

No code, tests, CI workflows, APKs, keys, Constitution, authority context, or protected effects were changed or created.

STEP 7 = OPEN / STOP / UNKNOWN.  
Constitution = DRAFT / NOT FROZEN / NOT COMMISSIONED.  
Protected effects = STOP.
