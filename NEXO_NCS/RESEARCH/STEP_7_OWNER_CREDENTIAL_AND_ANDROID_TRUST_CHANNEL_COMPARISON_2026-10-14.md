# STEP 7 — Owner Credential and Android Trust-Channel Comparison
Date: 2026-10-14
Branch: `ncs-clean-architecture`
Status: RESEARCH / CANDIDATE ONLY / NOT SELECTED FOR COMMISSIONING

## Question
Can an owner-held hardware authenticator reduce the work needed to recognize the owner during initial Nexo commissioning, without making the device, Android, manufacturer, or external service Nexo's constitutional authority?

## Short conclusion
A hardware authenticator such as YubiKey 5 NFC can provide a useful **possession-bound cryptographic operation**: a private key can be kept in the token and used to sign a scoped challenge, with PIN/touch policies where supported. Android integration is technically plausible through Yubico's YubiKit SDK and NFC/USB support. This can reduce the need to implement private-key protection from scratch.

It does **not** solve the initial trust problem by itself. Nexo must already have a recognized way to know which public key belongs to the owner's chosen credential. A token-generated signature proves control of the corresponding private key under the assumed token/application security; it does not prove who legitimately enrolled that key, what Constitution the owner reviewed, or that Nexo's verifier/current-state owner is legitimate.

No YubiKey purchase, selection, enrollment, key generation, or integration is authorized or assumed by this note.

## Primary-source cross-check
1. Android Keystore can protect non-exportable key material and constrain key usage, sometimes with hardware-backed enforcement and user authentication. This is useful within that Android installation, but a key bound to one phone does not by itself provide device-independent owner recovery. Source: https://developer.android.com/privacy-and-security/keystore
2. Android's authentication architecture describes hardware-backed Keystore/KeyMint, user authenticators and their role in gating cryptographic operations. These mechanisms attest to authentication/presence according to the device's implementation; they are not a Nexo constitutional identity service. Source: https://source.android.com/docs/security/features/authentication
3. Android key attestation can provide signed claims about key/device properties, but those claims require appropriate validation and trust in the attestation chain. They are scoped evidence, not owner approval of Nexo's Constitution. Source: https://source.android.com/docs/security/features/keystore/attestation
4. YubiKey 5 Series provides separate applications including PIV and OpenPGP; PIV supports cryptographic signing with keys stored on the smart card. Source: https://docs.yubico.com/hardware/yubikey/yk-tech-manual/yk5-apps-piv.html and https://docs.yubico.com/hardware/yubikey/yk-tech-manual/yk5-apps-openpgp.html
5. Yubico provides YubiKit for Android with NFC/USB support and PIV key generation/use APIs. Source: https://developers.yubico.com/yubikit-android/ and https://developers.yubico.com/Mobile/Android/
6. IETF RATS RFC 9334 separates evidence production, verifier appraisal, and relying-party decisions; a verification result is not itself the relying party's authorization policy. Source: https://www.rfc-editor.org/rfc/rfc9334.html

## Candidate roles — kept separate
- **Owner intent:** evidence that the human reviewed and approved the exact Constitution revision, rendering/context and narrow commissioning purpose.
- **Credential possession:** a token-held private key signs a fresh, domain-separated challenge bound to the exact artifact digest, revision, purpose/scope and nonce.
- **Verifier trust:** the code and appraisal rules that verify the signature and evaluate currentness/revocation must have independently recognized provenance.
- **Canonical currentness:** one named Core-owned state owner decides which Constitution is active, with explicit conflict, rollback, revocation and recovery rules.
- **Enforcement:** all protected activation paths must consult that canonical state at the real last boundary; UI flags or a successful signature cannot bypass it.

These are separate predicates. Passing one must not imply another.

## Candidate protocol shape (not implemented)
1. Owner reviews and approves the human-readable baseline clause-by-clause. The existing baseline file remains a proposal; it must not be hashed and promoted to a governing Constitution without that review.
2. Define a canonical serialization and a human-readable rendering process; establish that both refer to the same exact revision. Digest alone is only a byte-comparison aid.
3. If an owner-held authenticator is chosen, generate its signing key in the token and configure a PIN and physical-presence/touch requirement as appropriate. Prefer a private key that cannot be exported from the token.
4. Construct a fresh challenge that includes a protocol/domain identifier, exact Constitution digest, revision identifier, narrow commissioning scope, verifier/context identifier and nonce. Do not sign a generic “approve” string.
5. The token signs the challenge; the verifier checks the signature and all bound fields, then separately checks that the credential is enrolled/current/not revoked under an already recognized enrollment basis.
6. The canonical Constitution state owner accepts only the one narrow transition that this verified approval covers. This does not authorize missions, tools, external effects, amendments, recovery or succession.
7. Test missing credential, wrong key, wrong digest, changed scope, stale/replayed challenge, revoked credential, UNKNOWN verifier state, conflicting active Constitution, app/UI bypass and direct-call bypass. No test may use a caller-injected AUTHORIZED result as proof of legitimate owner authority.

## Critical unresolved bootstrap issue
The token's public key must be recognized before it can verify the token's first approval. If the same untrusted app or mutable file can silently substitute the enrolled public key, the ceremony is circular. The initial enrollment reference therefore needs an explicit, owner-understandable recognition step and a stated threat model.

Two phones are not automatically independent if they share the same repository/account, software supply chain or recovery channel. A device biometrics prompt proves only the platform's configured user-authentication event to the extent the platform can be trusted. A manufacturer certificate or Android attestation chain can support device/key claims but does not decide who the owner is under Nexo's Constitution.

If all enrolled tokens, phones, backups and previously recognized references are lost, there is no cryptographic way to distinguish the original owner from an impostor without some surviving independent trust source or a previously governed recovery process. This limitation must be made explicit rather than hidden behind a new key, hash, signature, account or device ID.

## Recommendation for NCS
- Keep an owner-held hardware authenticator as a **promising optional possession factor**, not the root of Nexo and not a substitute for the initial recognized enrollment basis.
- Do not add YubiKey support to M1 now. M1 is an inference/presentation client, not the Nexo Core; adding NFC/signing to its Activity would not establish canonical authority or complete mediation.
- First resolve owner approval of exact constitutional content and the initial enrollment-reference assumption. Then define the verifier's provenance and canonical state owner. Only after that, identify a real protected target and design the minimal host boundary.
- No need to buy hardware before the protocol and recovery assumptions are clear. If a token is later selected, validate the exact model/firmware, NFC interface, Android SDK path, key policy, backup/replacement process and revocation semantics before implementation.

## Evidence and non-actions
This is standards/documentation research and a design comparison. No source code, tests, keys, credentials, Constitution, APK, device, deployment, or authority state was changed. No YubiKey is assumed to be owned. No tests were executed.

## Disposition
Step 7 remains OPEN / STOP / UNKNOWN. The candidate may reduce key-protection implementation work, but does not close the initial trust/bootstrap gap or establish a production protected runtime.
