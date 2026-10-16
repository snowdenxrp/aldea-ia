# STEP 7 — Trusted Presentation Binding / Android Protected Confirmation Feasibility (M0.21)

Date: 2026-10-16  
Branch: `ncs-clean-architecture`  
Status: TARGETED RESEARCH / CANDIDATE LEAD ONLY / NO DEVICE TEST / NO IMPLEMENTATION  
STEP 7: OPEN / STOP / UNKNOWN — Direction B / L2 remains the objective.

## Purpose

Test one narrow question not answered by the earlier phone/product screens: does a documented mechanism exist that can bind an owner's explicit confirmation to text presented through a hardware-protected path, and does it close the complete initial-Constitution recognition claim?

This is not a device selection, trust-root decision, or authorization to create keys, an APK, a ceremony, or a local review record.

## New primary-source findings

### 1. Android Protected Confirmation is a real, conditional platform capability

Android's official `ConfirmationPrompt` documentation states that a positive response can provide high confidence the user saw the prompt text even if the Android framework, including the kernel, is compromised. The guarantee requires dedicated hardware support and may not be available on a given device. The API exposes `isSupported(context)`; generic Android version/model metadata is not proof of support.

Official source: https://developer.android.com/reference/android/security/ConfirmationPrompt

The documented relying-party flow is meaningful: provision/attest a key with the confirmation property, verify its attestation chain and expected root, issue a nonce, bind that nonce through `extraData`, receive the confirmation response, and verify the signature, expected prompt text and nonce. The documentation explicitly says the prompt text is the only part the user approved; `extraData` is returned but is not displayed.

### 1a. Hard content-size and display-fit constraint

The official Android Open Source Project implementation guide documents a hard 6,144-byte boundary for the prompt body, including non-displayed extra data and CBOR header information. It also requires that the entire rendered message fit the available screen; if it cannot fit completely, the confirmation must abort rather than truncate. This is a critical constraint for a long Constitution: a short prompt cannot be treated as proof that the complete draft was reviewed, and putting a digest in non-displayed `extraData` does not make that digest human-approved.

Implementation source: https://source.android.com/docs/security/features/protected-confirmation/implementation

A search surfaced a third-party device list that mentions POCO X7 Pro for Android hardware attestation, but that is not authoritative evidence of `ConfirmationPrompt.isSupported()` or of the Protected Confirmation path. No model-specific official confirmation-support evidence was found in this bounded search. Generic hardware key attestation and Protected Confirmation are distinct claims.

### 2. Deterministic presentation binding is a complementary, not equivalent, mechanism

The September 2026 individual Internet-Draft *Binding Deterministic Rendering and Display Attestations to Human-Authorization Receipts*, version -01, defines:
- a deterministic renderer derived from the exact canonical action bytes;
- independent verifier re-derivation of that rendering;
- a separate display-attestation claim, evaluated under relying-party-selected trust inputs;
- explicit refusal for unknown, ambiguous, hostile or unrenderable fields.

It expressly remains work in progress, is not an IETF-endorsed standard, and says it does not prove the human saw the claimed rendering if a compromised client displays different content out of band. It narrows one substitution class; it does not solve WYSIWYS or bootstrap trust in the display-attestation key.

Source: https://datatracker.ietf.org/doc/html/draft-schrock-ep-presentation-binding-01

The associated authorization-receipts draft likewise keeps receipt verification, presentation-evidence verification and trust in the presentation client as separate judgments. A valid signature or matching rendering digest is not itself constitutional authority.

Source: https://datatracker.ietf.org/doc/draft-schrock-ep-authorization-receipts/13/

## Claim-by-claim assessment for Nexo

| Required claim | What this lead could contribute | Remaining blocker | Result |
|---|---|---|---|
| Hardware-protected presentation of a confirmation prompt | Android Protected Confirmation, if actual hardware support and attestation are verified | POCO X7 Pro support and attestation status are not established; no test has been run | UNKNOWN |
| Exact prompt bound to approval evidence | Signed Confirmation Response can bind the displayed prompt text and relying-party nonce | The nonce/extraData is not displayed; showing an opaque digest does not let the owner understand the full Constitution | Partial capability only |
| Complete Constitution was reviewed and bound to exact bytes/scope | A deterministic, closed rendering could make a defined representation reproducible | No Nexo Constitution renderer/schema exists; a short protected prompt does not by itself present the full long-form Constitution, exclusions and scope | NOT ESTABLISHED |
| Verifier provenance / first trust anchor | Attestation may let a relying party check a key's declared confirmation property under a pinned attestation root | The relying party must already justify its expected root, policy, verifier implementation and currentness; attestation does not self-bootstrap them | NOT ESTABLISHED |
| Resistance to malicious Core/app and compromised OS | Protected Confirmation can protect the specific prompt path on supported hardware | It does not automatically protect the rest of the app, exact document review, the verifier, local state, or later runtime | NOT ESTABLISHED |
| Current Constitution / revocation / recovery | Nonce can prevent a narrow replay in one relying-party protocol | No canonical Constitution Authority Context/currentness owner, revocation source or recovery root exists | NOT ESTABLISHED |
| Final protected effect and bypass closure | None directly | No selected sink or complete production gate path | NOT ESTABLISHED |

## Security conclusion

**This is a credible capability lead, not a complete L2 path.** It is materially more specific than a generic claim that “Android has a secure screen”: the API defines a protected confirmation mechanism, a hardware-support predicate, an attested confirmation key and an exact-prompt verification flow. But no evidence establishes that the POCO supports it, and even if it does, it cannot alone establish that the owner reviewed the entire Constitution.

A future bounded experiment could begin with capability detection and authoritative attestation verification only after the owner explicitly authorizes device testing. It must not silently create or enroll a key, claim owner review, freeze the Constitution, or authorize an effect. Because no device operation was authorized here, no such test was performed.

The only technically honest path toward L2 would need to compose, without circular trust:
1. a complete, canonical, closed representation of the exact candidate and scope;
2. an honest, independently justified presentation/approval path that lets the owner review the full semantic content, not merely an opaque digest;
3. evidence binding that exact content and narrow decision to the protected confirmation;
4. an independently grounded verifier and attestation trust policy with currentness/revocation rules;
5. a separate future authority-context and final-effect enforcement path.

No new root, ID scheme, store, signature, API, or authority contract is proposed by this record.

## Decisions and non-actions

- Preserve Direction B / L2. Do not downgrade to a self-reported L1 convenience record.
- Treat Android Protected Confirmation as an **unverified platform capability lead**, not as a POCO feature already available.
- Treat the deterministic-rendering/display-attestation draft as an informative design lead, not a standard, independent audit, trust anchor, or turnkey Nexo solution.
- Scope A remains accepted as a work objective only; no owner-review event has occurred or may be inferred from prior display of a draft.
- No device, key, verifier, host, storage owner, Constitution identity, or recognition family was selected.
- No code/tests/workflows/APK/device operation/key/signature/digest/freeze/ceremony/commissioning or protected effect was changed, created, or run.

## Next exact action

Do not repeat the generic Android/device search. First determine from authoritative device-specific evidence whether the POCO X7 Pro exposes Android Protected Confirmation support and what attestation properties a relying party can actually verify. If authoritative support evidence is unavailable, record UNKNOWN rather than installing an APK or inferring support from Android 16. Even a positive result would justify only a separately authorized, bounded capability experiment—not commissioning or a claim that L2 is satisfied.

STEP 7 = OPEN / STOP / UNKNOWN.  
Constitution = DRAFT / NOT FROZEN / NOT COMMISSIONED.  
Protected effects = STOP.
