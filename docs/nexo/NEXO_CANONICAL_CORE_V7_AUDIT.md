# V7 Immediate Audit — 2026-09-23

V7 moved further toward finite records and a bounded configuration. It still cannot be treated as an executable/verified TLA+ model.

## Findings

1. **`Spec` is not defined.** The CFG therefore cannot execute the model. This is the primary blocker before TLC.
2. **The record sets remain unconstrained abstract sets.** TypeOK verifies membership in record-set aliases, but Init does not construct a concrete finite binding/authority/evidence/lease configuration.
3. **`STRING` and record fields need a finite model configuration.** For bounded TLC, target fingerprints/provenance should use finite constants rather than unconstrained strings.
4. **`Admit` is missing.** Operations remain PROPOSED, so the main path is unreachable.
5. **`MarkApplied`/remote result transition is missing.** The model only has REQUESTED→UNKNOWN; APPLIED is reachable only through reconciliation, which is acceptable for unknown effects but the normal successful execution path is absent.
6. **ReconcileApplied still relies on evidence validity but does not explicitly verify that the evidence's observed state says APPLIED.** Evidence needs an observed effect state/value, not merely identity and provenance.
7. **`Invalidate` does not itself change policy/graph/authority/dependency state.** It only reacts to changed context, so the adversarial change transitions are absent.
8. **STOP enforcement does not change opState to STOPPED or create an actuation fence.** Execution lease revocation alone is insufficient.
9. **Recovery/Reconciliation leases have no expiry/takeover actions.** Stale-owner scenarios remain unmodelled.
10. **The intended generation theorem is absent.** Need explicit invariants relating every acquire transition to `generation + 1` and all other transitions to unchanged generation.
11. **No `Spec == Init /\\ [][Next]` exists.**
12. **No SANY/TLC run has been performed.**

## Decision

V7 is rejected as a testable formal model because the bounded configuration is incomplete. No incremental patch chain will be created. V8 should be a deliberately small executable kernel: one operation, one effect, one target, two owners, two evidence records, one dependency, explicit concrete records, a complete Init/Next/Spec, and only the minimum transitions required for the adversarial invariants. Then SANY/TLC should be attempted before adding further architecture.

Status: DESIGNED/SPECIFIED; NOT FORMALLY CHECKED; NOT RUNTIME TESTED.
