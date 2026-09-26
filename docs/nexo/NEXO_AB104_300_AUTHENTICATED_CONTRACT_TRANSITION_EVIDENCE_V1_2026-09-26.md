# NEXO AB104.300 — Authenticated contract-transition evidence
Date: 2026-09-26
Status: RESEARCH-ONLY

## Findings
1. A contract transition must bind source contract identity, target contract identity, migration rule identity, and the authority that approved the transition.
2. Hashing the artifacts provides integrity/content identity; it does not by itself establish that the signer was authorized to approve the semantic transition.
3. Therefore transition evidence should bind both content and authorization context: source digest, target digest, migration digest, transition-policy/version, approver identity/authority epoch, target scope, and issuance/validity metadata.
4. The transition must also state its semantic result: UNCHANGED, COMPATIBLE, MIGRATABLE, BREAKING, or UNKNOWN. UNKNOWN must not be upgraded by signature alone; the signature authenticates the claim, not its truth.
5. Existing operation records should retain the original contract binding. A migration certificate may establish a relation to a successor contract, but should not rewrite historical evidence.
6. A current execution decision must independently verify that the transition is authorized, not revoked/superseded, applies to this target incarnation, and covers the exact operation/effect contract.
7. Recent work on consequential agent effects reinforces the separation: artifacts may each verify correctly while the executor still needs exact-action binding, authorization, durable consumption, provider entry, and authenticated reconciliation. This is an Internet-Draft, not a finalized standard. citeturn0search6
8. A useful research candidate is a signed transition certificate whose verification inputs are explicit and whose semantic-preservation claim is separately classified from cryptographic validity.

## Candidate invariant
`AUTHENTIC(TRANSITION_CERT) != SEMANTICALLY_SAFE(TRANSITION)` unless the certificate's authorized signer, scope, transition rule, evidence, and semantic criteria are all satisfied.

## Non-claims
No architecture selected; no implementation; no formal verification; no semantic freeze.

## Next exact step
AB104.301 — investigate revocation/supersession of contract-transition certificates and how old operations remain historically interpretable after authority changes.
