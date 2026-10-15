# STEP 7 — Owner approval trust-path comparison — 2026-10-15

Branch: `ncs-clean-architecture`  
Status: RESEARCH / DECISION SUPPORT ONLY — NO CEREMONY OR AUTHORITY ESTABLISHED

## Question

What is the smallest credible path to bind the owner's review and approval to the exact constitutional artifact, given no PC, no printer, an Android primary handset, a spare Moto G52, and a possible YubiKey 5 NFC?

## Finding

**The decisive requirement is not merely a protected private key. It is a trustworthy binding between (1) the complete human-readable content the owner reviewed, (2) the exact bytes/identity being endorsed, and (3) the narrow meaning of the approval.** The signing tool must not be able to substitute signed content without that mismatch being detectable to the owner.

NIST's signed-data report distinguishes the electronic context (the precise input stream) from the visual context (what the person sees). It notes that the verifier needs to reconstruct the signed context and check that it is consistent with the visual context. A valid signature alone does not prove that the owner saw or understood the same content.  
Source: https://csrc.nist.gov/csrc/media/projects/cryptographic-standards-and-guidelines/documents/commondataformat_110101.pdf (especially sections 4.1–4.2, PDF pp. 8–9).

Ledger Donjon's secure-display threat model likewise describes why an untrusted host can misrepresent what a signer is approving, and why trusted display and trusted input are separate security properties. This is an engineering reference, not an endorsement of a product for Nexo.  
Source: https://donjon.ledger.com/threat-model/device-secure-display-and-inputs/

## Candidate paths compared

| Path | What it can improve | What it does not prove | Current disposition |
|---|---|---|---|
| POCO + YubiKey 5 NFC | Hardware-held signing key; key extraction resistance; explicit physical interaction, depending on app/configuration | That POCO displayed the exact signed bytes; that initial enrollment was legitimate; canonical currentness; independent verifier; protected-effect enforcement | Do not purchase/configure yet. YubiKey lacks its own human-readable trusted display for this artifact. |
| Moto G52 offline review/signing app | Can separate the signing interface from the POCO/Core and reduce direct online-host exposure if kept offline; can independently parse a candidate artifact if software is purpose-built | Airplane mode does not prove OS/app integrity; a second device is not automatically an independent trust domain; no app/build/firmware/source provenance or trusted display has been selected | Candidate for later bounded experiment only, after defining its claim and software provenance. No wipe/flash/install authorized or required by this analysis. |
| POCO-only local review record | Lowest cost and simplest workflow; may be useful as a user-facing convenience | Independent proof of review, resistance to malicious Core/OS, exact content binding, authority/currentness | At most a self-reported operational record, not constitutional evidence. Current host threat model says do not implement Scope A until this choice is explicit. |
| Human review of repository/chat draft without a signing ceremony | Can establish an ordinary human decision if the owner actually reviews the full draft and explicitly confirms it | Cryptographic binding to immutable bytes, canonical artifact freeze, independent machine-verifiable provenance, current authority or mission authorization | Possible later as a clearly labelled human decision record, but not yet occurred and must not be backfilled from conversation history or document display. |
| Paper printout + signature | Human-readable review and a physical indication of intent | Machine-verifiable byte identity or protection against later substitution unless a separate binding is defined | Not presently available (no printer); do not make it a blocker or assume handwritten signature solves electronic binding. |

## Trust-path rules that follow

1. **Do not conflate these events:** artifact located; artifact fully reviewed; owner approved a specific scope; public key enrolled; signature verified; authority judged current; protected effect authorized. Each is a distinct claim and needs its own evidence.
2. **No blind signing.** Signing a digest or opaque challenge while relying on the same potentially untrusted host to explain what it represents is insufficient. A digest can bind bytes after a canonical representation is defined; it does not establish that those bytes were correctly presented or constitutionally legitimate.
3. **An offline device is not automatically a trusted device.** It reduces network attack paths, but its OS, app, update chain, parser, display, input and physical provisioning remain dependencies. Separate hardware is useful only if the relevant common-mode failure is reduced and the dependency closure is evidenced.
4. **A key's proof is role-bounded.** A signature can show that a key signed a specific statement. It cannot make the key its own legitimate owner root, prove the statement true, establish currentness/revocation, or close the final mutation boundary.
5. **No authority-bearing effect from Scope A.** A review record or candidate signature must remain incapable of authorizing missions, external actions, or protected effects.
6. **Failure stays UNKNOWN/STOP.** If exact reviewed-content binding, signer intent, verifier provenance, currentness, or the required dependency closure cannot be demonstrated, preserve the candidate and report the gap rather than inventing an enrollment success.

## Smallest next gate — design, not implementation

Before buying hardware or modifying either phone, specify a single ceremony contract in prose and map it against MASTER + existing AB/P/P112 contracts. It must answer:

- What exact complete artifact and scope is presented, including exclusions and amendment/version identity?
- Which component independently derives or validates the exact bytes that the signing operation receives?
- Which display/input path does the owner rely on, and what compromise is in scope?
- What exactly does approval mean: review acknowledgement, candidate endorsement, constitutional ratification, or permission for a named effect? These meanings must not be interchangeable.
- Which verifier validates the signature and policy, and how is that verifier's trust basis established without self-authentication?
- How are revocation, stale artifacts, replay, competing versions, recovery and currentness handled?
- Which final effect-capable sink must enforce the resulting authority, and what proves there is no bypass?

If the answers require an unproven trust claim, do not implement the ceremony. The next useful artifact is the contract and unresolved-decision list, not an APK, key setup, new commit primitive, or another CI run.

## Decision

- No new hardware purchase is justified by current evidence.
- Keep the POCO stock/locked; do not modify the Moto G52 merely to create an appearance of independence.
- Keep YubiKey 5 NFC as a possible later key-custody component, not as the bootstrap root.
- The Moto G52 remains a candidate for a future isolated presentation/parser experiment only if an explicit security property, trusted software provenance, recovery plan and testable claim are defined first.
- No key generation, signing, digest, canonical Constitution freeze, review event, ceremony, Scope A implementation, Authority Context, code/test/workflow/dependency/APK/device/deployment change occurred.

**STEP 7 remains OPEN / STOP / UNKNOWN. No commissioning and no protected effects.**
