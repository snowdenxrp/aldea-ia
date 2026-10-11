# STEP 7 — Minimal Read-Only Android Evidence Collection Contract — 2026-10-11

Status: collection plan only. No command has been run by this document, no APK is requested, and no device property is accepted as independent attestation.

## Objective
Resolve only the device/platform facts that materially affect the commissioning deployment inventory. This is not a device audit and cannot establish constitutional authority. Use the existing Termux environment; do not install a new M1 build, modify signing keys, unlock the bootloader, change security settings, or enable new services as part of collection.

## Stage A — Read-only environment and build inventory
When requested, capture the following from Termux and preserve the raw output with date/time and the exact command. These are local observations, not independently trusted measurements.

```sh
date -Iseconds
termux-info
getprop ro.product.manufacturer
getprop ro.product.model
getprop ro.product.device
getprop ro.build.fingerprint
getprop ro.build.version.release
getprop ro.build.version.sdk
getprop ro.build.version.security_patch
getprop ro.boot.verifiedbootstate
getprop ro.boot.flash.locked
getprop ro.boot.vbmeta.device_state
getprop ro.boot.veritymode
```

Interpretation rules:
- Empty, unsupported or inconsistent properties remain UNKNOWN; do not infer a favorable state.
- `ro.boot.*` values are reported through the running Android environment. By themselves, they are not independent proof against a compromised OS/kernel or spoofed property source.
- A model/product string identifies what the software reports, not a unique hardware identity.
- `termux-info` helps identify the Termux package/environment, not the security state of Android's hardware root.
- Do not run `su`, root-only commands, destructive commands, unlock/flash operations, package installs, or commands that write to signing/model files.

## Stage B — Existing M1 signing continuity (only if needed for APK updates)
No action required for STEP 7 commissioning now. If app update integrity becomes the specific question later, read-only verification must compare:
1. the public certificate from the recorded JKS alias;
2. the signer certificate of the actual installed/target APK;
3. package name/version and APK SHA-256;
4. the installed package's signing identity where the Android tooling exposes it.

This proves only artifact/signing continuity to the extent the evidence chain supports it. It does not prove constitutional authority. Do not display, export, paste or commit the private key/password. The existing JKS and backup must not be repurposed as Genesis root.

## Stage C — Hardware-backed key attestation (separate future gate)
Do not treat Stage A as attestation. A genuine Android key-attestation claim requires:
- an attestation record produced through the platform's key-attestation API for a freshly generated challenge-bound key;
- inspection of the attestation certificate chain and security-level/RootOfTrust fields;
- validation of that chain against the applicable trusted attestation root and current revocation/status information using a verifier whose own integrity is justified;
- documented support and dependency/failure assumptions for this exact device.

The user's current Termux `keytool`/JKS report does not establish any of these. Do not create/install a new APK solely to obtain attestation until the expected claim and trusted verification path are designed. If no independently trustworthy verifier/basis is available, mark attestation UNKNOWN rather than accepting the phone's self-report.

## Why even valid attestation is insufficient
Android key attestation can support bounded technical claims about key protection and boot state. It cannot establish that Kevin's Constitution is legitimate, that an approval was informed and bound to exact content, that revocation is current, or that the final protected-effect boundary enforces the result. Those remain separate STEP 7 claims.

## Output format after collection
Preserve:
- exact commands and raw outputs;
- collection date/time and provenance (user-run Termux command);
- each claim supported and each claim not supported;
- unavailable/empty values as UNKNOWN;
- no extrapolation from device model, package signature, local model success or app UI to trust-root legitimacy.

## Disposition
This contract is read-only and prospective. It does not authorize commissioning, a hardware root selection, a new M1 APK, or any change to the device. STEP 7 remains OPEN / CORE TRUST-POLICY AUTHORITY BOOTSTRAP STOP / UNKNOWN.
