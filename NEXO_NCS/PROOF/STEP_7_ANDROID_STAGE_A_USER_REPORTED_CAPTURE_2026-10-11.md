# STEP 7 — Android Stage A User-Reported Read-Only Capture — 2026-10-11

Status: 🟢 captured as user-reported terminal output; 🔵 platform claims are not independently attested; STEP 7 remains OPEN / STOP / UNKNOWN.

## Provenance and scope

- Collection method: Kevin pasted the output from read-only commands run in the Termux terminal on the Android device.
- Reported capture timestamp: `2026-10-11T19:34:24-06:00` from `date -Iseconds`.
- This artifact records the text received in chat; no raw terminal file, cryptographic digest, independent device attestation, or external verifier output was supplied.
- A stray initial paste contained `.fingerprint` and several command names without their full prompts/results. The subsequent commands were individually executed and their outputs were captured below; the stray text does not invalidate the later output.
- No install, signing-key change, unlock/flash operation, or device setting change was requested or performed as part of this capture.

## Reported raw values

| Command/property | Reported value |
|---|---|
| `getprop ro.product.manufacturer` | `Xiaomi` |
| `getprop ro.product.model` | `2412DPC0AG` |
| `getprop ro.product.device` | `rodin` |
| `getprop ro.build.fingerprint` | `POCO/rodin_global/rodin:16/BP2A.250605.031.A3/OS3.0.302.0.WOJMIXM:user/release-keys` |
| `getprop ro.build.version.release` | `16` |
| `getprop ro.build.version.sdk` | `36` |
| `getprop ro.build.version.security_patch` | `2026-08-01` |
| `getprop ro.boot.verifiedbootstate` | `green` |
| `getprop ro.boot.flash.locked` | `1` |
| `getprop ro.boot.vbmeta.device_state` | `locked` |
| `getprop ro.boot.veritymode` | `enforcing` |

The full displayed command prompts used `~/downloads $`; this only records the current Termux working directory and has no bearing on the meaning of `getprop` results.

## Claims supported, within limits

- 🟢 The submitted output reports Xiaomi as manufacturer, model `2412DPC0AG`, device `rodin`, Android release `16`, SDK `36`, and security patch date `2026-08-01`.
- 🟢 The running Android environment reports `green`, `1`, `locked`, and `enforcing` for the four boot/verification properties above.
- 🔵 These values are self-reported by the running environment and are not independently authenticated measurements.
- 🔴 They do not prove resistance to a compromised kernel/OS or spoofed property source; establish unique hardware identity; validate a hardware attestation chain; identify a trustworthy approval/verifier path; establish Kevin's constitutional authority; prove exact-content approval; prove current revocation; or establish enforcement at the last protected-effect boundary.
- 🟡 No hardware-backed attestation was collected. No claim is made about the integrity of a verifier, attestation root, or revocation service.

## Disposition and next gate

This capture modestly improves the deployment-environment inventory. It does **not** select the phone as a constitutional trust root and does not authorize commissioning.

Next design/evidence gate: map the actual first-boot protected transition and identify the concrete display, approval, verification, currentness/revocation, and last protected-effect components and their shared failure domains. If the final enforcement boundary or legitimate verification basis cannot be justified, retain STOP / UNKNOWN. Do not paper over the gap with a new resolver, registry, key, hash, UI prompt, or another compatibility layer.
