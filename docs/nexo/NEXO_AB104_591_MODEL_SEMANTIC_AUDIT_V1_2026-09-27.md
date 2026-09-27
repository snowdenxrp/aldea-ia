# NEXO — AB104.591 — Auditoría semántica del modelo TLA+ AB104.589

Date: 2026-09-27
Status: MODEL AUDIT — COUNTEREXAMPLES FOUND BY STATIC ANALYSIS
Production implementation: NONE.
TLC execution: NOT PERFORMED.

## Evidence
TLA+ is untyped; TypeOK is an explicit invariant rather than a language-level type system. TLC checks configured invariants over reachable states. citeturn0search2turn0search4
The standard action form uses primed variables for next-state values, and Init/Next define the transition system. citeturn0search6turn0search9

## Critical finding 1 — incarnation mutation misses QUEUED admission
Current `ChangeIncarnation` only changes `admission` to STALE when:
`admission = ADMITTED`.
But after Queue:
phase = QUEUED
admission = ADMITTED
boundIncarnation = I1
Then ChangeIncarnation permits:
incarnation' = I2
admission' = ADMITTED
boundIncarnation = I1

This produces:
admission = ADMITTED / boundIncarnation # incarnation

which violates the declared `Safety` invariant.

Therefore the model contains a reachable Safety violation in the conceptual transition graph.

## Critical finding 2 — authority revocation does not invalidate queued admission
`InvalidateAuthority` changes only `authority`.
A queued effect retains ADMITTED status. If authority is restored, the old admission can execute without a fresh admission.

That contradicts the AB104.571/585 boundary that authority/fence invalidation must invalidate the affected admission and require fresh validation.

Required correction for the model:
- authority/fence change relevant to an admission => STALE_ADMISSION;
- restoration does not resurrect the old admission;
- ReAdmit must bind a fresh authority/fence snapshot.

## Critical finding 3 — incarnation change while UNKNOWN is not represented
The model permits:
EXECUTING → UNKNOWN → ChangeIncarnation.

The old UNKNOWN remains attached to the new current incarnation without an explicit historical incarnation field on the outcome.

This cannot safely represent AB104.573/574 semantics.

Required model state:
`outcomeIncarnation` (or an immutable effect identity record) separate from current `incarnation`.

Then:
old UNKNOWN@I1 != current resource I2.

## Critical finding 4 — reconciliation is under-specified
`ReconcileCommitted` and `ReconcileNotCommitted` depend only on:
outcome = UNKNOWN / phase = OUTCOME.

No provider identity, resource incarnation, EffectID, evidence digest, or authority-independent evidence is required.

Thus the model permits a local action to convert UNKNOWN into COMMITTED without modeling the authoritative evidence that AB104.572–574 require.

This is acceptable only as a placeholder transition, not as a faithful formalization.

## Critical finding 5 — compensation typing is too weak
Compensation uses strings `"PENDING"` and `"COMMITTED"` while outcome uses model constants.
TLA+ permits strings, but the model's semantic distinction is fragile and not identity-bound.

More importantly, `CommitCompensation` has no phase/authority/incarnation/contract preconditions.

It therefore models compensation as an unconstrained state flip rather than a new externally governed effect.

## Critical finding 6 — the declared THEOREM is not an executed proof
`THEOREM Spec => []TypeOK` and `THEOREM Spec => []Safety` are declarations in the spec; the repository currently has no TLC result proving them.
The CFG explicitly enables TypeOK and Safety, but TLC has not run.

Therefore status remains UNVERIFIED.

## Required model correction set before first TLC run
1. Invalidate queued admissions on relevant authority/fence changes.
2. Invalidate queued admissions on incarnation changes.
3. Add immutable bound authority/fence/incarnation identity.
4. Bind UNKNOWN to the exact effect/provider/resource incarnation.
5. Make reconciliation consume explicit authoritative evidence.
6. Model compensation as a distinct successor effect identity.
7. Add guards preventing compensation from bypassing authority/fence/dependency checks.
8. Add explicit stale-admission state and fresh re-admission transition.
9. Add invariants for stale authority, incarnation mismatch, and evidence binding.

## Important methodological consequence
The first model should NOT be executed as if it were already faithful. AB104.591 found semantic defects before TLC execution.

This is exactly why the pre-run audit exists.

## Closure
AB104.591 is a **finding**, not a verification result.
The model must be corrected before the first TLC run.

## Next exact step
AB104.592 — revise the bounded model according to the nine corrections above, then perform a second static audit before any TLC execution. Preserve AB104.589 unchanged as historical evidence; do not overwrite it.