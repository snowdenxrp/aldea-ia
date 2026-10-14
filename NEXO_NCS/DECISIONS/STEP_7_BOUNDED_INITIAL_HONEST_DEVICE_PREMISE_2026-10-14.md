# STEP 7 DECISION — BOUNDED INITIAL HONEST-DEVICE/PRESENTATION PREMISE

Date: 2026-10-14
Status: OWNER-ACCEPTED BOUNDED PREMISE / NOT COMMISSIONING

## Owner decision

The owner explicitly accepts the following limited premise for the *first recognition ceremony only*:

> For the initial ceremony, provisionally assume that the owner's POCO phone and its screen faithfully present the exact content the owner is asked to approve.

This is an explicit risk acceptance to permit the bootstrap design to proceed. It is not a claim that the premise has been technically proved.

## Strict scope limits

This decision does **not** mean:
- Android, the POCO, the display/input path, or any app is permanently trusted;
- possession of the phone alone proves the owner's identity or constitutional authority;
- the phone, GitHub, ChatGPT, Termux, a digest, or a generated key becomes Nexo's constitutional authority;
- a YubiKey is selected, purchased, enrolled, or integrated;
- the Constitution is frozen or commissioned;
- any protected effect is authorized;
- the remaining STEP 7 gates are satisfied.

The premise is limited to the initial human recognition ceremony. It must not silently become a permanent platform-trust rule.

## Required remaining gates

Before commissioning or protected effects, independently resolve and evidence:
1. Exact canonical Constitution artifact, version, and scope.
2. Fresh owner approval cryptographically or otherwise unambiguously bound to that exact artifact/version/context.
3. Verifier provenance and separation from the untrusted approval presentation path.
4. Canonical currentness, ordering, expiry, and revocation semantics.
5. Complete protected-effect sink inventory and enforcement, including bypass paths and per-sink revocation effectiveness.
6. Governed recovery that cannot self-authorize or amplify authority.
7. Evidence that the actual target/runtime composes the above; design documents and injected test fixtures are not runtime proof.

If any gate is absent, conflicting, stale, or unverifiable, retain STOP / UNKNOWN for commissioning and protected effects.

## Alternatives considered

- Require a previously recognized independent out-of-band trust reference: stronger against a deceptive current device, but no concrete reference has yet been identified.
- Use a second phone, paper, YubiKey, GitHub/CI, or platform attestation as the root: rejected as an automatic solution because none is inherently independent or constitutional authority without a separately established trust relationship.
- Reject every initial assumption and remain STOP / UNKNOWN indefinitely: remains the safe fallback if the limited premise is later withdrawn or its scope cannot be maintained.

## Rationale and countereffects

This bounded assumption breaks the practical bootstrap deadlock only by making its residual risk explicit; it does not cryptographically eliminate bootstrap circularity. A compromised phone/app/display could still misrepresent the content during the ceremony. The owner understands and accepts that bounded risk for the first ceremony, not for later operation.

Future countereffects to track: initial compromise could seed a false root; the assumption could drift into permanent device trust; a correct hash/signature could be misread as proof of owner intent; recovery or successor mechanisms could bypass the initial scope; a valid recognition event could be replayed or superseded without canonical currentness; and any ungated sink could act despite a correct ceremony.

## Implementation status

Decision/documentation only. No keys, signatures, approval artifacts, commissioning digest, Constitution freeze, source code, tests, APK, device configuration, deployment, or runtime authority were changed. No ceremony has occurred.

**STEP 7 remains OPEN / STOP / UNKNOWN. No commissioning and no protected effects.**
