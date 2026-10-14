# STEP 7 — Concrete Initial Owner Recognition Path Proposal
Date: 2026-10-14
Branch: `ncs-clean-architecture`
Status: ENGINEERING PROPOSAL ONLY / OWNER RATIFICATION REQUIRED / NO COMMISSIONING

## Purpose
Turn the open recognition-channel question into one concrete, low-cost proposal that fits the known constraints (POCO X7 Pro available, no PC or printer assumed, no external constitutional authority). This is not an approved Constitution, a trust-root selection, or an activation ceremony.

## Proposed bounded basis
Use a **human-originated, owner-reviewed commissioning ceremony under an explicit honest-device assumption**, with a handwritten offline record as a recovery/reference aid. The human owner’s deliberate review and decision is the source of owner intent; neither the phone, Android, an app, GitHub, a digest, nor a signature becomes constitutional authority.

This proposal is deliberately conditional on all of the following assumptions being declared and accepted before any ceremony:
1. The owner is physically present and personally controls the unlocked device.
2. The displayed human-readable Constitution and scope are presented honestly; no active OS/app compromise or deceptive display/input is assumed during the ceremony.
3. The owner reviews the complete content and narrow purpose/scope, not only a hash.
4. The exact canonical bytes and their human-readable rendering have a deterministic, documented binding.
5. The owner can create and retain an offline handwritten record of the exact artifact identity and recovery instructions, away from the phone. The handwritten record is a recovery/reference aid, not proof that the content was legitimate before the owner reviewed it.
6. If these assumptions cannot be supported, the result is UNKNOWN/HOLD, not a weaker ceremony.

## What the initial ceremony would and would not establish
If the owner explicitly ratifies this proposal and all checks pass, the ceremony could establish only a bounded statement: the owner intentionally accepted one exact Constitution revision for initial recognition under the declared threat assumptions.

It would not by itself prove:
- the phone/OS/app was actually uncompromised;
- a verifier or future build cannot be substituted;
- the active Constitution is still current after amendments, conflicts, rollback or recovery;
- an implementation has a canonical state owner or a bypass-closed protected sink;
- recovery can safely proceed after all recognized credentials and references are lost.

## Candidate procedure (not yet executable)
1. Prepare a review draft of the Constitution with deterministic UTF-8 bytes, canonicalization rules, complete readable rendering, version, and an explicit initial scope. Do not calculate or record a commissioning digest while the content is still changing.
2. Owner reviews the full content and scope. Any change invalidates the review.
3. On the declared honest-device assumption, compute the artifact digest locally and independently re-compute it using a separately launched, pinned local tool if available. A second calculation on the same compromised device is not independent; its purpose is error detection only.
4. Owner manually records on paper: artifact name/version, digest, narrow purpose/scope, date, recovery limitations, and a warning that the record is not authority to execute missions/effects. Do not write private keys, passwords, or a secret recovery phrase into a repository.
5. Do not create an Android Keystore key or sign an approval yet. First determine verifier provenance, canonical state ownership, replay/currentness/revocation rules, and the real enforcement boundary.
6. If later implemented, any approval must bind the exact digest, revision, scope, and a fresh one-use challenge; the verifier must independently validate the transcript and reject replay/mismatch. A caller-supplied APPROVED/AUTHORIZED value is never sufficient.
7. Run adversarial tests for altered bytes, altered readable rendering, scope widening, stale artifact, replay, lost/duplicated recovery record, revoked/replaced credential, conflicting current Constitution, verifier substitution, and every alternate path to a protected sink.

## Why not rely on Android attestation as the root?
Android key attestation can provide evidence about a key’s security level and properties if its certificate chain and revocation are correctly validated. It does not prove the owner’s constitutional intent or decide which Constitution Nexo must obey. RFC 9334 likewise separates an Attester, Verifier and Relying Party; appraisal evidence does not authorize itself. These mechanisms may support a later verifier but do not replace owner recognition.

References:
- Android key attestation: https://source.android.com/docs/security/features/keystore/attestation
- Android developer guidance: https://developer.android.com/privacy-and-security/security-key-attestation
- IETF RFC 9334 (RATS): https://www.rfc-editor.org/rfc/rfc9334.html
- NIST SP 800-63B, authenticator binding and loss/recovery: https://pages.nist.gov/800-63-4/sp800-63b.html

## Required owner ratification — not assumed
Before this path can be selected, the owner must explicitly accept or reject:
- the honest-device/presentation assumption for the initial ceremony;
- handwritten offline record as a recovery/reference aid;
- the irreducible limit that losing every recognized credential and reference requires a previously governed recovery basis; otherwise owner identity cannot be re-established cryptographically from nothing.

No silence, prior trust in the assistant, device possession, biometric prompt, successful hash, GitHub commit, or generated key counts as ratification.

## Disposition
This is a concrete proposal to make the next owner decision reviewable, not a selected root. No code, keys, Constitution, APK, device, deployment, or authority state changed. STEP 7 remains **OPEN / STOP / UNKNOWN** until the owner decision, verifier provenance, canonical current-state ownership, and protected-boundary evidence are separately established.
