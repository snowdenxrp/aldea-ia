# NEXO AB105 G0 — RE-AUDIT ORDERING WITNESS — 2026-10-02

## Scope
Fresh audit of the prior ordering-witness continuity and executable paths. Goal: detect stale continuity, false completion, and executable-path mismatches before promoting any scientific result.

## Canonical invariants
- Repository: snowdenxrp/aldea-ia
- Active ordering branch: nexo-ab105-g0-ordering-witness
- Canonical anchor: AB105.116R — unchanged.
- AB105.117R: not created.
- TLC: not rerun.
- Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42.
- Scientific ordering witness remains open.

## Finding 1 — continuity was stale
The canonical continuity document still named 91c2a7a23cf2812c248e53596085b480684de006 as the latest harness correction.

A later real correction existed:
- 29242e6e59a6c1b18c681383d250eaa4a436228b
- message: fix(nexo): remove duplicate W1 probe rewrite causing Python syntax error

Therefore the prior continuity pointer was stale and did not describe the latest executable workflow state.

## Finding 2 — the Kafka Bootstrap run was not ordering-witness evidence
Commit 69a226c42b7552576f558fce9dd4c9921e9732ec produced Actions run 37061544071, workflow NEXO AB105 G0 Kafka Bootstrap.

The run checked out PR #94 merge commit 5e0e4387ca34aacac75680bcd950087073deb563, not the ordering branch head directly. It failed in its temporary legacy NexoG0RuntimeTest at:
server/src/test/java/org/apache/kafka/server/NexoG0RuntimeTest.java:190
because ResourceType was supplied where ResourcePattern required a String.

This run is NOT the ordering witness and provides NO NEXO_ORDER evidence.

## Finding 3 — the actual PR #94 ordering workflow still contained a W1 injector defect
Before this re-audit, .github/workflows/nexo-ab105-g0-ordering-witness.yml attempted to replace a removeAcl block that declared StandardAcl removedAcl, but the replacement referenced removedAcl without declaring it. That executable path therefore could not be treated as corrected.

## Finding 4 — correlation contract was incomplete in the main ordering workflow
AUTH_ENTER/AUTH_DECISION and ENQUEUE/DEQUEUE are required to carry correlation identifiers for causal pairing. The main ordering workflow lacked correlationId in these emitted events.

## Corrections made
On nexo-ab105-g0-ordering-witness:
- 3ab2aa33f45324d0e2414945e34c41e60973549e: replaced fragile W1 block with source-marker insertion and added auth correlation fields.
- f7163aa8e193fd3d77db90ebd2aec1850bc3da13: corrected W1 marker indentation to the pinned Kafka source.
- aa1d8c65bcf6842abc76fbb0d595d9ecd52a0c02: added correlationId to ENQUEUE/DEQUEUE.
- 1eb2e07cad798742518c2cbdd091044fb80f723e: removed redundant duplicate repl helper from v2 workflow.

These are workflow-local only; no canonical Kafka source was modified.

## Runtime status after corrections
At audit time, no Actions run was yet returned for commit 1eb2e07cad798742518c2cbdd091044fb80f723e. Therefore installation, compilation, runtime execution, and raw NEXO_ORDER events remain NOT OBSERVED after these corrections.

## Scientific boundary
Intended witness:
D0 -> W1 -> ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION

Do not infer JMM happens-before from timestamps. Do not equate D0 with W1. Missing or ambiguous events remain UNKNOWN. No security or exploitability conclusion is established.

## Epistemic state
ORDERING_WITNESS_INSTALL=NOT_VERIFIED_AFTER_REAUDIT_CORRECTIONS
ORDERING_WITNESS_RUNTIME=NOT_OBSERVED
NEXO_ORDER_RAW_EVENTS=NOT_OBSERVED_AFTER_REAUDIT_CORRECTIONS
W1_TO_R1=UNKNOWN
JMM_HAPPENS_BEFORE=UNKNOWN
EXACT_RACE=UNKNOWN
EXPLOITABILITY=UNKNOWN
AB105.116R=INTACT
AB105.117R=NOT_CREATED
TLC=NOT_RERUN

## DO-NOT-REPEAT
- Do not treat Kafka Bootstrap run 37061544071 as ordering evidence.
- Do not treat successful compilation as runtime evidence.
- Do not revive direct TARGET.authorize() experiments as RequestChannel ordering evidence.
- Do not infer security impact from stale-window observations.
- Do not overwrite historical continuity; this audit records the correction chain explicitly.
