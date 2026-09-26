# AB104.111 — Nexo lineage + persisted execution identity — 2026-09-25

## Continuity
Previous checkpoint: AB104.110, failure -> observation-driven replan.
Implementation commits in this round:
- `c372511643fe9d44b1d3f789e8de725c5a358dfa` — execution journal in Nexo memory.
- `9fc691b767d9c27552267463989de582ae874b61` — effect-adapter restores/persists idempotency results from journal.
- `631c6dd5823210408b8f0e30d19ab47edf00484a` — Lúmina adapter wired to the journal.
- `36a920fe07eb401b243de4c73578f4491d5dafce` — runtime records execution identity.
- `b4002d1680636a023e86718e9207d78ef38ef1cc` — explicit mission lineage.
- `36edd207aa9f4a4676ef4d78c0d9959bfcf0e064` — regression coverage for restart-style duplicate execution and lineage.

## Structural advance
Nexo now has an explicit execution ledger in its durable memory shape:
`missionId + stepId + idempotencyKey + action + target + result + timestamp`.

The concrete effect adapter can be recreated with the same persisted execution journal. A duplicate request is returned from the journal without rerunning the handler, so the simulation consequence is not applied twice. This is stronger than the previous process-local Map, but it is only crash/restart durable when the surrounding system actually persists the memory object.

Replans now carry explicit:
- `parentMissionId`
- `replanReason`

This removes the previous ambiguity where lineage was only inferred from timestamps or similar observations.

## Regression evidence
The runtime test simulates adapter recreation by executing a successful `drink`, rebuilding the adapter from the persisted journal, and issuing the same mission/step again. It asserts:
- success is recovered from the journal;
- the precondition is not rerun;
- water is not consumed twice;
- thirst is not modified twice;
- the journal still contains one execution record.

The same test asserts that a replan explicitly references its failed parent mission and reason `environment_changed`.

## CI status at checkpoint creation
Run `2190` / workflow ID `36203298338` for commit `36edd207aa9f4a4676ef4d78c0d9959bfcf0e064` was **IN PROGRESS** when this checkpoint was written. It had completed synchronization and was running assistant validation. Do not claim this implementation as fully CI-verified until this run reaches a terminal SUCCESS state.

## Boundary
This does not create arbitrary external autonomy, OS/device control, or crash-proof storage by itself. The ledger is a software contract; durable storage depends on the caller persisting `memory`. No formal verification is claimed.

## Next exact action
1. Verify Run 2190 to terminal state; inspect logs if failure occurs.
2. If green, add a multi-step mission test proving step 2 depends on verified completion of step 1 and that a failed step triggers lineage-preserving replan.
3. If storage architecture permits, make persistence atomic at the mission checkpoint boundary rather than merely mutating an in-memory object.
4. Continue with longer-running/recovery probes and persist the next checkpoint.
