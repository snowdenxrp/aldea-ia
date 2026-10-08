# Nexo NCS — Adversarial Review: Minimum Commissioning Binding Contract
Date: 2026-10-08
Status: design attack; no runtime implementation or formal verification performed.

## Review boundary
Attacks the candidate at `NEXO_NCS/BUILD/STEP_7_MINIMUM_COMMISSIONING_BINDING_CONTRACT_2026-10-08.md`. This is not a rerun of historical AB/P probes: the target is the new contract's commissioning semantics. Findings are architectural reasoning, not execution evidence.

## Attack results

| Attack | Candidate response | Disposition |
|---|---|---|
| Model/provider fabricates “owner approved” | Model/provider output is not authority evidence; independent recognition of the legitimate act is required. | BLOCKED by stated rule; concrete recognition mechanism OPEN. |
| Same device creates a key and uses it to certify its own genesis | Self-authentication/circular bootstrap prohibited. | BLOCKED as an accepted path; no viable genesis basis yet, so activation remains UNKNOWN. |
| Valid signature/hash/attestation exists but signer or root was never legitimately commissioned | Cryptographic validity alone cannot create legitimacy. | BLOCKED by stated rule. |
| Replay a legitimate commissioning record against a different Constitution version/context | Exact identity/version/digest/context binding and replay rejection. | BLOCKED by stated rule; canonical encoding and replay-proof implementation OPEN. |
| Constitution is substituted while keeping a familiar name or partial digest | Exact binding must identify the actual regime; ambiguous scope fails closed. | BLOCKED semantically; exact representation/canonicalization OPEN. |
| Root/credential was revoked, but an offline verifier has stale status | Currentness and revocation state are required; unresolved status yields UNKNOWN. | BLOCKED from positive activation; offline freshness/revocation mechanism OPEN. |
| Owner unavailable; system infers consent or delegates authority to model/provider | Unavailability is not consent/delegation; no implicit fallback. | BLOCKED by stated rule. |
| Recovery path claims it may appoint itself as owner/root | Recovery cannot self-promote; separate governed transition required. | BLOCKED by stated rule; recovery policy OPEN. |
| Two successor claims conflict and neither has governed ordering | Conflicting claims remain unresolved; UNKNOWN, no auto-promotion/merge. | BLOCKED from selecting either; ordering/predecessor cutoff OPEN. |
| Hardware reports measured boot or key protection, then claims constitutional legitimacy | Hardware evidence is bounded to the property it can establish; technical integrity ≠ legitimacy. | BLOCKED by stated rule. |
| Contract returns ESTABLISHED, then caller treats it as authorization to execute an arbitrary action | Result scope expressly excludes later operation authority and execution/effect. | BLOCKED semantically; any future API must preserve typed scope. |
| Revocation request is issued, caller interprets request as globally enforced | Contract requires revocation state and explicitly avoids claims of universal enforcement without evidence. | BLOCKED as a justified claim; enforcement evidence/coverage OPEN. |
| Required dependency cannot be checked or provenance is incomplete | UNKNOWN, dependent activation blocked, evidence preserved. | BLOCKED by stated rule. |

## Design gaps exposed (not patched here)
1. **Independent genesis basis remains the hard blocker.** The contract can forbid circularity but cannot itself produce a non-circular source of legitimacy.
2. **Evidence representation is underspecified.** Canonical Constitution identity/version/context encoding, anti-replay binding, evidence provenance format, and dependency closure must be specified before implementation.
3. **Currentness under disconnection is not solved.** The correct outcome can be UNKNOWN; this is a safe semantic outcome, not a claim that availability or freshness is implemented.
4. **Transition lifecycle is intentionally outside scope.** Amendments, replacement, delegation, recovery, migration, and succession must not be smuggled into commissioning. They need separate contracts linked to the established governance rules.
5. **Enforcement cannot be inferred from declaration.** Any future consumer must preserve the difference between a requested/recorded block and an independently verified enforced block.

## Decision
No contradiction found in the candidate's core fail-closed semantics. This is not a proof of completeness or security. Keep the contract as a candidate; do not implement or activate Constitution/Policy authority until an independently recognized genesis basis and its threat model are selected and the evidence representation is specified.

## Next step
Reconcile only the unresolved items against existing Master, preservation addendum, trust-foundation research, and commissioning/succession decisions. Do not re-run old probes or reopen closed conclusions. If the documents already settle an item, cite that source in the next checkpoint instead of creating another duplicate investigation.
