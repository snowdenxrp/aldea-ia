# NEXO AB104.348 — Common-mode analysis for witness/archive sets

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
C2SP witness policies explicitly model witness groups and quorum rules, including separate groups, rather than assuming a raw witness count is sufficient. citeturn0search5 The witness protocol requires each witness to compare a new checkpoint against its previously observed state; cosignatures therefore attest to consistency from that witness's retained frontier. citeturn0search1turn0search4 RFC 9162 likewise distinguishes append-only consistency auditing from the harder problem of consistency of the view presented to different observers. citeturn0search6

## Finding
For Nexo, witness independence must be evaluated against the **failure domains relevant to the claim**, not by counting keys. Candidate domains: operator, authority/root, acquisition path, upstream source, software/verification implementation, storage, physical/site dependency, credential/key management, and restoration dependency.

Two witnesses that share a single authoritative source, storage system, signing operator, or restore snapshot may provide multiple signatures but one effective failure domain. Conversely, witnesses from distinct domains can add evidence against a common-mode omission even when their protocol role is identical.

Candidate `IndependenceProfile`:
`witness_id + operator_domain + authority_domain + acquisition_domain + upstream_domain + software_domain + storage_domain + restore_domain + coverage_interval`

Candidate result:
`INDEPENDENCE_SUFFICIENT | INDEPENDENCE_CORRELATED | COMMON_MODE | COVERAGE_INSUFFICIENT | UNKNOWN | CONFLICT`.

## Critical boundary
Independence is **claim-specific**. A set can be independent for storage loss but correlated for authority compromise. Therefore Nexo must not reduce independence to one global boolean or score.

## Invariants
`WITNESS_COUNT != EFFECTIVE_INDEPENDENCE`
`MULTIPLE_KEYS != MULTIPLE_FAILURE_DOMAINS`
`INDEPENDENCE_FOR_CLAIM_A != INDEPENDENCE_FOR_CLAIM_B`
`COMMON_MODE_UNRESOLVED => UNKNOWN/STOP` when the claim depends on that separation.

## Status
Exact domain taxonomy, quorum composition, and formal proof remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.349 — study how to encode claim-specific independence requirements without introducing a scalar security score, and how quorum policy should reject correlated witness sets.
