AB105 G0 visibility probe correlation gate — 2026-10-03

The broker has one long-lived MetadataLoader owner thread and Processor owner thread across the 10-cycle witness. A simple last-value ThreadLocal is insufficient because multiple relevant authorizations can occur before/after each W1.

Neutral capture design: preallocated per-thread fixed records; no allocation during W1/AUTH. Each relevant W1/AUTH capture stores the already-read cache reference (experiment) or matched sentinel (control) plus a local timestamp. Timestamp capture is required only for post-window cross-thread reconstruction; control performs the same timestamp operation. No timestamp or record is read by another thread during the race.

Post-window reconstruction: merge owner-thread records after shutdown/join, then identify each cycle's first matching WRITE authorization after its W1 as the D1 candidate, using the existing harness phase boundaries. Ambiguous/truncated/missing records => UNKNOWN. A differing cache identity is evidence that D1 selected a different cache object; it is not by itself proof of stale or incorrect authorization.

Gate status: design CLOSED for implementation review. Still required before workflow execution: exact fixed-record diff review, compile/static checks, then control and experiment runs. AB105.116R unchanged; no TLC; PR #94 unmerged.