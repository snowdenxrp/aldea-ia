# NEXO AB105 G0 — executable-path audit 2026-10-02

## Finding
A prior JMM causal-window workflow provides a confirmed executable pattern for this repository: the workflow clones Kafka at pin 99b940733a9f6bc409457dba7108f08421d81e42, copies a Java test file from the Nexo repository into the pinned Kafka checkout, compiles it, executes it with Gradle, and uploads evidence.

This is materially different from PR #94's ordering workflow, which embeds its Java harness directly in a workflow heredoc.

## Consequence
A regular repository Java source file can be made executable by a workflow **only if an existing workflow explicitly copies/compiles that path**. Merely adding a corrected ordering test file does not cause PR #94's workflow to consume it.

The JMM workflow cannot be treated as ordering evidence: it executes the JMM causal-window discriminator, not W1 -> ENQUEUE -> DEQUEUE -> R1.

## Epistemic state
- Corrected ordering harness: design known, not executed.
- Existing executable copy-test pattern: CONFIRMED.
- Real broker ordering witness: NOT EXECUTED.
- NEXO_ORDER raw evidence: NONE.
- W1 -> R1: UNKNOWN.
- AB105.116R: UNCHANGED.
- AB105.117R: NOT CREATED.
- TLC: NOT RERUN.

## Next route
Find an already-existing executable workflow whose contract can legitimately run the ordering harness without changing historical semantics. Do not substitute the JMM test or promote its evidence to ordering evidence.
