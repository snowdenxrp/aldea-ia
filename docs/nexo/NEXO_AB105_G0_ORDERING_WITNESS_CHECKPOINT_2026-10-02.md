# AB105 G0 real broker ordering witness checkpoint — 2026-10-02

## Scope

This checkpoint defines the next distinct causal diagnostic after the completed cache-identity and authorize-snapshot diagnostics.

Kafka pin: `99b940733a9f6bc409457dba7108f08421d81e42`.

The witness is designed to record, on the real broker path and without adding synchronization to the ACL race:

1. local ACL mutation completion W1 at `StandardAuthorizerData.removeAcl()`;
2. RequestChannel enqueue;
3. RequestChannel dequeue;
4. authorization entry and decision.

The request uses a real network Produce RPC with a unique client id after the external D0 `deleteAcls().all().get()` returns.

## Methodological boundary

Instrumentation is workflow-local and timing-affecting because it emits timestamped probe lines. It does not add a lock, volatile gate, latch, join, or await between W1 and the authorization request.

The experiment must classify:

- W1 < enqueue < dequeue < authorization entry: RequestChannel publication is available for that request.
- dequeue < W1 < authorization entry: RequestChannel cannot publish the later W1 to that authorization.
- D0 return is retained as an external propagation boundary and is not substituted for local W1.

A positive W1-before-enqueue ordering is not proof of stale-read absence or presence. A later authorization ALLOWED would still require separate cache/visibility attribution; those cache/snapshot diagnostics are already covered and must not be repeated.

## Execution status

🟢 DESIGN/SOURCE-BOUNDARY: READY.

🟢 PR #94 created as draft: real broker ordering witness.

🟡 EXECUTION: NOT_YET_EXECUTED.

The GitHub connector can create/update repository content and read workflow runs, but the available GitHub tool surface does not expose the required workflow-dispatch/write-ref operation. The newly created standalone workflow therefore did not produce a run. This is a tooling/execution gate, not a scientific failure.

No result is inferred from the absence of a run.

## Preserved constraints

AB105.116R: UNCHANGED.

AB105.117R: NOT_CREATED.

TLC: NOT_RERUN.

Diagnostic PRs: NOT_MERGED.

Existing causal-v2, cache-identity, authorize-snapshot, source-audit, and RequestChannel evidence remains preserved.

## Next executable action

Execute this exact workflow on GitHub Actions when a workflow-dispatch or equivalent branch-trigger path is available, then audit the raw `NEXO_ORDER` events before making any causal interpretation.
