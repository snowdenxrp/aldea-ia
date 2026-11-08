# AB105 G0 steady-state visibility closure — 2026-10-02

Kafka pin: `99b940733a9f6bc409457dba7108f08421d81e42`.

## Lifecycle barrier

The broker lifecycle does contain a real startup barrier: metadata/authorizer initialization completes before normal request processing is enabled. This establishes startup publication/readiness, not per-ACL-mutation publication.

After startup:
- MetadataLoader continues delivering metadata updates.
- AclPublisher applies incremental ACL changes while request handlers continue processing requests concurrently.
- No lifecycle future, join, or readiness gate was identified that repeats for each steady-state ACL deletion.
- Therefore startup synchronization cannot be used as a blanket `removeAcl() -> authorize()` happens-before edge.

## Steady-state authorizer contract

`ClusterMetadataAuthorizer` requires thread-safe methods. The concrete `StandardAuthorizer` implementation delegates incremental `addAcl/removeAcl` directly to `StandardAuthorizerData`; no synchronized block or ReentrantReadWriteLock was found on that path.

The `StandardAuthorizer.data` volatile field is written when replacing the whole `StandardAuthorizerData` (for example lifecycle/snapshot paths), but steady-state ACL mutation retains the same data object and replaces only its plain `aclCache` reference. Consequently, the volatile `data` field does not publish each ACL mutation.

`Plugin.get()` returns the same authorizer instance and does not add serialization.

## Resulting HB graph

The inspected graph is:

`metadata event thread -> removeAcl() -> W1: plain D.aclCache = newCache`

and independently:

`request-handler thread -> authorize() -> R1: plain D.aclCache read`

RequestChannel synchronization publishes the Request object from producer to consumer, but does not connect W1 to R1 for a steady-state mutation. Startup synchronization also does not connect each later W1 to each R1.

Thus:

`HB(W1,R1) = NOT_IDENTIFIED`

This is an architectural/JMM boundary finding, not proof of stale visibility.

## Experimental boundary

Existing diagnostics provide:
- two raw-verified causal-v2 runs with `POST_RETURN_ALLOWED=0`;
- repeated temporal overlap with `OVERLAP_ALLOWED>0`;
- cache-identity census with zero post-return pre-remove cache observations;
- authorize-snapshot census with zero post-return pre-remove internal snapshots;
- real production-path run with real StandardAuthorizer + real RPC, 10/10 post-D0 decisions DENIED.

These results narrow the hypothesis space but do not establish that a stale read occurred or is impossible.

## Final epistemic state of this layer

🟢 STARTUP_HB = VERIFIED
🟢 REQUEST_CHANNEL_OBJECT_PUBLICATION = VERIFIED
🟢 ACL_MUTATION_CALLCHAIN = VERIFIED
🟢 STEADY_STATE_PER_MUTATION_ACK = NOT_IDENTIFIED
🟢 INNER_STANDARD_AUTHORIZER_LOCK = NOT_IDENTIFIED
🟢 WRAPPER_SERIALIZATION = NOT_PRESENT
🟡 HB W1->R1 = NOT_IDENTIFIED
🟡 STALE_READ = UNKNOWN
🟡 STALE_ALLOWED = NOT_OBSERVED_IN_CURRENT_RUNS
🟡 EXPLOITABILITY = UNKNOWN
🟡 GENERALIZATION = UNKNOWN
🟡 PRODUCTION_IMPACT = UNKNOWN
🔴 SECURITY_CONCLUSION = NOT_ESTABLISHED

## Decision boundary

The source audit has now closed the obvious publication candidates without producing a direct stale-read witness. Repeating the same source inspection or cache instrumentation would be redundant.

A genuinely new experiment would need to observe the real broker ordering between ACL mutation completion and request publication/dequeue, without inserting synchronization into the ACL race. Such an experiment would test ordering, not automatically prove JMM stale visibility.

Do not:
- modify AB105.116R;
- create AB105.117R;
- rerun TLC;
- merge diagnostic PRs;
- reinterpret `OVERLAP_ALLOWED` as stale visibility.

Next work, only if warranted: construct a real broker-path ordering witness with explicit D0/request enqueue/dequeue timestamps and no artificial ACL synchronization. Otherwise this layer is complete as an UNKNOWN-boundary finding.
