# AB105.008R — Drift resolution vs historical conformance audit

Date: 2026-09-29
Status: RESEARCH/AUDIT ONLY — no implementation, no semantic freeze.

## Fresh evidence

AWS CloudFormation documents that drift can be resolved by accepting the resource's current configuration as the intended configuration. The documented import workflow can remove the drifted resource from the template, describe its actual state, and import it back so the template matches that live state. AWS also documents that drift-aware change sets can either overwrite drifted resources with template values or update the template to match actual resource state.

## Finding

A later state of IN_SYNC or a resolved drift condition is not, by itself, proof that the resource was historically conformant with the earlier intended configuration.

Conceptual distinctions:
- DRIFT_RESOLVED != HISTORICAL_NEVER_DRIFTED
- CURRENT_IN_SYNC != HISTORICAL_CONFORMANCE
- NEW_EXPECTED_CONFIGURATION != HISTORICAL_EXPECTED_CONFIGURATION
- TEMPLATE_REALIGNMENT != HISTORICAL_ERASURE
- IMPORT_RESOLUTION != ORIGINAL_OPERATION_PROOF
- RESOLUTION != COMPENSATION
- CURRENT_EXPECTATION != PAST_FACT

The resolution operation can legitimately redefine the expected configuration to match an already-existing live state. Therefore the evidence graph must preserve the prior observation of drift separately from the post-resolution state.

## Nexo implication

For evidence modeling, a resolution/reconciliation event must be represented as a new fact and relation, not as an overwrite of the earlier drift evidence. A current IN_SYNC observation should be scoped to its expectation version and observation time.

Suggested conceptual lineage:

historical_observation -> resolution_operation -> expectation_version_n -> current_observation

The system must not infer:

current_IN_SYNC -> historical_never_drifted

This reinforces I19/I21/I22 and classes 7, 12, 14, 17, 19. No new top-level interaction class is justified.

## Epistemic state preserved

W19/W20: NOT FROZEN.
Coverage denominator: NOT FROZEN.
Formal verification: NOT PERFORMED.
Implementation: NOT STARTED.
Architecture/semantic freeze: NOT DECLARED.
AB50–AB58 unresolved ternary/event-dag items remain carried forward.

## Exact next action

AB105.009R: continue fresh external evidence research on the boundary between expectation/version changes, reconciliation, and historical evidence retention.