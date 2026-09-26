# NEXO AB104.321 — BFT quorum certificate claim boundary

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
A Byzantine quorum certificate (QC) can establish a protocol-scoped statement when its validator set, quorum rule, signatures, view/epoch, and safety assumptions are valid. In HotStuff-style systems, a 2f+1 quorum over n=3f+1 gives quorum intersection containing at least one correct validator; safety also depends on protocol locking/ancestry rules, not the certificate signature alone. citeturn0search0turn0search2turn0search5

## What a QC can establish
- A sufficient set of authorized protocol participants endorsed the exact certified statement under the specified configuration.
- Under the protocol's assumptions, conflicting certificates can be constrained by quorum intersection and correct-voter rules.
- A certificate can therefore support a **protocol fact** such as consensus on a value/commit point.

## What a QC does NOT establish by itself
- Real-world truth of the payload.
- Completeness of the evidence universe.
- Independent failure domains among signers.
- That an external target actually performed a requested effect.
- Current authorization after epoch/revocation changes.
- Correctness of an arbitrary application-level semantic interpretation.

## Nexo boundary
`VALID_QC = protocol_evidence`, not `universal_truth` and not `external_effect_receipt`.

A QC should therefore be modeled with explicit scope: validator-set/config digest, epoch/view, statement digest, quorum rule, signer set/threshold, and protocol assumptions. When any required scope/configuration is unknown or incompatible, the certificate cannot be promoted to a stronger claim.

## Recovery classification candidate
`QC_VALID_PROTOCOL_FACT | QC_SCOPE_UNKNOWN | QC_CONFLICT | QC_STALE_AUTHORITY | QC_INSUFFICIENT_FOR_CLAIM`

No implementation or final certificate schema selected.

## Next
AB104.322 — study certificate freshness across authority epochs/reconfiguration: determine when an old valid QC remains historical evidence but cannot authorize current execution.
