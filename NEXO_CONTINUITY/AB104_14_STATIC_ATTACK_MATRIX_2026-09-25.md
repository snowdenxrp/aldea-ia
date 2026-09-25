# AB104.14 — static attack matrix — 2026-09-25

## Objective
Attack the packed representation at the representation boundary before attempting any claim of quotient congruence.

## Cases

| Case | Change | Conservative result |
|---|---|---|
| E0 | identical packed records | TRUE at representation-view level, subject to known fields/linkage |
| E1 | remove ReplayBinding | UNKNOWN, because complete bridge reconstruction is unavailable |
| E2 | mark TemporalValidity UNKNOWN | UNKNOWN, not FALSE |
| E3 | alter AttemptBinding value | FALSE, known bridge difference |
| E4 | alter admission attempt identity | FALSE, known actual-linkage difference |
| E5 | alter invalidation history only | UNKNOWN for future behavior; representation difference alone does not establish P_AA difference |
| E6 | PolicyChange after packing | UNKNOWN until a complete transition/invalidation law maps it to successor state |
| E7 | ResourceReincarnate after packing | UNKNOWN for future behavior until complete reincarnation law is available |

## Key result
The comparator can now distinguish known representational loss from epistemic uncertainty. It still cannot establish future behavioral congruence because the protocol's successor relation is incomplete.

## No-go conclusions
- No P_AA collision established.
- No quotient congruence theorem established.
- No safe field elimination established.
- No LEASE_RENEW or LEASE_CONSUME semantics invented.

## Execution boundary
This matrix is a source-level research result. Runtime execution is NOT_VERIFIED.
