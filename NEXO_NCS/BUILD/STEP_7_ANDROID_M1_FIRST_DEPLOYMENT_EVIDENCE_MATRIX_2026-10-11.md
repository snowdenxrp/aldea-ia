# STEP 7 — First Deployment Evidence Matrix: Android / M1 — 2026-10-11

Status: deployment fact inventory only. This is not a device security audit, root selection, or commissioning authorization.

## Why this record exists
Fill the STEP 7 commissioning failure-claim inventory with facts already reported for the first practical Nexo/M1 deployment, while strictly separating user-reported facts from independently verified properties and unknowns. M1 is a prototype application/model path; its success, package identity or signing key does not by itself establish Nexo constitutional authority.

## Known deployment facts — USER-REPORTED, NOT INDEPENDENTLY ATTESTED
- Target is the user's POCO Android phone.
- The currently accepted primary M1 package is `org.nexo.m1.safetest18`, version `0.2.6-safe-test18`.
- The original GGUF model file is still in phone Downloads; prior conversation reported successful local model import/response, but this does not prove any trust-root property.
- Termux is installed from F-Droid. Java 17 and `keytool` are reported available.
- A JKS file was created at `/data/data/com.termux/files/home/.nexo-m1-signing/nexo-m1-release.jks`, alias `nexo-m1`, with a reported SHA-256 certificate fingerprint `3C:F0:EC:21:1E:A0:CE:C5:95:CE:DD:AB:F3:2E`? **Do not use this fingerprint for trust decisions:** the prior conversation's recorded fingerprint is `3C:F0:EC:21:1E:A0:CE:C5:95:CE:DD:BC:4E:C6:D3:18:04:E6:F7:48:90:74:9F:4E:2A:CD:A3:0E:DD:AB:F3:2E`; preserve this exact value and verify against the keystore when needed.
- The JKS backup was copied to `Download/Nexo-Backup`.
- Earlier M1 builds had package/signature conflicts. A persistent signing key was introduced to stabilize future APK updates; installed APK signature match was not independently verified in the available record.
- No documented read-back currently proves the phone's exact model/product code, Android build/security patch, bootloader lock and verified-boot state, KeyMint/Keystore security level, StrongBox support, hardware key attestation support/result, or the integrity of any external attestation verifier.

## Critical classification
| Item | What current evidence supports | What it does NOT support |
|---|---|---|
| M1 package/version | Identification of the intended app artifact as reported | Nexo's constitutional identity, authority, or trusted execution |
| Local GGUF model | Local inference path was reported working in prior conversation | Policy authority, independent verification, protected effects, or model truth |
| Termux Java/keytool | Ability to manage Java tooling and a JKS file in Termux | A hardware-protected root, verified boot, or isolated enforcement |
| JKS private key and backup | APK-signing continuity, if installed-signature matching is later verified | Owner constitutional authority; it is a file-backed signing credential, not proof of Android Keystore/TEE/StrongBox protection |
| APK certificate/fingerprint | Artifact/signing-key identity, once independently checked against the actual APK and keystore | Legitimacy/currentness of a Constitution or global revocation/enforcement |
| POCO/Android platform | A plausible platform-integrity component to investigate | Any specific hardware-backed capability until exact device state and evidence are read back |

## Platform security claims that must remain separate
Official Android documentation explains that hardware-backed key attestation can report key security level and verified-boot properties, but these claims require actual attestation evidence and a trustworthy verifier. A local app's own unverified statement about its security state is not independent evidence. Even a valid hardware attestation establishes only its defined technical properties; it does not make a Constitution legitimate or authorize a protected action.

Official references:
- Android Open Source Project, Key and ID attestation: https://source.android.com/docs/security/features/keystore/attestation
- Android Developers, Android Keystore system: https://developer.android.com/privacy-and-security/keystore
- Android Open Source Project, Hardware-backed Keystore: https://source.android.com/docs/security/features/keystore

## Deployment claim inventory
| Claim | Current state | Evidence needed before claiming it |
|---|---|---|
| Exact handset identity/model and OS build | UNKNOWN beyond user-reported POCO / Android | Read-only device build properties captured from the device, with date and provenance |
| Bootloader locked and Verified Boot state | UNKNOWN | Device-specific, independently validated boot/attestation evidence; do not infer from Settings labels alone |
| Hardware-backed key generation available | UNKNOWN | Actual key security level / attestation chain validated against a known trust anchor |
| M1 signing key is persistent and matches installed package | PARTIALLY REPORTED; NOT INDEPENDENTLY REVERIFIED HERE | Compare keystore certificate, APK signer certificate, installed package/version and SHA-256 digests; this remains app supply-chain evidence only |
| Owner authorization can be presented and bound to exact Constitution | NOT IMPLEMENTED / UNKNOWN | A commissioning contract and trusted presentation/commit mechanism with replay/substitution tests |
| Currentness/revocation while offline | UNKNOWN | Explicit offline bounds and recovery/revocation design under the declared deployment model |
| Final protected-effect boundary | NOT DEMONSTRATED | Identify the last effect-capable component and prove uncommissioned or revoked authority cannot cross it |
| Failure-domain independence | UNKNOWN | Component/dependency map for UI, OS, signing key, verifier, storage, updates, recovery and effect boundary |

## Guardrails for the next step
1. Do not use the M1 APK signing JKS as the Genesis root or as proof of Kevin's constitutional authority.
2. Do not assume the POCO supports StrongBox, hardware attestation, or a particular verified-boot state.
3. Do not add network/cloud/provider dependency merely to avoid local uncertainty; any external authority candidate needs an explicit governance and dependency analysis.
4. Do not install another M1 APK or alter the current signing arrangement as part of this architecture audit.
5. Do not require the user to perform a device command until the command's claim, expected output and safe interpretation are specified.
6. Keep commissioning blocked until the deployment-specific independent recognition basis and final enforcement boundary are established.

## Disposition
This matrix narrows the first-deployment context but does not resolve the STEP 7 root/enforcement gap. **STEP 7 remains OPEN; CORE TRUST / POLICY AUTHORITY BOOTSTRAP remains STOP / UNKNOWN.** No root, verifier, commissioning ceremony, or protected activation is selected or implemented.
