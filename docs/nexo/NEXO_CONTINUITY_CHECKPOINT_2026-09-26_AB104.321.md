# NEXO CONTINUITY — AB104.321

## Canonical state
AB104.321 research persisted. No implementation performed.

## Finding
A valid BFT quorum certificate is protocol-scoped evidence. In HotStuff-style consensus, quorum intersection plus protocol locking/ancestry supports safety; signatures/QC validity alone do not establish universal truth or an external effect. citeturn0search0turn0search2turn0search5

## Critical boundary
`VALID_QC = protocol_evidence`
`VALID_QC != universal_truth`
`VALID_QC != external_effect_receipt`

QC scope must include validator configuration, epoch/view, statement digest, quorum rule, signer/threshold evidence, and applicable protocol assumptions.

## Constraints
Research first; no V21; no implementation; no unsupported verification/security claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.322: study certificate freshness across authority epochs/reconfiguration and when an old valid QC becomes historical-only evidence.

## DO-NOT-REPEAT
Do not treat a valid quorum certificate as proof of application truth, completeness, external effect, or current authorization without additional evidence.
