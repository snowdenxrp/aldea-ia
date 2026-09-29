# AB104.998R — recovery can produce a terminal status while drift evidence remains explicitly UNKNOWN/NOT_CHECKED

Date: 2026-09-29
Status: RESEARCH COMPLETED; persistence verified.

## Question
When CloudFormation recovers a failed rollback, does the resulting operational status establish that skipped resources are synchronized with expected state, or can the evidence state remain unresolved?

## Fresh evidence
AWS's StackResourceDriftInformationSummary defines drift status separately from stack/resource operation status. `IN_SYNC` means actual configuration matches expected configuration; `MODIFIED` and `DELETED` indicate divergence; `NOT_CHECKED` means CloudFormation has not checked whether the resource differs. Critically, resources included in `ResourcesToSkip` during `ContinueUpdateRollback` receive `NOT_CHECKED` drift status. citeturn0search8turn0search11

AWS's ContinueUpdateRollback documentation also states that skipped resources are marked `UPDATE_COMPLETE` so rollback can continue, while their state remains inconsistent with the stack template until explicitly reconciled. citeturn0search0turn0search1

## Findings
1. A resource can carry an operational status such as `UPDATE_COMPLETE` while its drift/evidence status is `NOT_CHECKED`.
2. `NOT_CHECKED` is not evidence of `IN_SYNC`; absence of an observation must not be collapsed into observed consistency.
3. Therefore terminal orchestration status does not imply complete evidence coverage.
4. Recovery can intentionally advance an orchestration state while leaving a resource's physical-vs-expected relationship unresolved.
5. A later reconciliation/drift check is a new observation/evidence event; it should not retroactively convert the earlier `NOT_CHECKED` state into historical proof.
6. This gives a concrete external witness for the Nexo rule that UNKNOWN/PENDING evidence must survive state-machine progress when coverage is incomplete.
7. No new top-level interaction class is justified. The finding reinforces I19/I21/I22 and classes 7, 12, 17, 19, with class 20 only under an explicit atomic consistency contract.

## Anti-collapse
UPDATE_COMPLETE != IN_SYNC
NOT_CHECKED != IN_SYNC
NO_OBSERVATION != ABSENCE_OF_DRIFT
RECOVERY_TERMINAL != EVIDENCE_COMPLETE
LATER_RECONCILIATION != HISTORICAL_PROOF
ORCHESTRATION_STATUS != EVIDENCE_STATUS
UNKNOWN != FAILED

## Classification
Primary: I19, I21, I22.
Interactions: classes 7, 12, 17, 19.
Conditional: class 20 only where an explicit atomic consistency/effect contract covers the complete boundary.
No new top-level interaction class justified.
W19/W20 NOT FROZEN.
Coverage denominator NOT FROZEN.
Formal verification NOT PERFORMED.
Implementation NOT STARTED.
Architecture/semantic freeze NOT DECLARED.

## Conclusion
AB104.998R strengthens a core epistemic boundary: recovery status and evidence status are independent. A system may legitimately declare an orchestration/resource operation complete while leaving drift evidence `NOT_CHECKED`. Nexo must therefore preserve evidence incompleteness explicitly rather than inferring consistency from terminal state.
