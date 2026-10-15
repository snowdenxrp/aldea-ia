# STEP 7 — Existing trust-domain independence inventory

Date: 2026-10-15  
Branch: `ncs-clean-architecture`  
Status: SOURCE/DESIGN SYNTHESIS / NO TRUST DOMAIN SELECTED / NO IMPLEMENTATION

## 1. Question

Does any trust domain already available in the current project and user setup independently verify the Scope A claim chain, without asking a component to validate its own assertions or creating an authority above the owner?

This inventory uses existing project findings. It does not repeat device/key product research and does not treat separate process/device/app names as proof of independence.

## 2. Failure-domain matrix

| Candidate domain | What it can contribute | Shared/control dependencies | What it cannot independently prove today | Disposition |
|---|---|---|---|---|
| Owner's own review and decision | The actual human decision and its intended meaning; ultimate source of owner intent | Must receive truthful, complete content and distinguish acknowledgement from ratification | Does not automatically create machine-verifiable evidence of what was displayed or recorded | Necessary semantic authority; not a complete technical evidence path |
| POCO X7 Pro screen/app/runtime | Convenient presentation and interaction; user has accepted only a bounded honest-presentation premise for a possible first ceremony | App/Core, Android framework, runtime, input/output path, storage; no production host or review protocol | Persistent truthful recording, later verifier independence, rollback resistance, and any future runtime integrity | Bounded first-ceremony assumption only; not a general root |
| Moto G52 as a second phone | Could host a separate presentation or verifier if a suitable implementation existed | No Nexo trust software or independent verified workflow evidenced; device OS and setup are not established as independent | Independent authority/verifier merely by being a second physical device | Unselected; device separation alone is insufficient |
| YubiKey 5 NFC | Potentially protects a private signing key after enrollment; PIV/OpenPGP can support signatures; FIDO serves relying-party authentication | Enrollment and key-purpose policy must already be trusted; ordinary key has no trusted display of arbitrary Constitution content | Initial legitimate enrollment, exact reviewed-content binding, constitutional currentness, verifier provenance or final effect enforcement | Useful later for key custody only; not bootstrap by itself |
| Android Keystore / biometric authentication | Can constrain key use and potentially provide hardware-backed key properties/attestation | App request context, Android implementation, key enrollment, trust-chain verifier and revocation policy | Trusted display of exact content using ordinary biometric prompt; owner intent about bytes; independent initial enrollment | P1/P2 candidate only; no equivalent P3 |
| Android Protected Confirmation | On supported hardware, a trusted prompt can bind confirmation to visible short text | Device support is uncertain; API is deprecated; relying-party verifier, attestation, challenge and prompt-text comparison required | Whole Constitution review, Genesis legitimacy, canonical currentness, persistence owner, final effect boundary | Optional research candidate only; not primary |
| Termux / local Node.js | Useful engineering experiments and source/test execution | Same phone/Android host, Termux app lifecycle, filesystem, runtime and invoking user context | Packaged production host, independent verifier, secure presentation or protected sink | Engineering utility, not constitutional root |
| GitHub repository and commit history | Revisioned source/docs locator and collaboration/evidence trail | GitHub account/session, repository permissions, branch rules, GitHub service and authoring channel | That the human reviewed exact content; constitutional ratification; legitimacy of the owner; runtime currentness or local storage truth | Evidence/locator domain only, not authority root |
| GitHub Actions / CI | Reproducible execution evidence for specific source SHA and configured workflow | Workflow/repository configuration, GitHub runner, action/dependency supply chain; same repo governance | Real owner intent, trusted presentation, production runtime behavior, actual final-sink security | Test evidence only; passing CI cannot ratify authority |
| Current Nexo Core | Semantic validation contracts and design boundaries | Caller-supplied ports/results; no established production host, Genesis provenance, canonical currentness owner or final sink | Legitimacy of its own authority input or correctness of a self-produced trust claim | Cannot self-bootstrap; remains design skeleton |
| Future external service/server | Could act as a relying verifier if independently provisioned and operated | Would add network, operator, availability, key-management and governance dependencies | Automatically become legitimate authority merely by existing | Not authorized/selected; do not invent as default |
| Paper/PDF copy | Human-readable reference for review and comparison | Copy/printing/transcription, version drift, provenance and later linkage to digital bytes | Machine-verifiable currentness, signer identity, revocation or runtime enforcement | Helpful review medium, not authority proof; no printer currently available |

## 3. Independence test

For a domain to be considered an independent verifier for a particular claim, the design must show all of the following:

1. **Different failure control:** the adversary controlling the evidence producer cannot trivially rewrite the verifier, its policy, trusted keys or result.
2. **Grounded verifier identity:** the owner or a previously established trust basis has a justified way to know which verifier/policy is being used. A verifier's self-description is insufficient.
3. **Input binding:** the verifier receives the exact candidate, scope, decision evidence, and challenge it is meant to evaluate, not caller-asserted labels.
4. **Freshness and status:** the verifier can evaluate replay, revocation and currentness under an explicit source of truth; local timestamps or sequence numbers alone do not provide independent freshness.
5. **Limited result meaning:** the result states exactly which claims passed. It cannot promote a valid signature or review record into constitutional legitimacy.
6. **No circular recovery:** if the original verifier/trust basis is lost, a recovered artifact cannot authorize itself unless a separately governed recovery/succession basis exists.
7. **No effect coupling:** verification of Scope A remains unable to trigger mission/effect execution.

A separate executable, app, process, phone or CI job does not satisfy these tests by name alone.

## 4. Result

**No currently evidenced domain satisfies the entire Scope A review-evidence chain under a threat model that includes a malicious/substituted Core/app or compromised Android framework/kernel.**

There are partial contributors:
- the owner is the semantic source of intent;
- GitHub is a versioned locator/evidence channel;
- CI can establish narrow source/test results;
- hardware keys may later protect key custody;
- Android platform mechanisms may provide limited authentication or confirmation properties.

But the binding among complete content, actual owner decision, verifier provenance, freshness, persistent record and no-effect boundary remains missing. Combining partial properties does not create independence unless their dependencies and interfaces are explicitly established.

This is not proof that no conceivable architecture can work. It is the bounded finding that no existing selected path in the current project/user setup has been demonstrated to work.

## 5. Smallest missing capability

The missing capability is **a pre-established, independently verifiable owner-intent evidence path** that can validate the exact reviewed candidate and narrow decision, with explicit freshness and a verifier whose trust does not derive solely from the component being verified.

The trust basis for that verifier remains an architecture decision. Do not silently equate it with:
- a new app or second phone;
- an Android Keystore key created by the candidate app;
- a YubiKey enrolled by an unverified flow;
- a GitHub commit or CI success;
- a self-reported local record;
- a new service/server chosen only because it is convenient.

If the required independence must resist a compromised OS and no suitable trusted display/signer/verifier domain can be evidenced, the honest result is incompatibility under current constraints and continued STOP, not a patch.

## 6. Next step

The next step is not another product search. It is a constrained architecture decision on the assurance target:

- If Scope A is only an operational convenience, a self-reported local review record could eventually be considered, but it must be labelled as such and cannot prove owner intent independently.
- If Scope A is intended as evidence robust against a malicious Core/app or compromised OS, a separate trusted presentation/approval and verifier path is required; none is currently selected or evidenced.
- Regardless of which assurance target is chosen, Scope A remains non-authoritative and cannot unblock Scope B/C.

No owner review/ratification event is inferred from this document. No service, signer, trust root, host, key, code, test, APK or device change is authorized.

**STEP 7 remains OPEN / STOP / UNKNOWN. No commissioning and no protected effects.**
