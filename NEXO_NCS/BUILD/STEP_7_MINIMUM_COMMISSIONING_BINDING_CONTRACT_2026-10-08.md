# Nexo NCS — Minimum Commissioning Binding Contract
Date: 2026-10-08
Status: design candidate only; not implementation-authorized.

## Purpose
Specify the narrow binding between a legitimate initial commissioning act and the exact constitutional regime it commissions. This contract does not choose a cryptographic protocol, device, hardware root, credential format, or ceremony.

## Required binding
A commissioning decision may be recognized only when evidence establishes all of the following:
1. The commissioning act was made by the legitimate authority under the already-governed commissioning rule; a caller-supplied boolean, model/provider statement, inferred intent, or device-local claim is not evidence by itself.
2. The act is bound to the exact Constitution identity, version/content digest, and commissioning context. Substitution, ambiguous scope, or replay into a different context fails closed.
3. The authority-recognition basis is independently established for this deployment, with its provenance, dependencies, currentness, revocation/recovery state, and limitations available for appraisal.
4. The binding evidence is complete and internally consistent; conflicts without an already-governed ordering remain unresolved.

## Result semantics
Return exactly one of:
- `ESTABLISHED`: only the initial commissioning binding is established within the stated scope.
- `INVALID`: evidence contradicts the required binding or violates a defined invariant.
- `UNKNOWN`: evidence, currentness, independence, authority, dependency status, or ordering cannot be established.

`ESTABLISHED` does not prove platform integrity, authorize later operations, approve amendments/succession, establish execution/effect, or prove that revocation is enforced everywhere.

## Mandatory blocks
Do not establish the binding from a signature, hash, epoch, attestation, model output, or provider assertion alone. Do not permit self-authentication, circular same-device bootstrap without an independently justified basis, Constitution substitution, implicit consent/delegation during owner unavailability, emergency-recovery self-promotion, automatic provider fallback, or ungoverned successor selection. Unresolved revocation, incomplete dependencies, stale evidence, or conflicting successor claims yield `UNKNOWN` unless the already-governed rule explicitly resolves them.

## Failure and lifecycle boundaries
`UNKNOWN` or `INVALID` blocks dependent constitutional activation and dependent Policy authority establishment. Preserve evidence for review; do not silently retry, merge, promote, or reinterpret the result. Amendments, credential/root replacement, recovery, migration, delegation, and succession require separate explicit transition rules with their own authority, exact scope, ordering, revocation, and predecessor-cutoff/fencing semantics. This contract grants none of them.

## Unresolved prerequisites / implementation gate
Still unresolved: the independently recognized basis that authenticates the first legitimate act; its threat model and common-mode dependencies; credential loss/compromise and replacement; owner-unavailable behavior; and successor ordering/cutoff. Until these are selected from existing Constitution/Master constraints, documented, and adversarially reviewed, this remains a contract candidate and must not be implemented as if its trust root were established.

## Next action
Attack this contract against circular bootstrap, fabricated commissioning, replay/substitution, stale or revoked evidence, loss/offline recovery, conflicting successors, and false claims of enforcement. Record each attack as blocked, open, or falsifying; do not repeat closed historical probes unless the contract introduces a materially new risk.
