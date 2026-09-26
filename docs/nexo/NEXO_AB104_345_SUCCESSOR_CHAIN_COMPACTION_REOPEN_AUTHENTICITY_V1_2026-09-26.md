# NEXO AB104.345 — Successor chains across compaction/reopen

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
etcd compaction makes prior revisions inaccessible; therefore disappearance after compaction cannot establish that an historical event did not occur. citeturn0search4turn0search6 Restore creates a new logical cluster identity and can bump/mark revisions so old revisions are not mistaken for current state. citeturn0search0turn0search2

## Finding
A retirement→successor/reopen chain must preserve authenticated lineage across compaction. The retained successor record must bind the predecessor retirement certificate, the new authority/incarnation frontier, and the exact semantic transition. Compaction may remove predecessor details only if an authenticated summary preserves the chain needed to establish the successor relation.

Candidate `SuccessorCertificate`:
`successor_id + predecessor_digest + claim_id + transition_type + new_frontier + authority_epoch + target_incarnation + semantic_version + dependency_summary_digest + coverage + status`

Candidate states:
`CHAIN_VALID | PREDECESSOR_COMPACTED_BUT_SUMMARIZED | PREDECESSOR_COVERAGE_GAP | REOPENED | CONFLICT | UNKNOWN`.

A restored target must not accept an old retirement certificate as current merely because its signature remains valid. New incarnation/authority barriers are required before execution. If compaction removed a dependency needed to authenticate the successor relation, the chain is UNKNOWN rather than inferred complete.

## Invariants
`AUTHENTIC_PREDECESSOR != COMPLETE_LINEAGE`
`COMPACTED_PREDECESSOR + AUTHENTIC_SUMMARY => potentially recoverable lineage`
`MISSING_LINEAGE_COVERAGE => UNKNOWN`
`OLD_CERTIFICATE != CURRENT_AUTHORITY`

## Status
Exact chain format, compaction summary scheme, and formal proof remain UNSELECTED. No implementation or formal verification performed.

## Next
AB104.346 — study whether successor-chain summaries themselves need independent witnesses/archive coverage, and how to detect a malicious or accidental omission of a predecessor link.
