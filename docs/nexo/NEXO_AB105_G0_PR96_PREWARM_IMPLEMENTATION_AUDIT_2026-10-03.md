# NEXO AB105 G0 — PR #96 prewarm implementation audit

Date: 2026-10-03

## Finding
PR #96 documents a producer metadata prewarm (`producer.partitionsFor(TOPIC_NAME);`), but inspection of its branch workflow `nexo-ab105-g0-ordering-witness-v2.yml` shows the workflow reconstructs `NexoG0OrderingWitnessTest.java` from the old control commit `a3aaae3a...` and explicitly comments that no prewarm exists in that source.

The fetched workflow therefore does NOT provide sufficient evidence that the claimed prewarm is actually installed in the executable harness.

## Consequence
PR #96 must be treated as **IMPLEMENTATION UNVERIFIED**, not as an executable diagnostic result. No runtime result is accepted from it on this basis.

This is a documentation/implementation consistency finding only. It does not change AB105.116R.

## Frozen state
AB105.116R = FROZEN
AB105.117R = NOT_CREATED
TLC = NOT_RERUN
PR #94 = draft / unmerged
PR #96 = diagnostic / implementation mismatch found
REAL_BROKER_VISIBILITY_WITNESS = NOT_EXECUTED
STALE_READ = UNKNOWN
VULNERABILITY = NOT_DECLARED

## DO-NOT-REPEAT
Do not claim PR #96 prewarm executed.
Do not infer a runtime result from branch existence.
Do not modify AB105.116R or create AB105.117R for this finding alone.
