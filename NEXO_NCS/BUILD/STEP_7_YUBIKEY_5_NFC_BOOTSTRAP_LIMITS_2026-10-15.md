# STEP 7 — YubiKey 5 NFC role and bootstrap limits — 2026-10-15

Branch: `ncs-clean-architecture`
Status: RESEARCH ONLY — NO KEY SELECTED, INITIALIZED, OR AUTHORIZED

## Question

Would a YubiKey 5 NFC materially solve STEP 7's initial owner-recognition and constitutional trust problem, especially with no PC and an Android handset as the available interface?

## Finding

**It can provide a useful hardware-held signing key for a later, bounded authorization protocol, but it does not independently solve bootstrap, owner intent, exact reviewed-content binding, canonical currentness, verifier independence, or final-sink enforcement.** It is a possible component, not the root architecture.

## Evidence from official technical documentation

1. Yubico's Android SDK has separate PIV and OpenPGP modules. The PIV module documents signing a message using a private key stored on the YubiKey; the OpenPGP module documents signing, verification, encryption, decryption and authentication operations on supported keys. NFC connectivity and a compatible Android integration are therefore technically plausible without assuming desktop-only PIV middleware.
   - PIV Android SDK: https://developers.yubico.com/yubikit-android/piv/
   - OpenPGP Android SDK: https://developers.yubico.com/yubikit-android/openpgp/index.html
   - NFC device interface overview: https://docs.yubico.com/hardware/yubikey/yk-tech-manual/yk5-physical-attributes.html

2. YubiKey 5 Series PIV stores a private key on the smart card and performs RSA/ECC sign/decrypt operations. Yubico notes that its Windows Minidriver is not available on Android/Linux/macOS/iOS; on Android, a dedicated app using YubiKit or another compatible smart-card implementation is needed rather than assuming generic system support.
   - PIV technical specifics: https://docs.yubico.com/hardware/yubikey/yk-tech-manual/yk5-apps-piv.html

3. FIDO2/WebAuthn is designed for authentication to a relying party. Its challenge and relying-party identity model is not a generic interface for signing arbitrary constitutional bytes. It could protect access to a service, but it is not a substitute for an artifact-signing protocol tied to an exact Constitution version and scope.
   - Yubico FIDO documentation: https://docs.yubico.com/hardware/yubikey/yk-tech-manual/yk5-apps-fido.html
   - WebAuthn standard: https://www.w3.org/TR/webauthn-3/

4. Android Keystore can make key material non-exportable and may bind it to a TEE/StrongBox, but official Android documentation warns that a compromised OS may still be able to use an app's key on-device even if it cannot extract it. A device-local key is not, by itself, an independent answer to a compromised host.
   - Android Keystore: https://developer.android.com/privacy-and-security/keystore

## What a YubiKey could and could not establish

| Property | Possible contribution | Still not established |
|---|---|---|
| Private-key custody | Keep a signing key inside the YubiKey and require PIN/touch according to the chosen application/configuration | That the initial key was provisioned by the legitimate owner, or that the host asked the key to sign the intended bytes |
| Artifact integrity | Sign a precisely defined digest/statement, if the protocol and client bind it correctly | That the signed artifact is the right Constitution, complete, readable, or current |
| User presence | Physical touch and PIN can make unattended use harder | Informed owner intent; the host may display one thing and request a signature over another |
| Independent verification | Public-key signatures can be verified by a separate verifier | The verifier's trust anchor, appraisal policy, currentness source, or independence from a compromised Core |
| Revocation / recovery | A governed protocol could identify and revoke a key | No revocation authority, recovery root, successor rule, or predecessor cutoff is currently selected |
| Protected effects | A signature could be one input to a future protected transition | A final enforcement boundary, complete bypass closure, atomic currentness-to-commit binding, or deployed proof |

## Bootstrap circularity that must not be hidden

If the phone creates the key, displays its own public key, and declares that key to be the owner's constitutional root, the phone/app still bootstraps its own authority. If the YubiKey is enrolled by trusting a public key or fingerprint displayed only by the same potentially untrusted host, the circularity remains. Hardware custody protects a key after provisioning; it does not establish the legitimacy of the provisioning ceremony.

A possible later protocol would need to bind, at minimum, a domain-separated statement to:
- exact Constitution artifact identity/version and content digest;
- exact scope and exclusions;
- explicit owner approval event and ceremony identifier;
- intended role of the signature (candidate endorsement versus current authority versus a specific effect);
- verifier/appraisal policy identity and freshness/currentness dependencies;
- anti-replay and predecessor/fencing context;
- exact failure behavior and evidence record.

This is a list of protocol obligations, **not a proposed schema to implement now**. It must reuse the existing MASTER/AB/P trust contracts and be reconciled before implementation.

## Constraints for this project

- User has no PC. Do not assume desktop `ykman`, desktop smart-card middleware, or PC-based key enrollment is available.
- The official Android SDK makes a mobile NFC integration plausible, but no exact app, dependency version, build artifact, tested POCO NFC path, key initialization ceremony, or recovery procedure has been selected or tested.
- No YubiKey purchase, configuration, key generation, signing, public-key pinning, digest creation, Constitution freeze, or commissioning is authorized by this research.
- Do not add YubiKey as a prerequisite merely because it is a familiar product. First show which unresolved property it improves and which independent component validates the claim.
- Do not treat touch, PIN, a valid signature, attestation, or key non-exportability as constitutional authority or currentness.

## Disposition

**YubiKey 5 NFC: candidate hardware-held signer for later evaluation; not a bootstrap solution by itself.** It could reduce private-key extraction/copying risk and make a future owner-endorsement protocol more robust, but the exact reviewed-content path and independent verification remain decisive. No device modification is indicated by this finding.

Next technical gate: define the trust and evidence path for an owner-approved signature without allowing the phone/Core to self-authenticate. If the only available ceremony relies on the potentially compromised host both to present the artifact and to define what the key signs, record the limitation and keep STOP rather than claiming independent recognition.

No code/tests/workflows/dependencies/APK/device/key/Constitution/deployment/runtime authority changed. No tests were run.

**STEP 7 remains OPEN / STOP / UNKNOWN. No commissioning and no protected effects.**
