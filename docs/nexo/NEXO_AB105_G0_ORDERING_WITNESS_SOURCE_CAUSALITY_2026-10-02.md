# NEXO AB105 G0 — Source-Level Causality Finding

Date: 2026-10-02
Kafka pin: 99b940733a9f6bc409457dba7108f08421d81e42

## Finding

The real-broker witness establishes observed temporal ordering, but the pinned Kafka source does not yet provide a proven JMM happens-before edge from the local ACL removal publication (`aclCache = aclCacheSnapshot`) to the authorization reader's `aclCache` read.

## Relevant source structure

`StandardAuthorizer` has a `volatile StandardAuthorizerData data` field. Its `authorize(...)` method performs `StandardAuthorizerData curData = data` and then calls `curData.authorize(...)`.

However, `StandardAuthorizer.addAcl(...)` and `StandardAuthorizer.removeAcl(...)` delegate to `data.addAcl(...)` / `data.removeAcl(...)`; those methods mutate the `StandardAuthorizerData` object's plain `aclCache` field rather than replacing the outer volatile `data` field.

`StandardAuthorizerData` declares `private AclCache aclCache;` and explicitly documents the class as not thread-safe. `removeAcl` computes a new cache and then assigns `aclCache = aclCacheSnapshot`. `authorize` later reads `AclCache aclCacheSnapshot = aclCache` and scans it.

The source therefore has this shape:

writer thread:
  data.removeAcl(id)
    -> aclCache = new immutable AclCache

reader thread:
  curData = data
  -> curData.authorize(...)
  -> aclCacheSnapshot = aclCache
  -> scan snapshot

The outer `volatile data` publication is not itself a publication of each later `aclCache` mutation, because the remove/add path does not write `data` after mutating `aclCache`.

## Experimental correlation

Run 37079062681 shows the metadata event handler and request handler on distinct threads. The ACL_W1 probe is emitted immediately after `aclCache = aclCacheSnapshot`. Post-D0 requests show ENQUEUE -> DEQUEUE -> AUTH_ENTER -> AUTH_DECISION and all 10 post-delete decisions are DENIED.

Cycle 9 is particularly informative: broker-3000 W1 occurs before D0_RETURN, broker-0 W1 occurs after D0_RETURN, and the post-D0 ENQUEUE happens only after the broker-0 W1. Thus the observed ordering is sufficient to show that both local W1 observations preceded the request admission in all 10 cycles, while it is not sufficient to prove a JMM edge.

## What this does and does not establish

OBSERVED:
- two broker-local W1 cache-update observations per cycle;
- W1-to-post-D0-ENQUEUE temporal order in 10/10 cycles;
- post-D0 request reaches DEQUEUE/AUTH and is denied in 10/10 cycles.

NOT PROVEN:
- a JMM happens-before edge from `aclCache = aclCacheSnapshot` to the reader's `aclCache` load;
- that the reader must observe the new cache solely because `W1` timestamp precedes `ENQUEUE` timestamp;
- absence of a stale-read/race execution outside the tested schedules.

## Next proof target

Do not patch production behavior yet. First construct a source-level witness that distinguishes:
1. the volatile outer `data` publication edge, from
2. the plain inner `aclCache` mutation edge.

The experiment should target the actual authorization read and attempt to demonstrate whether an explicit synchronization edge exists elsewhere in the call path (executor/queue/future/lock/event handoff). If no such edge exists, the current witness can support a concrete race/visibility hypothesis, but the conclusion must remain bounded until an execution that demonstrates the stale-read outcome or a formal source-level proof is obtained.

AB105.116R unchanged. AB105.117R not created. TLC not rerun.