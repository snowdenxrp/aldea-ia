# STEP 7 — Exact phone platform assessment: model 2412DPC0AG — 2026-10-09

Status: DEVICE IDENTIFICATION MATCH STRONG; PLATFORM TRUST CAPABILITIES NOT YET VERIFIED; LCORE-1 REMAINS UNKNOWN/STOP.

## 1. User-reported device facts

The user supplied the following text from Settings → About phone / system information. These values are recorded as user-reported, not independently read from the handset:

- Model: 2412DPC0AG
- SoC: MediaTek Dimensity 8400-Ultra, octa-core, up to 3.25 GHz
- Memory display: 8.0 + 8.0 GB
- OS/build string: 3.0.302.0.WOJMIXM.C07
- Android version: 16, build BP2A.250605.031.A3
- Android security update: 2026-08-01
- Baseband: MOLY.NR17.R1.MP5.TC8.PR1.SP.V1.P33
- Kernel: 6.6.118-android15-8-ge56cf6b09cca-ab15511674-4k

No IMEI, serial number, phone number, account credential, PIN, password, recovery secret, biometric data or identity-document image was requested or stored.

## 2. Device-family identification

The combination of the reported Dimensity 8400-Ultra, 3.25 GHz maximum CPU frequency and 8 GB physical-memory class strongly matches the POCO X7 Pro family in Xiaomi's official specifications:
- Xiaomi Mexico product specifications: https://www.mi.com/mx/product/poco-x7-pro/specs/
- Xiaomi Global product specifications: https://www.mi.com/global/product/poco-x7-pro/specs/
- Xiaomi Mexico POCO X7 Pro FAQ, including that the model supports bootloader locking: https://www.mi.com/mx/support/faq/details/KA-909269/

Conclusion: identify this provisionally as a POCO X7 Pro / Xiaomi HyperOS device, with a strong specification match. The precise model-code-to-retail-name mapping for 2412DPC0AG was not independently established from an official page in this review; retain the distinction rather than treating the model-name mapping as cryptographically verified.

Xiaomi's official FAQ says the POCO X7 Pro supports bootloader locking. This establishes that the product family supports a locked-bootloader configuration; it does NOT establish that this particular handset is currently locked, has an intact verified-boot chain, or reports a trusted boot state.

## 3. Memory interpretation

The displayed 8.0 + 8.0 GB must not be recorded as 16 GB of physical RAM. Xiaomi's published X7 Pro configurations include 8 GB and 12 GB RAM variants, and the device UI's second amount is consistent with memory extension/virtual RAM. The exact currently enabled allocation has not been independently tested. For platform inventory, record 8 GB reported physical-memory class plus 8 GB displayed extension, not 16 GB physical RAM.

Official spec: https://www.mi.com/mx/product/poco-x7-pro/specs/

## 4. What the available evidence does and does not establish

### Established to the current evidence level
- User-reported exact build/version and security-update date.
- Strong product-family match from the SoC/clock/RAM facts against Xiaomi's official POCO X7 Pro specification.
- Manufacturer documentation says this family supports bootloader locking.
- Android defines a standard mechanism for key attestation to report deviceLocked, verifiedBootState, verifiedBootKey, and related root-of-trust fields.

Android reference: https://source.android.com/docs/security/features/keystore/attestation?hl=es-419

### Still UNKNOWN
- Whether this specific phone's bootloader is locked right now.
- Actual verified-boot state and whether its chain is rooted in the factory trust key.
- Whether this build exposes hardware-backed key attestation and whether the attestation chain is independently verifiable.
- Whether key material is backed by a TEE or StrongBox; do not infer either from the SoC or Android version.
- Secure-element properties, rollback resistance, bootloader-unlock history, firmware integrity, device compromise status, and relevant hardware/software dependency closure.
- Offline revocation/currentness guarantees.
- Whether any local Core boundary can prevent bypass by the device owner, OS, privileged software, recovery environment, vendor services, or physical access.
- Independent Genesis recognition, exact owner-to-ceremony/content/scope binding, and independently governed recovery/replacement.

Android's documentation describes how to interpret attestation evidence; it does not establish that this POCO build supports every field or that any attestation has actually been obtained or verified. No attestation was requested or run in this step.

## 5. Security and project decision

The phone is adequate as the currently available development device for repository review, documentation and ordinary app development, subject to tool limits. Its performance does not make it a proven Genesis trust root.

No developer options, USB debugging, bootloader unlocking, rooting, flashing, credential enrollment, key creation, Genesis commissioning, protected-Core deployment, or activation was authorized or performed.

Do not use the reported Android security patch date as proof that every component is current, nor infer a security guarantee from the kernel version suffix. The exact build's currentness and vendor security properties need evidence scoped to the actual claim.

No root family or physical trust anchor is selected. Path A remains NOT ACCEPTED; Path B remains NOT ESTABLISHED; Path C (remain uncommissioned UNKNOWN/STOP) remains valid. LCORE-1 remains UNKNOWN/STOP.

## 6. Next bounded action

Do not change device settings or install diagnostic apps yet. First check official vendor documentation and Android's compatibility/security requirements for the exact POCO X7 Pro family/build, looking specifically for publicly documented hardware-backed key attestation, TEE/StrongBox availability, verified boot, rollback protection, and security-update support. Separate published capability from handset-observed evidence and independent validation.

If public documentation cannot settle a claim, mark it UNKNOWN rather than escalating to a sensitive device experiment. Any later read-only diagnostic must have a narrowly stated purpose, avoid collecting identifiers/secrets, and must not enroll credentials or commission Nexo.

This assessment is research/design evidence only. It does not satisfy any of the six LCORE-1 blocking premises and does not authorize implementation of the Constitution Authority Context.

## 7. Additional official-source cross-check: Android 16 and Xiaomi update policy

Android 16's Compatibility Definition Document specifies Verified Boot requirements for compatible implementations, including verification on every boot, a chain beginning at an immutable hardware root of trust, and tamper-evident bootloader-unlock state. It also specifies hardware-protected key attestation under the secure-lock-screen requirements, but notes an exemption for devices launched on an earlier Android version that are later upgraded (with a stated fingerprint-feature exception). Therefore, the phone's reported Android 16 version alone does not establish which exact launch-time requirements applied to this product or prove that the handset's implementation passes them.

Official reference: https://source.android.com/docs/compatibility/16/android-16-cdd?hl=en

The CDD's general Verified Boot requirements are evidence of what a compatible implementation is expected to provide, not device-specific test evidence. They do not tell us the current bootloader state, actual verifiedBootState, the device's verifiedBootKey, whether its current build has been modified, or whether an independently verified attestation chain is available.

Xiaomi's security-update policy says it generally maintains security updates for at least two years after first shipment, sometimes three years or longer, and that delivery timing can vary by region/model. This general policy is not a model-specific end-of-support date and does not verify the status of this exact build. The user-reported patch date 2026-08-01 is recorded as such; it is not independently validated as current for this SKU/region/build.

Official reference: https://trust.mi.com/misrc/updates/phone?tab=aerdata

### Result of this cross-check

- 🔵 Documented platform expectation: Verified Boot is a core Android compatibility requirement; secure-lock-screen implementations have specified isolated-environment and key-attestation requirements, subject to the CDD's launch-version conditions.
- 🔴 Not established for this exact handset/build: successful compliance testing, current boot state, hardware-backed attestation availability/chain validity, TEE/StrongBox identity, rollback-resistance configuration, model-specific security-update end date, or independent security validation.
- StrongBox is not inferred. The Android CDD distinguishes a dedicated StrongBox secure processor from the broader isolated execution environment; no official POCO X7 Pro evidence located in this review establishes StrongBox support on this build.
- No diagnostic application, developer setting, debugging mode, security configuration change, key generation, attestation request, or sensitive device experiment was performed.

The next valid step is to preserve the boundary between specification and observation. Do not escalate into a sensitive on-device test merely to eliminate UNKNOWN. If a later claim genuinely requires device-observed evidence, first specify the exact claim, threat model, data exposure, independent verifier, and non-destructive test plan.
