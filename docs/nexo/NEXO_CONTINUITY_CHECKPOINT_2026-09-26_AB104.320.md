# NEXO CONTINUITY — AB104.320

## Canonical state
AB104.320 research persisted. No implementation performed.

## Finding
Threshold signatures prove threshold participation under a cryptographic scheme; they do not automatically prove independent failure domains. Current IETF work distinguishes distinct witnesses from repeated observations by one operator, and Byzantine quorum safety depends on explicit intersection/fault assumptions. citeturn0search1turn0search3turn0search18

## Required distinction
`CRYPTographic_THRESHOLD != EFFECTIVE_INDEPENDENT_THRESHOLD`

Effective independence is claim-specific and depends on provenance/failure domains. Raw signature count must not be used as a proxy for independent evidence.

## Constraints
Research first; no V21; no implementation; no unsupported verification/security claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.321: study Byzantine quorum certificates versus evidence corroboration and define which claims a quorum certificate can and cannot establish.

## DO-NOT-REPEAT
Do not equate threshold signatures, quorum size, or repeated signatures with independent evidence without analyzing shared domains.
