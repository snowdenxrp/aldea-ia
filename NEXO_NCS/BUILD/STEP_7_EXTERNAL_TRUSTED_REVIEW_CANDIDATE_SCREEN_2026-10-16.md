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
