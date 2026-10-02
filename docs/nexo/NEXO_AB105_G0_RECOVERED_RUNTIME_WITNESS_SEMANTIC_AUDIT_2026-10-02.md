# NEXO AB105 G0 — recovered historical runtime witness semantic audit 2026-10-02

## Recovered execution
Commit 99c6748e8d05130ea911c5f2321dbaeb8c207952 records:
- run 36969192502
- job 110719406205
- Kafka pin 99b940733a9f6bc409457dba7108f08421d81e42
- SUCCESS
- G0_WITNESS A1=OBSERVED D0=OBSERVED D1=DENIED D2=SUCCESS E_BASELINE=0 E_AFTER=1
- artifact 11210977168
- digest sha256:b0e6ae6499b76f1de0363805a58ae45635b9d661b169cb6338893338d2e31c54

## Critical semantic correction
Inspection of the recovered runtime harness shows that its D1 is performed by directly invoking the instrumented TargetAuthorizer: TARGET.authorize(userContext(), List.of(new Action(...)))

Therefore this historical witness is valid evidence for the harness sequence A1/D0/D1/D2/E as implemented, but D1 is not a real network RPC authorization path. It must not be promoted to evidence for RequestChannel ENQUEUE/DEQUEUE or W1 -> R1.

## Reuse classification
- 🟢 Real KafkaClusterTestKit runtime/bootstrap structure: reusable pattern.
- 🟢 SASL_PLAINTEXT + real Producer path for A1/D2: reusable pattern, subject to current experiment contract.
- 🟢 Exact local E measurement via BrokerServer/UnifiedLog: reusable diagnostic component.
- 🔵 Historical A1/D0/D1/D2/E witness: reusable only as a prior runtime fixture, not as ordering evidence.
- 🔴 Direct TARGET.authorize() D1: invalid for the current real-RPC ordering witness.
- 🔴 Do not claim this run established W1 -> ENQUEUE -> DEQUEUE -> R1.

## Why this matters
This confirms the user's concern: earlier generations contain useful working infrastructure, but also semantic shortcuts that can look like stronger evidence than they actually provide. The archaeology must preserve both.

## Current epistemic state
- Historical G0 runtime execution: RECOVERED.
- Historical A1/D0/D1/D2/E sequence: OBSERVED in that harness.
- Real-RPC D1: NOT ESTABLISHED by this run.
- W1 -> ENQUEUE -> DEQUEUE -> R1: UNKNOWN.
- Current PR #94 ordering witness: not executed.
- AB105.116R: UNCHANGED.
- AB105.117R: NOT CREATED.
- TLC: NOT RERUN.
