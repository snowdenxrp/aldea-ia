# STEP 7 — Bootstrap threat model and bounded decision table
Date: 2026-10-14
Branch: ncs-clean-architecture
Status: DESIGN ONLY — NOT RATIFIED — OPEN / STOP / UNKNOWN

## Purpose
Make the initial owner-recognition boundary explicit before choosing a device, credential, ceremony, or implementation. This document does not commission Nexo, select an owner-recognition premise, or authorize effects.

## Security objective
Recognize one owner-originated approval of one exact, canonical initial Constitution version and context. This recognition must not implicitly authorize later amendments, delegation, succession, recovery, autonomy, missions, tools, or protected effects. Those require separately specified and enforced rules.

## Threat capabilities and current disposition

| Threat/capability | What a candidate measure can help with | What it does NOT establish | Current disposition |
|---|---|---|---|
| Accidental corruption or transcription error | Independent byte comparison, digest comparison, schema/canonicalization checks | Who chose the content or whether the display was honest | Detect mismatch; STOP on mismatch |
| Malicious repository/source or replaced artifact | A trusted reference obtained through an independent channel; signatures verified against a pre-recognized key | Initial authenticity if key/reference came from that same untrusted source | UNKNOWN until reference provenance is established |
| Malicious Nexo app/verifier | Reproducible source/build evidence and independent verifier inspection | That the verifier currently running is the inspected verifier | Not solved; no commissioning |
| Compromised OS, display, input, or accessibility path | A genuinely independent trusted presentation/approval path could reduce exposure | A paper note or digest copied from the same potentially deceptive screen | In-scope unresolved; only exclude by explicit bounded assumption or solve independently |
| Owner impersonation / stolen unlocked phone | Fresh challenge, scoped credential, local presence checks, revocation | Legitimate initial key enrollment or constitutional intent by itself | Not solved by phone possession alone |
| Replay, stale state, rollback | Versioned canonical bytes, nonce/challenge, monotonic state, expiry/revocation checks | Correctness unless the verifier and canonical state owner are trusted and actually enforced | Required future gate; currently UNKNOWN |
| Protected sink bypass | Complete call-graph/sink inventory and tests proving all paths are mediated | A standalone authority gate or test with injected AUTHORIZED | Known production integration gap; STOP |
| Loss of all devices, keys, and independent references | A previously defined recovery authority/reference that survives the loss | Recovery from cryptography alone when no trusted fact remains | Must remain unrecoverable/UNKNOWN if no governed surviving reference exists |
| Malicious or coercive external party | No technical measure can make their constitutional authority legitimate merely by signing | That an external institution is above the owner | No external authority assumed or appointed |

## Candidate premises and decision table

| Premise | Benefit | Residual risk / condition | Decision now |
|---|---|---|---|
| Owner approves exact content on POCO under an honest-device/presentation assumption | No-cost, human-originated bounded intent record | Cannot detect active deception of screen/input/verifier; requires explicit owner acceptance of this limitation | OWNER-ACCEPTED FOR FIRST CEREMONY ONLY; see dated reconciliation below |
| Handwritten offline record copied from POCO | Helps later identify the intended artifact/version if the original review was honest | Not independent evidence of the original screen/content; may preserve a bad decision accurately | Supplement only |
| Moto G52 or E22i comparison | May expose accidental mismatch or improve readability | Not an independent root merely because it is another device; dependency chain must be evaluated | Optional comparison aid only |
| YubiKey or other hardware authenticator | Protects a private key and can sign fresh scoped challenges after enrollment | Does not decide which initial public key is Nexo's owner key; does not prove displayed Constitution or verifier is authentic | Defer purchase/integration |
| GitHub, CI, build hash, Android attestation | Can support source/build/device/key claims within validated scope | None independently establishes constitutional owner intent or initial trust | Supporting evidence only |
| Specific pre-existing, independently recognized reference | Could break the bootstrap circularity if its provenance and scope are actually established | Must be real and already recognized by the owner; do not invent or appoint one by implication | None selected/identified |
| No accepted assumption and no recognized independent reference | Honest representation of the limit | Cannot distinguish owner from impostor from zero trusted information | STOP / UNKNOWN |

## Required gates before any commissioning ceremony
1. **Premise:** owner explicitly accepts a precise, limited initial-trust premise, or identifies a real already-recognized independent reference. Silence is not acceptance.
2. **Artifact identity:** exact Constitution bytes, canonicalization rules, version/context, and human-readable rendering are fixed and bound together. No digest/signature while content is changing.
3. **Approval binding:** approval is fresh and bound to that exact artifact/version/context; no generic reusable “I approve” token.
4. **Verifier provenance:** establish what verifier is executing and why it is the intended one; repository history alone is not runtime provenance.
5. **Currentness/revocation:** define the authoritative current Constitution state and how stale, revoked, replaced, or rolled-back approvals are rejected.
6. **Complete enforcement:** identify the real protected sink and prove there is no bypass. Existing injected AUTHORIZED tests are not proof of legitimate initial authority.
7. **Recovery:** define what survives device/key loss, who may invoke recovery, and what happens if every trusted reference is lost. Do not silently promote the daughter, a manufacturer, GitHub, or a device to authority.

All seven gates are separate. Passing one does not imply another. Unknown, missing, expired, mismatched, revoked, or unverifiable inputs must fail closed to STOP/UNKNOWN.

## Engineering decision
Do not buy a YubiKey, modify M1, create a signing key, freeze the Constitution, generate a commissioning digest, or claim runtime authority at this stage. Those actions cannot compensate for unresolved initial trust, verifier provenance, canonical currentness, and sink enforcement.

Next work should inspect only the existing Constitution/MASTER and handoff definitions for any already-established recovery/reference premise and map the concrete current-state owner and protected sink. If no such prior premise exists, document the remaining owner-level choice rather than producing more speculative mechanisms.

## Evidence basis and limits
TUF explicitly requires a trusted root to be supplied or otherwise established out-of-band; its update chain preserves continuity from that root but does not bootstrap trust from nothing. See https://github.com/theupdateframework/specification/blob/master/tuf-spec.md (current specification). NIST defines a trust anchor as trusted a priori or securely provisioned out-of-band: https://csrc.nist.gov/glossary/term/trust_anchor.
These are analogies and supporting standards, not proof that Nexo has an implemented trust anchor.

No code, tests, keys, signatures, Constitution freeze, APK, device, deployment, or runtime authority changed.


## Dated reconciliation — 2026-10-14 owner decision

The earlier decision-table row above originally recorded NOT RATIFIED. After that text was authored, the owner explicitly accepted the bounded premise in NEXO_NCS/DECISIONS/STEP_7_BOUNDED_INITIAL_HONEST_DEVICE_PREMISE_2026-10-14.md:

> For the initial ceremony, provisionally assume that the owner's POCO phone and its screen faithfully present the exact content the owner is asked to approve.

This decision supersedes the prior NOT RATIFIED status only for that narrow first-ceremony premise. It does not prove the device honest, establish a trust root, approve the handwritten recovery reference, freeze/commission the Constitution, select a YubiKey, or satisfy the other commissioning gates. The original status is preserved here as historical context; this addendum reconciles the current status without broadening the owner's decision.

Current disposition remains DESIGN ONLY / OPEN / STOP / UNKNOWN. No ceremony, key creation, digest/signature, code change, tests, deployment, or protected effect is authorized by this addendum.
