# NEXO Canonical Core V10 — Lease/Takeover Structural Specification

V10 is the planned structural successor to V9. It is intentionally specified before code so lease expiry cannot be added as a patch that creates contradictory state semantics.

## Lease record

Each coordination lease is modeled as:

`{state, owner, generation, expiresAt}`

A lease is authoritative only when `state = HELD` and `expiresAt > now`.

## Linearization rules

### Acquire
Preconditions:
- lease is FREE, or EXPIRED with `expiresAt <= now`;
- required mutual-exclusion lease is not HELD and unexpired;
- current STOP/authority admission permits acquisition.

Postconditions:
- state becomes HELD;
- owner becomes caller;
- generation becomes old generation + 1;
- expiry is set from the current bounded lease duration.

Exactly one acquisition may linearize for a generation.

### Expire
Precondition:
- state = HELD;
- `expiresAt <= now`.

Postcondition:
- state becomes EXPIRED;
- owner is retained as historical metadata but loses authority to act;
- generation does not decrease or reset;
- no external-effect state is changed.

### Takeover
Takeover is an acquire after expiry and therefore obtains a strictly newer generation. A stale owner must fail every owner+generation guarded operation.

## Evidence interaction

Evidence is not owned by a lease. Expiry therefore does not automatically delete valid evidence.

Instead, evidence validity is recomputed against:
- exact operation/effect/target binding;
- evidence freshness;
- authority epoch;
- policy version;
- graph/dependency version;
- dependency state;
- provenance/observer requirements;
- current STOP and safety context.

Thus:

`lease expiry != evidence invalidation`

and

`lease takeover != evidence truth`

## Recovery/reconciliation exclusion

For every operation:

`ValidRecoveryLease => not ValidReconciliationLease`

`ValidReconciliationLease => not ValidRecoveryLease`

The mutual exclusion test must use validity at `now`, not merely a stale state label.

## STOP interaction

STOP has dominance over active execution and pending release authorization. Lease expiry cannot clear STOP. Takeover cannot clear STOP. Recovery acquisition during STOP may be allowed only if explicitly modeled as containment/recovery work; it must never grant release authority.

## Required V10 scenarios

T01 acquire at exact expiry boundary
T02 two owners race on same expired lease
T03 stale owner acts after takeover
T04 old generation tries release authorization
T05 recovery takeover while reconciliation held
T06 reconciliation takeover while recovery held
T07 evidence remains fresh after takeover
T08 evidence expires after takeover
T09 authority revoke after takeover
T10 STOP after takeover before release
T11 process restart with expired lease
T12 checkpoint restore with old generation

## Required temporal obligations

For each lease:

1. generation changes only on successful acquire/takeover;
2. generation never decreases;
3. successful takeover has strictly greater generation;
4. stale owner+generation cannot mutate protected state;
5. expiry cannot create external-world conclusions;
6. lease validity is time-dependent;
7. historical owner metadata is not current authority.

## Implementation correspondence obligation

The concrete implementation must provide an atomic primitive or equivalent serialization for acquire/expire/takeover. A TLA+ atomic action models this ordering but does not prove that a distributed implementation is linearizable.

Status: SPECIFIED / NOT IMPLEMENTED / NOT FORMALLY CHECKED.
