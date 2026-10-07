# P112 LOCAL JOURNAL VS STORAGE DURABILITY AUDIT V1 — 2026-10-07

Research-only. No implementation.

## Evidence
Current `scripts/simulate.mjs` has `persistState()` with lock → revision check → temp `writeFile()` → `rename()` → unlock. Repository search found no `fsync`, `fdatasync`, or `FileHandle.sync()` use associated with `persistState`.

Node documents `filehandle.sync()`/`fsync()` as the mechanism requesting data be flushed to the storage device; the current persistence primitive does not invoke such a barrier. citeturn0search0

## Separation established
Two independent guarantees must not be conflated:

1. **Logical recoverability:** a journal/commit marker can tell recovery what transition was prepared, attempted, committed, or remains UNKNOWN.
2. **Physical durability:** a storage contract must establish when the journal/state bytes are actually durable enough for the chosen crash model.

A logical commit marker written through the existing `writeFile`/`rename` path is not, by itself, proof of power-loss durability.

## Minimal candidate without assuming a database
For the local protected transition, the smallest conceptual record remains:
`AdmissionID/OperationID + dependency/provenance snapshot + PREPARED + resulting local delta or resulting state identity + COMMITTED/UNKNOWN recovery marker`.

Recovery can then classify:
- no durable PREPARED → NOT_COMMITTED;
- durable PREPARED, no committed marker → PREPARED/UNKNOWN and reconcile before retry;
- durable COMMITTED marker → COMMITTED, subject to the storage durability contract;
- ambiguous storage outcome → UNKNOWN until canonical state/journal evidence resolves it.

## Critical distinction
`rename()` gives a namespace replacement boundary, but the repository has not demonstrated a storage durability barrier after the temp write or directory durability after rename. Therefore do not claim a universal crash/power-loss linearization point from `persistState()`.

## Architecture implication
The journal/commit protocol and the storage durability contract are separate layers. A future bounded local transaction can reuse the current lock/temp/rename machinery, but only after explicitly choosing its crash model and proving the required durability barriers. This does not solve external-effect exactly-once or effect fencing.

## Status
GREEN: separation between logical recovery evidence and physical storage durability is established from repository code plus Node documentation.
BLUE: exact crash model required by Nexo and the minimum durability barrier needed for that model remain OPEN.

## Exact next
Audit whether existing journal fields can represent PREPARED/COMMITTED/UNKNOWN without ambiguity, then map which existing `nexoMemory` state is durable through `persistState()` and which execution metadata is still in-memory only.

## DO-NOT-REPEAT
No fsync implementation; no database migration; no TLC rerun; no global stateRevision promotion; no AB104.185 primary; no AB105.117R.
