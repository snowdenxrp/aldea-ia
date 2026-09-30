# AB105.009R — Expectation-version / reconciliation evidence boundary audit

Date: 2026-09-29
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Fresh evidence

AWS drift-aware change sets explicitly distinguish three configurations: actual state, previous deployment state, and desired state. AWS also exposes a `SyncWithActual` target that resets drift status without modifying the resource. The import workflow can describe a resource's current configuration and use that configuration as the template definition when resolving drift. citeturn0search0turn0search4turn0search15

## Finding

The evidence comparison is versioned by expectation, not merely by resource identity. A later reconciliation can make the current resource match a new expectation while preserving the fact that it differed from an earlier expectation.

Anti-collapse:
- CURRENT_IN_SYNC(E2) != HISTORICAL_IN_SYNC(E1)
- SYNC_WITH_ACTUAL != NO_PRIOR_DRIFT
- ACTUAL_STATE != PREVIOUS_DEPLOYMENT_STATE
- DESIRED_STATE(E2) != HISTORICAL_EXPECTATION(E1)
- EXPECTATION_VERSION_CHANGE != HISTORICAL_ERASURE
- RECONCILIATION_SUCCESS != HISTORICAL_CONFORMANCE
- CURRENT_RESOURCE_MATCH != COMPLETE_HISTORY

A resource-level evidence record therefore needs at least an expectation/version reference in addition to resource identity, observation time, scope, authority, and result. Without that binding, a later `IN_SYNC` observation can be incorrectly interpreted as evidence about an earlier policy/template state.

## Nexo implication

The Evidence Dependency Graph should treat an expectation/template version as an explicit dependency of a drift claim. Reconciliation creates a new fact and may invalidate or supersede a derived claim, but it must not overwrite the earlier observation.

Conceptual chain:

`resource_identity + expectation_version(E1) + observation(t1) -> drift_fact`
`reconciliation -> expectation_version(E2)`
`resource_identity + expectation_version(E2) + observation(t2) -> current_fact`

Safe inference boundary:
`current_fact(IN_SYNC,E2) -> current conformance to E2`
Not:
`current_fact(IN_SYNC,E2) -> historical conformance to E1`

This reinforces I19/I21/I22 and classes 7, 12, 14, 17, 19. No new top-level interaction class is justified.

## Epistemic state preserved

W19/W20: NOT FROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture/semantic freeze: NOT DECLARED.
AB50–AB58 unresolved ternary/EventDAG items remain carried forward.

## Exact next action

AB105.010R: continue fresh evidence research on whether reconciliation/resolution records themselves provide sufficient historical provenance, versus requiring independently retained pre-resolution evidence.