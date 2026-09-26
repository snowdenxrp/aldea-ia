# NEXO AB104.334 — Retention obligations from live/future recovery claims

Date: 2026-09-26
Status: RESEARCHED / PERSISTED — no implementation

## Evidence
Distributed checkpoint GC research defines safe collection in terms of future recovery usefulness: obsolete checkpoints may be discarded only when they cannot be useful for any future recovery; dependency propagation can force retention even when a checkpoint looks old. citeturn0search24turn0search7 Fault-tolerant distributed GC likewise requires reclamation to account for references that may remain remote or hidden by failure. citeturn0search0turn0search2

## Finding
For Nexo, retention cannot be age-only. A frontier/evidence item is **live** while any supported or potentially revalidated claim may still require its unique information.

Candidate retention roots:
- active recovery contracts/missions;
- unresolved UNKNOWN/CONFLICT claims;
- active authority/incarnation/fence transitions;
- retained operation/effect reconciliation obligations;
- archive/coverage certificates whose validity depends on the item;
- future recovery paths explicitly permitted by policy.

GC is safe only after dependency reachability shows that every discard candidate is either dominated by retained evidence or replaced by an authenticated summary that preserves all claim-relevant information. This mirrors recovery-GC work where future-usefulness, not age, determines whether a checkpoint is obsolete. citeturn0search24

## Critical consequence
`OLD != GARBAGE`
`UNREFERENCED_NOW != SAFE_TO_DELETE`
`RETENTION_EXPIRY != NOT_COMMITTED`

An unresolved UNKNOWN is itself a retention obligation when its underlying evidence is required to resolve a supported claim later.

Candidate states: `RETAINED_LIVE | RETAINED_FOR_UNKNOWN | RETAINED_FOR_TRANSITION | SUMMARY_SUBSTITUTED | GC_ELIGIBLE | UNKNOWN | CONFLICT`.

No final retention algorithm, policy, implementation, or formal proof selected.

## Next
AB104.335 — study how to encode retention roots/dependencies so GC can be audited and cannot silently delete evidence needed by a later recovery query.
