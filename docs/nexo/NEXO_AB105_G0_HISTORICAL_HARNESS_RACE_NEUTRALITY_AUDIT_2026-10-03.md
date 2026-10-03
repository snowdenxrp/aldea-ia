# NEXO AB105 G0 — Historical Harness Recovery / Race-Neutrality Audit — 2026-10-03

## Scope
Compared the currently persisted ordering-witness-v2 workflow with historical AB105 G0 branches and bootstrap material. The historical ordering branch `nexo-ab105-g0-ordering-witness-run` exists and preserves the G0 bootstrap workflow. Its tree does not contain the referenced `nexo-ab105-g0-ordering-witness.yml` file, so the exact source of the injected OrderingWitness test remains unavailable from that branch tree.

## Confirmed
- Historical branch exists: `nexo-ab105-g0-ordering-witness-run`.
- Historical bootstrap pins Kafka to `99b940733a9f6bc409457dba7108f08421d81e42`.
- Bootstrap harness uses a real KafkaClusterTestKit broker and controller and performs A1/D0/D1/D2 sequencing.
- The historical bootstrap explicitly uses CountDownLatch A1_OBSERVED/A1_RELEASE to hold D2; this is the intended A1 in-flight authorization control and is not evidence about W1→ENQUEUE.
- The current v2 workflow dynamically extracts `NexoG0OrderingWitnessTest.java` from `nexo-ab105-g0-ordering-witness.yml`, but that source file is not present in the historical branch tree or current main at the referenced path.

## Critical distinction
The A1 latch in the historical bootstrap is not automatically a W1 gate. However, without the exact OrderingWitness harness source we cannot yet prove that the successful v2 run was fully race-neutral with respect to W1 and D1 publication.

Therefore:
- prior temporal evidence W1 < D1 DEQUEUE (10/10) remains valid as observed runtime evidence;
- it must not be upgraded to a JMM happens-before claim;
- race-neutrality of the exact v2 harness remains UNKNOWN until the missing harness source is recovered;
- no rerun is justified yet.

## Current epistemic state
🟢 Historical branch recovered.
🟢 Bootstrap control path understood.
🟢 A1 latch identified as separate from W1 instrumentation.
🔵 Exact OrderingWitness harness source = UNKNOWN/unrecovered.
🔵 Race-neutral W1→D1 publication = UNKNOWN.
🔵 W1→ENQUEUE JMM edge = UNKNOWN.
🔵 stale read = UNKNOWN.
🔵 incorrect authorization consequence = UNKNOWN.
🔴 vulnerability/security conclusion = NOT_DECLARED.

## Frozen constraints
AB105.116R unchanged. AB105.117R not created. TLC not rerun. PR #94 not merged. No artificial W1 gate. No repeat of v2 until the harness source is recovered or a new hypothesis justifies a redesigned witness.

## Next action
Recover the exact historical test/workflow blob by commit/PR/blob ancestry rather than guessing a replacement path. If recovery fails, design a new race-neutral witness from first principles and label it as a new experiment, not as a replay of v2.
