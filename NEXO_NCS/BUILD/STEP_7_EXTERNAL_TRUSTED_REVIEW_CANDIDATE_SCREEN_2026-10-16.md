# STEP 7 — External Trusted-Review Candidate Screen (2026-10-16)

**Status:** bounded external-source screen; NOT implementation evidence; NOT an owner decision; no device selected.

## Question

Does a newly identified open-source trusted-display signer provide an already-grounded L2 path for Nexo's initial constitutional owner-intent decision, without repeating the existing POCO/Moto/YubiKey comparison?

## Sources inspected

- nSealr firmware repository: https://github.com/nSealr/firmware
- nSealr shared specifications: https://github.com/nSealr/specs
- nSealr smartcard research: https://github.com/nSealr/smartcard
- RS-Key experimental trusted display: https://github.com/TheMaxMur/RS-Key/blob/main/docs/guides/display.md
- Trezor clear-signing explanation (useful contrast for host-supplied versus device-decoded content): https://trezor.io/guides/sending-receiving-staking-funds/interacting-with-smart-contracts/clear-signing-on-trezor

This is a source-level public-document screen, not an independent audit, build, device test, or endorsement of these projects.

## Findings

### nSealr: relevant design pattern, not an available Nexo solution

The public firmware README describes a request-bound `approval_digest`, renderer-neutral review pages, traversal state, and a policy gate that keeps production signing disabled until multiple gates are accepted. Its declared protocol scope is Nostr events (NIP-01/NIP-46 and BIP-340), with constrained signer targets and shared conformance vectors. It explicitly says concrete target display/camera/button drivers are later work and production signing has no signing backend / remains disabled.

The smartcard line is explicitly display-less and signs a 32-byte Nostr event ID; its own project documentation says it cannot review full event JSON and requires external review acknowledgement. Therefore it cannot be treated as an independent trusted-review boundary by itself.

**Transferable design insight only:** bind an explicit local approval to a digest of the exact canonical material reviewed, render all material (including long/detail pages), and require traversal/approval on the trusted device. These are useful acceptance properties, not proof that nSealr presently implements a production-ready general-purpose signer.

**L2 gaps for Nexo:** no evidence that this protocol accepts and semantically renders Nexo's complete constitutional artifact, scope, exclusions, and governance decisions; no grounded initial verifier/provisioning root for this project; no demonstrated currentness/revocation/recovery policy for Nexo; and no connection to Nexo's final protected-effect sink or proof of bypass closure. Nostr-event conformance vectors do not prove any of those Nexo-specific claims.

### RS-Key: trusted display claim is protocol-bounded

Its experimental display documentation says the device displays the FIDO relying-party ID and binds the physical approval to that RP ID. That is a useful anti-phishing boundary for FIDO sign-in, but it is not a general arbitrary-document review/signing protocol. It cannot be counted as proof that the complete Nexo Constitution was displayed and endorsed.

### Trezor clear signing: reinforces the semantic-binding requirement

The documented approach has the device decode supported transaction payloads itself and show meaningful fields. Unsupported transactions may still fall back to a hash or a generic data-present warning. This illustrates why the trusted display must render the semantics relevant to the decision, and why a generic hash prompt is insufficient. It does not establish suitability for constitutional documents.

## Disposition

- **nSealr:** RESEARCH REFERENCE ONLY; not selected; not production-ready evidence for Nexo L2.
- **RS-Key:** NOT APPLICABLE to arbitrary constitutional content on evidence inspected; its documented review is FIDO RP-ID bounded.
- **Trezor clear signing:** design analogy only; supported transaction schemas do not imply general constitutional-document support.
- No purchase, device configuration, key generation, signing, digest/freeze, ceremony, owner-review event, code/test/workflow change, commissioning, or protected effect is authorized or reported here.

## What would change the disposition

A concrete candidate would need inspectable evidence for all of the following in the exact deployed model/firmware and protocol: (1) complete human-readable semantic rendering of the frozen Nexo artifact and narrow decision scope; (2) device-side derivation/binding of the displayed material to the exact signed bytes; (3) authenticated firmware/build and provisioning provenance; (4) an independently justified first verifier and currentness/revocation/recovery basis; and (5) a separate, demonstrated final-effect enforcement boundary with no bypass.

If the device cannot render the whole artifact, it must not replace the review with an opaque hash or rely on an untrusted host's description. Chunking/pages are acceptable only if completeness, ordering, omissions, and the exact signed representation are cryptographically and semantically bound.

**Result:** a new candidate family was screened and rejected as an available solution on its documented scope/maturity, while preserving one reusable requirement: trusted-device semantic review plus digest-bound approval. The actual L2 path remains NOT ESTABLISHED. STEP 7 stays OPEN / STOP / UNKNOWN.


## Addendum — air-gapped semantic signer and deterministic-presentation evidence (2026-10-16)

This addendum records a second, narrower source screen. It does not replace the findings above or select hardware.

### Faraday: stronger presentation pattern, wrong semantic domain

Public source: https://github.com/Faraday-signer/faraday

The repository describes an open-source, air-gapped signer whose offline device parses supported Solana transactions and shows transaction details before approval. It also describes a Raspberry Pi Zero 1.3 target with no radio silicon, and a simulator for development. These are useful architectural properties against a compromised online coordinator: the signer reconstructs and reviews a transaction locally instead of trusting the coordinator's summary.

The scope is still Solana wallet transactions and supported program parsers. Open source and air-gapping do not establish a Nexo Constitution parser, a trusted build/provisioning root, legitimate first verifier, governed revocation/currentness, or Nexo final-effect enforcement. The README's claims are project documentation, not an independent security audit. **Disposition: design reference only; not an L2 solution for Nexo.**

### Deterministic rendering and display attestations: useful new formal distinction, not proof of perception

Public working draft: https://mirrors.aliyun.com/ietf/draft-schrock-ep-presentation-binding-01.html (Internet-Draft dated 2026-09-11; informational/work in progress, expires 2027-03-15).

The draft distinguishes an authorization receipt from presentation evidence. It proposes a deterministic renderer that a verifier can re-derive from signed canonical action bytes, plus a signed client claim binding a rendering digest to an action digest. Critically, the draft explicitly says this does **not** prove that the physical display actually showed those bytes or that the human perceived them; verifier trust inputs and residual compromised-client/display risk remain.

Transferable Nexo requirement: define a canonical, closed schema for the exact constitutional decision; deterministic, locale-independent rendering with explicit refusal on truncation/unsupported fields; and independent re-derivation of the rendering from the endorsed bytes. Treat any display attestation as a separate claim requiring its own client provenance—not as self-authenticating proof of honest display.

The draft is not an IETF standard, and its reference implementation/status and security claims have not been independently audited here. It cannot serve as Nexo's trust root or be imported as an authority decision.

## Updated disposition

- Faraday: **RESEARCH REFERENCE ONLY**; transaction domain is not arbitrary constitutional review.
- Presentation-binding draft: **DESIGN REFERENCE ONLY**; improves detectability of render/action mismatch but explicitly does not prove actual human-facing display or perception.
- New reusable constraints: independently re-derive deterministic rendering from exact endorsed bytes; reject unknown/truncated/ambiguous fields; keep receipt verification, presentation evidence, owner authority, and effect admission as distinct results.
- No hardware selected or bought, no firmware run/build/test, no key/signature/digest/freeze, no ceremony, owner-review event, code/test/workflow change, commissioning, or protected effect occurred.

**L2 remains NOT ESTABLISHED. STEP 7 remains OPEN / STOP / UNKNOWN.**
