# STEP 7 — Recognition, Fallback and Authenticator Failure Matrix
Date: 2026-10-08
Status: RESEARCH / DESIGN CONSTRAINTS; NOT A CHANNEL SELECTION; NO IMPLEMENTATION AUTHORIZED

## User preference captured
Kevin approves natural/automatic recognition when supported, with a password, passphrase, keyword, credential or additional confirmation when necessary. The goal is low friction for ordinary interaction and stronger, explicit confirmation when action/context risk warrants it. This preference does not select a specific authenticator or change the accepted independent-genesis-recognition requirement.

## Research anchors
- NIST SP 800-63B (current SP 800-63-4 series) distinguishes replay resistance and authentication intent. A memorized secret is not replay-resistant because the secret itself is submitted repeatedly; a biometric observation such as seeing a face may not establish user intent. https://pages.nist.gov/800-63-4/sp800-63b.html
- FIDO2/WebAuthn uses public-key challenge-response and verifier/domain binding for phishing resistance; local biometric/PIN can unlock an authenticator without making the biometric itself the portable trust root. The biometric remains on the device in typical FIDO flows. https://fidoalliance.org/specifications/ and https://fidoalliance.org/passkeys-2/
- These standards inform authentication design; they do not establish Nexo's constitutional legitimacy, initial owner binding, authority succession, or safe recovery. Their deployment assumptions must be appraised.

## Candidate-family matrix

| Candidate | Useful role | Principal failure modes / dependencies | Design constraint |
|---|---|---|---|
| Voice recognition | Hands-free presence/interaction convenience | Recorded replay, synthetic/cloned voice, ambient capture, microphone/OS/provider compromise, weak intent signal | May enable low-risk session convenience only; never sole authority for consequential actions |
| Face recognition | Passive convenience / local device unlock | Photos/video/deepfake or presentation attacks, camera/OS/sensor pipeline, false accept/reject, may not prove intentional approval | Treat as a device-local signal where platform guarantees are verifiable; not sole proof of intent or genesis legitimacy |
| Fingerprint / platform biometric | Convenient activation of a local authenticator | Sensor/OS integrity, coercion, platform enrollment/recovery, biometric non-revocability | Prefer use to unlock a cryptographic credential locally; Nexo must not assume every platform exposes trustworthy assurance |
| Spoken keyword / passphrase | Fallback or deliberate confirmation, including accessibility/offline cases | Eavesdropping, reuse, guessing, shoulder-surfing, recording/replay when spoken, coercion, secret leakage | Never speak a long-lived secret aloud as the default high-assurance path; use as a bounded fallback only if policy accepts its risks and rate/lockout/recovery are explicit |
| Typed password/passphrase | Familiar recovery or fallback | Phishing, reuse, guessing, keylogging, endpoint compromise, weak entropy; repeated submission is replayable | Do not equate password with independent device possession; protect storage/verifier and avoid reuse; not automatically sufficient for high-risk actions |
| Device-bound or platform passkey / cryptographic authenticator | Strong challenge-response, verifier binding, explicit user verification/intent where supported | Enrollment/verifier trust, compromised endpoint, platform/vendor lock-in, lost device, recovery/sync account common mode | Strong candidate for action-bound confirmation only after enrollment, verifier, portability and recovery are bounded; not a pre-genesis legitimacy shortcut |
| Separate authenticator / second device | Out-of-band, action-bound approval, recovery support | Shared owner/account/provider/network, compromised UI, push fatigue, theft/loss, offline unavailability, unclear exact transaction display | Count as independent only after failure-domain analysis; approval must display/bind exact action, target and context |
| Physical token/medium | Offline backup, out-of-band proof, recovery | Bearer theft/copying, loss, coercion, stale/revoked status, reader/issuance dependency | Not sufficient alone for informed consent or current authority; pair with protocol freshness and recovery rules where justified |

## Derived design rules
1. No universal “recognition score” can authorize every action. Define policy by action class, target, context, freshness, consequence, and required evidence.
2. Recognition may establish a low-friction interaction context but does not by itself prove a specific human intent or authorize a protected transition.
3. A spoken keyword is a memorized secret transmitted through a sensor channel; if recorded/replayed, it can be replayed. It must not be described as replay-resistant.
4. A platform biometric should preferentially activate a local cryptographic authenticator rather than be exported to Nexo/provider as a reusable biometric template, where supported.
5. For high-consequence actions, prefer a fresh challenge-response or equivalent confirmation bound to the exact action and target. The UI must faithfully show what is being approved.
6. Two signals do not constitute two independent factors if they share a compromised OS, device, provider, enrollment process, or recovery account.
7. Fallback must not silently downgrade assurance after a mismatch, spoof suspicion, device loss, stale revocation state, network partition, or unavailable verifier. Policy may explicitly allow a limited safe mode; otherwise protected action is UNKNOWN/STOP.
8. Enrollment, genesis commissioning, routine recognition, step-up confirmation, revocation, device replacement, and authority succession are separate lifecycle transitions with distinct evidence requirements.
9. Avoid storing raw voice/face/fingerprint templates in Nexo core unless a demonstrated requirement survives privacy/threat analysis. Prefer local platform matching and minimal assertions.
10. Accessibility and availability matter: the design must provide more than one recovery/interaction route over the system lifecycle, but not make all methods equally authoritative.

## Preliminary action bands (candidate only; must be policy-defined)
- Conversation / non-protected read: low-friction recognition may be sufficient within a bounded session.
- Ordinary reversible operation: action-specific permission plus established context; step-up if the consequence or uncertainty warrants it.
- Sensitive disclosure, external communication, spending, destructive/irreversible operation: fresh confirmation bound to exact action and target using an authenticator suitable for the threat model.
- Constitution, root credentials, recovery, enrollment/replacement, delegation/succession, or authority changes: separate high-assurance ceremony; voice/face/keyword alone is insufficient.
- Any conflict, unknown currentness, uncertain authority, suspected coercion or compromised trust boundary: no protected execution.

These bands are not yet an executable policy. No thresholds, scores, universal priority fields, or arbitrary fallbacks are introduced.

## Open dependencies requiring analysis
- What trustworthy user-visible channel shows the exact transaction to be approved?
- Can the candidate authenticate that display and verifier, or can malware substitute action/target?
- Which dependencies are shared among recognition, credential, approval UI, provider, update mechanism, revocation and recovery?
- What happens when offline and unable to learn current revocation/succession state?
- What is the loss/recovery path that does not let an attacker reset the trust root?
- How can credentials move across devices/providers without silent authority transfer or lock-in?
- What proof of informed intent is available under coercion, accessibility constraints, and hands-free use?
- How is user privacy protected and templates kept local/short-lived?

## Conclusion
The user's preference is compatible with a layered experience: natural recognition for routine interaction, optional/passphrase fallback for explicitly bounded cases, and stronger action-bound confirmation for high-risk transitions. It is not yet safe to choose a single channel. The narrowest viable contract must specify credential binding, context-bound user intent, freshness/replay resistance, independent failure domains, revocation/offline behavior, recovery and portability, then survive adversarial review and the future-countereffects gate.

## Next exact action
Cross-check this matrix against MASTER + frozen AB + P/P112, then build and attack a minimum action-bound confirmation contract: exact action/target/context binding, evidence provenance/freshness, verifier/UI trust, independent-channel test, denial/UNKNOWN behavior, revocation/offline and recovery. No implementation until contradictions and root legitimacy gap are resolved.
