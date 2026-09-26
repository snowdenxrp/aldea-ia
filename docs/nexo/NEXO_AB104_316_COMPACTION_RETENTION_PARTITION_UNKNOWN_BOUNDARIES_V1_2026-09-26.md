# NEXO AB104.316 — Compaction, retention, partitioned history, and UNKNOWN boundaries

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Finding
Historical coverage is a bounded resource. Compaction or retention expiry can make prior revisions inaccessible; a partition can leave a gap in the authoritative history. When the operation could lie inside an uncovered interval, negative evidence cannot establish NOT_COMMITTED and must remain UNKNOWN.

## Evidence
etcd documents that compaction removes historical revisions before the compaction point and that reads requiring those revisions fail. It also documents revision bumping during snapshot restore so old revisions do not appear current. RFC 9162 shows why authenticated append-only continuity can prove relationships between tree states, but continuity does not recreate entries that are no longer covered. citeturn0search1turn0search5turn0search0

## Nexo consequence
1. Coverage must be represented explicitly as a frontier/interval, not assumed from current state.
2. Compaction boundary before the queried operation => historical absence is UNKNOWN unless an independent authenticated archive covers that interval.
3. Partitioned or unavailable history => UNKNOWN for claims requiring the missing interval.
4. Retention expiry removes proof availability; it is not evidence of non-execution.
5. Restore must establish a new monotonic revision/incarnation boundary; an older revision must not masquerade as current.
6. Independent archival evidence can close a gap only if its lineage, coverage, target incarnation, and authenticity are themselves established.

## Candidate coverage state
`COVERED | PARTIALLY_COVERED | GAP | CONFLICT | UNKNOWN`

Negative claim rule: `NOT_COMMITTED` requires `COVERED` for every interval in which the operation could have committed, plus authenticated non-membership. Any `GAP` => `UNKNOWN`.

## Explicit non-claims
No specific archival mechanism or retention period is selected. No implementation or formal verification performed.

## Next
AB104.317 — study independent archival coverage and common-mode failure: when does a second evidence source actually add independence rather than duplicate the same blind spot?
