# NEXO AB105 G0 — Actions zero-job diagnosis CLOSED

Date: 2026-10-03

## Direct job API evidence
- Run 37152905765 (ordering witness): jobs=[]
- Run 37152553984 (visibility witness): jobs=[]
- Run 37152504624 (runtime validation): job 111289092094 exists and completed SUCCESS.

The runtime validation job executed checkout, setup-python, and validation successfully. The witness/ordering runs have no materialized jobs.

## Consequence
The failure boundary is before runner/job execution for the witness/ordering workflows. No Kafka, Java, JAAS, probe, or test execution occurred in those runs. The minimal structural witness also did not produce an independently accepted job run, so it does not provide a workaround.

## Epistemic status
A precise GitHub control-plane error message is not exposed by the available connector/API surface. Therefore the exact registration/planning cause remains UNKNOWN.

Do not infer YAML syntax failure, permissions failure, branch-policy failure, or runner failure without direct evidence.

## Frozen research state
AB105.116R = FROZEN
AB105.117R = NOT_CREATED
TLC = NOT_RERUN
REAL_VISIBILITY_WITNESS = NOT_EXECUTED
REAL_BROKER_ORDERING_WITNESS = already observed in v2; no rerun requested by this diagnosis
SECURITY_CONCLUSION = NOT_ESTABLISHED
