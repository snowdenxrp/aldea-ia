# STEP 7 — Natural Recognition and Risk-Adaptive Confirmation
Date: 2026-10-08
Status: UX PRINCIPLE ACCEPTED; SECURITY CONTRACT NOT YET DEFINED; NO IMPLEMENTATION AUTHORIZED

## User-approved experience direction
Kevin agreed that Nexo should recognize him naturally and automatically where supported, without repeatedly demanding passwords, and should request additional confirmation when the risk of the requested action warrants it.

This is an experience direction, not a selection of biometric vendor, sensor, authenticator, protocol, identity root, or authority mechanism.

## Architectural invariants
1. Recognition signal is not identity proof by itself; identity confidence is not authority; authority is not action-specific authorization.
2. Voice, face, fingerprint, personal device, passphrase, and cryptographic credential are different signal/credential families with different threat models. Support is capability-dependent; no method is assumed universally available or equally strong.
3. A voice/face match may support low-friction interaction but must not alone authorize consequential protected actions. Replay, synthetic voice/video, presentation attacks, sensor/OS compromise, coercion, and shared dependencies must be modeled.
4. Confirmation strength is selected by an explicit protected policy bound to the exact action, target, context, freshness, and authority epoch—not by model intuition, convenience, familiarity, or a generic confidence score.
5. Risk tiers must not become a hidden global scalar score. The policy must specify eligibility and required evidence; ambiguous/incomparable cases remain UNKNOWN/STOP.
6. Additional confirmation must be meaningful and context-bound: the user must be shown what action and target are being approved, with replay resistance and an authoritative result.
7. Independent confirmation means independent failure domains, not merely two modalities that share the same compromised device, operating system, provider, network, or enrollment authority.
8. Loss, mismatch, stale evidence, revocation uncertainty, suspected spoofing, coercion, or conflicting signals cannot silently fall back to weaker authentication for a protected action.
9. Recovery and enrollment are separate security boundaries. Successful everyday recognition does not establish genesis legitimacy, transfer authority to a new device, or authorize succession.
10. Privacy is a design constraint: prefer local processing and minimize retention/transfer of raw biometric data; never assume the core must store face/voice templates. Platform capabilities and their trust boundaries must be explicit.

## Candidate interaction policy (not yet executable)
- Routine conversation: allow low-friction recognition only within an explicitly limited session/context and supported confidence boundary.
- Ordinary reversible actions: follow the least-privilege policy for the established context.
- Consequential or irreversible actions: require a fresh, action-bound confirmation from an appropriate independent channel.
- Constitution, root authority, recovery, credential enrollment/replacement, delegation/succession, or security-policy changes: use a separately specified high-assurance ceremony; automatic voice/face recognition alone is insufficient.
- Uncertain/conflicting/compromised context: refuse protected execution and explain the minimum safe next step.

These categories are provisional examples. Exact action classification and evidence requirements must come from Constitution/mission policy and the threat model, not be hard-coded from this note.

## Not decided
- Which recognition channels are acceptable or supported.
- Whether any biometric is stored, and where.
- Which device/OS/sensor/verifier boundary is trusted.
- What independent channel is used for genesis commissioning.
- Exact risk/action taxonomy, thresholds, freshness, revocation/offline semantics, recovery, and coercion handling.
- Any production implementation or activation.

## Next research action
Extend the existing recognition-channel comparative assessment with this user-approved UX direction. Compare failure-domain independence and attack surfaces for voice, face, fingerprint/platform biometric, separate authenticator/device, and physical/cryptographic credential; evaluate spoofing, replay, liveness claims, coercion, common-mode compromise, privacy, accessibility, offline operation, revocation, loss/recovery, portability, and provider exit. Reconcile with MASTER + AB + P/P112. Do not select or implement a channel until the narrowest viable binding contract survives adversarial review and the future-countereffects gate.
