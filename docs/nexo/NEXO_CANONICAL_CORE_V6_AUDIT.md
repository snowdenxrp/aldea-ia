# V6 Immediate Audit — 2026-09-23

V6 reconstructs explicit finite records and adds reachable admission, effect request/UNKNOWN, reconciliation, observation, verification, release authorization, commit, STOP request/enforcement/verification, context invalidation and logical freshness.

The draft was audited immediately.

## Blocking defects

1. **Record-domain initialization is invalid as a TLA+ construction.** `effectBinding \\in [Ops -> EffectBinding]` treats a record set definition as if it were a value constructor. The same issue applies to AuthorityContext, Lease, Evidence and ReleaseAuth. V7 must define explicit finite record sets or construct records with configured constants.
2. **Init does not constrain required records to the exact operation/effect relation.** Effect uniqueness and operation-to-effect binding need explicit configuration.
3. **ReconcileApplied can assert APPLIED without requiring verified evidence bound to the exact external effect.** This recreates the observation/truth compression we were trying to remove.
4. **AcquireReconcileAndObserve combines ownership acquisition and observation.** Canonical model should separate acquire and observe so the linearization boundary is explicit.
5. **RequestEffect chooses an owner nondeterministically instead of explicit execution admission.** Execution lease acquisition must be a distinct transition.
6. **STOP enforcement changes the execution lease to REVOKED but does not explicitly fence the operation/effect or represent actuation interruption.**
7. **Context invalidation does not model material policy/graph/trust-root changes.**
8. **Release authorization is not automatically invalidated by every material safety-context change.**
9. **Evidence provenance is only a boolean.** Canonical model needs structured provenance/dependency binding sufficient to prove the exact dependency snapshot.
10. **No implementation linearization/CAS semantics are represented.** Atomic TLA+ actions are necessary but do not prove an implementation primitive is linearizable.

## Key positive result

The structural decomposition is now exposing the remaining gaps cleanly. EffectState is separate from evidence, and ReleaseAuthorization is a first-class consumable record.

## Decision

V6 is not final and will not be incrementally patched. V7 must define explicit finite record sets/configuration; separate all lease acquisitions; require verified exact evidence before changing an external effect to APPLIED; model actuation fencing; model material safety-context changes; preserve structured provenance/dependency snapshots; add a bounded adversarial CFG and attempt SANY/TLC.

Status: DESIGNED/SPECIFIED; SANY/TLC NOT RUN; runtime tests NOT RUN; formal equivalence NOT CLAIMED.
