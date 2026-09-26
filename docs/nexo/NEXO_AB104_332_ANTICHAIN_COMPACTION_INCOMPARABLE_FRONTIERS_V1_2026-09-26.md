# NEXO AB104.332 — Antichain preservation during recovery-frontier compaction

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
Vector clocks represent distributed causality as a partial order and explicitly distinguish incomparable/concurrent states; distributed checkpoint/recovery uses this distinction rather than forcing a total order. citeturn0search22turn0search24

## Finding
A recovery frontier cannot safely be compacted by retaining only the numerically largest/scalar revision when frontiers are incomparable. The retained state may need an **antichain**: the minimal set of mutually incomparable frontiers that still dominates every safely discardable predecessor.

Candidate rule:
`GC(F) is safe only if every discarded frontier f is dominated by retained evidence r, OR an authenticated summary preserves every claim that f could uniquely support.`

If `f || g`, neither may be discarded merely because one has a larger scalar timestamp elsewhere. Scalarization can erase causality/incomparability information.

## Nexo consequence
Compaction must preserve:
- incomparable frontier elements required by live safety/history claims;
- coverage boundaries and UNKNOWN/CONFLICT states;
- dependency/lineage and target incarnation;
- authority/fence frontier independently from data frontier.

Candidate states: `ANTICHAIN_PRESERVED | DOMINATED_AND_COMPACTED | SUMMARY_COVERED | COMPACTION_GAP | COMPACTION_CONFLICT | UNKNOWN`.

No final antichain representation, GC algorithm, or proof selected. No implementation/formal verification performed.

## Next
AB104.333 — study frontier dominance/coverage queries: define when one retained summary truly subsumes another without hiding a unique UNKNOWN or conflict.
