# STEP 7 — Bootstrap Premise Comparison and Candidate Ranking
Date: 2026-10-14
Branch: `ncs-clean-architecture`
Status: ENGINEERING COMPARISON / NOT SELECTED / NO OWNER RATIFICATION / NO COMMISSIONING

## Purpose
Compare the concrete bootstrap premise options against the current requirement: recognize the initial owner and exact Constitution without pretending that a key, digest, device, repository, or verifier can authenticate itself. This is a decision aid, not an owner decision.

## Core result
There is no zero-assumption cryptographic bootstrap. At least one initial fact must be accepted from a source already recognized by the owner, or the system must explicitly accept a trust-on-first-use (TOFU) ceremony under a stated threat model. Later cryptography can preserve and check continuity from that starting point; it cannot retroactively prove that the starting point was legitimate.

This is consistent with TUF: a client begins with trusted root metadata supplied through an out-of-band process or an explicit TOFU model; subsequent root rotation is validated against the already trusted predecessor. Android key attestation can provide scoped evidence about key/device properties only when the chain, root and revocation are validated; it does not attest Nexo constitutional intent. Sources:
- TUF specification: https://github.com/theupdateframework/specification/blob/master/tuf-spec.md
- Android key attestation: https://developer.android.com/privacy-and-security/security-key-attestation

## Candidate comparison

| Candidate premise | What it can provide | What it cannot establish | Assessment |
|---|---|---|---|
| A. Owner personally reviews exact content on POCO under an explicit honest-device/presentation assumption | Human intent for a bounded initial decision, conditional on the declared premise | Does not detect active deception of display/input/app or prove the verifier is authentic | Simplest, but only valid if owner explicitly accepts the assumption |
| B. Handwritten paper record of the artifact identity, created from the same POCO display | Offline continuity/reference after the record is created; helps detect later mismatches | Does not independently authenticate the first display or prove the note's source | Supporting record only; not an independent bootstrap root |
| C. Second phone (Moto G52 or E22i) displays/stores a copy | Can catch accidental mismatch if artifact acquisition and comparison paths differ | Two devices may share repository/account/software/recovery dependencies; two compromised paths can agree | Useful as a comparison aid only after dependency analysis; not automatically independent |
| D. Hardware authenticator (e.g. YubiKey) signs a fresh scoped challenge | Stronger possession-bound signature and private-key protection, depending on exact product/policy | Does not tell Nexo which public key to trust initially, what was displayed, or whether verifier/current-state owner is legitimate | Post-bootstrap factor, not root; defer purchase/integration |
| E. Public repository/commit/CI artifact as initial reference | Identifies a specific published artifact and can provide reproducible build evidence if separately checked | Repository/account/maintainer/CI cannot be their own constitutional authority; mutable branch or green CI is not owner intent | Supporting provenance only |
| F. Manufacturer/Android attestation as root | Can support claims about key backing and device state within validated attestation semantics | Manufacturer/OS trust does not equal the user's constitutional owner authority; requires trusted roots and revocation validation | Supporting evidence only |
| G. Independent human or institution conveys a pre-existing reference | Potentially independent out-of-band recognition if the owner already recognizes that source | No such source has been named or accepted; making that source a constitutional authority would violate the current boundary unless narrowly scoped as evidence | Not currently available/selected |
| H. No trusted prior reference and no accepted TOFU assumption | None | Cannot distinguish the legitimate initial owner from an impostor on cryptographic evidence alone | STOP / UNKNOWN |

## Dependency test for a claimed independent second device
Do not label the Moto G52 or E22i independent merely because it is physically separate. Before using either as evidence, record:
1. how the Constitution bytes arrive on each device;
2. whether both copies descend from the same mutable repository/account/link;
3. whether both rely on the same app/build/signing key or shared clipboard/message channel;
4. whether the human-readable rendering is produced independently or copied as an image/text;
5. whether one device can verify the other's result without trusting the same code or presentation path;
6. what happens if the shared source is malicious, unavailable, rolled back or compromised.

If both devices receive the same malicious artifact from the same source, agreement between them proves only consistency with that source, not legitimacy.

## Minimum decision boundary
Before implementation, the owner-recognition premise must be one of these explicitly bounded choices:
- **Bounded TOFU / honest-device assumption:** owner accepts that, for the initial ceremony only, the selected phone, OS, app, display and input path are not actively compromised. This is a declared assumption, not a cryptographic proof. The exact scope and consequences must be written plainly.
- **Pre-existing out-of-band recognition:** name the specific already-recognized reference/source and explain how the owner recognizes it independently of the candidate Nexo flow. It must not be invented during the ceremony.
- **No acceptable premise:** preserve UNKNOWN/STOP and do not commission.

A paper record and a second phone may supplement either premise but do not silently upgrade it to independent trust.

## Narrow architecture sequence after a premise is selected
Even if the initial premise is accepted, these remain separate gates:
1. freeze and human-review the complete Constitution and narrow initial scope;
2. bind canonical bytes to the exact readable rendering;
3. establish verifier provenance and test that the approval cannot substitute the verifier;
4. define one canonical current-Constitution state owner and conflict/revocation/recovery ordering;
5. identify the real protected sink and every route to it;
6. implement only the smallest needed boundary;
7. run adversarial tests against wrong content/scope, stale or replayed approval, revoked credentials, conflicting current state, unknown verifier, and direct/UI bypass;
8. tie test/build evidence to the actual deployed artifact before claiming runtime protection.

No approval, digest, or key should be created while the content or trust premise remains unresolved.

## Recommendation (technical, not constitutional ratification)
Do not buy hardware or add credential support to M1 now. The best near-term step is to decide whether the user is willing to accept a narrowly bounded honest-device assumption for the *initial recognition ceremony only*, or whether a genuinely pre-existing out-of-band reference is available. The engineering team can explain the consequences, but cannot accept that personal assumption on the owner's behalf.

If the owner does not accept the premise and no independent reference exists, there is no honest cryptographic shortcut: STEP 7 stays UNKNOWN/STOP. This is a real security boundary, not an implementation inconvenience to patch over.

## Non-actions and disposition
- No owner choice or ratification is inferred.
- No keys, signatures, commissioning digest, Constitution freeze, code, tests, APK, device, deployment or runtime authority changed.
- This is a comparison/design artifact, not proof of successful commissioning.
- STEP 7 remains **OPEN / STOP / UNKNOWN**.
