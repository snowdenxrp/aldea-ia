# AB61 — AB55 REPRODUCTION OUTPUT — 2026-09-25

Source executed:
NEXO_CONTINUITY/AB55_FINITE_RESEARCH_INTERPRETER.py

Result: EXACT MATCH with historical AB55 report.

| Attack | Histories | TRUE | FALSE | UNKNOWN |
|---|---:|---:|---:|---:|
| POLICY_CHANGE + DELEGATION_CHANGE + ADMIT | 384 | 8 | 376 | 0 |
| DELEGATION_CHANGE + RESOURCE_REINCARNATE + ADMIT | 384 | 8 | 376 | 0 |
| LEASE_RENEW + POLICY_CHANGE + ADMIT | 384 | 8 | 184 | 192 |
| LEASE_EXPIRE + RETRY + ADMIT | 384 | 12 | 180 | 192 |
| DECIDE + AUTH_REVOKE + ADMIT | 384 | 12 | 372 | 0 |
| RECHECK + MUTATION + ADMIT | 384 | 10 | 150 | 224 |
| RETRY + LEASE_CONSUME + ADMIT | 384 | 12 | 180 | 192 |
| RESOURCE_REINCARNATE + LEASE_RENEW + ADMIT | 384 | 8 | 184 | 192 |

Reproducibility status: CLOSED for the historical AB55 bounded interpreter results.

Interpretation:
- This validates the provenance of the historical AB55 counts against the recovered source.
- It does not validate AB55 as protocol proof.
- UNKNOWN remains epistemic.
- The AB55 report is not modified.
- The next gate is the repaired AB61 observational/EventDAG execution.
