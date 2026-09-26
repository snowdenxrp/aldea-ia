# NEXO CONTINUITY — AB104.328

## Canonical state
AB104.328 research persisted. No implementation performed.

## Finding
Recovery should not collapse into one boolean. Four independent dimensions are useful: authority/fence safety, historical effect knowledge, target-state integrity, and idempotency/history coverage. Current external-effect recovery guidance separately tracks stable operation identity, target observations, ambiguous outcomes, fencing, and reconciliation. citeturn0search0turn0search8

## Candidate vector
`R = <FenceSafety, EffectKnowledge, TargetIntegrity, IdempotencyCoverage>`

Each dimension: `GOOD | DEGRADED | UNKNOWN | CONFLICT`.

Executable recovery depends on the effect contract's required admission predicate; missing/unknown dimensions must not be hidden by a scalar recovered flag.

## Constraints
Research first; no V21; no implementation; no unsupported verification/security claims; preserve AB50–AB58 unresolved findings; no overwrite/delete.

## Exact next action
AB104.329: test conceptually whether the four-dimensional recovery state composes safely with the existing multidimensional recovery frontier without scalarizing away partial-order information.

## DO-NOT-REPEAT
Do not collapse authority safety, historical effect knowledge, target integrity, and idempotency coverage into one recovery boolean.
