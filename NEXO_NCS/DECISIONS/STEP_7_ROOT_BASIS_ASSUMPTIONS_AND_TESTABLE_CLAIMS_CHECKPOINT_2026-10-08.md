# STEP 7 — Root Basis: Assumptions and Independently Testable Claims
Date: 2026-10-08
Status: DECISION CHECKPOINT; SEMANTIC DIRECTION NARROWED; ROOT / TECHNICAL CHANNEL NOT SELECTED; NO IMPLEMENTATION

## 1. Purpose
Consolidate the existing accepted governance requirement and the recent concrete threat-model/circularity attacks into one checkpoint. This document does not create a new root mechanism and does not claim that genesis legitimacy is solved.

## 2. Decision supported by existing governance
1. The initial commissioning act must be explicitly authorized by Kevin under the intended Constitution.
2. The candidate Nexo instance, its model/provider, its local state and its newly generated keys cannot establish their own legitimacy.
3. An independent recognition channel under Kevin's control is required. If it is unavailable or unverifiable, protected activation remains blocked.
4. The approval must bind to the exact constitutional object and commissioning context; silence, ordinary conversation, inferred intent or provider assertion cannot substitute for explicit approval.
5. Recovery, credential replacement, constitutional amendment and succession are separate governed transitions, not consequences of ordinary recognition.
6. Portability/provider independence are requirements; no vendor or device is silently appointed permanent constitutional governor.

These are existing governance constraints restated as a checkpoint, not new proof of deployment security.

## 3. Trust assumptions that must be explicit before a concrete channel is accepted
| Assumption | What it means | Can Nexo prove it from its own uncommissioned state? | Evidence / acceptance needed |
|---|---|---|---|
| A. Owner's governance intent | Kevin accepts explicit owner-authorized commissioning as the normative legitimacy source | No; the system cannot create the normative rule it is meant to follow | Explicit human governance decision; preserved as a design decision, not inferred from software |
| B. Independent channel is under Kevin's control | The channel existed/was recognized outside the candidate Nexo trust domain and is available to approve the ceremony | Not by itself | Human-established control/recognition plus an explicit threat model for device/account/OS/provider/recovery |
| C. Channel credential was legitimately enrolled before the ceremony | The response key/credential is not an attacker-inserted key | No, if enrollment starts inside the candidate device | Prior binding evidence or a separately accepted out-of-band enrollment ceremony |
| D. Presentation is faithful | What Kevin reviews matches the canonical Constitution/context that will be bound | Not merely from a signature or digest | Defined canonicalization, independent display/input threat model, test vectors and binding tests |
| E. Cryptographic response is fresh and context-bound | Response is for this challenge, deployment, Constitution and ceremony only | The protocol can validate bounded properties if trust assumptions hold | Challenge-response tests; replay, substitution, cross-context and concurrency attacks |
| F. Credential currentness/revocation is known | Credential has not been revoked/superseded under the applicable rule | Not when currentness source is unavailable or stale | Defined authoritative lifecycle source and consistency guarantee; otherwise UNKNOWN/HOLD |
| G. Dependencies are sufficiently independent | Candidate and recognition path do not share a failure domain that defeats the required claim | Not from different device names or keys alone | Dependency/failure-domain map including account, OS, updates, network, provider, recovery and administration |
| H. Recovery authority is legitimate | Replacement cannot self-promote or silently become root | No, absent a pre-governed recovery/succession basis | Separate governance rule; if unavailable, preserve root-unavailable state and block protected transitions |
| I. Migration preserves authority semantics | New device/provider/credential cannot alter who controls the Constitution | Not from copying bits or signing a migration request alone | Explicitly authorized migration transition, exact scope binding, predecessor cutoff/revocation and reconciliation |
| J. Human approval is voluntary and informed | Approval is not inferred from silence or mere authentication | Cryptography cannot prove freedom from all coercion or comprehension | Clear ceremony, intelligible presentation, user action; residual coercion risk stated honestly |

If a required assumption is not accepted or its evidence is unavailable, the dependent claim remains UNKNOWN. No model confidence score or extra signature may substitute for it.

## 4. Properties that can be independently tested once a mechanism is selected
- Exact Constitution/version/content/context binding and deterministic canonicalization.
- Freshness, nonce/challenge uniqueness, expiration, replay rejection and cross-deployment rejection.
- Public-key/credential binding and signature verification under a stated algorithm/key lifecycle.
- Presentation-to-approved-object and approved-object-to-executed-object equivalence.
- Failure behavior for mismatches, unavailable revocation, interrupted ceremony and duplicate requests.
- Credential enrollment, loss, revocation, replacement and migration state transitions under the selected lifecycle authority.
- Dependency/common-mode scenarios in which a shared account, OS, update path or recovery provider is compromised.
- Evidence capture, audit completeness and whether results justify only the claims stated.
- Safe behavior when the channel is offline, revoked, disputed or unavailable.
- Prevention of activation of broader policy, root replacement or succession from an initial commissioning result.

Testing can validate mechanism properties under the declared threat model; it cannot independently prove the legitimacy of the normative governance rule or prove absence of all coercion.

## 5. Claims that must never be made from a single mechanism result
- “The signature is valid, therefore the Constitution is legitimate.”
- “The biometric/voice match is valid, therefore Kevin approved this exact operation freely.”
- “Two devices/keys exist, therefore the paths are independent.”
- “The root is stored locally/immutably, therefore it was legitimately established.”
- “Recovery succeeded, therefore the new credential may govern the Constitution.”
- “A revocation request was recorded, therefore all incarnations/providers enforce it.”
- “The commissioning binding is established, therefore arbitrary future actions are authorized.”
- “The provider accepted the request, therefore the external effect occurred exactly as intended.”

## 6. Current architectural checkpoint
**Retain as the leading semantic direction, not a selected implementation:** explicit owner-authorized commissioning + a pre-existing independently recognized channel under Kevin's control + fresh challenge and exact Constitution/context binding + separately governed currentness/recovery/migration/succession.

The channel's initial enrollment and trust boundary remain the key unresolved technical/governance premise. A dedicated physical token, second device, external issuer, hardware root or hybrid may contribute to the design, but none is sufficient merely by name.

## 7. Decision and gate
- Root-basis legitimacy: semantically narrowed to owner-authorized commissioning under the existing Constitution.
- Independent channel requirement: accepted.
- Concrete channel, authenticator, enrollment mechanism, trusted display, recovery authority and provider independence: NOT SELECTED / OPEN.
- Trust Foundation and Constitution Authority Context: BLOCKED.
- Future-countereffects gate: CLOSED.
- No code, runtime activation or production-security claim is authorized.

## 8. Next exact action
Before selecting a channel, resolve from existing MASTER/Constitution material whether Kevin's prior control of an independent device/channel is an accepted deployment trust assumption, and define the minimum evidence that makes its enrollment independent of the candidate Nexo instance. If the existing governance material already accepts that premise, cite it and proceed to a mechanism-specific enrollment/binding contract. If not, keep root unresolved; do not ask cryptography to decide a governance question.
