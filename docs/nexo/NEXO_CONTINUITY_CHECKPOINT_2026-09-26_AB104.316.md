# NEXO CONTINUITY — AB104.316

## Canonical state
AB104.316 research persisted. No implementation performed.

## Finding
Compaction, retention expiry, and partitioned history create explicit coverage gaps. A gap in the interval where an operation could have committed prevents a negative claim: preserve UNKNOWN unless independent authenticated archival evidence covers it.

## Required semantics
Coverage state: COVERED, PARTIALLY_COVERED, GAP, CONFLICT, UNKNOWN. NOT_COMMITTED requires complete coverage across the possible commit interval plus authenticated non-membership. Any unresolved GAP => UNKNOWN.

## Constraints
Research first; no V21; no historical patching; no unsupported security/correctness/verification claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.317: study independent archival coverage and common-mode failure; determine when a second evidence source actually adds independence versus repeating the same blind spot.

## DO-NOT-REPEAT
Do not interpret compaction, retention expiry, missing partition history, or an older restored revision as proof that an external operation never committed.
